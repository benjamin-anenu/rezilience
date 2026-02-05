import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Calculate liveness status based on days since last commit
function calculateLivenessStatus(daysSinceCommit: number): "ACTIVE" | "STALE" | "DECAYING" {
  if (daysSinceCommit <= 30) return "ACTIVE";
  if (daysSinceCommit <= 90) return "DECAYING";
  return "STALE";
}

// Calculate resilience score using exponential decay (unified formula)
// λ = 0.05/month converted to per-day: 0.05/30 ≈ 0.00167
function calculateResilienceScore(params: {
  commitVelocity: number;
  daysSinceCommit: number;
  contributors: number;
  stars: number;
  isFork: boolean;
  totalStaked: number;
}): number {
  const { commitVelocity, daysSinceCommit, contributors, stars, isFork, totalStaked } = params;
  
  // O (Originality): 0.3 for forks, 1.0 for original (per spec)
  const originality = isFork ? 0.3 : 1.0;
  
  // I (Impact): logarithmic scale of contributors + stars
  const impact = Math.log10(Math.max(contributors + stars, 1));
  
  // λ = 0.05/month = 0.00167/day
  const lambda = 0.05 / 30;
  const decayFactor = Math.exp(-lambda * daysSinceCommit);
  
  // S (Stake bonus)
  const stakingBonus = totalStaked > 0 ? Math.min(totalStaked / 1000, 50) : 0;
  
  // R(P,t) = (O × I) × e^(-λ × t) + S
  const baseScore = (originality * impact) * decayFactor;
  
  // Normalize to 0-100 scale (max theoretical baseScore ~4 without stake)
  const normalizedScore = Math.min((baseScore / 4) * 100 + stakingBonus, 100);
  
  return Math.round(normalizedScore * 10) / 10;
}

// Parse GitHub URL to get owner/repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "").replace(/\/$/, "") };
}

// Fetch GitHub data for a project
async function fetchGitHubData(
  githubUrl: string,
  githubToken?: string
): Promise<{
  stars: number;
  forks: number;
  contributors: number;
  lastCommit: string;
  commitVelocity: number;
  language: string | null;
  isFork: boolean;
} | null> {
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) return null;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Resilience-Platform",
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

  try {
    const { owner, repo } = parsed;
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    
    if (!repoResponse.ok) return null;

    const repoData = await repoResponse.json();
    
    // Get commit velocity
    let commitVelocity = 0;
    try {
      const activityRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`, { headers });
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        if (Array.isArray(activityData) && activityData.length >= 4) {
          const recentWeeks = activityData.slice(-4);
          commitVelocity = Math.round((recentWeeks.reduce((sum: number, w: { total: number }) => sum + w.total, 0) / 4) * 10) / 10;
        }
      }
    } catch { /* ignore */ }

    // Get contributor count
    let contributors = 0;
    try {
      const contribRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1`, { headers });
      if (contribRes.ok) {
        const linkHeader = contribRes.headers.get("Link");
        if (linkHeader) {
          const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
          if (match) contributors = parseInt(match[1], 10);
        } else {
          const contribData = await contribRes.json();
          contributors = Array.isArray(contribData) ? contribData.length : 0;
        }
      }
    } catch { /* ignore */ }

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      contributors,
      lastCommit: repoData.pushed_at,
      commitVelocity,
      language: repoData.language,
      isFork: repoData.fork,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubToken = Deno.env.get("GITHUB_TOKEN");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();

    if (!body.program_id || !body.program_name) {
      return new Response(
        JSON.stringify({ error: "program_id and program_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("program_id", body.program_id)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Project already exists", id: existing.id }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize with defaults
    let resilienceScore = 0;
    let livenessStatus: "ACTIVE" | "STALE" | "DECAYING" = "STALE";
    let githubData: Awaited<ReturnType<typeof fetchGitHubData>> = null;

    // If GitHub URL provided, fetch data and calculate score immediately
    if (body.github_url) {
      githubData = await fetchGitHubData(body.github_url, githubToken);
      
      if (githubData) {
        const lastCommitDate = new Date(githubData.lastCommit);
        const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
        livenessStatus = calculateLivenessStatus(daysSinceCommit);

        resilienceScore = calculateResilienceScore({
          commitVelocity: githubData.commitVelocity,
          daysSinceCommit,
          contributors: githubData.contributors,
          stars: githubData.stars,
          isFork: githubData.isFork,
          totalStaked: 0,
        });
      }
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        program_id: body.program_id,
        program_name: body.program_name,
        github_url: body.github_url || null,
        website_url: body.website_url || null,
        description: body.description || null,
        logo_url: body.logo_url || null,
        verified: false,
        resilience_score: resilienceScore,
        liveness_status: livenessStatus,
        // GitHub data if fetched
        github_stars: githubData?.stars ?? 0,
        github_forks: githubData?.forks ?? 0,
        github_contributors: githubData?.contributors ?? 0,
        github_last_commit: githubData?.lastCommit ?? null,
        github_commit_velocity: githubData?.commitVelocity ?? 0,
        github_language: githubData?.language ?? null,
        is_fork: githubData?.isFork ?? false,
      })
      .select("id, program_id, program_name, resilience_score, liveness_status")
      .single();

    if (error) throw new Error(`Failed to insert: ${error.message}`);

    // Record initial score in history
    if (resilienceScore > 0 && data) {
      await supabase.from("score_history").insert({
        project_id: data.id,
        score: resilienceScore,
        commit_velocity: githubData?.commitVelocity ?? 0,
        days_last_commit: githubData ? Math.floor((Date.now() - new Date(githubData.lastCommit).getTime()) / (1000 * 60 * 60 * 24)) : null,
      });
    }

    return new Response(
      JSON.stringify({ 
        message: "Project created", 
        project: data,
        scored: resilienceScore > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
