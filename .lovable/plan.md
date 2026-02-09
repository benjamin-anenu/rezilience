# Context-Aware Terminology Update: Protocol → Project

## Status: ✅ COMPLETED

All user-facing instances of "protocol" have been replaced with "project" across the web application.

---

## Summary

| Metric | Count |
|--------|-------|
| Files modified | 14 |
| Text replacements | ~45 |
| Breaking changes | 0 |

---

## Files Modified

1. `src/pages/Explorer.tsx` - 5 changes
2. `src/pages/Dashboard.tsx` - 4 changes  
3. `src/pages/ProgramDetail.tsx` - 4 changes
4. `src/pages/ClaimProfile.tsx` - 1 change
5. `src/pages/Readme.tsx` - 15+ changes
6. `src/components/dashboard/DeleteProfileDialog.tsx` - 3 changes
7. `src/components/landing/HeroSection.tsx` - 4 changes
8. `src/components/landing/UseCasesSection.tsx` - 2 changes
9. `src/components/explorer/EcosystemHeatmap.tsx` - 1 change
10. `src/components/program/TVLMetricsCard.tsx` - 1 change
11. `src/components/profile/tabs/RoadmapManagement.tsx` - 2 changes
12. `src/components/profile/tabs/TeamManagement.tsx` - 1 change
13. `src/components/staking/BondSummary.tsx` - 1 change
14. `src/components/program/tabs/TeamTabContent.tsx` - 2 changes

---

## Technical Notes

- **Prop names unchanged**: Internal TypeScript prop names like `protocolName` remain unchanged to avoid breaking changes
- **UI-only update**: No database changes required
