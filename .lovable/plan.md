
# Redesign: Premium Trust Gap Section with Slanted Stamps

## Overview
Enhance the Problem/Solution section with a sophisticated, icon-centric design featuring slanted stamps (like the reference image), premium icons, and bullet points explaining each ocean concept.

---

## Visual Design

### Layout Structure
```text
+------------------------------------------------------------------+
|            THE PROBLEM: VANITY METRICS FAIL.                      |
+------------------------------------------------------------------+
|                                                                   |
|  +-----------------------------+  +-----------------------------+ |
|  |      THE RED OCEAN          |  |    THE BLUE OCEAN           | |
|  |    What Exists Today        |  |   What Resilience Unlocks   | |
|  |                             |  |                             | |
|  |    [Star]     [Utensils]    |  | [Heart] [Fingerprint] [Lock]| |
|  |   GitHub         TVL        |  | Liveness Originality Staked | |
|  |   Stars                     |  |  Score     Index   Assurance| |
|  |                             |  |                             | |
|  |  • Opaque upgrade history   |  | • Transparent liveness      | |
|  |  • No standardized health   |  | • Quantified resilience     | |
|  |  • Forks erode integrity    |  | • Bytecode verification     | |
|  |  • Manual diligence         |  | • Automated risk assessment | |
|  |                             |  |                             | |
|  |      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲      |  |     ╱‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾╲     | |
|  |     ╱ DECAY DETECTED  ╲     |  |    ╱ VERIFIED ACTIVE   ╲    | |
|  |     ╲________________╱      |  |    ╲_________________╱     | |
|  |        (rotated -6deg)      |  |       (rotated 6deg)        | |
|  +-----------------------------+  +-----------------------------+ |
+------------------------------------------------------------------+
```

---

## Component Details

### Section Header
- Title: "THE PROBLEM: VANITY METRICS FAIL."
- Left-aligned, uppercase, bold Space Grotesk
- Optional subtitle about Solana's trust gap

### Red Ocean Panel (Left)
**Visual Style:**
- Background: `bg-destructive/5` with subtle red tint
- Border: `border-destructive/20`
- Muted, faded aesthetic

**Icons (Large, ~48px):**
- `Star` - GitHub Stars (vanity metric)
- `Utensils` - TVL / Fork metaphor
- Icons rendered in muted gray color (`text-muted-foreground`)

**Bullet Points:**
- Opaque upgrade history creates trust vacuum
- No standardized way to assess program health
- Forks and clones erode ecosystem integrity
- Manual due diligence doesn't scale

**Slanted Stamp:**
- "DECAY DETECTED" text
- Dashed border in orange/rot color
- Rotated `-6deg` for that authentic stamp look
- Uppercase, monospace font

### Blue Ocean Panel (Right)
**Visual Style:**
- Background: `bg-card` with teal accent
- Border: `border-primary/30` with subtle glow
- Premium, vibrant aesthetic

**Icons (Large, ~48px, with glow):**
- `HeartPulse` - Liveness Score
- `Fingerprint` - Originality Index
- `Shield` - Staked Assurance
- Icons in teal with drop-shadow glow effect

**Bullet Points:**
- Transparent liveness indexing on every program
- Quantified resilience scores across ecosystem
- Bytecode originality verification and fingerprinting
- Automated, real-time program risk assessment

**Slanted Stamp:**
- "VERIFIED ACTIVE" text
- Solid teal border with glow effect
- Rotated `6deg` (opposite direction)
- Uppercase, monospace font

---

## Technical Implementation

### File Changes
1. **`src/components/landing/ProblemSolutionSection.tsx`** - Complete redesign

### Icons from lucide-react
- `Star` - GitHub stars
- `Utensils` - TVL/forks
- `HeartPulse` - Liveness
- `Fingerprint` - Originality
- `Shield` - Staked assurance

### Stamp Styling (Tailwind + inline)
```tsx
// Red Ocean stamp - rotated left
<div className="inline-block -rotate-6 border-2 border-dashed border-destructive px-4 py-2">
  <span className="font-mono text-sm uppercase tracking-wider text-destructive">
    DECAY DETECTED
  </span>
</div>

// Blue Ocean stamp - rotated right, with glow
<div className="inline-block rotate-6 border-2 border-primary px-4 py-2 shadow-[0_0_15px_hsl(174,100%,38%,0.4)]">
  <span className="font-mono text-sm uppercase tracking-wider text-primary">
    VERIFIED ACTIVE
  </span>
</div>
```

### Icon Glow Effect
```tsx
// Teal icons with glow
<HeartPulse 
  className="h-12 w-12 text-primary" 
  style={{ filter: 'drop-shadow(0 0 8px hsl(174 100% 38% / 0.5))' }} 
/>
```

### Responsive Behavior
- Desktop: Side-by-side panels
- Mobile: Stacked vertically, icons in a row

---

## Expected Result
A premium, sophisticated comparison section that:
- Uses large, meaningful icons to represent metrics
- Features authentic-looking slanted stamps
- Includes explanatory bullet points
- Maintains the Bloomberg Terminal aesthetic
- Creates clear visual contrast between problems and solutions
