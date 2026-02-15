

# Terms of Service and Privacy Policy Page for Rezilience

## Overview
Create a branded, developer-friendly Terms of Service and Privacy Policy page at `/terms` that reinforces Rezilience's identity as open-source public good infrastructure for Solana. The document will be written in plain language with a transparent, builder-first tone -- not corporate legalese. A link to this page will be added to the footer on all pages.

## What Gets Built

### 1. New Page: `/terms` (`src/pages/Terms.tsx`)
A single-page legal document with two major sections (Terms of Service + Privacy Policy), wrapped in the standard `<Layout>` component. Uses the existing brand system:
- Space Grotesk uppercase section headers
- JetBrains Mono for defined terms and data labels
- Collapsible/Accordion sections for easy navigation
- Table of Contents sidebar (sticky, matching README page pattern)
- "Open Source Public Good" badge prominently displayed at the top

### 2. Document Content Structure

**TERMS OF SERVICE**
- Preamble: "Rezilience is open-source public good infrastructure for the Solana ecosystem. This codebase is freely forkable under [MIT/Apache 2.0]. We do not sell data. We do not gate public information."
- Acceptance of Terms
- Nature of the Service (public registry, scoring methodology, transparency layer)
- Open Source License & Forkability
- User Accounts (X OAuth -- what we store, what we don't)
- Wallet Connections (read-only, no custody, no private keys)
- Registry Participation (voluntary claim process, data accuracy responsibility)
- Intellectual Property (user-submitted content remains theirs)
- Disclaimers (scores are informational, not financial advice)
- Limitation of Liability
- Governing Law
- Changes to Terms

**PRIVACY POLICY**
- Data We Collect (exhaustive, transparent list):
  - **X (Twitter) Authentication**: User ID, username, display name, avatar URL (via OAuth -- no passwords stored)
  - **Wallet Addresses**: Public keys only (read-only, never private keys)
  - **GitHub Data**: Public repository metrics (stars, forks, contributors, commit history, languages, topics) -- all publicly available data
  - **Project Registry Data**: Project name, description, category, country, website URL, logo, program ID, media assets, roadmap milestones, team members
  - **On-Chain Data**: Program authority verification signatures, bytecode hashes, governance transaction counts, TVL metrics -- all from public blockchain data
  - **Analytics**: Anonymous session IDs (UUID, no PII), page views, click events, device type, geo-location (country/city level via IP -- IP itself is not stored)
  - **Build In Public**: Tweet URLs and embedded content (public tweets only)
- Data We Do NOT Collect: passwords, private keys, email addresses, phone numbers, financial account information, browsing history outside the platform
- How We Use Data: scoring, public transparency, ecosystem health monitoring
- Data Sharing: We do not sell data. Period. All registry data is designed to be public.
- Data Retention & Deletion: Users can delete their profile via Dashboard (existing `useDeleteProfile` hook)
- Third-Party Services: GitHub API, X/Twitter API, Solana RPC (Helius), Algolia (search indexing)
- Cookies & Local Storage: Session IDs, form progress persistence, auth tokens -- all functional, no advertising trackers
- Open Data Philosophy: Registry data is public by design. Scores are published for ecosystem transparency.
- Contact

### 3. Footer Update (`src/components/layout/Footer.tsx`)
Add a "Terms & Privacy" link in the footer links section, using a `Scale` (or `FileText`) icon, positioned alongside README, GitHub, and Twitter links.

### 4. Route Registration (`src/App.tsx`)
Add `<Route path="/terms" element={<Terms />} />` to the router.

## Technical Details

### File Changes
1. **New**: `src/pages/Terms.tsx` -- Full legal page with branded layout, accordion sections, and sticky table of contents
2. **Edit**: `src/components/layout/Footer.tsx` -- Add Terms & Privacy link to footer nav
3. **Edit**: `src/App.tsx` -- Register `/terms` route

### Component Reuse
- `Layout` wrapper (Navigation + Footer)
- `Accordion` / `AccordionItem` for collapsible sections
- `Badge` for "Open Source" and "Public Good" labels
- `Separator` between major sections
- Brand typography classes (`font-display`, `font-mono`, `font-body`)

### Design Approach
- Matches the README page aesthetic (institutional, high-density, terminal-inspired)
- "Last Updated" timestamp displayed prominently
- Each section is linkable via anchor IDs for easy reference
- Mobile-responsive with proper text scaling

