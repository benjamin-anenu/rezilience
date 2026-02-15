

## Redesign Card Header + Expandable Tweet

### 1. Improved Header Layout

**Current problem:** The project name, logo, category badge, and subscribe button are all crammed into one horizontal row, making it feel cluttered.

**New layout — two rows in the header:**

```text
+---------------------------------------+
|  [Logo 36px]  Project Name            |
|               infrastructure | Subscribe |
+---------------------------------------+
```

- **Row 1**: Larger logo (36px, `h-9 w-9`) + project name in bolder text (`text-base font-bold`)
- **Row 2**: Category badge + Subscribe button, aligned below the name with slight left padding to clear the logo
- More vertical breathing room (`py-3 px-4`) between header elements

### 2. Expandable Card (Click to Read Full Tweet)

Add a collapsed/expanded toggle so users can read the full tweet without leaving the page:

- **Collapsed (default)**: Tweet area stays at `h-[200px]` with the fade-out gradient — same as now
- **Expanded**: Remove the height constraint and fade gradient, letting the full tweet render. The cards below smoothly push down.
- **Toggle trigger**: A small "Read more" / "Show less" button at the bottom of the tweet area
- **Animation**: Use Radix `Collapsible` (already installed) or a CSS `max-height` transition for smooth expand/collapse. Since Radix Collapsible animates height changes natively, it provides the smooth push-down effect.

### Technical Approach

- Add `useState` for `expanded` toggle
- Wrap the tweet area in a container that switches between `h-[200px] overflow-hidden` (collapsed) and `h-auto` (expanded)
- Use `framer-motion`'s `AnimatePresence` + `motion.div` with `layout` for a smooth height animation (already installed), OR use CSS `transition-[max-height]` with a generous max-height value
- The fade gradient only renders when collapsed
- "Read more" button sits at the bottom border, styled as a subtle text link

### Files Changed

| File | Change |
|------|--------|
| `src/components/explorer/BuilderPostCard.tsx` | Restructure header into two rows (logo+name / badge+subscribe), add expand/collapse state with smooth animation for the tweet embed area |

