

# Learning Room -- Premium UI Redesign

## Problem

The current module cards are flat, plain bordered boxes that look clickable but aren't interactive. The information (topics, resources, prerequisites) is crammed together without visual hierarchy. It reads like a basic list rather than a premium curriculum experience.

## Solution: Accordion-Based Curriculum Timeline

Replace the flat card list with a sophisticated vertical timeline + accordion pattern. Each module shows a compact summary row by default, and expands to reveal full details on click. This creates a clear visual progression and eliminates the "everything at once" overwhelm.

### Visual Structure

```text
[01] ─── What is Solana? ──────────── 15 min ── CONCEPT
              (click to expand)
         |
[02] ─── The Accounts Model ──────── 30 min ── CONCEPT
              (click to expand)
         |
[03] ─── Transactions 101 ─────────── 30 min ── CONCEPT
              (click to expand)
         |
[04] ─── Setting Up Your Environment ─ 45 min ── HANDS-ON
              (click to expand)
         |
[05] ─── Hello World Program ─────── 1 hour ── PROJECT
              (click to expand)
```

### Collapsed State (Summary Row)
Each module shows:
- Left: vertical timeline connector line with a numbered circle node (teal glow)
- Module title (Space Grotesk, bold)
- Difficulty/type badge: CONCEPT, HANDS-ON, or PROJECT (derived from estimated time -- under 30min = concept, 30-59min = hands-on, 1hr+ = project)
- Estimated time with clock icon (right-aligned, mono)
- Subtle chevron indicating expandability

### Expanded State (Detail Panel)
On click, the card expands with a smooth animation (framer-motion) to reveal:
- Description paragraph with slightly larger text
- **What You'll Learn** section: topics rendered as a clean checklist (check-circle icons) instead of tiny badges
- **Resources** section: each resource as a full-width row with icon, label, source domain, and external link arrow -- not just inline text links
- **Prerequisites** section (if any): rendered as linked badges pointing to the prerequisite module's anchor on the page
- A subtle inner border-left accent line in teal

### Additional Enhancements

**Data Enhancement** -- Add a `difficulty` field to `LearningModule` type:
- `'concept'` -- reading/theory modules
- `'hands-on'` -- setup and practice modules
- `'project'` -- build something end-to-end

This gets set on each module in `learning-paths.ts` and renders as a colored badge (teal for concept, amber for hands-on, primary for project).

**Progress Indicator** -- The timeline nodes use three visual states:
- Filled teal circle = current/expanded module
- Outlined circle with number = collapsed module
- Connected by a vertical dashed line

**"Other Paths" Section** -- Upgrade from plain cards to glass cards with the tier icon, module count, and a progress-style indicator showing what content awaits.

## Technical Details

### Files Modified

**`src/data/learning-paths.ts`**
- Add `difficulty: 'concept' | 'hands-on' | 'project'` to `LearningModule` interface
- Set appropriate difficulty value on each of the 15 modules

**`src/pages/LibraryLearn.tsx`**
- Replace the flat `space-y-4` div with a timeline-based accordion layout
- Use `useState` to track which module is expanded (or null for all collapsed)
- Add framer-motion `AnimatePresence` + `motion.div` for smooth expand/collapse
- Render timeline connector lines between modules
- Upgrade "Other Paths" section with icons and glass styling
- Add difficulty badges with color coding
- Render resources as full-width rows instead of inline links
- Render topics as a checklist instead of tiny badges

### No New Dependencies
- `framer-motion` already installed for animations
- All UI primitives (Badge, etc.) already available
- Lucide icons for CheckCircle2, ChevronDown, etc. already available

