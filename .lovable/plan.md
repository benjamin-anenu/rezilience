

## Rename "LIVE" Column to "LIVENESS" and "Live" Badge to "Active"

Two single-line text changes:

| File | Line | From | To |
|------|------|------|----|
| `src/components/explorer/ProgramLeaderboard.tsx` | 43 | `LIVE` | `LIVENESS` |
| `src/components/explorer/LeaderboardRow.tsx` | 50 | `Live` | `Active` |

The mobile view (`MobileProgramCard.tsx`) already uses "Active" for the ACTIVE status -- no change needed there.

No logic, layout, or styling changes. Just two label updates for consistency.

