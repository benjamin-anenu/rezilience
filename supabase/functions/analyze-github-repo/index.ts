import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GitHubAnalysisResult {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  contributors: number;
  openIssues: number;
  createdAt: string;
  pushedAt: string;
  isFork: boolean;
  topics: string[];
  commitVelocity: number;
  commitsLast30Days: number;
  releasesLast30Days: number;
  latestRelease: { tag: string; date: string } | null;
  topContributors: Array<{ login: string; contributions: number; avatar: string }>;
  recentEvents: Array<{ type: string; actor: string; date: string; message?: string }>;
  resilienceScore: number;
  livenessStatus: "ACTIVE" | "STALE" | "DECAYING";
  daysSinceLastCommit: number;
  // Multi-signal activity tracking
  pushEvents30d: number;
  prEvents30d: number;
  issueEvents30d: number;
  lastActivity: string;
  daysSinceLastActivity: number;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\?#]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}

async function fetchWithAuth(url: string, token: string): Promise<Response> {
  return fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Resilience-Registry",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { github_url, profile_id } = await req.json();

    if (!github_url) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing github_url parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = parseGitHubUrl(github_url);
    if (!parsed) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid GitHub URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { owner, repo } = parsed;
    const githubToken = Deno.env.get("GITHUB_TOKEN");

    if (!githubToken) {
      return new Response(
        JSON.stringify({ success: false, error: "GitHub integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing repository: ${owner}/${repo}`);

    // Fetch all data in parallel for speed
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sinceDate = thirtyDaysAgo.toISOString();

    const [repoResponse, commitsResponse, contributorsResponse, releasesResponse, eventsResponse] = await Promise.all([
      fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}`, githubToken),
      fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/commits?since=${sinceDate}&per_page=100`, githubToken),
      fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`, githubToken),
      fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`, githubToken),
      fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/events?per_page=20`, githubToken),
    ]);

    // Check if repo exists
    if (repoResponse.status === 404) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Repository not found. It may be private - try connecting your GitHub account instead.",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!repoResponse.ok) {
      console.error("GitHub API error:", await repoResponse.text());
      return new Response(
        JSON.stringify({ success: false, error: "Failed to fetch repository data" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const repoData = await repoResponse.json();
    
    // Parse commits
    let commits: any[] = [];
    if (commitsResponse.ok) {
      commits = await commitsResponse.json();
    }
    
    // Parse contributors
    let contributors: any[] = [];
    if (contributorsResponse.ok) {
      contributors = await contributorsResponse.json();
    }
    
    // Parse releases
    let releases: any[] = [];
    if (releasesResponse.ok) {
      releases = await releasesResponse.json();
    }
    
    // Parse events
    let events: any[] = [];
    if (eventsResponse.ok) {
      events = await eventsResponse.json();
    }

    // Calculate metrics
    const commitsLast30Days = commits.length;
    const commitVelocity = commitsLast30Days / 30; // commits per day

    const pushedAt = new Date(repoData.pushed_at);
    const now = new Date();
    const daysSinceLastCommit = Math.floor((now.getTime() - pushedAt.getTime()) / (1000 * 60 * 60 * 24));

    // Filter releases in last 30 days
    const releasesLast30Days = releases.filter((r: any) => {
      const releaseDate = new Date(r.published_at);
      return releaseDate > thirtyDaysAgo;
    }).length;

    const latestRelease = releases[0]
      ? { tag: releases[0].tag_name, date: releases[0].published_at }
      : null;

    // Top contributors
    const topContributors = contributors.slice(0, 5).map((c: any) => ({
      login: c.login,
      contributions: c.contributions,
      avatar: c.avatar_url,
    }));

    // === MULTI-SIGNAL ACTIVITY TRACKING ===
    // Filter events from last 30 days
    const eventsLast30Days = events.filter((e: any) => {
      const eventDate = new Date(e.created_at);
      return eventDate > thirtyDaysAgo;
    });

    // Count different activity types
    const pushEvents30d = eventsLast30Days.filter((e: any) => e.type === 'PushEvent').length;
    const prEvents30d = eventsLast30Days.filter((e: any) => e.type === 'PullRequestEvent').length;
    const issueEvents30d = eventsLast30Days.filter((e: any) => 
      e.type === 'IssuesEvent' || e.type === 'IssueCommentEvent'
    ).length;

    // Get most recent activity of ANY type (events are sorted by date desc)
    const lastActivity = events.length > 0 
      ? events[0].created_at 
      : repoData.pushed_at;
    const lastActivityDate = new Date(lastActivity);
    const daysSinceLastActivity = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    // Recent events (keep existing parsing)
    const recentEvents = events.slice(0, 10).map((e: any) => {
      const event: any = {
        type: e.type,
        actor: e.actor?.login || "unknown",
        date: e.created_at,
      };
      
      // Extract commit message for push events
      if (e.type === "PushEvent" && e.payload?.commits?.[0]) {
        event.message = e.payload.commits[0].message?.split("\n")[0] || "";
      }
      
      return event;
    });

    // Calculate Resilience Score
    let resilienceScore = 0;

    // Commit velocity (0-30 points)
    if (commitVelocity > 2) resilienceScore += 30;
    else if (commitVelocity > 1) resilienceScore += 25;
    else if (commitVelocity > 0.5) resilienceScore += 15;
    else if (commitVelocity > 0.1) resilienceScore += 8;

    // Contributors (0-25 points)
    const contributorCount = contributors.length;
    if (contributorCount > 20) resilienceScore += 25;
    else if (contributorCount > 10) resilienceScore += 20;
    else if (contributorCount > 5) resilienceScore += 15;
    else if (contributorCount > 2) resilienceScore += 10;
    else if (contributorCount > 0) resilienceScore += 5;

    // Releases (0-20 points)
    if (releasesLast30Days > 3) resilienceScore += 20;
    else if (releasesLast30Days > 1) resilienceScore += 15;
    else if (releasesLast30Days > 0) resilienceScore += 10;

    // Stars (0-15 points)
    if (repoData.stargazers_count > 10000) resilienceScore += 15;
    else if (repoData.stargazers_count > 1000) resilienceScore += 12;
    else if (repoData.stargazers_count > 100) resilienceScore += 8;
    else if (repoData.stargazers_count > 10) resilienceScore += 4;

    // Project age (0-10 points)
    const createdAt = new Date(repoData.created_at);
    const daysActive = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysActive > 365) resilienceScore += 10;
    else if (daysActive > 180) resilienceScore += 8;
    else if (daysActive > 90) resilienceScore += 5;

    // Determine liveness status using MULTI-SIGNAL activity
    // Weighted scoring: pushes 1x, PRs 2x (significant work), issues 1x, commits 1x
    const totalActivity = pushEvents30d + (prEvents30d * 2) + issueEvents30d + commitsLast30Days;
    
    let livenessStatus: "ACTIVE" | "STALE" | "DECAYING";
    if (daysSinceLastActivity <= 14 && totalActivity >= 5) {
      livenessStatus = "ACTIVE";
    } else if (daysSinceLastActivity <= 45) {
      livenessStatus = "STALE";
    } else {
      livenessStatus = "DECAYING";
    }
    
    console.log(`Multi-signal activity: pushes=${pushEvents30d}, PRs=${prEvents30d}, issues=${issueEvents30d}, commits=${commitsLast30Days}, total=${totalActivity}, daysSinceLastActivity=${daysSinceLastActivity}, status=${livenessStatus}`);

    resilienceScore = Math.min(Math.round(resilienceScore), 100);

    const result: GitHubAnalysisResult = {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description,
      htmlUrl: repoData.html_url,
      homepage: repoData.homepage,
      language: repoData.language,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      contributors: contributorCount,
      openIssues: repoData.open_issues_count,
      createdAt: repoData.created_at,
      pushedAt: repoData.pushed_at,
      isFork: repoData.fork,
      topics: repoData.topics || [],
      commitVelocity,
      commitsLast30Days,
      releasesLast30Days,
      latestRelease,
      topContributors,
      recentEvents,
      resilienceScore,
      livenessStatus,
      daysSinceLastCommit,
      // Multi-signal fields
      pushEvents30d,
      prEvents30d,
      issueEvents30d,
      lastActivity,
      daysSinceLastActivity,
    };

    console.log(`Analysis complete for ${owner}/${repo}: Score ${resilienceScore}, Status ${livenessStatus}, Activity=${totalActivity}`);

    // If profile_id is provided, update the claimed_profiles table
    if (profile_id) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from("claimed_profiles")
          .update({
            github_org_url: github_url,
            github_stars: result.stars,
            github_forks: result.forks,
            github_contributors: result.contributors,
            github_language: result.language,
            github_last_commit: result.pushedAt,
            github_commit_velocity: result.commitVelocity,
            github_commits_30d: result.commitsLast30Days,
            github_releases_30d: result.releasesLast30Days,
            github_open_issues: result.openIssues,
            github_topics: result.topics,
            github_top_contributors: result.topContributors,
            github_recent_events: result.recentEvents,
            github_is_fork: result.isFork,
            github_homepage: result.homepage,
            github_analyzed_at: new Date().toISOString(),
            resilience_score: result.resilienceScore,
            liveness_status: result.livenessStatus,
            // Multi-signal activity fields
            github_push_events_30d: result.pushEvents30d,
            github_pr_events_30d: result.prEvents30d,
            github_issue_events_30d: result.issueEvents30d,
            github_last_activity: result.lastActivity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing repository:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
