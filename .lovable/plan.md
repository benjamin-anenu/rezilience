
# README Page: Three Updates

## 1. Rename "For Protocol Builders" to "For Solana Builders"

**Files:** `src/pages/Readme.tsx` (line 401), `src/components/readme/TableOfContents.tsx` (line 28)

- Change `SectionHeader` title from `"For Project Builders"` to `"For Solana Builders"`
- Update TOC entry from `"For Protocol Builders"` to `"For Solana Builders"`

## 2. Add "How to Improve Continuity" Card

**File:** `src/pages/Readme.tsx` (after the existing "How to Join" card, around line 464)

Add a second `Card` inside the "For Solana Builders" section, after the existing card closes. This new card will contain:

- **Title:** "How to Improve Continuity"
- **Subtitle:** "To Increase Your Resilience Score (Prove Continuity):"
- **5 subsections** using an accordion or collapsible pattern for each continuity dimension:
  1. **Brain Continuity** -- 4 bullet points (commit consistently, merge PRs, release versions, 3+ contributors)
  2. **Nervous System Continuity** -- 4 bullet points (cargo update monthly, security advisories, monitor crates.io, test before deploying)
  3. **Heart Continuity** -- 4 bullet points (multisig/DAO governance, vote regularly, multiple signers, publish decisions)
  4. **Limbs Continuity** -- 4 bullet points (maintain economic activity, match maintenance to TVL, improve retention, diversify user base)
  5. **Overall Continuity** -- 4 bullet points (build in public updates, commitment lock milestones, respond to issues, consistent activity)

Each subsection will be a numbered item with bold title and bullet list, styled consistently with the existing "How to Join" step items. The existing "Improving Your Score" section (lines 436-462) will be **removed** since this new card supersedes it with much more detailed guidance.

## 3. Add Product Roadmap Section

**Files:** `src/pages/Readme.tsx` (new section after Data Provenance, before FAQ), `src/components/readme/TableOfContents.tsx` (add TOC entry)

### TOC Update
Add `{ id: 'roadmap', label: 'Product Roadmap', level: 1 }` between `data-provenance` and `faq`.

### New Section Structure
A new `section` with id `"roadmap"` containing 4 phase cards, each as an Accordion item for clean expand/collapse:

| Phase | Title | Status Badge | Timeline |
|---|---|---|---|
| Phase 1 | Resilience Registry | COMPLETE | Months 1-3 |
| Phase 2 | Economic Commitment Layer | IN PROGRESS | Months 4-6 |
| Phase 3 | Ecosystem Integration | PLANNED | Months 7-12 |
| Phase 4 | AEGIS Supply Chain Monitor | PLANNED | Months 13+ |

Each phase accordion item will contain:
- **Tagline** in primary color (e.g., "Proof-of-Maintenance for All Solana Infrastructure")
- **Description paragraph**
- **"Ships" list** with checkmark bullets for delivered items
- **Phase-specific extras:** Impact metrics for Phase 1, "How it works" flow for Phase 2, Use Cases for Phase 3, "How AEGIS Leverages Phases 1-3" cascade diagram for Phase 4

Uses a new `Map` icon from lucide-react for the section header. Phase 1 will default to expanded since it's complete.

## Technical Details

### Files modified:
1. **`src/pages/Readme.tsx`** -- Rename section title, replace "Improving Your Score" with detailed "How to Improve Continuity" card, add Roadmap section with 4 accordion phases
2. **`src/components/readme/TableOfContents.tsx`** -- Update "For Protocol Builders" label to "For Solana Builders", add "Product Roadmap" entry

### No new dependencies needed.
