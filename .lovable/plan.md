

# Rebrand Health States: Healthy, Evolving, Under Observation, Locked

## Label Mapping

| Score Range | Current Label | New Label | Color Change |
|-------------|--------------|-----------|--------------|
| 70+ | Healthy | **Healthy** (no change) | None |
| 40-69 | Stale | **Evolving** | None (amber stays) |
| 1-39 | Decaying | **Under Observation** | Red -> muted slate/steel |
| Private repo | Unclaimed | **Locked** | New: black with padlock |

## Files to Update

### 1. `src/components/explorer/EcosystemHeatmap.tsx`
- Add `'locked'` health status for unclaimed projects with no GitHub analysis
- `getStatusLabel()`: STALE -> "EVOLVING", DECAYING -> "UNDER OBSERVATION", add LOCKED
- `getHealthColor()`: decaying changes from red to muted steel; locked = near-black
- Legend: update text and add Locked entry with padlock
- Filter dropdown: update labels
- Heatmap cell: show Lock icon for locked repos instead of score
- Stats: add locked count

### 2. `src/components/explorer/EcosystemPulse.tsx`
- Pie chart labels: "Stale" -> "Evolving", "Decaying" -> "Under Observation"
- Decaying pie slice color: red -> steel

### 3. `src/components/explorer/LeaderboardRow.tsx`
- Badge text: "Stale" -> "Evolving", "Decay" -> "Observing"
- Decaying badge color: destructive -> neutral steel

### 4. `src/components/explorer/MobileProgramCard.tsx`
- Same badge text and color changes as LeaderboardRow

### 5. `src/components/explorer/SearchBar.tsx`
- Filter dropdown: "Stale" -> "Evolving", "Decaying" -> "Under Observation"

### What stays unchanged
- Internal code keys (`'healthy'`, `'stale'`, `'decaying'`)
- Database enum values (`ACTIVE`, `STALE`, `DECAYING`)
- Score thresholds (70/40)
- Teal and Amber colors
- All scoring logic

