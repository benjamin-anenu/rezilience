

# Redesign Team Tab Layout

## Overview

Restructure the Team tab to display a **two-column layout** with the "Why Stake" section on the left and the "Meet The Team" grid on the right. Also add the label "I am best fit for this project" before each team member's quote.

---

## Layout Change

**Current Layout (Vertical Stack):**
```
┌─────────────────────────────────────────┐
│           MEET THE TEAM                 │
│  ┌─────┐  ┌─────┐  ┌─────┐             │
│  │Card │  │Card │  │Card │              │
│  └─────┘  └─────┘  └─────┘             │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│       WHY STAKE ON THIS PROJECT?        │
│       "Staking pitch text..."           │
└─────────────────────────────────────────┘
```

**New Layout (Side-by-Side):**
```
┌──────────────────┬──────────────────────┐
│  WHY STAKE ON    │    MEET THE TEAM     │
│  THIS PROJECT?   │  ┌─────┐  ┌─────┐    │
│                  │  │Card │  │Card │    │
│  "Staking pitch  │  └─────┘  └─────┘    │
│   text..."       │  ┌─────┐  ┌─────┐    │
│                  │  │Card │  │Card │    │
│                  │  └─────┘  └─────┘    │
└──────────────────┴──────────────────────┘
```

- On desktop: 1/3 width for "Why Stake" (left), 2/3 width for "Meet The Team" (right)
- On mobile: Stack vertically with "Why Stake" first, then team grid below

---

## Changes

### File: `src/components/program/tabs/TeamTabContent.tsx`

| Change | Description |
|--------|-------------|
| Restructure main container | Use CSS Grid with `lg:grid-cols-3` for side-by-side layout |
| Move "Why Stake" section | Position it first (left column, spans 1 column) |
| Move "Meet The Team" section | Position it second (right column, spans 2 columns) |
| Add "I am best fit" label | Insert text above the quote in each team member card |
| Make "Why Stake" sticky | Add `lg:sticky lg:top-6` so it stays visible while scrolling team members |

### Quote Section Enhancement

**Current:**
```
┌────────────────────┐
│ " Member's quote   │
│   text here...     │
└────────────────────┘
```

**New:**
```
┌────────────────────┐
│ I am best fit for  │
│ this project       │
│ " Member's quote   │
│   text here...     │
└────────────────────┘
```

---

## Technical Implementation

```tsx
// New layout structure
<div className="grid gap-8 lg:grid-cols-3">
  {/* Left Column - Why Stake (1/3 width) */}
  {hasStakingPitch && (
    <div className="lg:col-span-1">
      <Card className="lg:sticky lg:top-6 ...">
        {/* Why Stake content */}
      </Card>
    </div>
  )}
  
  {/* Right Column - Meet The Team (2/3 width) */}
  {hasTeamMembers && (
    <div className={hasStakingPitch ? "lg:col-span-2" : "lg:col-span-3"}>
      {/* Team header and grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Team cards - reduced from 3 cols to 2 since container is smaller */}
      </div>
    </div>
  )}
</div>
```

```tsx
// Quote section with label
{member.whyFit && (
  <div className="relative pt-2 border-t border-border/50">
    <p className="text-xs font-medium text-primary/70 uppercase tracking-wider mb-1">
      I am best fit for this project
    </p>
    <div className="flex items-start gap-1">
      <Quote className="h-4 w-4 text-primary/40 flex-shrink-0 mt-0.5" />
      <p className="text-sm italic text-muted-foreground leading-relaxed">
        {member.whyFit}
      </p>
    </div>
  </div>
)}
```

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 1024px) | Single column: "Why Stake" stacked above team grid |
| Desktop (≥ 1024px) | Two columns: "Why Stake" (left, sticky), Team grid (right) |

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Only team members (no staking pitch) | Team grid takes full width (3 columns) |
| Only staking pitch (no team members) | Staking pitch card displayed alone, centered |
| Both present | Side-by-side layout as described |

