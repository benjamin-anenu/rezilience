

# Sync Profile Detail (My Registry) with Public Program Detail

## Problem
The owner's "My Registry" page (`/profile/:id`) is missing several features that exist on the public program detail page (`/program/:id`). The two views have drifted apart as new features were added to the public page.

## Gaps Identified

### 1. Owner's Development Tab -- Missing Health Cards
The owner view uses a custom `DevelopmentTab` component that lacks:
- **Dependency Health Card** (outdated/critical crate counts)
- **Governance Health Card** (DAO/multisig transaction monitoring)
- **TVL Metrics Card** (economic impact for DeFi protocols)
- **Vulnerability & Security Card** (OSV.dev + OpenSSF data)
- Confidence badges, deploy slot info, and "last verified" timestamps on originality metrics

### 2. Visitor View Development Tab -- Missing Props
The visitor (non-owner) view inside ProfileDetail passes far fewer props to `DevelopmentTabContent` than the public ProgramDetail page:
- Missing: `bytecodeMatchStatus`, `bytecodeVerifiedAt`, `bytecodeConfidence`, `bytecodeDeploySlot`
- Missing: `vulnerabilityCount`, `vulnerabilityDetails`, `vulnerabilityAnalyzedAt`
- Missing: `openssfScore`, `openssfChecks`, `openssfAnalyzedAt`
- Missing: `claimStatus` on Team, Community, and Roadmap tabs

### 3. Owner View -- Missing Support Tab
The owner's "Support" tab currently renders the `SettingsTab` (edit website/socials). The public page shows a proper `SupportTabContent` with staking info and FAQ. The owner should see both: the public support content plus their settings controls.

### 4. Missing Sticky CTA
The profile page (both owner and visitor views) does not render the `StickyCTA` component that exists on the public program page.

## Implementation Plan

### File: `src/pages/ProfileDetail.tsx`

**A. Add missing imports:**
- Import `StickyCTA`, `SupportTabContent`, and `UnclaimedBanner` from `@/components/program`

**B. Owner View -- Replace custom DevelopmentTab with full DevelopmentTabContent:**
- Switch from the stripped-down `DevelopmentTab` to `DevelopmentTabContent` (the same component the public page uses), passing all dimension props from the profile data
- Keep the owner-specific verification actions by passing the existing verification props (bytecodeMatchStatus, bytecodeVerifiedAt, etc.)

**C. Owner View -- Add health card props to Development tab:**
- Pass all missing props: dependency metrics, governance metrics, TVL metrics, vulnerability data, and OpenSSF data

**D. Owner View -- Support tab combines public content + settings:**
- Render `SupportTabContent` (staking info, FAQ) above the existing `SettingsTab` (edit socials/website)

**E. Visitor View -- Pass all missing props:**
- Add bytecode verification props (matchStatus, verifiedAt, confidence, deploySlot)
- Add vulnerability props (count, details, analyzedAt)
- Add OpenSSF props (score, checks, analyzedAt)
- Add `claimStatus` to Team, Community, and Roadmap tabs
- Replace the placeholder "Support options coming soon" with the actual `SupportTabContent`

**F. Add StickyCTA to both views:**
- Render `<StickyCTA>` at the bottom of the page layout for both owner and visitor views

### File: `src/components/profile/tabs/DevelopmentTab.tsx`
- No changes needed -- this file will no longer be used by ProfileDetail (replaced by DevelopmentTabContent). It can remain for potential future use or be removed in a cleanup pass.

## Summary of Changes
- **1 file edited**: `src/pages/ProfileDetail.tsx`
- Owner Development tab upgraded from 3 sections to 7 sections (adds 4 health cards)
- Visitor Development tab upgraded with 11 missing props
- Support tab upgraded from placeholder to full staking/FAQ content
- Sticky mobile CTA added to both views

