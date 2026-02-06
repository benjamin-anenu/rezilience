

# Fix: Restore Program Detail View for Explorer Clicks

## What Went Wrong

In the previous terminology update, I incorrectly changed the Explorer navigation from `/program/:id` to `/profile/:id`. This broke the intended UX:

| Route | Page | Purpose |
|-------|------|---------|
| `/program/:id` | `ProgramDetail.tsx` | **FULL DASHBOARD** - Charts, events, metrics, milestones, media, socials |
| `/profile/:id` | `ProfileDetail.tsx` | Simpler view (was meant for post-registration redirect only) |

The `ProgramDetail` page is the **correct** destination for Explorer clicks because it shows:
- Upgrade Frequency Chart
- Recent Events
- Metric Cards
- Verified Timeline
- Website Preview (full-width)
- Media Gallery
- Social Pulse
- Stake CTA

## The Fix

### Update `ProgramLeaderboard.tsx`

Restore navigation to use `/program/:id` with the correct ID format:

```typescript
const handleRowClick = (project: ExplorerProject) => {
  // Use program_id if available, otherwise use the claimed profile id
  const routeId = project.program_id && project.program_id !== project.id 
    ? project.program_id 
    : project.id;
  navigate(`/program/${routeId}`);
};
```

### Update `ProgramDetail.tsx` to Handle Claimed Profile IDs

The `ProgramDetail` page needs to handle cases where the route ID is a claimed profile UUID (not a Solana program ID):

1. First try to fetch from `projects` table by `program_id`
2. If not found, try to fetch from `claimed_profiles` by `id`
3. Display the full dashboard either way

### Files to Modify

| File | Change |
|------|--------|
| `src/components/explorer/ProgramLeaderboard.tsx` | Restore `/program/:id` navigation |
| `src/pages/ProgramDetail.tsx` | Add fallback to fetch claimed profile by UUID if project not found |
| `src/hooks/useProjects.ts` | Add hook to fetch by claimed profile ID as fallback |

## Result After Fix

- **Explorer clicks** → Full `ProgramDetail` dashboard with charts, events, and all verified content
- **Dashboard "View" action** → Same full dashboard (for owner preview)
- `ProfileDetail` can be removed or repurposed for simpler use cases

