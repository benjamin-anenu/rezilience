

# Fix Dependency Analysis: Handle Invalid URLs and Add Debug Logging

## Problems Identified

| Issue | Description | Affected Projects |
|-------|-------------|-------------------|
| Org-only URLs | URLs like `github.com/step-finance` have no repo name | ~10+ profiles |
| Private/Deleted repos | Repos don't exist publicly or are archived | Jupiter, Jet Protocol |
| No error logging | Failed GitHub API calls are silently swallowed | All failed analyses |
| Resilience project | Uses Deno URL imports, not package.json | Your project |

## Solution Overview

### Fix 1: Validate URLs Before Analysis

Add URL validation to reject org-only URLs with a clear error message:

```text
Input:  https://github.com/step-finance
Result: Error - "URL points to GitHub organization, not a repository"

Input:  https://github.com/step-finance/step-program  
Result: Proceed with analysis
```

### Fix 2: Add Debug Logging for GitHub API Errors

Currently, failed GitHub API calls return null with no logging. We need to log the HTTP status code to understand why requests fail:

```text
Before: (silent failure)
After:  "GitHub API error for jet-lab/jet-v2 main/Cargo.toml: 404 Not Found"
```

### Fix 3: Handle Resilience (Deno Projects)

For your Resilience project specifically, the dependencies are defined via URL imports in edge function files. Options:

1. **Mark as "N/A"** - Deno projects don't use traditional package manifests
2. **Parse import statements** - Scan for `npm:package@version` in `.ts` files (complex)
3. **Link to connected Supabase project** - Use the main app's `package.json` instead

Recommended: Option 1 for now, as the frontend already has a `package.json` that was analyzed separately.

## Technical Changes

### File: `supabase/functions/analyze-dependencies/index.ts`

**1. Enhance parseGitHubUrl to detect org-only URLs:**

```typescript
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Check for org-only URLs first
  const orgOnlyPattern = /github\.com\/([^\/]+)\/?$/;
  if (orgOnlyPattern.test(url)) {
    console.error(`Invalid URL: ${url} points to org, not repo`);
    return null;
  }
  
  // Normal repo pattern
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/\?#]+)/,
  ];
  // ... existing logic
}
```

**2. Add HTTP status logging to fetchGitHubFile:**

```typescript
async function fetchGitHubFile(
  owner: string, repo: string, branch: string, path: string, token: string
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const response = await fetch(url, { headers: {...} });
  
  if (!response.ok) {
    // Only log once per repo for first branch attempt
    if (branch === "main") {
      console.log(`GitHub ${response.status} for ${owner}/${repo}/${branch}/${path}`);
    }
    return null;
  }
  return await response.text();
}
```

**3. Return informative error for org-only URLs:**

```typescript
// In main handler
const parsed = parseGitHubUrl(github_url);
if (!parsed) {
  // Check if it's an org-only URL
  if (/github\.com\/[^\/]+\/?$/.test(github_url)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "URL points to GitHub organization, not a specific repository" 
      }),
      { status: 400, headers: corsHeaders }
    );
  }
  // ... existing invalid URL handling
}
```

## Expected Outcomes

| Scenario | Before | After |
|----------|--------|-------|
| Org-only URL | Silent failure, score=50 | Clear error: "URL points to org" |
| Private repo | Silent failure, score=50 | Logged: "GitHub 404 for owner/repo" |
| Deleted repo | Silent failure, score=50 | Logged: "GitHub 404 for owner/repo" |
| Valid public repo | Works | Works (no change) |

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/analyze-dependencies/index.ts` | Add URL validation, HTTP status logging, informative error messages |

## Data Cleanup Recommendation

After fixing the code, we should identify and flag profiles with invalid URLs:

```sql
-- Find profiles with org-only URLs (no repo path)
SELECT id, project_name, github_org_url 
FROM claimed_profiles 
WHERE github_org_url ~ '^https?://github\.com/[^/]+/?$';
```

These profiles need their `github_org_url` updated to point to actual repositories.

## For Your Resilience Project

Since this is a Lovable project with Deno edge functions, the dependency analysis will continue showing "No files found" which is correct. The frontend portion of this project (React/Vite) does have a `package.json`, but your Resilience profile points to the GitHub repo which may be private.

To get dependency data for Resilience, you could:
1. Make the GitHub repo public (if appropriate)
2. Update the URL to point to a specific public repo with dependencies
3. Accept that Deno projects don't have traditional manifests

