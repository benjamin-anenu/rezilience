

# Solana Grants Directory Page

## Overview

Replace the external GRANTS link with an internal `/grants` page that serves as a curated directory of Solana ecosystem grant programs. The page is static content (no database), designed as a public good resource.

## What Gets Built

### 1. New Page: `src/pages/Grants.tsx`
A single-page directory with these sections:

**Header Section**
- Title: "Solana Grants Directory"
- Subtitle explaining this is a curated list of funding opportunities in the Solana ecosystem
- Disclaimer banner: "This directory is maintained as a public good by Resilience. Information may change -- always verify directly with grant providers before applying."
- Transparency note: "Resilience is also an active grant applicant within the Solana ecosystem."

**Grant Cards Grid**
Each grant program displayed as a card with:
- Grant name and provider logo/icon
- Funding range (e.g., "$5K - $100K")
- Status badge (Open / Rolling / Seasonal)
- Focus areas as tags (Infrastructure, DeFi, Public Goods, Developer Tooling, etc.)
- Eligibility summary (who can apply)
- Brief description of what the grant funds
- "Apply" button linking to the official application page
- "Learn More" link to official criteria page

**Programs to include (based on current Solana ecosystem):**
1. Solana Foundation Grants (general)
2. Solana Foundation RFPs (specific bounties)
3. Superteam Grants (regional)
4. Colosseum Accelerator / Hackathons
5. Marinade Finance Grants
6. Jupiter Ecosystem Grants
7. Dialect / xNFT Grants (if active)
8. Ecosystem-specific programs as available

**Criteria Guidance Section**
An accordion-style section titled "What Grant Providers Look For" with general advice:
- Open source commitment
- Clear problem statement and target users
- Team credibility and track record
- Technical feasibility
- Ecosystem alignment
- Milestone-based delivery plans

**Bottom CTA**
- "Know a grant program we're missing? Let us know" with a link to X/Twitter or contact

### 2. Update Navigation
**`src/components/layout/Navigation.tsx`**
- Change the GRANTS entry from `external: true` with `href: 'https://grants.resilience.dev'` to `external: false` with `href: '/grants'`

### 3. Update Router
**`src/App.tsx`**
- Add route: `<Route path="/grants" element={<Grants />} />`
- Import the new Grants page

### 4. Grant Data File
**`src/data/solana-grants.ts`**
- Static array of grant objects with fields: `name`, `provider`, `fundingRange`, `status`, `focusAreas`, `eligibility`, `description`, `applyUrl`, `learnMoreUrl`
- Easy to update manually when grants change
- No database needed -- this is curated editorial content

## Technical Details

- Uses existing `Layout`, `Card`, `Badge`, `Accordion`, `Button` components
- No new dependencies required
- No database tables or edge functions needed
- Follows the existing page patterns (similar structure to Readme page)
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Design follows the existing "Institutional Bloomberg Terminal" aesthetic

## What Is Explicitly Out of Scope
- No application tracking or submission forms
- No user accounts or saved grants
- No automated data fetching from grant provider APIs
- No grant matching algorithm
- No comments or reviews system

## Content Maintenance Strategy
The grant data lives in a single TypeScript file (`src/data/solana-grants.ts`). When grants change, only that file needs updating. A `lastUpdated` timestamp is displayed on the page so users know how current the information is.
