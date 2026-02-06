

# Terminology Alignment & Unified Registration Flow

## Analysis & Recommendation

I completely agree with your assessment. The current terminology creates confusion and doesn't align with Resilience's core mission:

**Problems with Current Approach:**
1. "Submitted Projects" and "Claimed Profiles" are two disconnected paths to the same goal
2. "Claimed Profile" is passive and person-centric, not protocol-centric
3. "Submit Project" goes to the `projects` table (currently empty), while "Claim Profile" goes to `claimed_profiles` (where verified builders live)
4. This creates the Explorer disconnect we identified earlier

**Recommended Terminology (from your vision doc):**

| Current Term | New Term | Rationale |
|--------------|----------|-----------|
| "Claim Profile" | **"SECURE MY STANDING"** | Active, builder-centric language |
| "Claimed Profile" | **"Registered Protocol"** | Protocol-first focus |
| "Submit Project" | Remove entirely | Creates confusion; should be one unified path |
| "Claim New Protocol" | **"REGISTER PROTOCOL"** | Clearer action |
| "Your Protocols" | **"BUILDER DASHBOARD"** | Emphasizes builder identity |
| "Verified Projects" | **"MY REGISTRY"** | Aligns with "Proof of Life" registry concept |
| "Dashboard" nav link | **"MY REGISTRY"** | Consistency |

---

## Implementation Plan

### Phase 1: Remove Submit Project Flow

**Delete entirely:**
- `src/pages/SubmitProject.tsx` - Remove the file
- `supabase/functions/add-project/index.ts` - Remove the edge function
- Route `/submit` from `App.tsx`

**Rationale:** The `projects` table should only be populated by:
1. Verified registrations (from the "Secure My Standing" flow)
2. Automated indexing (Phase 2 feature for the 2,847 Initial Cohort)

There's no need for anonymous project submission that bypasses verification.

### Phase 2: Update Terminology Throughout Codebase

#### File: `src/components/layout/Navigation.tsx`
- Line 107: "JOIN THE REGISTRY" → Already good, keep it
- Line 72: "DASHBOARD" → "MY REGISTRY"

#### File: `src/pages/Dashboard.tsx`
- Line 68: "YOUR PROTOCOLS" → "BUILDER DASHBOARD"
- Line 72: "Manage your verified projects..." → "Manage your registered protocols and monitor Resilience Scores"
- Line 99: "CLAIM NEW PROTOCOL" → "REGISTER PROTOCOL"
- Line 105: "EXPLORE PROJECTS" → "EXPLORE REGISTRY"
- Line 115: "No Verified Projects" → "No Registered Protocols"
- Line 118: "Claim your first protocol..." → "Register your first protocol..."
- Line 121: "CLAIM NOW" → "REGISTER NOW"

#### File: `src/pages/ClaimProfile.tsx`
- Page title updates to match "SECURE MY STANDING" terminology
- Step labels to use "Register" instead of "Claim"

#### File: `src/pages/Explorer.tsx`
- Lines 52-56: Remove "Submit Project" button entirely
- Lines 118-124: Remove empty state "Submit a Project" button
- Update text to reference "Registry" not "Projects"

#### File: `src/types/database.ts`
- Line 99: Comment "Claimed profile" → "Registered protocol"
- Type name changes (optional, for code clarity)

### Phase 3: Fix Explorer Data Source

Update the Explorer to show **verified registered protocols** from `claimed_profiles`:

#### Create: `src/hooks/useExplorerProjects.ts`

Unified hook that:
1. Fetches verified profiles from `claimed_profiles` where `verified = true`
2. Transforms them to match the Explorer's expected data structure
3. Sorts by `resilience_score` descending

```typescript
// Query claimed_profiles for verified entries
const { data } = await supabase
  .from('claimed_profiles')
  .select('*')
  .eq('verified', true)
  .order('resilience_score', { ascending: false });
```

#### Update: `src/pages/Explorer.tsx`
- Use `useExplorerProjects` instead of `useProjects`
- Route clicks to `/profile/:id` (not `/program/:id`)

#### Update: `src/components/explorer/ProgramLeaderboard.tsx`
- Handle the transformed data from claimed_profiles
- Update navigation to use profile routes

### Phase 4: Update Related Pages

#### File: `src/pages/MyBonds.tsx`
- Line 110: "claim-profile" route reference (keep, but ensure terminology matches)
- "JOIN THE REGISTRY" - Already correct

#### File: `src/components/landing/HeroSection.tsx`
- Keep "SOLANA PROJECT VITALS" as the Explorer CTA - Already good

---

## Route Changes

| Current Route | New Route | Action |
|---------------|-----------|--------|
| `/submit` | Remove | Delete entirely |
| `/claim-profile` | `/register` | Rename for clarity (optional) |
| `/dashboard` | `/my-registry` | Rename for clarity (optional) |

**Note:** Route renames are optional but would improve URL clarity. Can keep existing routes with updated UI terminology.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/SubmitProject.tsx` | Delete |
| `supabase/functions/add-project/index.ts` | Delete |
| `src/App.tsx` | Remove SubmitProject route and import |
| `src/components/layout/Navigation.tsx` | Update "DASHBOARD" → "MY REGISTRY" |
| `src/pages/Dashboard.tsx` | Update all terminology |
| `src/pages/Explorer.tsx` | Remove Submit buttons, use new hook |
| `src/pages/ClaimProfile.tsx` | Update terminology to "Register" |
| `src/hooks/useExplorerProjects.ts` | Create new unified hook |
| `src/components/explorer/ProgramLeaderboard.tsx` | Update for claimed_profiles data |
| `src/types/database.ts` | Update comments/terminology |

---

## User Flow After Changes

```text
LANDING PAGE
     ↓
[SOLANA PROJECT VITALS] → Explorer (shows verified registered protocols)
     OR
[JOIN THE REGISTRY] → Registration Flow
     ↓
Step 1: X Auth → Step 2: Identity → Step 3: Socials/GitHub → Step 4: Media → Step 5: Roadmap
     ↓
Protocol appears in Explorer immediately
     ↓
User can manage via "MY REGISTRY" dashboard
```

---

## Summary

This plan:
1. Eliminates the "Submit Project" parallel path that caused the disconnect
2. Unifies everything around the Registry concept from your vision
3. Uses active, builder-centric language ("Secure My Standing", "Register Protocol")
4. Fixes the Explorer to show verified registered protocols
5. Aligns with "Proof of Life" and "reputation can't be forked" messaging

