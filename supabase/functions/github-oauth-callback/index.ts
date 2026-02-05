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

// Calculate resilience score using exponential decay
function calculateResilienceScore(params: {
  commitVelocity: number;
  daysSinceCommit: number;
  contributors: number;
  stars: number;
  isFork: boolean;
}): number {
  const { commitVelocity, daysSinceCommit, contributors, stars, isFork } = params;
  
  const originality = isFork ? 0.3 : 1.0;
  const velocityScore = Math.min(commitVelocity * 2, 20);
  const contributorScore = Math.min(contributors * 0.5, 15);
  const starScore = Math.min(Math.log10(stars + 1) * 5, 15);
  const intensity = velocityScore + contributorScore + starScore;
  
  const lambda = 0.02;
  const decayFactor = Math.exp(-lambda * daysSinceCommit);
  
  const finalScore = Math.min(Math.max((originality * intensity) * decayFactor, 0), 100);
  
  return Math.round(finalScore * 10) / 10;
}

// Parse GitHub URL to get owner/repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "").replace(/\/$/, "") };
}

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
}

interface GitHubRepo {
  full_name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  pushed_at: string;
  language: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const githubClientId = Deno.env.get("GITHUB_CLIENT_ID");
    const githubClientSecret = Deno.env.get("GITHUB_CLIENT_SECRET");

    if (!githubClientId || !githubClientSecret) {
      return new Response(
        JSON.stringify({ error: "GitHub OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { code, profile_data } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: "Authorization code required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error_description);
      return new Response(
        JSON.stringify({ error: `GitHub OAuth failed: ${tokenData.error_description || tokenData.error}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = tokenData.access_token;
    const tokenScope = tokenData.scope;

    // Step 2: Fetch GitHub user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Resilience-Platform",
      },
    });

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch GitHub user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const githubUser: GitHubUser = await userResponse.json();

    // Step 3: Fetch user's repos to calculate score
    let resilienceScore = 0;
    let livenessStatus: "ACTIVE" | "STALE" | "DECAYING" = "STALE";
    let primaryRepo: GitHubRepo | null = null;

    // If profile_data contains a specific repo URL, use that
    const githubOrgUrl = profile_data?.githubOrgUrl;
    
    if (githubOrgUrl) {
      const parsed = parseGitHubUrl(githubOrgUrl);
      if (parsed) {
        const repoResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Resilience-Platform",
          },
        });

        if (repoResponse.ok) {
          primaryRepo = await repoResponse.json();
        }
      }
    }

    // If no specific repo, get user's most popular repo
    if (!primaryRepo) {
      const reposResponse = await fetch("https://api.github.com/user/repos?sort=pushed&per_page=10", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Resilience-Platform",
        },
      });

      if (reposResponse.ok) {
        const repos: GitHubRepo[] = await reposResponse.json();
        // Find the most starred non-fork repo
        primaryRepo = repos
          .filter(r => !r.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)[0] || repos[0];
      }
    }

    if (primaryRepo) {
      const lastCommitDate = new Date(primaryRepo.pushed_at);
      const daysSinceCommit = Math.floor((Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60 * 24));
      livenessStatus = calculateLivenessStatus(daysSinceCommit);

      // Get commit velocity (simplified - last 4 weeks average)
      let commitVelocity = 0;
      try {
        const parsed = parseGitHubUrl(primaryRepo.html_url);
        if (parsed) {
          const activityRes = await fetch(
            `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/stats/commit_activity`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Resilience-Platform",
              },
            }
          );
          if (activityRes.ok) {
            const activityData = await activityRes.json();
            if (Array.isArray(activityData) && activityData.length >= 4) {
              const recentWeeks = activityData.slice(-4);
              commitVelocity = Math.round(
                (recentWeeks.reduce((sum: number, w: { total: number }) => sum + w.total, 0) / 4) * 10
              ) / 10;
            }
          }
        }
      } catch { /* ignore */ }

      // Get contributor count
      let contributors = 1;
      try {
        const parsed = parseGitHubUrl(primaryRepo.html_url);
        if (parsed) {
          const contribRes = await fetch(
            `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=1`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Resilience-Platform",
              },
            }
          );
          if (contribRes.ok) {
            const linkHeader = contribRes.headers.get("Link");
            if (linkHeader) {
              const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
              if (match) contributors = parseInt(match[1], 10);
            } else {
              const contribData = await contribRes.json();
              contributors = Array.isArray(contribData) ? contribData.length : 1;
            }
          }
        }
      } catch { /* ignore */ }

      resilienceScore = calculateResilienceScore({
        commitVelocity,
        daysSinceCommit,
        contributors,
        stars: primaryRepo.stargazers_count,
        isFork: primaryRepo.fork,
      });
    }

    // Step 4: Create or update claimed_profile
    const profileId = profile_data?.id || `profile_${Date.now()}_${githubUser.id}`;
    
    const claimedProfile = {
      id: profileId,
      project_name: profile_data?.projectName || githubUser.name || githubUser.login,
      description: profile_data?.description || null,
      category: profile_data?.category || null,
      website_url: profile_data?.websiteUrl || null,
      program_id: profile_data?.programId || null,
      wallet_address: profile_data?.walletAddress || null,
      claimer_wallet: profile_data?.walletAddress || null,
      github_org_url: githubOrgUrl || primaryRepo?.html_url || null,
      github_username: githubUser.login,
      github_access_token: accessToken,
      github_token_scope: tokenScope,
      x_user_id: profile_data?.xUserId || null,
      x_username: profile_data?.xUsername || null,
      discord_url: profile_data?.socials?.discordUrl || null,
      telegram_url: profile_data?.socials?.telegramUrl || null,
      media_assets: profile_data?.mediaAssets || [],
      milestones: profile_data?.milestones || [],
      verified: true,
      verified_at: new Date().toISOString(),
    };

    const { data: savedProfile, error: saveError } = await supabase
      .from("claimed_profiles")
      .upsert(claimedProfile, { onConflict: "id" })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return new Response(
        JSON.stringify({ error: `Failed to save profile: ${saveError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success with profile data (exclude access token from response)
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: savedProfile.id,
          projectName: savedProfile.project_name,
          githubUsername: savedProfile.github_username,
          score: resilienceScore,
          livenessStatus,
          verified: true,
        },
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
