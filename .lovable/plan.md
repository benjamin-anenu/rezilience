
# Add Python/PyPI Support to Dependency Analyzer

## Overview

Extend the `analyze-dependencies` edge function to parse Python project dependency files (`requirements.txt` and `pyproject.toml`) and check versions against the PyPI registry.

---

## Detection Priority

The analyzer will try dependency files in this order:
1. `Cargo.toml` (Rust) - existing
2. `package.json` (JS/TS) - existing  
3. `requirements.txt` (Python) - new
4. `pyproject.toml` (Python) - new

---

## Technical Implementation

### 1. Edge Function: `supabase/functions/analyze-dependencies/index.ts`

**Add critical Python dependencies list:**

```typescript
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
```

**New functions to add:**

| Function | Purpose |
|----------|---------|
| `fetchRequirementsTxt()` | Fetch `requirements.txt` from GitHub across common branches |
| `fetchPyprojectToml()` | Fetch `pyproject.toml` from GitHub |
| `parseRequirementsTxt()` | Parse dependency lines like `package==1.0.0` or `package>=1.0` |
| `parsePyprojectToml()` | Parse `[project.dependencies]` and `[tool.poetry.dependencies]` sections |
| `getPypiLatestVersion()` | Query `https://pypi.org/pypi/{package}/json` for latest version |
| `getPypiDownloads()` | Use pypistats API or fallback to 0 |
| `analyzePypiDependencies()` | Orchestrate Python dependency analysis |

**Parsing Logic:**

`requirements.txt` format examples:
```text
requests==2.31.0
numpy>=1.24.0
pandas~=2.0
flask  # no version pin
-e git+https://...  # editable, skip
```

`pyproject.toml` format examples:
```toml
[project]
dependencies = [
    "requests>=2.28",
    "pydantic==2.0.0",
]

[tool.poetry.dependencies]
python = "^3.9"
django = "^4.2"
```

**Update main handler flow:**

```typescript
// After npm check fails
if (!npmResponse) {
  console.log("No package.json found - checking for Python dependencies...");
  
  const pypiResponse = await analyzePypiDependencies(owner, repo, githubToken, profile_id);
  
  if (pypiResponse) {
    return pypiResponse;
  }
  
  // No dependency files found at all
  return neutralResponse();
}
```

**Update `storeDependencyGraph()` to populate `pypi_url`:**

```typescript
const rows = dependencies.map((dep) => ({
  // ... existing fields ...
  pypi_url: dependencyType === 'pypi' ? `https://pypi.org/project/${dep.name}/` : null,
}));
```

---

### 2. Update Hook: `src/hooks/useDependencyGraph.ts`

Add `pypi_url` to the data model and query:

```typescript
export interface DependencyNode {
  // ... existing fields ...
  pypi_url: string | null;  // Add this
}

// In the mapping function
pypi_url: d.pypi_url,
```

---

### 3. Update UI Components

**`DependencyTreeCanvas.tsx`**

Pass `pypiUrl` to the detail panel:

```typescript
<NodeDetailPanel
  pypiUrl={selectedDep?.pypi_url}
  // ... existing props
/>
```

**`NodeDetailPanel.tsx`**

Add `pypiUrl` prop and update registry logic:

```typescript
interface NodeDetailPanelProps {
  pypiUrl?: string | null;  // Add this
  // ... existing props
}

// Update registry URL logic
const registryUrl = nodeData.dependencyType === 'npm' 
  ? npmUrl 
  : nodeData.dependencyType === 'pypi' 
    ? pypiUrl 
    : cratesIoUrl;
```

---

### 4. Database

No changes needed - the `pypi_url` column already exists in `dependency_graph` table.

---

## Files Changed

| File | Action |
|------|--------|
| `supabase/functions/analyze-dependencies/index.ts` | Add Python parsing, PyPI registry lookups |
| `src/hooks/useDependencyGraph.ts` | Include `pypi_url` field |
| `src/components/dependency-tree/DependencyTreeCanvas.tsx` | Pass `pypiUrl` to panel |
| `src/components/dependency-tree/NodeDetailPanel.tsx` | Add `pypiUrl` prop |

---

## Testing

After implementation:
1. Find a Python project profile or update test profile GitHub URL to a Python repo
2. Trigger "Analyze Dependencies Now"
3. Verify dependencies appear with snake icon (🐍) and link to PyPI

---

## Rate Limiting

PyPI has generous rate limits but we will still:
- Add 300ms delay between version lookups
- Skip editable installs (`-e`) and local paths
- Limit analysis to first 100 dependencies for large projects
