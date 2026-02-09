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
  reverseDeps: number;
}

interface DependencyAnalysisResult {
  healthScore: number;
  totalDependencies: number;
  outdatedCount: number;
  criticalCount: number;
  dependencies: CrateDependency[];
  analyzedAt: string;
  dependencyType: 'crate' | 'npm' | 'pypi';
}

// Critical Solana/Rust dependencies to track
const CRITICAL_DEPS = [
  "anchor-lang",
  "anchor-spl",
  "solana-program",
  "solana-sdk",
  "spl-token",
  "solana-client",
];

// Critical npm dependencies to track
const CRITICAL_NPM_DEPS = [
  "@solana/web3.js",
  "@solana/spl-token",
  "@project-serum/anchor",
  "@coral-xyz/anchor",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
  "react",
  "next",
  "typescript",
];

// Critical Python/PyPI dependencies to track
const CRITICAL_PYPI_DEPS = [
  "solana",
  "solders",
  "anchorpy",
  "base58",
  "pynacl",
  "httpx",
  "aiohttp",
  "fastapi",
  "django",
  "flask",
  "pytest",
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
 * Fetch package.json from GitHub raw content
 */
async function fetchPackageJson(owner: string, repo: string, token: string): Promise<object | null> {
  const branches = ["main", "master", "develop"];
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
      console.log(`Checking for package.json at: ${url}`);
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/json",
          "User-Agent": "Resilience-Registry",
        },
      });
      
      console.log(`Response status for ${branch}/package.json: ${response.status}`);
      
      if (response.ok) {
        console.log(`Found package.json at ${branch}/package.json`);
        return await response.json();
      }
    } catch (error) {
      console.error(`Error fetching ${branch}/package.json:`, error);
      continue;
    }
  }
  console.log("No package.json found in any branch");
  return null;
}

/**
 * Fetch requirements.txt from GitHub raw content
 */
