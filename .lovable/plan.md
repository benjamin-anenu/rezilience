

# Fix Dependency Analysis: Support Workspace Cargo.toml and Nested Structures

## Problem Identified

The dependency analyzer is **failing for almost all projects** because:

1. **Workspace Cargo.toml** - Many Solana projects use Cargo workspaces where the root `Cargo.toml` only has `[workspace]` with `members = [...]` but no `[dependencies]` section

2. **Nested dependency files** - Files are often in subdirectories like:
   - `programs/protocol-name/Cargo.toml`
   - `sdk/package.json`
   - `js/package.json`
   - `app/package.json`
   - `client/package.json`

3. **Your Resilience repo** - The analyzer couldn't find any dependency files because they may be in a subdirectory

---

## Current Paths Checked

| Type | Paths |
|------|-------|
| Cargo.toml | `Cargo.toml`, `programs/Cargo.toml`, `program/Cargo.toml` |
| package.json | `package.json` (root only) |
| Python | `requirements.txt`, `pyproject.toml` (root only) |

---

## Solution: Expand Path Discovery

### Enhanced Path Lists

```text
Cargo.toml paths:
- Cargo.toml (root - check for workspace members)
- programs/*/Cargo.toml (glob pattern simulation)
- program/Cargo.toml
- sdk/Cargo.toml
- cli/Cargo.toml

package.json paths:
- package.json
- app/package.json
- sdk/package.json
- js/package.json
- client/package.json
- packages/core/package.json

Python paths:
- requirements.txt
- requirements/base.txt
- requirements/production.txt
- pyproject.toml
- backend/requirements.txt
- api/requirements.txt
```

### Parse Workspace Members

When root `Cargo.toml` has `[workspace]`, extract member paths and fetch their `Cargo.toml` files:

```toml
[workspace]
members = [
    "programs/my-protocol",
    "programs/token",
    "sdk",
]
```

The analyzer will then check each member path for dependencies.

---

## Technical Implementation

### File: `supabase/functions/analyze-dependencies/index.ts`

**1. Add workspace parsing function:**

```typescript
function parseWorkspaceMembers(cargoContent: string): string[] {
  const match = cargoContent.match(/members\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return [];
  
  const members: string[] = [];
  const memberStrings = match[1].match(/"([^"]+)"/g);
  if (memberStrings) {
    for (const m of memberStrings) {
      members.push(m.replace(/"/g, ''));
    }
  }
  return members;
}
```

**2. Update fetchCargoToml to handle workspaces:**

```typescript
async function fetchCargoToml(owner: string, repo: string, token: string): Promise<string | null> {
  const branches = ["main", "master", "develop"];
  const rootPaths = ["Cargo.toml"];
  const additionalPaths = [
    "programs/Cargo.toml",
    "program/Cargo.toml", 
    "sdk/Cargo.toml",
    "cli/Cargo.toml"
  ];
  
  for (const branch of branches) {
    // First check root for workspace
    const rootUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/Cargo.toml`;
    const rootResponse = await fetch(rootUrl, { headers: {...} });
    
    if (rootResponse.ok) {
      const rootContent = await rootResponse.text();
      
      // Check if it's a workspace
      if (rootContent.includes("[workspace]")) {
        const members = parseWorkspaceMembers(rootContent);
        if (members.length > 0) {
          // Aggregate dependencies from all members
          const allDeps = new Map<string, string>();
          for (const member of members) {
            const memberContent = await fetchMemberCargoToml(owner, repo, branch, member, token);
            if (memberContent) {
              const deps = parseCargoToml(memberContent);
              for (const [k, v] of deps) {
                allDeps.set(k, v);
              }
            }
          }
          // Return combined result
          return createCombinedCargoToml(allDeps);
        }
      }
      
      // Not a workspace - parse normally
      return rootContent;
    }
    
    // Check additional paths
    for (const path of additionalPaths) {
      // ... existing logic
    }
  }
  return null;
}
```

**3. Expand package.json paths:**

```typescript
async function fetchPackageJson(owner: string, repo: string, token: string): Promise<object | null> {
  const branches = ["main", "master", "develop"];
  const paths = [
    "package.json",
    "app/package.json",
    "sdk/package.json",
    "js/package.json",
    "client/package.json",
    "packages/core/package.json",
    "frontend/package.json",
  ];
  
  for (const branch of branches) {
    for (const path of paths) {
      // Try each path
    }
  }
  return null;
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-dependencies/index.ts` | Add workspace parsing, expand path discovery, aggregate dependencies from multiple sources |

---

## Expected Outcomes

After this fix:

| Project | Current Result | Expected Result |
|---------|---------------|-----------------|
| OpenBook V2 | 0 dependencies | 15+ crates from workspace members |
| Metaplex Core | 0 dependencies | 20+ crates from mpl-core program |
| Drift Protocol | 0 dependencies | 30+ crates from programs/* |
| Resilience | Not found | Dependencies from wherever they exist |

---

## Re-run Analysis

After deployment, trigger a full refresh to re-analyze all projects with the improved path discovery.

