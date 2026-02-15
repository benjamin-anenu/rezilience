**Premium "Build In Public" Card Redesign**

### Changes to `src/components/explorer/BuilderPostCard.tsx`

#### 1. Card Shell — Black with Cyan Border

- Background: `bg-[#0a0a0a]` (true black) instead of `bg-card/80`
- Border: `border-primary/40` (cyan outline) with `hover:border-primary/70` glow on hover
- Hover shadow: stronger cyan glow `hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.25)]`

#### 2. Smaller Tweet Embed

- Reduce height from `h-[280px]` to `h-[200px]` — enough to show the tweet text preview without dominating the card
- Apply CSS scaling (`transform: scale(0.85) origin-top-left`) on the inner tweet wrapper so the rendered tweet content shrinks proportionally and more of it is visible
- Keep the fade-out gradient at the bottom

#### 3. Enhanced Footer with More Info

- Show the post title prominently (not just a muted single line)
- Display the relative timestamp as a visible element
- Make the "View on X" link a small teal-accented pill button instead of plain text
- Add a subtle cyan divider line at the top of the footer

#### 4. Header Refinements

- Header background: `bg-[#0a0a0a]` matching the card body
- Border bottom in cyan: `border-b border-primary/20`
- Category badge with stronger teal styling

### Visual Result

- Compact, box-shaped cards with black fill and glowing cyan borders
- Tweet preview is readable but contained — shows enough to decide whether to click through
- Footer gives clear context (title, time, CTA) so you know what the post is about before visiting X

### Files Changed


| File                                          | Change                                                                                          |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/components/explorer/BuilderPostCard.tsx` | Full card restyling: black bg, cyan border, smaller tweet embed with CSS scale, enhanced footer |
