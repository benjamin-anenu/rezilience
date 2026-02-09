

# Hero Section: Solana Logo + Dimension of Trust Icons

## Central Node
Replace the `Shield` icon with an inline SVG of the official Solana logo mark (the "S" parallelogram shape). This will be rendered as a clean SVG path directly in the component -- no external assets needed. The logo will use the `primary` (teal) color to stay on-brand.

The central node will also get a subtle double-border treatment and a stronger glow effect (`glow-signal-strong`) for a more premium, institutional feel.

## Orbital Nodes -- Four Dimensions of Trust
Each orbital node maps to a dimension from the scoring methodology, using semantically precise icons per the design system rules:

| Position | Dimension | Icon | Rationale |
|---|---|---|---|
| Top-left | Brain (Code Activity, 40%) | `GitBranch` | Represents development branching and code activity |
| Top-right | Nervous System (Dependencies, 25%) | `Network` | Represents interconnected dependency supply chain |
| Bottom-left | Heart (Governance, 20%) | `Heart` | Per design system: Heart = community/governance |
| Bottom-right | Limbs (Economic, 15%) | `Coins` | Per design system: Coins = financial/staked metrics |

Each orbital node will get a small label beneath it (hidden on smaller screens) showing the dimension name in `font-mono text-[10px]` for added sophistication.

## Additional Polish
- Add a subtle `pulse-subtle` animation to the central Solana logo node
- Improve connection lines with dashed stroke and slight opacity for a more technical/blueprint feel
- Add a faint rotating ring around the central node using CSS animation for a "scanning" effect

## Technical Details

### File modified:
- `src/pages/...` -- No, just **`src/components/landing/HeroSection.tsx`** (lines ~136-170)

### Changes:
1. Replace `Shield` import with `GitBranch`, `Network`, `Heart`, `Coins` from lucide-react
2. Replace the central Shield icon with an inline SVG Solana logo path
3. Update the 4 orbital node icons to match the dimension mapping
4. Add dimension labels below each orbital node
5. Update SVG connection lines to use `strokeDasharray` for a technical look
6. Add CSS class for a subtle rotating ring animation (inline keyframes or in index.css)

