

## Two Changes: Config Fix + "Owned" to "Main" Rename

### 1. Add `verify-github-ownership` to config.toml (SHIP-BLOCKER)

The new edge function will return 401 without this entry. Add to `supabase/config.toml`:

```toml
[functions.verify-github-ownership]
verify_jwt = false
```

### 2. Rename "Owned" to "Main" in Explorer Table

Currently the originality column shows **"Owned"** vs **"Forked"**. Change "Owned" to "Main" so the pair reads **"Main" / "Forked"** -- clearer terminology that mirrors how Git repositories are described.

**Files to update:**

| File | Location | Change |
|------|----------|--------|
| `supabase/config.toml` | End of file | Add `[functions.verify-github-ownership]` block |
| `src/components/explorer/LeaderboardRow.tsx` | Line 79 inside `getOriginalityBadge` | Change `Owned` text to `Main` |
| `src/components/explorer/MobileProgramCard.tsx` | Line 249 inside the bottom stats row | Change `Owned` text to `Main` |

Three small, surgical edits. No logic changes, no new dependencies.
