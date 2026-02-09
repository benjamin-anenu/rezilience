
# Refactor: Replace Inline Row with Dropdown Menu

## Why Dropdown is Better

| Aspect | Inline Row (Current) | Dropdown/Popover (Proposed) |
|--------|---------------------|----------------------------|
| Table Flow | Breaks flow, shifts content | Maintains table integrity |
| Visual Space | Takes full row width | Compact, contained |
| UX Pattern | Less familiar | Standard interaction |
| Animation | Row insertion/removal | Smooth fade in/out |

---

## Implementation

### Change Eye Icon to Popover Trigger

Replace the current expand/collapse state logic with a Radix Popover component:

```typescript
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// In LeaderboardRow.tsx - replace Button with Popover
<Popover>
  <PopoverTrigger asChild>
    <Button variant="ghost" size="icon" className="h-7 w-7">
      <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
    </Button>
  </PopoverTrigger>
  <PopoverContent 
    className="w-80 p-4" 
    align="end" 
    side="left"
  >
    {/* Details content here */}
  </PopoverContent>
</Popover>
```

### Dropdown Content Layout

Stack the details vertically in the popover for better readability:

```text
┌─────────────────────────────┐
│ GitHub Status    [PUBLIC]   │
│ ─────────────────────────── │
│ 🌐 Website      novengrid.io│
│ 👥 Contributors      3      │
│ ✨ Source       Breakout '25│
│ 𝕏 Handle       @novengrid   │
└─────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/explorer/LeaderboardRow.tsx` | Replace expand state with Popover, remove ExpandedDetailsRow |
| `src/components/explorer/ProgramLeaderboard.tsx` | Remove expandedRows state and toggle handler |

---

## Benefits

1. **No state management needed** - Popover handles open/close internally
2. **Simpler component** - Remove expanded row rendering logic
3. **Better performance** - No row insertion/removal, just overlay
4. **Cleaner table** - Content stays in place, no shifting

---

## Technical Notes

- The Popover component is already available from `@/components/ui/popover`
- Use `align="end"` and `side="left"` to position dropdown to the left of the eye icon
- Add `sideOffset={8}` for proper spacing
- The popover will auto-close when clicking outside
