

# Enhanced Dependency Tree: Multi-Language + Ecosystem Impact

## Executive Summary

This plan addresses two critical gaps in the current implementation:
1. **Language Expansion**: Support package.json (JS/TS) and pyproject.toml/requirements.txt (Python) in addition to Cargo.toml
2. **Ecosystem Impact**: Show who depends on this project (forks, crates.io dependents, cross-registry links)

---

## Current State Analysis

| Aspect | Current | Gap |
|--------|---------|-----|
| Rust dependencies | Working (Cargo.toml) | Only 1 project analyzed |
| JS/TS dependencies | Missing | No package.json parsing |
| Python dependencies | Missing | No pyproject.toml parsing |
| GitHub forks | Data exists, UI partial | Not showing despite 214 forks |
| Crates.io dependents | Per-crate only | Not shown at project level |
| Cross-registry links | Missing | No matching against other profiles |

---

## Phase 1: Fix Current Visualization (Quick Win)

### 1.1 Show GitHub Forks Correctly

The canvas already has logic for forks but it's not rendering. Need to verify the data flow:

```text
claimed_profiles.github_forks → useDependencyGraph → DependencyTreeCanvas → Fork node
```

**Fix**: Ensure `github_forks` is properly passed and rendered even when no crate dependencies exist.

### 1.2 Add "Analyze Now" Button for Empty States

When no dependencies exist, show an action button to trigger analysis:

```text
┌─────────────────────────────────────────────────────────┐
│         [Package Icon]                                  │
│    No Dependencies Analyzed Yet                         │
│                                                         │
│    This project hasn't been analyzed for dependencies.  │
│    Click below to start the analysis.                   │
│                                                         │
│          [🔄 Analyze Dependencies Now]                  │
│                                                         │
│    ────────────────────────────────────                 │
│    ℹ️ Currently supports: Cargo.toml (Rust/Solana)      │
│       Coming soon: package.json, requirements.txt      │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 2: Multi-Language Dependency Support

### 2.1 Enhance Edge Function: analyze-dependencies

Add parsing for additional package managers:

| Language | File | Registry API |
|----------|------|--------------|
| Rust | Cargo.toml | crates.io |
| JavaScript/TypeScript | package.json | npm registry |
| Python | pyproject.toml, requirements.txt | PyPI |

### 2.2 New Database Column

Add `dependency_type` column to track the source:

```sql
ALTER TABLE dependency_graph 
ADD COLUMN dependency_type TEXT DEFAULT 'crate';
-- Values: 'crate', 'npm', 'pypi'
```

### 2.3 Edge Function Enhancement

```text
analyze-dependencies/index.ts
├── fetchCargoToml()      -- existing
├── fetchPackageJson()    -- NEW: npm dependencies
├── fetchPyProject()      -- NEW: Python dependencies
├── parseCargoToml()      -- existing
├── parsePackageJson()    -- NEW
├── parsePyProject()      -- NEW
├── getNpmLatestVersion() -- NEW: npm registry API
├── getPyPILatestVersion()-- NEW: PyPI API
└── storeDependencyGraph()-- enhance for type
```

### 2.4 Updated Visualization

Different colors/icons for different package types:

```text
Legend:
  🦀 Rust (crates.io)
  📦 JavaScript (npm)
  🐍 Python (PyPI)
```

---

## Phase 3: Ecosystem Impact (Reverse Dependencies)

### 3.1 Right-Side Nodes: Who Depends on This Project

The tree currently only shows LEFT side (what project uses). Add RIGHT side:

```text
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   [anchor-lang]──┐                            ┌──[214 Forks]      │
│   [anchor-spl]───┤                            │                   │
│   [solana-sdk]───┼────►[ PROJECT ]────────────┼──[629 crates.io]  │
│   [spl-token]────┤        NAME                │  dependents       │
│   [borsh]────────┘                            └──[3 Registry      │
│                                                   Projects]       │
│   INWARD DEPS                                 OUTWARD IMPACT      │
│   (Supply Chain)                              (Ecosystem Reach)   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2 Cross-Registry Linking

Match crate names against other `claimed_profiles` in the database:

```sql
-- Find which registered projects depend on a specific crate
SELECT DISTINCT cp.id, cp.project_name
FROM dependency_graph dg
JOIN claimed_profiles cp ON cp.id = dg.source_profile_id
WHERE dg.crate_name = 'anchor-lang'
  AND dg.source_profile_id != 'current-profile-id';
```

