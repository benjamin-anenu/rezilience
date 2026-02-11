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

// Calculate provisional resilience score using hybrid formula
// R = (0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL) × ContinuityDecay
// At claim time, only GitHub dimension is known; deps/gov/tvl use baselines
function calculateProvisionalScore(params: {
  daysSinceCommit: number;
  githubDimensionScore: number; // 0-100 from anti-gaming buckets
}): number {
  const { daysSinceCommit, githubDimensionScore } = params;
  
  // Weighted base with default baselines for unknown dimensions
  const baseScore = 
    (githubDimensionScore * 0.40) +
    (50 * 0.25) +  // deps baseline: neutral
    (0 * 0.20) +   // gov baseline: unknown
    (50 * 0.15);   // tvl baseline: neutral for non-DeFi
  
  // Continuity decay: e^(-λ × days), λ = 0.00167/day
  const decayRate = 0.00167;
  const continuityDecay = 1 - Math.exp(-decayRate * daysSinceCommit);
  const finalScore = baseScore * (1 - continuityDecay);
  
  return Math.max(0, Math.min(100, Math.round(finalScore)));
}

// Estimate a GitHub dimension score (0-100) from basic repo stats
// Simplified version of analyze-github-repo's anti-gaming buckets
function estimateGitHubScore(params: {
  commitVelocity: number;
  contributors: number;
  stars: number;
  isFork: boolean;
}): number {
  const { commitVelocity, contributors, stars, isFork } = params;
  
  // Velocity component (0-40 pts)
  const velocityPts = Math.min(40, commitVelocity * 3);
  // Contributor component (0-30 pts)
  const contribPts = Math.min(30, contributors * 3);
  // Community component (0-20 pts)
  const communityPts = Math.min(20, Math.log10(Math.max(stars, 1)) * 8);
  // Fork penalty
  const forkMultiplier = isFork ? 0.3 : 1.0;
  // Base 10 pts for existing
  const score = (10 + velocityPts + contribPts + communityPts) * forkMultiplier;
  
  return Math.max(0, Math.min(100, Math.round(score)));
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
        "User-Agent": "Rezilience-Platform",
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
            "User-Agent": "Rezilience-Platform",
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
          "User-Agent": "Rezilience-Platform",
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
      // GitHub Stats API returns 202 while computing, so retry up to 3 times
      let commitVelocity = 0;
      try {
        const parsed = parseGitHubUrl(primaryRepo.html_url);
        if (parsed) {
          let activityData: { total: number }[] = [];
          for (let attempt = 0; attempt < 3; attempt++) {
            const activityRes = await fetch(
              `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/stats/commit_activity`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                  "User-Agent": "Rezilience-Platform",
                },
              }
            );
            if (activityRes.status === 200) {
              activityData = await activityRes.json();
              break;
            } else if (activityRes.status === 202) {
              // Stats being computed, wait and retry
              await new Promise(r => setTimeout(r, 1000));
            } else {
              break;
            }
          }
          if (Array.isArray(activityData) && activityData.length >= 4) {
            const recentWeeks = activityData.slice(-4);
            commitVelocity = Math.round(
              (recentWeeks.reduce((sum: number, w: { total: number }) => sum + w.total, 0) / 4) * 10
            ) / 10;
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
                "User-Agent": "Rezilience-Platform",
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

      const githubDimensionScore = estimateGitHubScore({
        commitVelocity,
        contributors,
        stars: primaryRepo.stargazers_count,
        isFork: primaryRepo.fork,
      });
      resilienceScore = calculateProvisionalScore({
        daysSinceCommit,
        githubDimensionScore,
      });
    }

    // Step 4: Link to existing project if program_id provided
    let projectId: string | null = null;
    const programId = profile_data?.programId;
    
    if (programId) {
      // Try to find existing project by program_id
      const { data: existingProject } = await supabase
        .from("projects")
        .select("id")
        .eq("program_id", programId)
        .maybeSingle();
      
      if (existingProject) {
        projectId = existingProject.id;
        
        // Update project as verified and update GitHub data
        await supabase
          .from("projects")
          .update({
            verified: true,
            github_url: githubOrgUrl || primaryRepo?.html_url || null,
            github_stars: primaryRepo?.stargazers_count ?? 0,
            github_forks: primaryRepo?.forks_count ?? 0,
            github_last_commit: primaryRepo?.pushed_at ?? null,
            resilience_score: resilienceScore,
            liveness_status: livenessStatus,
            is_fork: primaryRepo?.fork ?? false,
          })
          .eq("id", projectId);
      }
    }

    // FIX #6: Check for existing profile by X user ID to prevent duplicates
    const xUserId = profile_data?.xUserId;
    let existingProfileId: string | null = null;
    
    if (xUserId) {
      const { data: existingProfile } = await supabase
        .from("claimed_profiles")
        .select("id")
        .eq("x_user_id", xUserId)
        .maybeSingle();
      
      if (existingProfile) {
        existingProfileId = existingProfile.id;
      }
    }

    // Use existing profile ID if found, otherwise generate new one
    const profileId = existingProfileId || profile_data?.id || crypto.randomUUID();
    
    const claimedProfile = {
      id: profileId,
      project_id: projectId, // Link to projects table
      project_name: profile_data?.projectName || githubUser.name || githubUser.login,
      description: profile_data?.description || null,
      category: profile_data?.category || null,
      country: profile_data?.country || null,
      website_url: profile_data?.websiteUrl || null,
      program_id: programId || null,
      wallet_address: profile_data?.walletAddress || null,
      claimer_wallet: profile_data?.walletAddress || null,
      github_org_url: githubOrgUrl || primaryRepo?.html_url || null,
      github_username: githubUser.login,
      github_access_token: accessToken,
      github_token_scope: tokenScope,
      x_user_id: xUserId || null,
      x_username: profile_data?.xUsername || null,
      discord_url: profile_data?.socials?.discordUrl || null,
      telegram_url: profile_data?.socials?.telegramUrl || null,
      media_assets: profile_data?.mediaAssets || [],
      milestones: profile_data?.milestones || [],
      verified: true,
      verified_at: new Date().toISOString(),
      resilience_score: resilienceScore,
      liveness_status: livenessStatus,
      // Authority verification data (SIWS)
      authority_wallet: profile_data?.authorityWallet || null,
      authority_verified_at: profile_data?.authorityVerified ? new Date().toISOString() : null,
      authority_signature: profile_data?.authoritySignature || null,
      authority_type: profile_data?.authorityType || null,
      // Multisig verification data (Squads)
      multisig_address: profile_data?.multisigAddress || null,
      squads_version: profile_data?.squadsVersion || null,
      multisig_verified_via: profile_data?.multisigVerifiedVia || null,
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

    // Trigger full analytics fetch to populate all extended fields
    const repoUrl = githubOrgUrl || primaryRepo?.html_url;
    if (repoUrl && savedProfile?.id) {
      try {
        const analyzeUrl = `${supabaseUrl}/functions/v1/analyze-github-repo`;
        await fetch(analyzeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            github_url: repoUrl,
            profile_id: savedProfile.id,
          }),
        });
        console.log("Triggered full analytics fetch for profile:", savedProfile.id);
      } catch (err) {
        console.error("Failed to trigger analytics fetch:", err);
        // Non-blocking - profile was still created successfully
      }
    }

    // Return success with profile data (exclude access token from response)
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          id: savedProfile.id,
          projectId: projectId,
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
