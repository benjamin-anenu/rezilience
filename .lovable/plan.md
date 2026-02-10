

# Resilience Grant Pitch Deck — Internal Page at `/pitch`

## Strategy & Rationale

The Solana Foundation application guidelines explicitly state "A deck / presentation is not necessary but would be helpful." Building it as a navigable in-app page serves three purposes:

1. **Live demo** — reviewers click the link and immediately see the product working, not a static PDF
2. **Dynamic data** — slide stats pull from the live registry (project count, avg score, active heartbeats)
3. **Reusable asset** — works for Foundation grants, investor intros, and partnership pitches

The deck follows the Foundation's exact evaluation criteria: What are you building, Budget/Milestones, Metrics, Why You, Competition, and Community Benefit.

## Slide Structure (10 slides, keyboard-navigable)

```text
Slide 1: TITLE
  "Reputation Can't Be Forked."
  Resilience — Decentralized Assurance Layer for Solana
  [Live stats from registry: Projects | Active | Avg Score]

Slide 2: THE PROBLEM
  Solana's upgrade authority model creates a trust vacuum
  - No standardized health monitoring
  - Forks/clones erode integrity
  - Manual due diligence doesn't scale
  - $X billion in TVL with zero continuous auditing

Slide 3: THE SOLUTION
  Multi-dimensional Proof-of-Life registry
  R = 0.40xGitHub + 0.25xDeps + 0.20xGov + 0.15xTVL
  Visual: four dimension icons (Brain, Nervous System, Heart, Limbs)

Slide 4: HOW IT WORKS
  3-step flow:
  1. Index — Automated scoring of every registered program
  2. Verify — Bytecode originality + dependency health
  3. Commit — Staked assurance + Commitment Locks

Slide 5: TRACTION & METRICS
  Live data pulled from database:
  - Registry count, Active heartbeats, Avg resilience score
  - Claimed vs unclaimed ratio
  - Edge functions running (refresh cycles)

Slide 6: PUBLIC GOOD VALUE
  - Open registry (free access for everyone)
  - Grants Directory (curated funding resource)
  - Dependency health monitoring (supply chain security)
  - Score Oracle architecture (composable on-chain data)
  - Open-source scoring methodology

Slide 7: COMPETITIVE LANDSCAPE
  Comparison table:
  Resilience vs generic block explorers vs audit firms vs DeFi dashboards
  Key differentiator: continuous, automated, multi-dimensional
  (not one-time audits or single-metric dashboards)

Slide 8: ROADMAP & MILESTONES (Budget-aligned)
  Phase 1: Registry (IN PROGRESS) — $X
  Phase 2: Economic Commitment Layer — $X
  Phase 3: Ecosystem Integration — $X
  Phase 4: AEGIS Supply Chain Monitor — $X

Slide 9: THE TEAM
  Placeholder section for team bios
  (Content to be filled by user — name, role, background, links)

Slide 10: ASK & CONTACT
  Funding request amount
  Key milestones tied to funding tranches
  Website URL, X/Twitter, GitHub links
```

## Technical Implementation

### New Files
- **`src/pages/PitchDeck.tsx`** — Full-screen slide presentation with keyboard navigation (arrow keys, Escape). Each slide is a React component rendered at viewport size. Minimal chrome — no header/footer/nav (this is a presentation, not a website page). Includes a small progress bar and slide counter. Uses framer-motion for slide transitions.
- **`src/components/pitch/slides.tsx`** — Individual slide components (TitleSlide, ProblemSlide, SolutionSlide, etc.) using the existing design tokens and typography (Space Grotesk headlines, Inter body, JetBrains Mono data).

### Modified Files
- **`src/App.tsx`** — Add route: `/pitch`

### Design Approach
- Dark background (matches existing theme), no Layout wrapper
- Each slide uses full viewport (`h-screen w-screen`)
- Navigation: Left/Right arrows, dot indicators at bottom
- Auto-hides cursor after 3 seconds of inactivity (presentation mode)
- Responsive but optimized for landscape/desktop (this is a pitch deck)
- Uses `useHeroStats` hook for live data on the Traction slide
- Team slide has placeholder content with clear `TODO` markers for user to fill in

### What Is NOT Included
- No PDF export (unnecessary complexity — the live URL is the deliverable)
- No edit mode (content is code-managed, not CMS)
- No speaker notes (this is a self-guided deck)
- Not linked from main navigation (accessed via direct URL only)

