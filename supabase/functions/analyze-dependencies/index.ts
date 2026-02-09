import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CrateDependency {
  name: string;
  currentVersion: string;
  latestVersion: string | null;
  monthsBehind: number;
  isOutdated: boolean;
  isCritical: boolean;
}

interface DependencyAnalysisResult {
  healthScore: number;
  totalDependencies: number;
  outdatedCount: number;
  criticalCount: number;
  dependencies: CrateDependency[];
  analyzedAt: string;
}

// Critical Solana dependencies to track
const CRITICAL_DEPS = [
  "anchor-lang",
  "anchor-spl",
  "solana-program",
  "solana-sdk",
  "spl-token",
  "solana-client",
];

/**
 * Parse GitHub URL to owner/repo
 */
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

/**
 * Fetch Cargo.toml from GitHub raw content
 */
async function fetchCargoToml(owner: string, repo: string, token: string): Promise<string | null> {
  const branches = ["main", "master", "develop"];
  const paths = ["Cargo.toml", "programs/Cargo.toml", "program/Cargo.toml"];
  
  for (const branch of branches) {
    for (const path of paths) {
      try {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "text/plain",
            "User-Agent": "Resilience-Registry",
          },
        });
        
        if (response.ok) {
          console.log(`Found Cargo.toml at ${branch}/${path}`);
          return await response.text();
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Parse [dependencies] section from Cargo.toml
 */
function parseCargoToml(content: string): Map<string, string> {
  const deps = new Map<string, string>();
  
  // Match [dependencies] section
  const depSectionMatch = content.match(/\[dependencies\]([\s\S]*?)(?=\[|$)/);
  if (!depSectionMatch) return deps;
  
  const depSection = depSectionMatch[1];
  const lines = depSection.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    
    // Match: name = "version" or name = { version = "..." }
    const simpleMatch = trimmed.match(/^([a-z0-9_-]+)\s*=\s*"([^"]+)"/i);
    const complexMatch = trimmed.match(/^([a-z0-9_-]+)\s*=\s*\{/i);
    
    if (simpleMatch) {
      deps.set(simpleMatch[1], simpleMatch[2]);
    } else if (complexMatch) {
      const versionMatch = trimmed.match(/version\s*=\s*"([^"]+)"/);
      if (versionMatch) {
        deps.set(complexMatch[1], versionMatch[1]);
      }
    }
  }
  
  return deps;
}

/**
 * Get latest version from crates.io API
 * Rate limited: 1 request/second
 */
async function getLatestCrateVersion(crateName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://crates.io/api/v1/crates/${crateName}`, {
      headers: {
        "User-Agent": "Resilience-Registry (contact@resilience.fi)",
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      console.warn(`Crate ${crateName} not found on crates.io`);
      return null;
    }
    
    const data = await response.json();
    return data.crate?.newest_version || null;
  } catch (error) {
    console.error(`Error fetching crate ${crateName}:`, error);
    return null;
  }
}

/**
 * Parse semantic version and compare
 * Returns estimated months behind
 */
