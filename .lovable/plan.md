

# Optimize Team Member Card Size

## Current Issue

The team member cards use `aspect-square` (1:1 ratio) for the profile image container, making each card very tall. When there are multiple team members, this causes the page to feel crowded and requires excessive scrolling, especially on mobile.

## Solution

Reduce the card size by approximately half while keeping faces clearly visible:

1. **Change image aspect ratio** from `aspect-square` (1:1) to `aspect-[4/3]` (shorter height)
2. **Reduce image container size** for a more compact layout
3. **Adjust typography and spacing** to match the smaller card footprint
4. **Optimize mobile grid** to show more cards on screen

---

## Changes

### File: `src/components/program/tabs/TeamTabContent.tsx`

| Line | Current | New |
|------|---------|-----|
| 109 | `aspect-square` | `aspect-[4/3]` - Shorter image container |
| 118 | `text-5xl` for initials | `text-3xl` - Smaller fallback initials |
| 125-132 | Badge at `bottom-3 left-3` | `bottom-2 left-2` - Tighter positioning |
| 136 | `p-4 space-y-3` | `p-3 space-y-2` - Reduced padding |
| 139 | `text-lg` name | `text-base` - Slightly smaller name |
| 157-165 | Quote section spacing | Tighter spacing for compact cards |

### Grid Optimization

Change the grid to fit more cards:

```tsx
// Current (line 100)
<div className="grid gap-6 sm:grid-cols-2">

// New - 3 columns on desktop, tighter gap
<div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
```

This ensures:
- **Mobile**: 2 cards per row (compact but readable)
- **Desktop with staking pitch**: 3 cards in the 2/3 width area
- **Desktop without staking pitch**: 3 cards across full width

---

## Visual Comparison

**Before (aspect-square):**
```
┌─────────────────┐
│                 │
│   [  Image  ]   │  <- Square, very tall
│                 │
├─────────────────┤
│ Name            │
│ @nickname       │
│ Job Title       │
│ Why Fit quote...│
└─────────────────┘
```

**After (aspect-[4/3]):**
```
┌─────────────────┐
│   [  Image  ]   │  <- 4:3 ratio, ~25% shorter
├─────────────────┤
│ Name            │
│ @nickname       │
│ Job Title       │
│ Why Fit...      │
└─────────────────┘
```

---

## Technical Implementation

```tsx
// Optimized card structure
<Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/30 hover:shadow-md">
  {/* Shorter aspect ratio image */}
  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
    {member.imageUrl ? (
      <img
        src={member.imageUrl}
        alt={member.name}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
        <span className="font-display text-3xl font-bold text-primary/60">
          {getInitials(member.name)}
        </span>
      </div>
    )}
    
    {/* Role Badge - tighter positioning */}
    <div className="absolute bottom-2 left-2">
      <Badge 
        variant={getRoleBadgeVariant(member.role)}
        className="font-display text-xs uppercase tracking-wider shadow-md"
      >
        {getRoleLabel(member)}
      </Badge>
    </div>
  </div>
  
  {/* Member Info - reduced padding */}
  <CardContent className="p-3 space-y-2">
    <div>
      <h3 className="font-display text-base font-semibold text-foreground">
        {member.name}
      </h3>
      {member.nickname && (
        <p className="text-xs text-muted-foreground">@{member.nickname}</p>
      )}
    </div>
    
    <p className="text-sm text-foreground/90 font-medium">
      {member.jobTitle}
    </p>
    
    {member.whyFit && (
      <div className="relative pt-2 border-t border-border/50">
        <p className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-0.5">
          I am best fit for this project
        </p>
        <div className="flex items-start gap-1">
          <Quote className="h-3 w-3 text-primary/40 flex-shrink-0 mt-0.5" />
          <p className="text-xs italic text-muted-foreground leading-relaxed line-clamp-2">
            {member.whyFit}
          </p>
        </div>
      </div>
    )}
  </CardContent>
</Card>
```

---

## Summary

| Change | Impact |
|--------|--------|
| `aspect-[4/3]` instead of `aspect-square` | ~25% shorter image area |
| Smaller typography (`text-base`, `text-xs`) | More compact text |
| Reduced padding (`p-3`, `gap-4`) | Tighter overall spacing |
| 3-column grid on desktop | More cards visible at once |
| `line-clamp-2` on "Why Fit" quote | Prevents overly long quotes |