async function fetchRequirementsTxt(owner: string, repo: string, token: string): Promise<string | null> {
  const branches = ["main", "master", "develop"];
  const paths = ["requirements.txt", "requirements/base.txt", "requirements/production.txt"];
  
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
          console.log(`Found ${path} at ${branch}/${path}`);
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
 * Fetch pyproject.toml from GitHub raw content
 */
async function fetchPyprojectToml(owner: string, repo: string, token: string): Promise<string | null> {
  const branches = ["main", "master", "develop"];
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/pyproject.toml`;
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "text/plain",
          "User-Agent": "Resilience-Registry",
        },
      });
      
      if (response.ok) {
        console.log(`Found pyproject.toml at ${branch}/pyproject.toml`);
        return await response.text();
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * Parse package.json dependencies
 */
function parsePackageJson(pkg: any): Map<string, string> {
  const deps = new Map<string, string>();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  for (const [name, version] of Object.entries(allDeps)) {
    deps.set(name, String(version).replace(/[\^~>=<]/g, ''));
  }
  return deps;
}

/**
 * Parse requirements.txt file
 * Handles formats: package==1.0.0, package>=1.0.0, package~=1.0, package
 * Skips: comments, editable installs (-e), local paths, URLs
 */
function parseRequirementsTxt(content: string): Map<string, string> {
  const deps = new Map<string, string>();
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines, comments, editable installs, URLs, and local paths
    if (!trimmed || 
        trimmed.startsWith("#") || 
        trimmed.startsWith("-e") || 
        trimmed.startsWith("-r") ||
        trimmed.startsWith("git+") ||
        trimmed.startsWith("http") ||
        trimmed.startsWith("./") ||
        trimmed.startsWith("../")) {
      continue;
    }
    
    // Match patterns: package==1.0.0, package>=1.0.0, package~=1.0, package<=1.0
    const match = trimmed.match(/^([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)\s*([=<>~!]+)?\s*([0-9][^;\s#]*)?/);
    
    if (match) {
      const packageName = match[1].replace(/\[.*\]/, '').toLowerCase(); // Remove extras like [security]
      const version = match[3] || "latest";
      deps.set(packageName, version.replace(/[\^~>=<!=]/g, ''));
    }
  }
  
  return deps;
}

/**
 * Parse pyproject.toml dependencies
 * Handles both PEP 621 format and Poetry format
 */
function parsePyprojectToml(content: string): Map<string, string> {
  const deps = new Map<string, string>();
  
  // Match PEP 621 [project.dependencies] format
  const projectDepsMatch = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (projectDepsMatch) {
    const depsBlock = projectDepsMatch[1];
    const depsStrings = depsBlock.match(/"([^"]+)"/g);
    if (depsStrings) {
      for (const depStr of depsStrings) {
        const cleaned = depStr.replace(/"/g, '');
        const match = cleaned.match(/^([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)\s*([=<>~!]+)?\s*([0-9][^,;\s]*)?/);
        if (match) {
          const packageName = match[1].replace(/\[.*\]/, '').toLowerCase();
          const version = match[3] || "latest";
          deps.set(packageName, version.replace(/[\^~>=<!=]/g, ''));
        }
      }
    }
  }
  
  // Match Poetry [tool.poetry.dependencies] format
  const poetryMatch = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?=\[|$)/);
  if (poetryMatch) {
    const poetrySection = poetryMatch[1];
    const lines = poetrySection.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      // Skip python version specification
      if (trimmed.startsWith("python")) continue;
      
      // Match: package = "^1.0.0" or package = { version = "^1.0" }
      const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
      const complexMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{/);
      
      if (simpleMatch) {
        const packageName = simpleMatch[1].toLowerCase();
        const version = simpleMatch[2].replace(/[\^~>=<!=]/g, '');
        deps.set(packageName, version);
      } else if (complexMatch) {
        const versionMatch = trimmed.match(/version\s*=\s*"([^"]+)"/);
        if (versionMatch) {
          const packageName = complexMatch[1].toLowerCase();
          const version = versionMatch[1].replace(/[\^~>=<!=]/g, '');
          deps.set(packageName, version);
        }
      }
    }
  }
  
  return deps;
}

/**
 * Get latest version from npm registry
 */
async function getNpmLatestVersion(packageName: string): Promise<string | null> {
  try {
    // Handle scoped packages (@org/name)
    const encodedName = encodeURIComponent(packageName);
    const response = await fetch(`https://registry.npmjs.org/${encodedName}/latest`, {
      headers: {
        "User-Agent": "Resilience-Registry",
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      console.warn(`Package ${packageName} not found on npm`);
      return null;
    }
    
    const data = await response.json();
    return data.version || null;
  } catch (error) {
    console.error(`Error fetching npm package ${packageName}:`, error);
    return null;
  }
}

/**
 * Get npm download count as proxy for "dependents"
 */
async function getNpmDownloads(packageName: string): Promise<number> {
  try {
    const encodedName = encodeURIComponent(packageName);
    const response = await fetch(
      `https://api.npmjs.org/downloads/point/last-week/${encodedName}`,
      { headers: { "User-Agent": "Resilience-Registry" } }
    );
    
    if (!response.ok) return 0;
    const data = await response.json();
    return data.downloads || 0;
  } catch {
    return 0;
  }
}

/**
 * Get latest version from PyPI registry
 */
async function getPypiLatestVersion(packageName: string): Promise<string | null> {
  try {
    const response = await fetch(`https://pypi.org/pypi/${packageName}/json`, {
      headers: {
        "User-Agent": "Resilience-Registry",
        Accept: "application/json",
      },
    });
    
    if (!response.ok) {
      console.warn(`Package ${packageName} not found on PyPI`);
      return null;
    }
    
    const data = await response.json();
    return data.info?.version || null;
  } catch (error) {
    console.error(`Error fetching PyPI package ${packageName}:`, error);
    return null;
  }
}

/**
 * Get PyPI download count as proxy for ecosystem impact
 * Uses pypistats.org API
 */
