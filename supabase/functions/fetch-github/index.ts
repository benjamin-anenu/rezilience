import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  language: string | null;
}

interface GitHubContributor {
  login: string;
}

interface CommitActivity {
  total: number;
  week: number;
}

// Calculate weekly commit velocity from GitHub stats
async function getCommitVelocity(owner: string, repo: string, headers: HeadersInit): Promise<number> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`,
      { headers }
    );
    
    if (!response.ok) return 0;
    
    const data: CommitActivity[] = await response.json();
    if (!Array.isArray(data) || data.length === 0) return 0;
    
    // Average commits per week over last 4 weeks
    const recentWeeks = data.slice(-4);
    const totalCommits = recentWeeks.reduce((sum, week) => sum + week.total, 0);
    return Math.round((totalCommits / recentWeeks.length) * 10) / 10;
  } catch {
    return 0;
  }
}

// Get contributor count
async function getContributorCount(owner: string, repo: string, headers: HeadersInit): Promise<number> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
      { headers }
    );
    
    if (!response.ok) return 0;
    
    // GitHub returns total count in Link header
    const linkHeader = response.headers.get("Link");
    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) return parseInt(match[1], 10);
    }
    
    // Fallback: count returned contributors
    const data: GitHubContributor[] = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch {
    return 0;
  }
}

// Parse GitHub URL to get owner/repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

// Calculate liveness status based on days since last commit
function calculateLivenessStatus(daysSinceCommit: number): "ACTIVE" | "STALE" | "DECAYING" {
  if (daysSinceCommit <= 30) return "ACTIVE";
  if (daysSinceCommit <= 90) return "DECAYING";
  return "STALE";
}

// Calculate resilience score using exponential decay
function calculateResilienceScore(params: {
  commitVelocity: number;
  daysSinceCommit: number;
  contributors: number;
  stars: number;
  isFork: boolean;
  totalStaked: number;
}): number {
  const { commitVelocity, daysSinceCommit, contributors, stars, isFork, totalStaked } = params;
  
  // Base originality score (1.0 for original, 0.7 for forks)
  const originality = isFork ? 0.7 : 1.0;
  
  // Intensity score (0-50 range based on velocity, contributors, stars)
  const velocityScore = Math.min(commitVelocity * 2, 20); // Max 20 points
  const contributorScore = Math.min(contributors * 0.5, 15); // Max 15 points
  const starScore = Math.min(Math.log10(stars + 1) * 5, 15); // Max 15 points
  const intensity = velocityScore + contributorScore + starScore;
  
  // Decay factor (λ = 0.02, half-life ~35 days)
  const lambda = 0.02;
  const decayFactor = Math.exp(-lambda * daysSinceCommit);
  
  // Staking bonus (0-15 points based on total staked)
  const stakingBonus = Math.min(Math.log10(totalStaked + 1) * 3, 15);
  
  // Final score: (O × I) × decay + S
  const baseScore = (originality * intensity) * decayFactor;
  const finalScore = Math.min(Math.max(baseScore + stakingBonus, 0), 100);
  
  return Math.round(finalScore * 10) / 10;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubToken = Deno.env.get("GITHUB_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for optional project_id filter
    let projectId: string | null = null;
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      projectId = body.project_id || null;
    }

    // Fetch projects that have a GitHub URL
    let query = supabase
      .from("projects")
      .select("id, program_name, github_url, total_staked, is_fork");
    
    if (projectId) {
      query = query.eq("id", projectId);
    } else {
      query = query.not("github_url", "is", null);
    }

    const { data: projects, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Failed to fetch projects: ${fetchError.message}`);
    }

    if (!projects || projects.length === 0) {
      return new Response(
        JSON.stringify({ message: "No projects with GitHub URLs found", updated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Resilience-Platform",
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    let updatedCount = 0;
    const results: Array<{ project: string; status: string; score?: number }> = [];

    for (const project of projects) {
      try {
        if (!project.github_url) continue;

        const parsed = parseGitHubUrl(project.github_url);
        if (!parsed) {
          results.push({ project: project.program_name, status: "invalid_url" });
          continue;
        }

        const { owner, repo } = parsed;

        // Fetch repo data
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        
        if (!repoResponse.ok) {
          results.push({ project: project.program_name, status: `github_error_${repoResponse.status}` });
          continue;
        }

        const repoData: GitHubRepo = await repoResponse.json();

        // Fetch additional metrics
        const [commitVelocity, contributors] = await Promise.all([
          getCommitVelocity(owner, repo, headers),
          getContributorCount(owner, repo, headers),
        ]);

        // Calculate days since last commit
        const lastCommitDate = new Date(repoData.pushed_at);
        const daysSinceCommit = Math.floor(
          (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine liveness status
        const livenessStatus = calculateLivenessStatus(daysSinceCommit);

        // Calculate resilience score
        const resilienceScore = calculateResilienceScore({
          commitVelocity,
          daysSinceCommit,
          contributors,
          stars: repoData.stargazers_count,
          isFork: project.is_fork ?? repoData.fork,
          totalStaked: project.total_staked ?? 0,
        });

        // Update project in database
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            github_stars: repoData.stargazers_count,
            github_forks: repoData.forks_count,
            github_contributors: contributors,
            github_last_commit: repoData.pushed_at,
            github_commit_velocity: commitVelocity,
            github_language: repoData.language,
            is_fork: project.is_fork ?? repoData.fork,
            liveness_status: livenessStatus,
            resilience_score: resilienceScore,
          })
          .eq("id", project.id);

        if (updateError) {
          results.push({ project: project.program_name, status: `update_error: ${updateError.message}` });
          continue;
        }

        // Insert score history snapshot
        await supabase.from("score_history").insert({
          project_id: project.id,
          score: resilienceScore,
          commit_velocity: commitVelocity,
          days_last_commit: daysSinceCommit,
          breakdown: {
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            contributors,
            velocity: commitVelocity,
            daysSinceCommit,
            livenessStatus,
          },
        });

        updatedCount++;
        results.push({ project: project.program_name, status: "updated", score: resilienceScore });
      } catch (projectError) {
        results.push({ 
          project: project.program_name, 
          status: `error: ${projectError instanceof Error ? projectError.message : "unknown"}` 
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Updated ${updatedCount} of ${projects.length} projects`,
        updated: updatedCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fetch-github function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
