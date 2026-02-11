

# Landing Page Revamp: Below the Hero

## Strategic Assessment

The current sections below the hero (ProblemSolution, HowItWorks, Pillars, UseCases) are technically accurate but suffer from:

1. **Redundancy** -- PillarsSection repeats concepts already in HowItWorksSection
2. **Jargon-heavy** -- "Red Ocean/Blue Ocean" is MBA language, not builder/public language
3. **No visual storytelling** -- all text-and-icon cards, no imagery that creates emotional connection
4. **Missing the adaptive scoring story** -- the new formula isn't reflected on the landing page
5. **PillarsSection has fake metrics** ("2.8M+ Fingerprints", "$1.28M Total Staked") that undermine credibility

## New Section Architecture

The hero stays untouched. Below it, the new flow:

```text
HERO (untouched)
  |
  v
Section 1: "THE GAP" (replaces ProblemSolutionSection)
  - Simple: "Solana makes it easy to ship. Hard to prove you're still building."
  - Left: AI-generated 3D image of a crumbling/abandoned building (decay)
  - Right: AI-generated 3D image of a healthy, glowing structure (signal)
  - 4 crisp one-liner pain points, no Red/Blue Ocean jargon
  |
  v
Section 2: "THE ASSURANCE PIPELINE" (replaces HowItWorksSection)
  - The 4-step pipeline: INDEX > VERIFY > COMMIT > DETECT
  - Each step gets an AI-generated 3D isometric icon
  - Clean horizontal flow with arrow connectors
  |
  v
Section 3: "ADAPTIVE SCORING" (replaces PillarsSection -- new section)
  - Shows the adaptive formula
  - 3-column weight profile visual (Full Stack / DeFi / Infrastructure)
  - Brief explanation: "No project penalized for what doesn't apply"
  - Uses real data from the README methodology
  |
  v
Section 4: "WHO IT'S FOR" (replaces UseCasesSection)
  - Simplified: Builders, Investors, DAOs
  - Each card gets a 3D avatar/character image
  - CTA stays the same
```

## AI Image Generation Plan

Using Lovable AI (via an edge function calling the Nano banana model), generate 6 images total:

1. **"Decay" visual** -- 3D pixel-realism crumbling server/building, dark tones, warning orange accents
2. **"Signal" visual** -- 3D pixel-realism healthy glowing server/structure, teal accents
3. **INDEX icon** -- 3D isometric database/scanner
4. **VERIFY icon** -- 3D isometric shield with checkmark
5. **COMMIT icon** -- 3D isometric lock/bond
6. **DETECT icon** -- 3D isometric radar/network graph

These will be generated via an edge function that calls the Lovable AI image generation endpoint, saves results to Supabase Storage, and serves them as public URLs. The images are generated once and cached permanently.

## Detailed Technical Changes

### 1. New Edge Function: `generate-landing-images`

Creates an edge function that:
- Accepts a prompt and image name
- Calls the Lovable AI gateway (`google/gemini-2.5-flash-image`) with LOVABLE_API_KEY
- Uploads the resulting base64 image to a `landing-images` storage bucket
- Returns the public URL
- Skips generation if the image already exists in storage

### 2. Storage Bucket: `landing-images`

- Public bucket for landing page assets
- RLS: public read, no write from client

### 3. New Component: `TheGapSection.tsx` (replaces ProblemSolutionSection)

**Header**: "THE MAINTENANCE VISIBILITY GAP"
**Subtitle**: "Solana makes it incredibly easy to ship. What's still hard is knowing what's actually being maintained."

Two-panel layout (no Red/Blue Ocean terminology):

**Left Panel ("Without Resilience")**:
- Muted, dark card with decay image
- 4 pain points using simple language:
  - "No way to tell if a project is actively maintained"
  - "Forks look identical to originals on-chain"
  - "Due diligence is manual, slow, and doesn't scale"  
  - "Governance and dependency health are invisible"

**Right Panel ("With Resilience")**:
- Teal-accented card with signal image
- 4 solutions:
  - "Continuous development health scoring, updated in real-time"
  - "Bytecode fingerprinting verifies originality across the ecosystem"
  - "Adaptive scoring adjusts to each project type automatically"
  - "Supply chain intelligence maps risk across dependencies"

### 4. Updated Component: `HowItWorksSection.tsx` (the pipeline)

Keep the existing 4-step structure (INDEX, VERIFY, COMMIT, DETECT) but:
- Replace icon-in-box with AI-generated 3D isometric images
- Update subtitle from "three-stage pipeline" to "Four-step assurance pipeline"
- Add subtle glow effects on hover
- Each card has a brief "For Builders" and "For Public" one-liner

### 5. New Component: `AdaptiveScoringSection.tsx` (replaces PillarsSection)

**Header**: "SCORING THAT ADAPTS"
**Subtitle**: "Every Solana project is different. Our formula knows that."

Content:
- The adaptive formula display (same as README/pitch deck)
- 3 visual weight profile cards showing how weights shift
- A "See Full Methodology" link to /readme
- No fake metrics -- only real explanations

### 6. Updated Component: `UseCasesSection.tsx`

Simplify the 3 cards:
- **Builders**: "Prove you're still building. Claim your profile, track milestones, earn trust."
- **Investors & DAOs**: "Data-backed due diligence. Score breakdowns, dependency health, governance signals."
- **The Ecosystem**: "A public good. Open data, open source, no gatekeeping."

Each card gets an AI-generated 3D character/avatar.

### 7. Update `landing/index.ts` exports

Replace ProblemSolutionSection with TheGapSection, add AdaptiveScoringSection, remove PillarsSection.

### 8. Update `Index.tsx` page

New section order:
```
HeroSection
TheGapSection
HowItWorksSection
AdaptiveScoringSection
UseCasesSection
```

## Files to Create
- `supabase/functions/generate-landing-images/index.ts` -- AI image generation edge function
- `src/components/landing/TheGapSection.tsx` -- replaces ProblemSolutionSection
- `src/components/landing/AdaptiveScoringSection.tsx` -- replaces PillarsSection

## Files to Modify
- `src/components/landing/HowItWorksSection.tsx` -- add 3D images, update copy
- `src/components/landing/UseCasesSection.tsx` -- simplify copy, add 3D images
- `src/components/landing/index.ts` -- update exports
- `src/pages/Index.tsx` -- new section order

## Database Migration
- Create `landing-images` public storage bucket

## Hero Section Advisory (no changes made)
The hero is strong. One optional suggestion for a future iteration: the right-side orbital illustration is desktop-only (`hidden lg:flex`). Consider adding a simplified mobile version -- perhaps just the Solana logo with a subtle pulse animation -- so mobile users get some visual impact too.

