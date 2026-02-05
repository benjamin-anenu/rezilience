

# Reorder Program Detail Page Sections

## New Section Order

1. **Program Header** (unchanged - stays at top)
2. **Verified Badge Banner** (unchanged - verification status)
3. **Description + Category** (brief intro)
4. **Upgrade Frequency Chart + Recent Events** (operational health - side by side)
5. **Metric Cards** (key stats)
6. **Verified Timeline** (roadmap accountability)
7. **Media Gallery** (project showcase)
8. **Website Snippet + Social Pulse** (marketing/community - side by side)
9. **Stake CTA** (call to action - stays at bottom)

---

## Technical Changes

### File: `src/pages/ProgramDetail.tsx`

Reorder the JSX blocks in the return statement:

```text
Current Order:
├── Back link
├── Verified Badge
├── Header
├── Description
├── Media Gallery          ← Move down
├── Website + Social Pulse ← Move down
├── Verified Timeline      ← Move up
├── Upgrade Chart + Events
├── Metric Cards
└── Stake CTA

New Order:
├── Back link
├── Verified Badge
├── Header
├── Description
├── Upgrade Chart + Events ← Promoted to top
├── Metric Cards           ← Moved up
├── Verified Timeline      ← Second priority
├── Media Gallery          ← Project showcase section
├── Website + Social Pulse ← Community/marketing section
└── Stake CTA
```

---

## Implementation

Move these code blocks in `ProgramDetail.tsx`:

1. Move **Upgrade Chart + Recent Events grid** (currently lines ~213-223) up to right after Description
2. Move **Metric Cards** (currently lines ~226-228) up to after the chart grid
3. Keep **Verified Timeline** in its current relative position (after metrics)
4. Move **Media Gallery** down (after timeline)
5. Move **Website + Social Pulse grid** down (after media gallery)

No logic changes required - just reordering the JSX sections.

---

## Result

The page will now flow as:
- **Operational Health First**: Chart and events immediately visible
- **Key Metrics**: Quick stats overview
- **Accountability**: Roadmap commitments with status indicators
- **Showcase**: Media and community links at the bottom

This prioritizes trust signals (activity, stability, commitments) over marketing content (images, social links).

