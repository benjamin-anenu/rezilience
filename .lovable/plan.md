
# Fix Dependency Analysis: Parameter Name + Enhanced Parsing

## Problems Identified

1. **Parameter name mismatch**: The frontend hook (`useDependencyGraph`) likely sends `profileId` (camelCase), but the edge function expects `profile_id` (snake_case). This causes database writes to silently fail.

2. **Incomplete Cargo.toml parsing**: Currently only parses the `[dependencies]` section. Missing:
   - `[workspace.dependencies]` (shared dependencies)
   - `[dev-dependencies]`
   - `[build-dependencies]`
   - Workspace inheritance like `package.workspace = true`

3. **OpenBook V2 showing only 3 deps**: The workspace Cargo.toml likely defines shared dependencies in `[workspace.dependencies]`, which are then inherited by member crates using `workspace = true` syntax.

4. **Resilience repo structure**: The analyzer cannot find any dependency files. Need to confirm your repo's actual file structure.

---

## Solution 1: Fix Parameter Extraction

Update the edge function to accept both parameter naming conventions:

```typescript
const { github_url, profile_id, profileId } = await req.json();
const finalProfileId = profile_id || profileId;
```

Then use `finalProfileId` throughout the function.

---

## Solution 2: Enhanced Cargo.toml Parsing

### Parse `[workspace.dependencies]`

Many workspaces define shared dependencies at the root:

```toml
[workspace.dependencies]
anchor-lang = "0.30.0"
solana-program = "1.18.0"
```

Member crates then use:

```toml
[dependencies]
anchor-lang.workspace = true
```

### Updated parsing logic:

1. Check for `[workspace.dependencies]` in root Cargo.toml
2. Parse those shared dependencies
3. When parsing member Cargo.toml files, resolve `workspace = true` references
4. Aggregate all unique dependencies

---

## Solution 3: Verify Resilience Repo Structure

To debug your Resilience project, I need to know the actual file structure. The analyzer checks these paths:

| Type | Paths Checked |
|------|--------------|
| Cargo.toml | Root, programs/*, program/, sdk/, cli/, core/, lib/ |
| package.json | Root, app/, sdk/, js/, client/, packages/core/, frontend/, web/, ui/, packages/sdk/ |
| requirements.txt | Root, requirements/base.txt, backend/, api/, server/, app/ |
| pyproject.toml | Root, backend/, api/, server/, app/ |

**If your dependencies are in a different location**, we need to add that path to the discovery list.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-dependencies/index.ts` | Accept both `profile_id` and `profileId` parameters; add `[workspace.dependencies]` parsing; resolve `workspace = true` inheritance |

---

## Expected Outcomes

| Project | Before | After |
|---------|--------|-------|
| OpenBook V2 | 3 dependencies | 25-40+ dependencies |
| Drift Protocol | 0 dependencies | 30+ dependencies |
| Resilience | 0 dependencies | Depends on actual file structure |

---

## Questions

Before implementing, I need one piece of information:

**What type of project is your Resilience repository?**
- Is it a Rust/Solana project with Cargo.toml?
- Is it a JavaScript/TypeScript project with package.json?
- Is it a Python project?
- Where are your "3rd party API" dependencies defined?

If you can share a screenshot of your repo's root folder structure or tell me where your dependencies are located, I can ensure the analyzer finds them.
