

# Add Tagline Below Main Headline

## Placement

Insert "Secure the Ecosystem. Get Rewarded for Longevity." as a secondary headline between the H1 ("REPUTATION CAN'T BE FORKED.") and the paragraph text. This follows the hero information hierarchy: Category Badge, Hook Headline, Promise Tagline, Explanation, Call-to-Action.

## Visual Hierarchy

```text
[DECENTRALIZED ASSURANCE OF SOLANA]        <-- badge (category)
REPUTATION CAN'T BE FORKED.                <-- h1 (hook)
Secure the Ecosystem. Get Rewarded for Longevity.  <-- NEW tagline (promise)
The Solana Ecosystem needs projects...      <-- paragraph (explain)
[SOLANA PROJECT VITALS]  [STAKE NOW]        <-- CTAs (convert)
```

## File Change

| File | Action | Details |
|------|--------|---------|
| `src/components/landing/HeroSection.tsx` | **EDIT** | Add a styled `p` or `h2` element after the H1 closing tag and before the paragraph |

## Styling

- Font: Space Grotesk (font-display), matching the headline family
- Weight: semibold (not bold like the H1, to create hierarchy)
- Size: text-lg on mobile, text-xl on desktop -- smaller than H1 but larger than body text
- Color: `text-muted-foreground` with the word "Rewarded" in `text-primary` (teal) to echo the teal accent used in "FORKED." above
- Uppercase tracking-wide to match the institutional Bloomberg terminal aesthetic
- Small top margin (mb-6 reduced to mb-2 on H1, then mt-2 mb-6 on the tagline) to keep it visually grouped with the headline

