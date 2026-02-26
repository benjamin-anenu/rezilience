

# Hackathon Demo Page Rebuild -- Storytelling Flow

## Concept

Replace the current `/demo` page with an immersive, scrollable storytelling experience that walks judges through the **full DAO Accountability lifecycle** in ~90 seconds. Each section reveals the next step of the story with real data and visual clarity.

## Story Arc (7 Sections)

```text
HERO --> THE PROBLEM --> JOIN THE REGISTRY --> COMMITMENT LOCK --> REALMS ACCOUNTABILITY --> LIVE ANALYSIS --> CTA
```

### Section 1: Hero
- Title: "Rezilience x Realms -- DAO Accountability Layer"
- Subtitle: "DAOs fund projects. Rezilience tracks if they deliver."
- Animated badge: "SOLANA GRAVEYARD HACKATHON"
- Single scroll-down indicator

### Section 2: The Problem (Why This Matters)
- Three pain-point cards with icons:
  - "DAOs approve funding but nobody tracks execution"
  - "Abandoned projects keep governance tokens but deliver nothing"
  - "The public has no way to verify if funded milestones were completed"
- Brief stat: "X proposals approved across Solana DAOs -- how many shipped?"

### Section 3: Join the Registry (Animated Flow)
A horizontal pipeline showing 5 steps with connecting arrows:
1. **Sign in with X** -- Builder authenticates identity
2. **Submit Project Identity** -- Name, program ID, GitHub, DAO address
3. **Verify Authority** -- SIWS wallet proof or Squads multisig
4. **GitHub Analysis** -- Automated code health scoring
5. **Live on Registry** -- Project appears in explorer with Rezilience score

Each step has an icon, title, and one-line description. The "Submit Project Identity" step highlights the **Realms DAO Address** field as a callout box, showing this is where the DAO link gets established.

### Section 4: The Commitment Lock
Visual showing how the Rezilience score is calculated with the Realms modifier:
- Formula display: `R = (GitHub x 40%) + (Deps x 25%) + (Gov x 20%) + (TVL x 15%)`
- Callout card showing the Realms modifier rules:
  - Delivery Rate >= 70%: +10 governance bonus (green)
  - Delivery Rate 40-70%: no modifier (amber)
  - Delivery Rate < 40%: -15 penalty (red)
- "This is the Commitment Lock. Your DAO's execution record directly impacts your Rezilience Score."

### Section 5: DAO Accountability Dashboard
A mock dashboard card (using real component patterns) showing:
- A sample project card with:
  - Project name, score, liveness badge
  - DAOAccountabilityCard embedded (showing delivery rate, proposal counts)
  - Score breakdown showing the `realms_modifier` field
- Caption: "Every project page shows real-time governance accountability"

### Section 6: Live Analysis (Interactive -- kept from current page)
- The existing live DAO analysis input + example DAO buttons
- Results display with delivery rate, proposal breakdown, score impact
- State breakdown grid
- "Try it yourself" prompt

### Section 7: CTA
- "This Is What Accountability Looks Like"
- Three buttons: Explore Registry, Read Methodology, Claim Your Project

## Technical Details

### Files Changed

| File | Action |
|------|--------|
| `src/pages/HackathonDemo.tsx` | Full rewrite -- storytelling layout with 7 sections |

### Design Patterns
- Uses existing `Layout` wrapper, `Card`, `Badge`, `Progress`, `Button` components
- Bloomberg terminal aesthetic: dark background, teal accents, `font-display` uppercase headers, `font-mono` data
- Framer Motion for section entrance animations (fade-in on scroll via `whileInView`)
- Each section is full-viewport-height or near it, separated by `border-b border-border`
- Mobile responsive: pipeline steps stack vertically on small screens

### Key UI Components Within the Page
- **StorySection**: Reusable wrapper with `whileInView` animation, consistent padding
- **PipelineStep**: Numbered step with icon, title, description, connecting arrow
- **ScoringModifierCard**: Shows the three delivery rate tiers with color coding
- **MockProjectCard**: Simulated project profile card with embedded DAOAccountabilityCard
- **LiveAnalysis**: Kept from current implementation -- the interactive DAO address input and results

### No New Dependencies
All animations use existing `framer-motion`. All UI uses existing shadcn components.

### No Backend Changes
The existing `fetch-realms-governance` edge function is reused as-is for the live analysis section.
