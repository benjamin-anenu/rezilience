
# Add "Unclaimed" Branding with Claim CTA to Program Detail Tabs

## Overview
When a visitor views an unclaimed project's detail page, the Team, Community, Roadmap, and Support tabs should each display a graceful "UNCLAIMED" overlay/banner with a contextual reason explaining why the builder should claim this project, along with a prominent "Claim This Project" button.

## Approach
Create a reusable `UnclaimedBanner` component that accepts a tab-specific reason, then integrate it into each of the four tabs. The banner will appear at the top of each tab when the project is unclaimed, pushing existing content (empty states) below or replacing them.

## Changes

### 1. New Component: `src/components/program/UnclaimedBanner.tsx`
A reusable card component with:
- A shield/lock icon conveying "unclaimed" status
- "UNCLAIMED PROJECT" heading in the existing font-display uppercase style
- A tab-specific reason paragraph explaining the value of claiming
- A prominent "Claim This Project" CTA button linking to `/claim-profile`
- Styled consistently with the existing card-premium design system (gradient borders, subtle glows)

### 2. Pass `claimStatus` to the four tabs
**File: `src/pages/ProgramDetail.tsx`**
- Derive `claimStatus` from `claimedProfile?.claim_status` (defaulting to `'claimed'` if not set)
- Pass `claimStatus` as a prop to `TeamTabContent`, `CommunityTabContent`, `RoadmapTabContent`, and `SupportTabContent`

### 3. Update `TeamTabContent`
**File: `src/components/program/tabs/TeamTabContent.tsx`**
- Accept `claimStatus` prop
- When `claimStatus === 'unclaimed'`, render the `UnclaimedBanner` with reason: *"Claim this project to showcase your team, build trust with the community, and let stakers know who is behind the code."*
- Show the banner above the empty state (replacing the generic "Team Coming Soon" message)

### 4. Update `CommunityTabContent`
**File: `src/components/program/tabs/CommunityTabContent.tsx`**
- Accept `claimStatus` prop
- When `claimStatus === 'unclaimed'`, render the `UnclaimedBanner` with reason: *"Claim this project to connect your social channels, share build-in-public content, and grow your community presence."*
- Show the banner instead of/above the empty social links state

### 5. Update `RoadmapTabContent`
**File: `src/components/program/tabs/RoadmapTabContent.tsx`**
- Accept `claimStatus` prop
- When `claimStatus === 'unclaimed'`, render the `UnclaimedBanner` with reason: *"Claim this project to publish your roadmap, set delivery commitments, and demonstrate long-term vision to stakers and users."*
- Replace the generic "Roadmap Coming Soon" empty state

### 6. Update `SupportTabContent`
**File: `src/components/program/tabs/SupportTabContent.tsx`**
- Accept `claimStatus` prop
- When `claimStatus === 'unclaimed'`, render the `UnclaimedBanner` with reason: *"Claim this project to unlock staking, build economic security, and let supporters back your protocol with confidence."*
- Show the banner prominently above the staking CTA

### UnclaimedBanner Design
- Uses `Card` with `border-amber-500/20` gradient styling (amber = unclaimed color, consistent with explorer badges)
- Shield icon in an amber-tinted circle
- "UNCLAIMED PROJECT" title in `font-display uppercase tracking-wider`
- Contextual reason text in `text-muted-foreground`
- "Claim This Project" button linking to `/claim-profile` with `ShieldCheck` icon
- Optional secondary text: "Verify your authority to unlock this tab"

## Files Modified
1. `src/components/program/UnclaimedBanner.tsx` (new)
2. `src/pages/ProgramDetail.tsx` (pass claimStatus prop)
3. `src/components/program/tabs/TeamTabContent.tsx` (add banner)
4. `src/components/program/tabs/CommunityTabContent.tsx` (add banner)
5. `src/components/program/tabs/RoadmapTabContent.tsx` (add banner)
6. `src/components/program/tabs/SupportTabContent.tsx` (add banner)
7. `src/components/program/index.ts` (export new component)
