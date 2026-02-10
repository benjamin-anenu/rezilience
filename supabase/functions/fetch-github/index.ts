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
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// Fetch stored GitHub token for a project from claimed_profiles
async function getStoredGitHubToken(supabase: ReturnType<typeof createClient>, projectId: string): Promise<string | null> {
  const { data } = await supabase
    .from("claimed_profiles")
    .select("github_access_token")
    .eq("project_id", projectId)
    .eq("verified", true)
    .maybeSingle();
  
  return data?.github_access_token || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const fallbackGithubToken = Deno.env.get("GITHUB_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseKey);

    let projectId: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      projectId = body.project_id || null;
    }

    let query = supabase
      .from("projects")
      .select("id, program_name, github_url, total_staked, is_fork");
    
    if (projectId) {
      query = query.eq("id", projectId);
    } else {
      query = query.not("github_url", "is", null);
    }

    const { data: projects, error: fetchError } = await query;

    if (fetchError) throw new Error(`Failed to fetch projects: ${fetchError.message}`);

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ message: "No projects with GitHub URLs found", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let updatedCount = 0;
    const results: Array<{ project: string; status: string; score?: number; tokenSource?: string }> = [];

    for (const project of projects) {
      try {
        if (!project.github_url) continue;

        const parsed = parseGitHubUrl(project.github_url);
        if (!parsed) {
          results.push({ project: project.program_name, status: "invalid_url" });
          continue;
        }

        // Try to get stored token from claimed_profiles, fallback to env GITHUB_TOKEN
        const storedToken = await getStoredGitHubToken(supabase, project.id);
        const githubToken = storedToken || fallbackGithubToken;
        const tokenSource = storedToken ? "claimed_profile" : (fallbackGithubToken ? "env" : "none");

        const headers: HeadersInit = {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Resilience-Platform",
        };
        if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

        const { owner, repo } = parsed;
        const [repoResponse, languagesResponse] = await Promise.all([
          fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
          fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers }),
        ]);
        
        if (!repoResponse.ok) {
          results.push({ project: project.program_name, status: `github_error_${repoResponse.status}` });
          continue;
        }

        const repoData = await repoResponse.json();
        
        // Parse languages
        let languages: Record<string, number> = {};
        if (languagesResponse.ok) {
          languages = await languagesResponse.json();
        }
        
        // Get commit velocity (simplified)
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

        const lastCommitDate = new Date(repoData.pushed_at);
        const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
        const livenessStatus = calculateLivenessStatus(daysSinceCommit);

        const resilienceScore = calculateResilienceScore({
          commitVelocity,
          daysSinceCommit,
          contributors,
          stars: repoData.stargazers_count,
          isFork: project.is_fork ?? repoData.fork,
          totalStaked: project.total_staked ?? 0,
        });

        await supabase.from("projects").update({
          github_stars: repoData.stargazers_count,
          github_forks: repoData.forks_count,
          github_contributors: contributors,
          github_last_commit: repoData.pushed_at,
          github_commit_velocity: commitVelocity,
          github_language: repoData.language,
          github_languages: languages,
          is_fork: project.is_fork ?? repoData.fork,
          liveness_status: livenessStatus,
          resilience_score: resilienceScore,
        }).eq("id", project.id);

        await supabase.from("score_history").insert({
          project_id: project.id,
          score: resilienceScore,
          commit_velocity: commitVelocity,
          days_last_commit: daysSinceCommit,
        });

        updatedCount++;
        results.push({ project: project.program_name, status: "updated", score: resilienceScore, tokenSource });
      } catch (err) {
        results.push({ project: project.program_name, status: `error: ${err}` });
      }
    }

    return new Response(
      JSON.stringify({ message: `Updated ${updatedCount} of ${projects.length} projects`, updated: updatedCount, results }),
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