function calculateVersionGap(current: string, latest: string): number {
  try {
    // Clean version strings (remove ^, ~, etc.)
    const cleanCurrent = current.replace(/[\^~>=<]/, "").split("-")[0].split("+")[0];
    const cleanLatest = latest.split("-")[0].split("+")[0];
    
    const currentParts = cleanCurrent.split(".").map((p) => parseInt(p, 10) || 0);
    const latestParts = cleanLatest.split(".").map((p) => parseInt(p, 10) || 0);
    
    // Pad to 3 parts
    while (currentParts.length < 3) currentParts.push(0);
    while (latestParts.length < 3) latestParts.push(0);
    
    const [curMajor, curMinor, curPatch] = currentParts;
    const [latMajor, latMinor, latPatch] = latestParts;
    
    // Estimate months behind based on version difference
    if (curMajor < latMajor) {
      return (latMajor - curMajor) * 12; // Major versions ~ 12 months
    } else if (curMinor < latMinor) {
      return Math.ceil((latMinor - curMinor) * 3); // Minor versions ~ 3 months
    } else if (curPatch < latPatch) {
      return Math.ceil((latPatch - curPatch) * 0.5); // Patches ~ 2 weeks each
    }
    
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Calculate health score from dependency analysis
 */
function calculateHealthScore(
  dependencies: CrateDependency[],
  outdatedCount: number,
  criticalCount: number
): number {
  if (dependencies.length === 0) return 100; // No deps = no debt
  
  let score = 100;
  
  // Penalty for outdated dependencies
  const outdatedRatio = outdatedCount / dependencies.length;
  score -= outdatedRatio * 30; // Up to -30 for all outdated
  
  // Heavy penalty for critical dependencies being outdated
  score -= criticalCount * 15; // -15 per critical outdated
  
  // Penalty for very old dependencies (6+ months)
  const veryOld = dependencies.filter((d) => d.monthsBehind >= 6).length;
  score -= veryOld * 5;
  
  return Math.max(0, Math.round(score));
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

    console.log(`📦 Analyzing dependencies for: ${owner}/${repo}`);

    // Fetch Cargo.toml
    const cargoContent = await fetchCargoToml(owner, repo, githubToken);
    
    if (!cargoContent) {
      console.log("No Cargo.toml found - not a Rust/Solana project");
      
      // Return neutral score for non-Rust projects
      const result: DependencyAnalysisResult = {
        healthScore: 50, // Neutral - can't analyze
        totalDependencies: 0,
        outdatedCount: 0,
        criticalCount: 0,
        dependencies: [],
        analyzedAt: new Date().toISOString(),
      };
      
      // Update profile if provided
      if (profile_id) {
        await updateProfile(profile_id, result);
      }
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "No Cargo.toml found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse dependencies
    const parsedDeps = parseCargoToml(cargoContent);
    console.log(`Found ${parsedDeps.size} dependencies in Cargo.toml`);

    // Analyze each dependency against crates.io
    const dependencies: CrateDependency[] = [];
    let outdatedCount = 0;
    let criticalCount = 0;

    for (const [name, currentVersion] of parsedDeps) {
      // Rate limit: 1 request/second to respect crates.io
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const latestVersion = await getLatestCrateVersion(name);
      const isCritical = CRITICAL_DEPS.includes(name);
      
      if (latestVersion) {
        const monthsBehind = calculateVersionGap(currentVersion, latestVersion);
        const isOutdated = monthsBehind > 0;
        
        dependencies.push({
          name,
          currentVersion,
          latestVersion,
          monthsBehind,
          isOutdated,
          isCritical,
        });
        
        if (isOutdated) {
          outdatedCount++;
          if (isCritical && monthsBehind >= 3) {
            criticalCount++;
          }
        }
      }
    }

    // Calculate health score
    const healthScore = calculateHealthScore(dependencies, outdatedCount, criticalCount);

    const result: DependencyAnalysisResult = {
      healthScore,
      totalDependencies: dependencies.length,
      outdatedCount,
      criticalCount,
      dependencies: dependencies.sort((a, b) => b.monthsBehind - a.monthsBehind),
      analyzedAt: new Date().toISOString(),
    };

    console.log(`✅ Dependency analysis complete: ${healthScore}/100 health, ${outdatedCount} outdated, ${criticalCount} critical`);

    // Update profile if provided
    if (profile_id) {
      await updateProfile(profile_id, result);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing dependencies:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Update claimed_profiles with dependency analysis results
 */
async function updateProfile(profileId: string, result: DependencyAnalysisResult): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { error } = await supabase
    .from("claimed_profiles")
    .update({
      dependency_health_score: result.healthScore,
      dependency_outdated_count: result.outdatedCount,
      dependency_critical_count: result.criticalCount,
      dependency_analyzed_at: result.analyzedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating claimed_profiles:", error);
  } else {
    console.log(`Updated profile ${profileId} with dependency analysis`);
  }
}
