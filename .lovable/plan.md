

# Official Brand Logo Watermarks on Grant Cards

## What Changes

Replace the current `<img>` tags (using GitHub avatar URLs) with **inline SVG components** for each provider's official logo mark. This is the same approach used for the Solana logo in the hero section -- it guarantees zero CORS issues, instant loading, and pixel-perfect rendering.

## Logo Sources

Each provider will get a dedicated inline SVG matching their official brand identity:

| Provider | Logo | Source |
|---|---|---|
| **Solana Foundation** (x2 + Merge Club) | Solana "S" triple-bar mark | Same SVG paths already used in `HeroSection.tsx` |
| **Superteam** | Superteam "S" shield mark | Official brand assets |
| **Colosseum** | Colosseum arch/pillar mark | Official brand identity |
| **Jupiter** | Jupiter "cat" planet icon | Official JUP brand kit |
| **Marinade** | Marinade chef hat / wave mark | Official press kit |

## Technical Details

### File: `src/data/solana-grants.ts`

- Remove the `logoUrl` field from the `SolanaGrant` interface
- Add a `providerId` field instead (e.g., `'solana'`, `'superteam'`, `'colosseum'`, `'jupiter'`, `'marinade'`) to map each grant to its logo component

### File: `src/pages/Grants.tsx`

- Create a `ProviderLogo` component that renders the correct inline SVG based on `providerId`
- Each SVG will be rendered at `h-24 w-24` size with `opacity-[0.08]` and `grayscale` filter, positioned `absolute bottom-3 right-3`
- The Solana Foundation SVG reuses the exact same `<path>` elements from the hero section
- Jupiter, Superteam, Colosseum, and Marinade get their own SVG path data from their official brand kits

### Watermark Styling (unchanged from current)

- `pointer-events-none select-none` to prevent interaction interference
- `absolute bottom-3 right-3` positioning
- `h-24 w-24` size (96px)
- `opacity-[0.08] grayscale` for subtle monochromatic effect

## Why Inline SVGs

- Zero CORS issues (no external requests)
- Instant rendering (no network latency)
- Scales perfectly at any size
- Matches the proven pattern already used in the hero section
- Full control over fill color for the grayscale/monochrome watermark effect

