
# Implementation Plan: Seed Colosseum Startups + Add Pagination

## Overview

This plan adds 120 Colosseum hackathon startups to the Resilience Registry and implements pagination (100 records per page) for better performance and usability.

---

## Part 1: Seed Registry with Colosseum Startups

### Data Structure

The JSON file contains 120 startups across:
- 4 Accelerator Cohorts (44 startups): Renaissance, Radar, Breakout, Cypherpunk
- Hackathon Winners (76 startups): Various track winners not in accelerator

Each startup includes:
- Name, Category, Description
- Program ID (many are "TBD" for pre-mainnet)
- GitHub URL (many are "private")
- Website, X handle, Location
- Discovery source (hackathon/cohort info)

### Implementation: Edge Function for Bulk Seeding

Create a new edge function `seed-colosseum-profiles` that:
1. Parses the JSON data
2. Maps each startup to the `claimed_profiles` schema
3. Uses UPSERT to avoid duplicates (matching on project_name)
4. Sets `claim_status = 'unclaimed'` and `verified = false`
5. Populates `discovery_source` with cohort/hackathon info
6. Maps `location` to the `country` field

```text
JSON Startup Record          claimed_profiles Column
─────────────────────        ─────────────────────────
name                    -->  project_name
category                -->  category
description             -->  description
program_id              -->  program_id (or NULL if "TBD")
github_url              -->  github_org_url (or NULL if "private")
website                 -->  website_url
x_handle                -->  x_username (strip @ prefix)
location                -->  country
contributors_approx     -->  github_contributors
cohort/hackathon        -->  discovery_source
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/seed-colosseum-profiles/index.ts` | Create - Edge function for seeding |
| `src/data/colosseum-startups.json` | Create - Copy JSON to project for import |

---

## Part 2: Add Pagination (100 per page)

### Current State
- All projects fetched at once from `claimed_profiles`
- Rendered in single list without pagination
- With 120+ new records, performance will degrade

### Implementation

Add pagination state and controls to the Explorer page:

```text
┌─────────────────────────────────────────────────────────┐
│  Showing 1-100 of 200 registered protocols              │
├─────────────────────────────────────────────────────────┤
│  [Table with 100 rows]                                  │
├─────────────────────────────────────────────────────────┤
│  ← Previous  [1] [2] [3] ... [N]  Next →               │
└─────────────────────────────────────────────────────────┘
```

### Technical Approach

1. **Add pagination state** to `Explorer.tsx`:
   - `currentPage` (default: 1)
   - `itemsPerPage` (fixed: 100)

2. **Slice filtered results** based on current page:
   ```typescript
   const paginatedPrograms = filteredPrograms.slice(
     (currentPage - 1) * 100,
     currentPage * 100
   );
   ```

3. **Update results count** to show range:
   ```
   "Showing 1-100 of 200 registered protocols"
   ```

4. **Add pagination controls** below the table using existing `Pagination` component

5. **Reset to page 1** when filters change

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Explorer.tsx` | Add pagination state, slice logic, pagination controls |

---

## Detailed Changes

### 1. Edge Function: `seed-colosseum-profiles/index.ts`

```typescript
// Parse the startup data from JSON
// Map each entry to claimed_profiles schema
// Bulk UPSERT using Supabase service role
// Return count of inserted/updated records
```

Key features:
- Uses service role for write access (bypasses RLS)
- Deduplicates by project_name
- Handles "TBD" program IDs as NULL
- Handles "private" GitHub URLs as NULL
- Strips @ from X handles

### 2. Explorer.tsx Pagination

Add state:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 100;
```

Add pagination logic:
```typescript
const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage);
```

Add pagination controls at bottom of table using the existing `Pagination` component.

---

## Summary

| Task | Complexity | Files |
|------|------------|-------|
| Create seeding edge function | Medium | 1 new file |
| Copy JSON data to project | Low | 1 new file |
| Add pagination to Explorer | Low | 1 file modified |

After implementation:
- Run the edge function once to seed 120 startups
- Explorer will show 100 records per page with navigation
- All Colosseum startups will appear as "Unclaimed" with their discovery source badge
