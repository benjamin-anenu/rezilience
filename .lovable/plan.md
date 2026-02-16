
# Solana Branding: Footer Badge + Bigger Map Icons

## 1. Footer -- Add "Powered by Solana" Badge

In `src/components/layout/Footer.tsx`, add a subtle "Powered by Solana" badge between the copyright line and the Data Provenance section (or inline with the copyright). It will feature:

- An inline SVG of the Solana logo (the gradient "S" mark, same path used on the map)
- Text: "Powered by Solana" in `font-code text-[10px] uppercase tracking-widest text-muted-foreground`
- Wrapped in an anchor tag linking to `https://solana.com` (opens in new tab)
- Styled as a subtle pill with `border border-border/30 rounded-full px-3 py-1` to keep it understated and premium

The copyright line will also be updated from "Built for Solana" to include the badge visually, keeping the text clean.

## 2. Map Markers -- Increase Solana Logo Size

In `src/components/landing/EcosystemMapSection.tsx`, increase the marker sizes:

- `getPulseRadius()` values increased ~60%: `2.5 -> 4`, `3.5 -> 5.5`, `4.5 -> 7`, `6 -> 9`
- `logoSize` multiplier increased from `r * 1.6` to `r * 2.2` so the Solana "S" icon is more prominent
- Pulse ring outer radius adjusted proportionally

## Technical Details

### Files to edit:
- `src/components/layout/Footer.tsx` -- add Solana badge near copyright
- `src/components/landing/EcosystemMapSection.tsx` -- increase `getPulseRadius` return values and `logoSize` multiplier

### Solana logo SVG path (reused from map):
```
M3.5 18.5L8 14h16l-4.5 4.5H3.5zm0-6.5L8 8h16l-4.5 4H3.5zm0-6.5L8 1.5h16L19.5 6H3.5z
```

With a linear gradient from `#9945FF` through `#14F195` to `#00C2FF`.
