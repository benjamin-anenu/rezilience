

# Fix: Add package.json (JS/TS) Parsing to analyze-dependencies

## Root Cause

The `analyze-dependencies` edge function currently only parses `Cargo.toml` (Rust projects). When analyzing a JavaScript/TypeScript project like this one (`https://github.com/benjamin-anenu/resilience`), it finds no Cargo.toml and returns zero dependencies.

The plan to add `package.json` support was approved but **the edge function was not updated** with that code.

---

## Solution

Enhance the edge function to:
1. First try `Cargo.toml` (existing Rust logic)
2. If not found, try `package.json` (new JS/TS logic)
3. Store dependencies with `dependency_type = 'npm'` for npm packages

---

## File Changes

### 1. `supabase/functions/analyze-dependencies/index.ts`

**Add new functions:**

```typescript
// Fetch package.json from GitHub
async function fetchPackageJson(owner: string, repo: string, token: string): Promise<object | null> {
  const branches = ["main", "master", "develop"];
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/json",
          "User-Agent": "Resilience-Registry",
        },
      });
      
      if (response.ok) {
        console.log(`Found package.json at ${branch}/package.json`);
        return await response.json();
      }
    } catch {
      continue;
    }
  }
  return null;
}

// Parse package.json dependencies
function parsePackageJson(pkg: any): Map<string, string> {
  const deps = new Map<string, string>();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  for (const [name, version] of Object.entries(allDeps)) {
    deps.set(name, String(version).replace(/[\^~>=<]/g, ''));
  }
  return deps;
}

// Get latest version from npm registry
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

// Get npm download count as proxy for "dependents"
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
```

**Critical npm dependencies to track:**

```typescript
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
```

**Update main handler to try package.json if no Cargo.toml:**

```typescript
// Current code ends at line 290 with "No Cargo.toml found"
// CHANGE: Instead of returning neutral, try package.json

if (!cargoContent) {
  console.log("No Cargo.toml found - checking for package.json...");
  
  const packageJson = await fetchPackageJson(owner, repo, githubToken);
  
  if (packageJson) {
    // Parse and analyze npm dependencies
    const parsedDeps = parsePackageJson(packageJson);
    console.log(`Found ${parsedDeps.size} npm dependencies`);
    
    const dependencies: CrateDependency[] = [];
    let outdatedCount = 0;
    let criticalCount = 0;
    
    for (const [name, currentVersion] of parsedDeps) {
      // Rate limit: be gentle with npm registry
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const latestVersion = await getNpmLatestVersion(name);
      const isCritical = CRITICAL_NPM_DEPS.includes(name);
      
      if (latestVersion) {
        const monthsBehind = calculateVersionGap(currentVersion, latestVersion);
        const isOutdated = monthsBehind > 0;
        const downloads = await getNpmDownloads(name);
        
        dependencies.push({
          name,
          currentVersion,
          latestVersion,
          monthsBehind,
          isOutdated,
          isCritical,
          reverseDeps: downloads, // Using downloads as proxy
        });
        
        if (isOutdated) {
          outdatedCount++;
          if (isCritical && monthsBehind >= 3) {
            criticalCount++;
          }
        }
      }
    }
    
    const healthScore = calculateHealthScore(dependencies, outdatedCount, criticalCount);
    const result = { healthScore, totalDependencies: dependencies.length, ... };
    
    // Store with dependency_type = 'npm'
    if (profile_id) {
      await updateProfile(profile_id, result);
      await storeDependencyGraph(profile_id, dependencies, 'npm');
    }
    
    return new Response(JSON.stringify({ success: true, data: result }), ...);
  }
  
  // Neither Cargo.toml nor package.json found
  return new Response(
    JSON.stringify({ success: true, data: { healthScore: 50, ... }, note: "No dependency files found" }),
    ...
  );
}
```

**Update storeDependencyGraph to include dependency_type:**

```typescript
async function storeDependencyGraph(
  profileId: string, 
  dependencies: CrateDependency[], 
  dependencyType: 'crate' | 'npm' | 'pypi' = 'crate'
): Promise<void> {
  // ... existing code ...
  
  const rows = dependencies.map((dep) => ({
    source_profile_id: profileId,
    crate_name: dep.name, // This column stores package name for all types
    package_name: dep.name, // New column for clarity
    dependency_type: dependencyType, // 'crate', 'npm', or 'pypi'
    current_version: dep.currentVersion,
    latest_version: dep.latestVersion,
    months_behind: dep.monthsBehind,
    is_critical: dep.isCritical,
    is_outdated: dep.isOutdated,
    crates_io_url: dependencyType === 'crate' ? `https://crates.io/crates/${dep.name}` : null,
    npm_url: dependencyType === 'npm' ? `https://www.npmjs.com/package/${dep.name}` : null,
    crates_io_dependents: dep.reverseDeps,
    analyzed_at: new Date().toISOString(),
  }));
  
  // ... rest of insert logic ...
}
```

---

### 2. Update `useDependencyGraph.ts`

Include `dependency_type` and `npm_url` in the data model:

```typescript
export interface DependencyNode {
  id: string;
  crate_name: string;
  current_version: string | null;
  latest_version: string | null;
  months_behind: number;
  is_critical: boolean;
  is_outdated: boolean;
  crates_io_url: string | null;
  npm_url: string | null; // NEW
  crates_io_dependents: number;
  dependency_type: 'crate' | 'npm' | 'pypi'; // NEW
}
```

---

### 3. Update `DependencyNode.tsx` and `NodeDetailPanel.tsx`

Show npm icon for JS/TS dependencies and crates.io icon for Rust:

```typescript
// In DependencyNode.tsx
const typeIcon = dependencyType === 'npm' ? '📦' : dependencyType === 'pypi' ? '🐍' : '🦀';

// In NodeDetailPanel.tsx
const registryUrl = dependencyType === 'npm' ? npmUrl : cratesIoUrl;
const registryName = dependencyType === 'npm' ? 'npm' : 'crates.io';
```

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/analyze-dependencies/index.ts` | Add package.json parsing, npm registry lookups |
| `src/hooks/useDependencyGraph.ts` | Include dependency_type and npm_url |
| `src/components/dependency-tree/DependencyNode.tsx` | Show language-specific icons |
| `src/components/dependency-tree/NodeDetailPanel.tsx` | Link to correct registry |

---

## After Implementation

Once the edge function is updated:
1. Click "Analyze Dependencies Now" again
2. The function will find `package.json` in your repo
3. It will parse all npm dependencies (react, react-router-dom, etc.)
4. The tree will populate with your actual project dependencies

