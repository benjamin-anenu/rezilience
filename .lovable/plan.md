

# Review: Phase-Based Roadmap + Draft Persistence — One Fix Needed

## Status: 1 Issue Found, Everything Else Intact

### What's Working Correctly

1. **Type System** -- `Phase` and `PhaseMilestone` interfaces are properly defined. `ClaimedProfile.milestones` and `ClaimProfileFormData.milestones` both use `Phase[]`. The old `Milestone` type is preserved for backward compatibility.

2. **Claim Flow (ClaimProfile.tsx)** -- Step 5 renders `RoadmapForm` with `phases={milestones}` and `setPhases={setMilestones}`. The `handleDirectSubmit` correctly serializes milestones as JSON for the edge function. All 3 cases at Step 5 (GitHub OAuth done, public repo analyzed, no analysis) are intact.

3. **Draft Persistence** -- All fields are saved to localStorage: `githubAnalysisResult`, `logoUrl`, `authorityData`, `authorityVerified`, `programVerified`, `githubVerified`, plus the original form fields and `milestones` (Phase[]). Restore logic on mount is complete. "Draft auto-saved" indicator is rendered.

4. **RoadmapForm (Claim Step)** -- Add/remove phases, add/remove milestones within phases, collapsible UI, lock-all mechanism, optional target dates, required descriptions -- all correct.

5. **RoadmapManagement (Dashboard)** -- Full CRUD with dialogs for add phase, add milestone, mark complete, request variance, remove phase/milestone. Locked phases block edits. Variance badge shown. Completion timestamps captured.

6. **Public Display (RoadmapTabContent)** -- Progress bar, phase-level progress, collapsible phases, milestone status icons (completed/overdue/upcoming), optional dates, descriptions, variance badges -- all rendering correctly.

7. **AboutTab (Owner Dashboard)** -- Correctly shows `RoadmapManagement` for owners and a static "Verified Timeline" view for public visitors, both using the Phase structure.

8. **Data Layer** -- `useClaimedProfiles` maps DB JSON to `Phase[]`. `useUpdateProfile` accepts `Phase[]`. The `claim-profile` edge function uses `...rest` spread so it accepts any JSON shape without type issues.

9. **Barrel Exports** -- `RoadmapForm` is properly exported from `src/components/claim/index.ts`.

---

### Issue: Stale Type in `update-profile` Edge Function

**File:** `supabase/functions/update-profile/index.ts` (lines 31-39)

The `UpdateProfileBody.updates.milestones` type still defines the OLD flat milestone shape:

```text
milestones?: Array<{
  id: string;
  title: string;
  targetDate: string;      // <-- old shape
  isLocked: boolean;       // <-- old shape
  status: "upcoming" | "completed" | "overdue";
  varianceRequested?: boolean;
  completedAt?: string;
  originalTargetDate?: string;
}>
```

This should be updated to the new Phase structure:

```text
milestones?: Array<{
  id: string;
  title: string;
  isLocked: boolean;
  varianceRequested?: boolean;
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate?: string;
    status: "upcoming" | "completed" | "overdue";
    completedAt?: string;
  }>;
  order: number;
}>
```

**Impact:** Currently non-breaking because the edge function just passes the JSON through to the DB without runtime validation against this TypeScript type. However, the type mismatch is technically incorrect and could cause issues if validation logic is added later.

### Fix

Update lines 31-39 in `supabase/functions/update-profile/index.ts` to match the Phase structure.

---

### Summary Checklist

| Checkpoint | Status |
|---|---|
| Phase/PhaseMilestone types defined | OK |
| ClaimedProfile.milestones uses Phase[] | OK |
| ClaimProfileFormData.milestones uses Phase[] | OK |
| RoadmapForm (claim) - add/remove phases | OK |
| RoadmapForm - add/remove milestones in phases | OK |
| RoadmapForm - optional target dates | OK |
| RoadmapForm - required descriptions | OK |
| RoadmapForm - lock all phases | OK |
| RoadmapManagement (dashboard) - CRUD | OK |
| RoadmapManagement - mark complete with timestamp | OK |
| RoadmapManagement - request variance on locked phase | OK |
| RoadmapManagement - locked phases block edits | OK |
| RoadmapTabContent (public) - phase progress bars | OK |
| RoadmapTabContent - milestone status icons | OK |
| RoadmapTabContent - descriptions displayed | OK |
| RoadmapTabContent - optional dates displayed | OK |
| AboutTab - owner vs public view | OK |
| Draft persistence - all fields saved | OK |
| Draft persistence - all fields restored | OK |
| Draft persistence - "Draft auto-saved" indicator | OK |
| Draft cleared on successful submit | OK |
| githubAnalysisResult persisted (no OAuth at Step 5) | OK |
| claim-profile edge function accepts Phase[] | OK |
| update-profile edge function type matches Phase[] | **NEEDS FIX** |
| useClaimedProfiles maps milestones as Phase[] | OK |
| useUpdateProfile accepts Phase[] | OK |

