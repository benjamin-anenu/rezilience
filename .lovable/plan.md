

# Rebrand: Resilience → Rezilience

## Why

There is an existing Solana token called "Resilience." To avoid confusion and prevent your platform launch from inadvertently boosting that token, all user-facing instances of "Resilience" need to change to **Rezilience**.

## Scope Rules

**CHANGE (user-facing branding only):**
- Display text, titles, headings, tooltips, labels, descriptions
- HTML meta tags (title, OG, twitter)
- User-Agent strings in API calls
- GPT system prompt and assistant identity
- Alt text on images
- External link URLs (Twitter handle, GitHub org, docs domain)
- File name: `resilience-ecosystem.png` → referenced as import (we update the import alias, but the physical file stays -- renaming assets requires manual git action)

**DO NOT CHANGE (would cause breaking changes):**
- Database column names (`resilience_score`, `avg_resilience_score`) -- these are in the schema and types file
- The auto-generated `src/integrations/supabase/types.ts` file
- Variable names that reference DB columns (e.g., `result.data.resilience_score`)
- TypeScript interface names like `ResilienceScoreResult` (internal, not user-facing)
- Migration SQL files (historical records)
- The React component function name `ResilienceGPT` and its filename (internal code, not user-facing)
- Route paths (`/gpt`, `/readme`, etc.)

## Mapping

| Current | New |
|---------|-----|
| Resilience | Rezilience |
| RESILIENCE | REZILIENCE |
| ResilienceGPT | RezilienceGPT |
| ResilienceSol (Twitter) | RezilienceSol |
| resilience-protocol (GitHub) | rezilience-protocol |
| docs.resilience.dev | docs.rezilience.dev |
| resilience.fi | rezilience.fi |
| Resilience Protocol (author) | Rezilience Protocol |
| Resilience Platform | Rezilience Platform |
| Resilience Registry | Rezilience Registry |
| Resilience Score (display label) | Rezilience Score |

## Files to Modify (18 files)

### 1. `index.html`
- Title: "Rezilience - On-Chain Assurance Layer for Solana"
- OG tags, author, twitter:site → @RezilienceSol

### 2. `src/components/layout/Navigation.tsx`
- Logo alt text and "RESILIENCE" brand text → "REZILIENCE"

### 3. `src/components/layout/Footer.tsx`
- Logo alt, brand text → REZILIENCE
- External links: docs.rezilience.dev, github.com/rezilience-protocol, twitter.com/RezilienceSol
- Copyright: Rezilience Protocol

### 4. `src/components/gpt/ChatHeader.tsx`
- "ResilienceGPT" → "RezilienceGPT"
- Logo alt text

### 5. `src/components/gpt/ChatInput.tsx`
- Disclaimer text: "RezilienceGPT"
- Placeholder text

### 6. `src/pages/ResilienceGPT.tsx`
- All display text: "RezilienceGPT", "Resilience platform" → "Rezilience platform"

### 7. `src/components/landing/TheGapSection.tsx`
- "WITHOUT RESILIENCE" → "WITHOUT REZILIENCE"
- "WITH RESILIENCE" → "WITH REZILIENCE"

### 8. `src/components/landing/AdaptiveScoringSection.tsx`
- "Adaptive Resilience Formula" → "Adaptive Rezilience Formula"

### 9. `src/components/landing/HowItWorksSection.tsx`
- Any "Resilience" display text

### 10. `src/components/landing/PillarsSection.tsx`
- "resilience scores" text

### 11. `src/components/program/HeroBanner.tsx`
- "Resilience" score label, tooltip text

### 12. `src/components/program/ProgramHeader.tsx`
- "Resilience Score" labels

### 13. `src/components/program/tabs/SupportTabContent.tsx`
- "Resilience Score" in FAQ answers and labels

### 14. `src/components/pitch/slides.tsx`
- All display text: "RESILIENCE REGISTRY", "RESILIENCE vs. PROOF OF HISTORY", formula labels, brand names throughout all slides

### 15. `src/pages/Readme.tsx`
- "RESILIENCE README" heading, "IMPACT ON RESILIENCE SCORE"

### 16. `src/pages/Explorer.tsx`
- "RESILIENCE REGISTRY" heading

### 17. `src/pages/Grants.tsx`
- Twitter link: x.com/RezilienceSol

### 18. `src/components/claim/GitHubAnalysisResult.tsx`
- "RESILIENCE SCORE" label

### 19. `src/components/readme/ScoringMethodology.tsx`
- "UNIFIED RESILIENCE SCORE" → "UNIFIED REZILIENCE SCORE"

### 20. `src/components/staking/ComingSoonOverlay.tsx`
- "Resilience Score" in description text

### 21. `src/components/explorer/EcosystemPulse.tsx`
- Any "Resilience" display text in disclaimers/labels

### Edge Functions (User-Agent strings + GPT prompt):

### 22. `supabase/functions/chat-gpt/index.ts`
- Full system prompt rebrand: "ResilienceGPT" → "RezilienceGPT", "Resilience platform" → "Rezilience platform", "Resilience registry" → "Rezilience registry", etc.

### 23. `supabase/functions/fetch-github/index.ts`
- User-Agent: "Rezilience-Platform"

### 24. `supabase/functions/analyze-github-repo/index.ts`
- User-Agent: "Rezilience-Registry"

### 25. `supabase/functions/analyze-tvl/index.ts`
- User-Agent: "Rezilience-Registry"

### 26. `supabase/functions/analyze-dependencies/index.ts`
- User-Agent: "Rezilience-Registry" (multiple instances)

### 27. `supabase/functions/github-oauth-callback/index.ts`
- User-Agent: "Rezilience-Platform" (multiple instances)

### 28. `src/types/index.ts`
- Comment: "Rezilience Type Definitions", "Full-Spectrum Rezilience"

## What Stays the Same

- All database columns (`resilience_score`) -- no migrations needed
- `src/integrations/supabase/types.ts` -- auto-generated, never touch
- TypeScript variable/interface names referencing DB columns
- Physical asset filenames (would require git rename)
- Route paths
- Migration files (historical)

