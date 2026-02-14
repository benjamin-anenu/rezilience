

## Originality Metrics: Unverified State Fixes

### Problem
Currently, the Bytecode Originality and GitHub Originality cards always show a progress bar, even when verification hasn't been performed. Unverified states also appear in neutral grey rather than signaling that action is needed.

### What Will Change

**1. Hide Progress Bar When Not Verified**
- Bytecode Originality: If no wallet signature verification has been done (`bytecodeMatchStatus` is null and program is not verified), the progress bar will be hidden entirely.
- GitHub Originality: If GitHub analysis hasn't run (`githubIsFork` is undefined), the progress bar will be hidden entirely.
- A text label like "Awaiting Verification" or "Awaiting Analysis" will remain visible.

**2. Dark Orange for Unverified States**
- All unverified/not-analyzed subtitle text will use dark orange (`text-orange-600`) instead of grey.
- If a bar does show (e.g. partial states like "fork"), warning bars will also use dark orange.

### Files to Update

| File | Change |
|------|--------|
| `DevelopmentTabContent.tsx` (Program Detail) | Add `isUnverified` flag to hide bar + apply dark orange |
| `DevelopmentTab.tsx` (Profile Detail) | Same logic for the claimed profile view |
| `MetricCards.tsx` (Program Detail) | Same logic for the 4-card grid |
| `IntelligenceGrid.tsx` (Explorer) | Update "Not Verified" bytecode color to dark orange |

### Technical Details

- A new `isUnverified` boolean will be added to each metric object.
- When `isUnverified` is true, the `<Progress>` component will not render, replaced by a small "Pending" indicator.
- The color class for unverified states will change from `text-muted-foreground` to `text-orange-600` (dark orange) across all four files.
- The `getBytecodeStatusInfo` helper in `useBytecodeVerification.ts` will also get an updated default return with `isUnverified: true` so downstream consumers can use it consistently.

