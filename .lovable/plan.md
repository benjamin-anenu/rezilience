

## Premium "Build In Public" Feed Redesign

### Problems with Current UI
- No section header or contextual intro — just raw tweet cards dumped in a grid
- Cards are plain white `Card` components with minimal styling — no glass effects, no depth
- No visual hierarchy — the header bar (logo + subscribe) feels like a simple list item
- The grid has no breathing room and no staggered entry animations
- Missing a "hero" banner or context block explaining what this feed is
- No timestamp or recency indicator on posts
- Skeleton loading is generic rectangles with no visual interest

### Design Direction
Institutional Bloomberg aesthetic with glass-morphism, staggered card animations, and a premium section header — consistent with the Titan Watch and Ecosystem Pulse tabs.

---

### Changes

#### 1. New Section Header Banner (`BuildersInPublicFeed.tsx`)

Add a premium glass header at the top of the feed with:
- Megaphone icon with teal glow
- "BUILD IN PUBLIC" title in Space Grotesk uppercase
- Subtitle: "Real-time project updates from verified builders in the Rezilience Registry"
- Post count badge (e.g., "4 UPDATES")
- Styled with `glass-chart` class, matching Ecosystem Pulse

#### 2. Redesigned Post Cards (`BuilderPostCard.tsx`)

Transform the flat cards into premium glass panels:
- **Glass effect**: `backdrop-blur-xl bg-card/80 border-primary/10` with hover glow (`hover:border-primary/30`)
- **Header**: Larger logo (32px), bolder project name, category badge with teal tint, and a relative timestamp (e.g., "2d ago") using `date-fns`'s `formatDistanceToNow`
- **Subscribe button**: Moved inline with a more subtle ghost style
- **Tweet embed area**: Contained within a rounded inner panel with subtle border, preventing the raw tweet from visually bleeding
- **Footer**: Enhanced with timestamp and "View on X" link
- **Card-lift transition**: Add `.card-lift` hover effect for depth
- **Staggered entry**: Each card gets `animate-fade-in` with increasing delay via inline style `animationDelay`

#### 3. Enhanced Empty State (`BuildersInPublicFeed.tsx`)

Upgrade from plain card to a glass panel with:
- Animated megaphone icon with subtle pulse
- Stronger CTA copy: "BE THE FIRST TO BUILD IN PUBLIC"
- Teal-accent "Claim Your Project" button

#### 4. Premium Loading Skeletons (`BuildersInPublicFeed.tsx`)

Replace flat rectangles with glass-panel skeletons that mirror the final card layout:
- Header skeleton (avatar circle + text lines)
- Body skeleton (tweet area)
- Footer skeleton (small line)

---

### Files Changed

| File | Change |
|------|--------|
| `src/components/explorer/BuildersInPublicFeed.tsx` | Add section header banner, premium skeletons, enhanced empty state, staggered animations |
| `src/components/explorer/BuilderPostCard.tsx` | Glass-morphism card, larger header, relative timestamps, card-lift hover, contained tweet embed |

### No new dependencies
- `date-fns` is already installed and used for `formatDistanceToNow`
- All glass/animation classes already exist in the design system