async function getPypiDownloads(packageName: string): Promise<number> {
  try {
    const response = await fetch(
      `https://pypistats.org/api/packages/${packageName}/recent`,
      { headers: { "User-Agent": "Resilience-Registry" } }
    );
    
    if (!response.ok) return 0;
    const data = await response.json();
    return data.data?.last_week || 0;
  } catch {
    return 0;
  }
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
 * Get reverse dependency count from crates.io
 */
async function getCrateReverseDeps(crateName: string): Promise<number> {
  try {
    const response = await fetch(`https://crates.io/api/v1/crates/${crateName}/reverse_dependencies?per_page=1`, {
      headers: {
        "User-Agent": "Resilience-Registry (contact@resilience.fi)",
        Accept: "application/json",
      },
    });
    
    if (!response.ok) return 0;
    
    const data = await response.json();
    return data.meta?.total || 0;
  } catch {
    return 0;
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

/**
 * Analyze Python dependencies from requirements.txt or pyproject.toml
 */
async function analyzePypiDependencies(
  owner: string,
  repo: string,
  githubToken: string,
  profileId: string | null
): Promise<Response | null> {
  // Try requirements.txt first
  let content = await fetchRequirementsTxt(owner, repo, githubToken);
  let parsedDeps: Map<string, string>;
  let sourceFile = "requirements.txt";
  
  if (content) {
    parsedDeps = parseRequirementsTxt(content);
  } else {
    // Try pyproject.toml
    content = await fetchPyprojectToml(owner, repo, githubToken);
    if (!content) {
      return null; // No Python dependency files found
    }
    parsedDeps = parsePyprojectToml(content);
    sourceFile = "pyproject.toml";
  }
  
  if (parsedDeps.size === 0) {
    console.log(`Found ${sourceFile} but no dependencies parsed`);
    return null;
  }
  
  console.log(`Found ${parsedDeps.size} Python dependencies in ${sourceFile}`);
  
  const dependencies: CrateDependency[] = [];
  let outdatedCount = 0;
  let criticalCount = 0;
  
  // Limit to first 100 dependencies for large projects
  const depEntries = Array.from(parsedDeps.entries()).slice(0, 100);
  
  for (const [name, currentVersion] of depEntries) {
    // Rate limit: 300ms between requests (PyPI is generous but be polite)
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const latestVersion = await getPypiLatestVersion(name);
    const isCritical = CRITICAL_PYPI_DEPS.includes(name);
    
    if (latestVersion) {
      const monthsBehind = currentVersion === "latest" 
        ? 0 
        : calculateVersionGap(currentVersion, latestVersion);
      const isOutdated = monthsBehind > 0;
      
      // Get download count as ecosystem impact proxy
      const downloads = await getPypiDownloads(name);
      
      dependencies.push({
        name,
        currentVersion: currentVersion === "latest" ? latestVersion : currentVersion,
        latestVersion,
        monthsBehind,
        isOutdated,
        isCritical,
        reverseDeps: downloads,
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
    dependencyType: 'pypi',
  };
  
  console.log(`✅ Python/PyPI dependency analysis complete: ${healthScore}/100 health, ${outdatedCount} outdated, ${criticalCount} critical`);
  
  // Update profile and store in dependency_graph table
  if (profileId) {
    await updateProfile(profileId, result);
    await storeDependencyGraph(profileId, dependencies, 'pypi');
  }
  
  return new Response(
    JSON.stringify({ success: true, data: result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

/**
 * Analyze npm dependencies from package.json
 */
async function analyzeNpmDependencies(
  owner: string,
  repo: string,
  githubToken: string,
  profileId: string | null
): Promise<Response | null> {
  const packageJson = await fetchPackageJson(owner, repo, githubToken);
  
  if (!packageJson) {
    return null; // No package.json found
  }
  
  // Parse and analyze npm dependencies
  const parsedDeps = parsePackageJson(packageJson);
  console.log(`Found ${parsedDeps.size} npm dependencies in package.json`);
  
  const dependencies: CrateDependency[] = [];
  let outdatedCount = 0;
  let criticalCount = 0;
  
  for (const [name, currentVersion] of parsedDeps) {
    // Rate limit: be gentle with npm registry (500ms between requests)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const latestVersion = await getNpmLatestVersion(name);
    const isCritical = CRITICAL_NPM_DEPS.includes(name);
    
    if (latestVersion) {
      const monthsBehind = calculateVersionGap(currentVersion, latestVersion);
      const isOutdated = monthsBehind > 0;
      
      // Get download count as ecosystem impact proxy
      const downloads = await getNpmDownloads(name);
      
      dependencies.push({
        name,
        currentVersion,
        latestVersion,
        monthsBehind,
        isOutdated,
        isCritical,
        reverseDeps: downloads,
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
    dependencyType: 'npm',
  };
  
  console.log(`✅ NPM dependency analysis complete: ${healthScore}/100 health, ${outdatedCount} outdated, ${criticalCount} critical`);
  
  // Update profile and store in dependency_graph table
  if (profileId) {
    await updateProfile(profileId, result);
    await storeDependencyGraph(profileId, dependencies, 'npm');
  }
  
  return new Response(
    JSON.stringify({ success: true, data: result }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
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

    // First try Cargo.toml (Rust projects)
    const cargoContent = await fetchCargoToml(owner, repo, githubToken);
    
    if (!cargoContent) {
      console.log("No Cargo.toml found - checking for package.json...");
      
      // Try package.json (JS/TS projects)
      const npmResponse = await analyzeNpmDependencies(owner, repo, githubToken, profile_id);
      
      if (npmResponse) {
        return npmResponse;
      }
      
      console.log("No package.json found - checking for Python dependencies...");
      
      // Try Python (requirements.txt or pyproject.toml)
      const pypiResponse = await analyzePypiDependencies(owner, repo, githubToken, profile_id);
      
      if (pypiResponse) {
        return pypiResponse;
      }
      
      // No dependency files found at all
      console.log("No dependency files found (Cargo.toml, package.json, requirements.txt, or pyproject.toml)");
      
      const result: DependencyAnalysisResult = {
        healthScore: 50, // Neutral - can't analyze
        totalDependencies: 0,
        outdatedCount: 0,
        criticalCount: 0,
        dependencies: [],
        analyzedAt: new Date().toISOString(),
        dependencyType: 'crate',
      };
      
      // Update profile if provided
      if (profile_id) {
        await updateProfile(profile_id, result);
      }
      
      return new Response(
        JSON.stringify({ success: true, data: result, note: "No dependency files found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse Rust dependencies from Cargo.toml
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
        
        // Fetch reverse dependency count for ecosystem impact
        const reverseDeps = await getCrateReverseDeps(name);
        
        dependencies.push({
          name,
          currentVersion,
          latestVersion,
          monthsBehind,
          isOutdated,
          isCritical,
          reverseDeps,
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
      dependencyType: 'crate',
    };

    console.log(`✅ Rust dependency analysis complete: ${healthScore}/100 health, ${outdatedCount} outdated, ${criticalCount} critical`);

    // Update profile and store in dependency_graph table
    if (profile_id) {
      await updateProfile(profile_id, result);
      await storeDependencyGraph(profile_id, dependencies, 'crate');
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

/**
 * Store individual dependencies in dependency_graph table
 */
async function storeDependencyGraph(
  profileId: string, 
  dependencies: CrateDependency[],
  dependencyType: 'crate' | 'npm' | 'pypi' = 'crate'
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseKey) return;
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  // First, delete existing dependencies for this profile
  await supabase
    .from("dependency_graph")
    .delete()
    .eq("source_profile_id", profileId);

  // Insert new dependencies with type-specific fields
  const rows = dependencies.map((dep) => ({
    source_profile_id: profileId,
    crate_name: dep.name,
    package_name: dep.name,
    dependency_type: dependencyType,
    current_version: dep.currentVersion,
    latest_version: dep.latestVersion,
    months_behind: dep.monthsBehind,
    is_critical: dep.isCritical,
    is_outdated: dep.isOutdated,
    crates_io_url: dependencyType === 'crate' ? `https://crates.io/crates/${dep.name}` : null,
    npm_url: dependencyType === 'npm' ? `https://www.npmjs.com/package/${dep.name}` : null,
    pypi_url: dependencyType === 'pypi' ? `https://pypi.org/project/${dep.name}/` : null,
    crates_io_dependents: dep.reverseDeps,
    analyzed_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase
      .from("dependency_graph")
      .insert(rows);

    if (error) {
      console.error("Error storing dependency_graph:", error);
    } else {
      console.log(`Stored ${rows.length} ${dependencyType} dependencies in dependency_graph`);
    }
  }
}
