

# Premium Mobile Experience Upgrade

## Current State Analysis

After reviewing the codebase, I identified several areas where the mobile experience can be elevated to match the premium Bloomberg Terminal aesthetic:

### Current Issues

| Component | Issue |
|-----------|-------|
| Navigation | Basic dropdown menu, no slide-in drawer animation |
| Program Leaderboard | Uses hidden columns approach - mobile users see minimal info |
| Program Header | Social icons row wraps awkwardly on mobile |
| Hero Stats | `grid-cols-3` cramped on mobile |
| Metric Cards | Single column stacking lacks visual hierarchy |
| Dashboard Header | User info + actions don't stack elegantly |
| Cards | No touch-optimized spacing or gestures |

---

## Implementation Plan

### 1. Premium Slide-Out Mobile Menu

Replace the basic dropdown with a polished drawer using the `vaul` library (already installed):

**Features:**
- Slide-in from right with smooth animation
- Dark overlay backdrop
- User profile section at top
- Full-height navigation links with large touch targets
- Active route highlighting with teal accent bar
- Separated sections: Navigation / Actions / Account

**Visual Layout:**
```text
┌──────────────────────────────────────┐
│ [X Close]                            │
├──────────────────────────────────────┤
│  ┌─────────────────────────────────┐ │
│  │ 👤 @username                    │ │
│  │ Connected via X                  │ │
│  └─────────────────────────────────┘ │
├──────────────────────────────────────┤
│                                      │
│  NAVIGATION                          │
│  ────────────────────────            │
│  ┃ EXPLORER                         │ ← Active
│  │ DOCS                              │
│  │ GRANTS                            │
│  │ STAKING                           │
│  │ MY BONDS                          │
│  │ MY REGISTRY                       │
│                                      │
├──────────────────────────────────────┤
│  [████ JOIN THE REGISTRY ████]       │
│                                      │
│  [Sign Out]                          │
└──────────────────────────────────────┘
```

### 2. Mobile-Optimized Program Cards

Replace the table on mobile with touch-friendly cards:

**Implementation:**
- Detect mobile using `useIsMobile()` hook
- Show cards on mobile, table on desktop
- Each card shows: Rank, Name, Score, Status badge
- Swipe-hint animation on first card
- Larger touch target (min 48px height)

**Mobile Card Layout:**
```text
┌────────────────────────────────────────┐
│ #1                           ◀ ACTIVE  │
│ ┌──┐                                   │
│ │M │ MARINADE FINANCE                 │
│ └──┘                                   │
│                                        │
│ RESILIENCE SCORE              89/100   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░ ← Progress bar  │
│                                        │
│ 150K SOL Staked  •  Verified ✓         │
└────────────────────────────────────────┘
```

### 3. Hero Section Mobile Optimization

**Changes:**
- Stack stats vertically (1 column) on mobile
- Larger touch-friendly CTA buttons
- Reduce heading size for mobile
- Add subtle fade-in animation

**Mobile Stats Layout:**
```text
┌────────────────────────────┐
│ 2,847                      │
│ Initial Cohort         ℹ️   │
├────────────────────────────┤
│ 12K+                       │
│ Est. Weekly Heartbeats ℹ️   │
├────────────────────────────┤
│ 73.4                       │
│ Beta Benchmark         ℹ️   │
└────────────────────────────┘
```

### 4. Program Detail Mobile Layout

**Header Improvements:**
- Stack logo + name vertically on mobile
- Social icons in horizontal scrollable row
- Score displayed prominently below name
- Program ID with copy button on its own row

**Mobile Header:**
```text
┌────────────────────────────────────────┐
│ ← Back to Explorer                     │
├────────────────────────────────────────┤
│        ┌────────┐                      │
│        │   M    │                      │
│        └────────┘                      │
│                                        │
│    MARINADE FINANCE                    │
│    ◀ Active                            │
│                                        │
│         89                             │
│    Resilience Score                    │
├────────────────────────────────────────┤
│ Program ID: 8888...6666  [Copy] [↗]    │
├────────────────────────────────────────┤
│ 🌐  𝕏  💬  ✈️  🐙                       │ ← Scrollable social row
└────────────────────────────────────────┘
```

### 5. Dashboard Mobile Improvements

**Changes:**
- Collapsible user info section
- Full-width action buttons stacked
- Project cards with larger touch targets
- Bottom sheet for delete confirmation (better UX than modal)

### 6. Touch-Optimized Spacing & Typography

**Global Mobile Enhancements:**
- Increase base tap target to 48px minimum
- Add `active:scale-95` feedback on buttons
- Larger fonts for data display (`text-lg` → `text-xl`)
- More generous padding on cards (`p-4` → `p-5`)
- Safe area insets for notched devices

---

## Files to Create/Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/layout/Navigation.tsx` | Modify | Add Drawer-based mobile menu |
| `src/components/explorer/MobileProgramCard.tsx` | Create | New mobile-optimized card component |
| `src/components/explorer/ProgramLeaderboard.tsx` | Modify | Use mobile cards on small screens |
| `src/components/program/ProgramHeader.tsx` | Modify | Mobile-first responsive layout |
| `src/components/landing/HeroSection.tsx` | Modify | Stack stats vertically on mobile |
| `src/pages/Dashboard.tsx` | Modify | Mobile-optimized layout |
| `src/index.css` | Modify | Add mobile utility classes |

---

## Technical Details

### Drawer Implementation (Navigation.tsx)

Uses the existing `vaul` Drawer component:
```tsx
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';

// Mobile menu trigger
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </DrawerTrigger>
  <DrawerContent className="h-full">
    {/* Premium mobile menu content */}
  </DrawerContent>
</Drawer>
```

### Mobile Card Detection

Uses the existing `useIsMobile()` hook:
```tsx
import { useIsMobile } from '@/hooks/use-mobile';

export function ProgramLeaderboard({ projects }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return <MobileProgramCards projects={projects} />;
  }
  
  return <Table>...</Table>;
}
```

### Touch Feedback Utilities

Add to `src/index.css`:
```css
@layer utilities {
  .touch-feedback {
    @apply transition-transform active:scale-[0.98];
  }
  
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
}
```

---

## Visual Hierarchy on Mobile

The premium mobile experience maintains the Bloomberg Terminal aesthetic through:

1. **Information Density**: Showing key metrics prominently without clutter
2. **Generous Touch Targets**: 48px minimum for all interactive elements
3. **Progressive Disclosure**: "Read More" patterns, collapsible sections
4. **Smooth Animations**: Drawer transitions, card press feedback
5. **Brand Consistency**: Teal accents, Space Grotesk headlines, JetBrains Mono data

