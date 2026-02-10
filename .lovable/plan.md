

# Display Multiple GitHub Languages as a Dropdown

## Problem
Currently, only the **primary language** from GitHub is stored and displayed (a single string like "TypeScript"). Many Solana projects use multiple languages (e.g., Rust for on-chain, TypeScript for SDK/frontend). Showing only one language is misleading.

## Solution
Fetch all languages from GitHub's Languages API, store them in the database, and display them as a dropdown on the program detail page.

## Changes

### 1. Database Migration
Add a new column `github_languages` (JSONB) to the `claimed_profiles` table to store the full language breakdown:
```
{ "Rust": 150000, "TypeScript": 42000, "JavaScript": 8000 }
```
The existing `github_language` column (primary language) remains unchanged for backward compatibility.

### 2. Edge Function: `analyze-github-repo/index.ts`
- After fetching repo data, also call `GET /repos/{owner}/{repo}/languages` (returns `{ "Lang": byteCount, ... }`)
- Store the result in the new `github_languages` JSONB column
- Keep populating `github_language` (primary) as before

### 3. Edge Function: `fetch-github/index.ts`
- Same change: fetch the `/languages` endpoint and store in `github_languages`

### 4. Types Update
- Add `github_languages?: Record<string, number>` to the `GitHubAnalytics` type in `src/types/index.ts`
- Map the new DB field in `src/hooks/useClaimedProfiles.ts`

### 5. UI: `src/components/program/PublicGitHubMetrics.tsx`
- Replace the static "Language" text display with a dropdown (Popover or Select)
- Primary language shown by default with a small chevron indicator
- Clicking opens a dropdown listing all languages sorted by byte percentage
- Each entry shows: language name + percentage bar (e.g., "Rust 72%", "TypeScript 25%", "JS 3%")
- If only one language exists, display it as plain text (no dropdown)

### 6. Dashboard: `src/components/dashboard/GitHubAnalyticsCard.tsx`
- Update to show multi-language display if available

## Visual Behavior

```text
Before:
  [ Code icon ]  TypeScript

After (single language):
  [ Code icon ]  Rust

After (multiple languages - collapsed):
  [ Code icon ]  Rust  v

After (multiple languages - expanded dropdown):
  [ Code icon ]  Rust  ^
  +---------------------------+
  | Rust         ████████ 72% |
  | TypeScript   ███     25%  |
  | JavaScript   █       3%   |
  +---------------------------+
```

## Files Modified
1. **New migration** -- Add `github_languages JSONB` column to `claimed_profiles`
2. `supabase/functions/analyze-github-repo/index.ts` -- Fetch `/languages` endpoint, store in DB
3. `supabase/functions/fetch-github/index.ts` -- Same languages fetch
4. `src/types/index.ts` -- Add `github_languages` to analytics type
5. `src/hooks/useClaimedProfiles.ts` -- Map new field from DB
6. `src/components/program/PublicGitHubMetrics.tsx` -- Dropdown UI for multiple languages
7. `src/components/dashboard/GitHubAnalyticsCard.tsx` -- Multi-language display