This creates internal links like:
- "3 Solana projects in this registry use anchor-lang"
- Clicking shows list of those projects

### 3.3 Aggregate Ecosystem Impact Score

Calculate and display:

```text
┌────────────────────────────────────────┐
│ ECOSYSTEM IMPACT                       │
│ ────────────────────────────────────── │
│ GitHub Forks:           214            │
│ crates.io Dependents:   1,200 total    │
│ Registry Dependents:    5 projects     │
│ ────────────────────────────────────── │
│ Impact Score:           HIGH           │
└────────────────────────────────────────┘
```

---

## Phase 4: Implementation Files

### Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/analyze-dependencies/index.ts` | Modify | Add package.json and pyproject.toml parsing |
| `src/hooks/useDependencyGraph.ts` | Modify | Fetch cross-registry links |
| `src/components/dependency-tree/DependencyTreeCanvas.tsx` | Modify | Add right-side ecosystem nodes |
| `src/components/dependency-tree/EcosystemImpactPanel.tsx` | Create | Side panel for impact metrics |
| `src/pages/DependencyTree.tsx` | Modify | Add "Analyze Now" button for empty states |
| Migration | Create | Add `dependency_type` column |

---

## Phase 5: Database Migration

```sql
-- Add dependency type for multi-language support
ALTER TABLE dependency_graph 
ADD COLUMN IF NOT EXISTS dependency_type TEXT DEFAULT 'crate';

-- Add index for cross-registry queries
CREATE INDEX IF NOT EXISTS idx_dependency_graph_crate_name 
ON dependency_graph(crate_name);

-- Add npm registry URL column
ALTER TABLE dependency_graph 
ADD COLUMN IF NOT EXISTS npm_url TEXT;

-- Add PyPI URL column
ALTER TABLE dependency_graph 
ADD COLUMN IF NOT EXISTS pypi_url TEXT;
```

---

## Technical Details

### package.json Parsing

```typescript
async function fetchPackageJson(owner: string, repo: string, token: string): Promise<object | null> {
  const branches = ["main", "master", "develop"];
  
  for (const branch of branches) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/package.json`;
    const response = await fetch(url, { headers: { Authorization: `token ${token}` }});
    if (response.ok) return response.json();
  }
  return null;
}

function parsePackageJson(pkg: any): Map<string, string> {
  const deps = new Map<string, string>();
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  for (const [name, version] of Object.entries(allDeps)) {
    deps.set(name, String(version).replace(/[\^~>=<]/g, ''));
  }
  return deps;
}
```

### npm Registry API

```typescript
async function getNpmLatestVersion(packageName: string): Promise<string | null> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
  if (!response.ok) return null;
  const data = await response.json();
  return data.version || null;
}
```

### Critical npm Dependencies (Solana Ecosystem)

```typescript
const CRITICAL_NPM_DEPS = [
  "@solana/web3.js",
  "@solana/spl-token",
  "@project-serum/anchor",
  "@coral-xyz/anchor",
  "@solana/wallet-adapter-base",
  "@solana/wallet-adapter-react",
];
```

---

## User Experience Flow

```text
1. User navigates to /deps/:profileId
2. If no dependencies found:
   a. Show empty state with "Analyze Now" button
   b. User clicks button
   c. Edge function runs (15-60 seconds)
   d. Tree updates with parsed dependencies
3. If dependencies exist:
   a. LEFT: Show inward dependencies (supply chain)
   b. CENTER: Project node
   c. RIGHT: Show ecosystem impact (forks, dependents)
4. User can click any node for details
5. Cross-registry links open internal navigation
```

---

## Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Fix fork display in current canvas | Critical |
| 2 | Add "Analyze Now" button to empty state | Critical |
| 3 | Add dependency_type column migration | High |
| 4 | Enhance edge function for package.json | High |
| 5 | Update canvas for right-side ecosystem nodes | High |
| 6 | Implement cross-registry linking query | Medium |
| 7 | Add EcosystemImpactPanel component | Medium |
| 8 | Add Python support (pyproject.toml) | Low |

---

## Summary

This plan transforms the dependency tree from a Rust-only supply chain viewer into a comprehensive **Ecosystem Intelligence Hub** that:

1. **Supports Multiple Languages**: Rust, JavaScript/TypeScript, Python
2. **Shows Bidirectional Impact**: What you depend on AND who depends on you
3. **Enables Analysis on Demand**: Users can trigger fresh analysis
4. **Links Registry Projects**: Discover connections within the Solana ecosystem

