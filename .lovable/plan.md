

# Program Detail Page - Premium Tabbed Redesign

## Overview

Transform the current linear scroll layout into a sophisticated **tabbed interface** below the hero section. This redesign will:
1. Organize content into 5 intuitive tabs: **About**, **Development**, **Community**, **Roadmap**, **Support**
2. Apply premium Web3 visual polish across ALL sections (not just the hero)
3. Make information digestible for non-developers while retaining technical depth for builders

## Current State Analysis

The page currently displays 13+ sections in a long vertical scroll:
- Hero Banner (recently redesigned)
- Quick Stats Bar
- Description Section
- Build In Public Videos
- GitHub Metrics
- Analytics Charts + Recent Events
- Twitter Pulse
- Verified Timeline (Roadmap)
- Website Preview
- Media Gallery + Social Pulse
- Metric Cards
- Stake CTA

**Problem**: Information overload, especially for non-technical visitors who need to understand "what does this project do and is it trustworthy?"

## Proposed Tab Structure

```text
+--------+-------------+-----------+----------+---------+
| About  | Development | Community | Roadmap  | Support |
+--------+-------------+-----------+----------+---------+
```

### Tab Content Mapping

| Tab | Content | Target Audience |
|-----|---------|-----------------|
| **About** | Description, Website Preview, Media Gallery, Category | Everyone (first impression) |
| **Development** | GitHub Metrics, Analytics Charts, Recent Events, Metric Cards (Bytecode/GitHub Originality) | Developers, Technical investors |
| **Community** | Build In Public Videos, Twitter Pulse, Social Pulse, Discord/Telegram links | Community members, Supporters |
| **Roadmap** | Verified Timeline milestones, Commitment status | Investors, Long-term supporters |
| **Support** | Staking info, Metric Cards (Staked Assurance, Admin Constraints), Stake CTA | Potential stakers |

## Visual Design Upgrades

### 1. Premium Tab Bar Design
- Full-width tab bar with subtle gradient border
- Active tab: Signal teal glow + filled background
- Inactive tabs: Ghost styling with hover effects
- Mobile: Horizontal scroll with snap behavior
- Icons for each tab (BookOpen, Code, Users, Map, Zap)

### 2. Enhanced Card Styling (Global)
- Add subtle glass-morphism effect: `backdrop-blur-sm`
- Premium borders: `border-primary/10` with hover `border-primary/30`
- Micro-interactions: Scale on hover (1.01x)
- Consistent section headers with uppercase tracking

### 3. About Tab Enhancements
- Website Preview: Add browser chrome frame (URL bar, buttons)
- Media Gallery: Premium lightbox with zoom
- Rich description with typography polish

### 4. Development Tab Enhancements
- GitHub Metrics: Add animated progress bars on mount
- Activity signals: Use gauge-style visualizations
- Recent Events: Premium timeline with glow dots
- Charts: Add gradient fills, smoother animations

### 5. Community Tab Enhancements
- Twitter Pulse: Card with X brand treatment
- Build In Public: Premium video cards with play animations
- Social Links: Icon grid with brand colors

### 6. Roadmap Tab Enhancements
- Horizontal timeline visualization
- Milestone cards with status indicators
- Progress path with connecting lines
- Empty state: "Roadmap coming soon" with illustration

### 7. Support Tab Enhancements
- Large Stake CTA card with animated gradient
- Trust metrics (Staked Assurance, Admin Constraints)
- Benefits breakdown (APY, lock periods)
- "Why Stake?" explainer section

## Component Architecture

### New Components to Create

1. **`ProgramTabs.tsx`** - Main tab container
   - Uses Radix UI Tabs
   - Handles tab state and URL sync
   - Responsive tab list

2. **`AboutTabContent.tsx`** - About tab wrapper
   - Description, Website Preview, Media Gallery

3. **`DevelopmentTabContent.tsx`** - Development tab wrapper
   - GitHub Metrics, Analytics, Events, Originality cards

4. **`CommunityTabContent.tsx`** - Community tab wrapper
   - Twitter Pulse, Build In Public, Social Links

5. **`RoadmapTabContent.tsx`** - Roadmap tab wrapper
   - Timeline visualization, Milestones

6. **`SupportTabContent.tsx`** - Support tab wrapper
   - Stake CTA, Trust metrics, Benefits

### Enhanced Existing Components

- **All Card components**: Add premium styling utilities
- **MetricCards**: Split into originality metrics vs. trust metrics
- **AnalyticsCharts**: Enhanced chart styling
- **RecentEvents**: Premium timeline with glow effects

## Technical Implementation

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ProgramDetail.tsx` | **Modify** | Replace linear layout with tabbed structure |
| `src/components/program/ProgramTabs.tsx` | **Create** | Main tab container with 5 tabs |
| `src/components/program/tabs/AboutTabContent.tsx` | **Create** | About tab content |
| `src/components/program/tabs/DevelopmentTabContent.tsx` | **Create** | Development tab content |
| `src/components/program/tabs/CommunityTabContent.tsx` | **Create** | Community tab content |
| `src/components/program/tabs/RoadmapTabContent.tsx` | **Create** | Roadmap tab content |
| `src/components/program/tabs/SupportTabContent.tsx` | **Create** | Support tab content |
| `src/components/program/index.ts` | **Modify** | Export new components |
| `src/index.css` | **Modify** | Add premium utility classes |

### URL State Sync
- Default tab: `about`
- URL parameter: `?tab=development`
- Preserves tab selection on refresh

### Mobile Optimization
- Tab bar: Horizontal scroll with snap
- Content: Single column, no side-by-side grids
- Touch targets: 44px minimum
- Sticky tab bar option for long content

## Section-by-Section Premium Polish

### Global CSS Utilities to Add

```css
/* Premium card hover effect */
.card-premium {
  @apply transition-all duration-200;
  @apply hover:border-primary/30 hover:shadow-[0_0_30px_rgba(0,194,182,0.1)];
}

/* Glass effect for overlays */
.glass {
  @apply bg-background/80 backdrop-blur-sm;
}

/* Animated gradient backgrounds */
.gradient-animated {
  background: linear-gradient(
    135deg,
    hsl(var(--background)) 0%,
    hsl(var(--card)) 50%,
    hsl(var(--background)) 100%
  );
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

/* Section glow for important content */
.section-glow {
  box-shadow: inset 0 1px 0 hsl(var(--primary) / 0.1);
}
```

### About Tab Details
- Description: Full rich text with prose styling
- Website Preview: Browser chrome frame with "Launch" button
- Media Gallery: 3-column grid on desktop, carousel on mobile
- Category badge: Prominent display

### Development Tab Details
- GitHub Health Badge: Large status indicator
- Metrics Grid: 6 metrics with icons
- Velocity: Animated gauge visualization
- Contributors: Avatar stack with hover cards
- Activity Signals: Stacked bars with tooltips
- Recent Events: Timeline with glow dots and avatars

### Community Tab Details
- Twitter Stats: Large follower count, engagement rate
- Recent Tweets: Card grid with engagement icons
- Build In Public: Video carousel with play overlays
- Social Grid: 2x3 grid of social platform links

### Roadmap Tab Details
- Timeline: Horizontal on desktop, vertical on mobile
- Milestone Cards: Status colors (green/amber/gray)
- Progress Line: Animated connecting line
- Lock Icons: For immutable milestones
- Empty State: Illustration + "Coming soon"

### Support Tab Details
- Hero Card: "Support This Project" with gradient
- Stake Calculator: Amount input with impact preview
- Trust Metrics: Staked Assurance, Admin Constraints
- Benefits Grid: Lock periods, APY estimates
- FAQ Accordion: Common staking questions

## Information Hierarchy (Non-Technical Focus)

### For Public Visitors (About tab first)
1. What does this project do? (Description)
2. Can I see it in action? (Website Preview)
3. What does it look like? (Media Gallery)

### For Technical Visitors (Development tab)
1. Is it actively maintained? (GitHub metrics)
2. Who builds it? (Contributors)
3. Is the code original? (Originality metrics)

### For Community (Community tab)
1. Is the team transparent? (Build In Public)
2. Are they active on social? (Twitter Pulse)
3. Where can I connect? (Social links)

### For Investors (Roadmap tab)
1. What's planned? (Milestones)
2. Are they on track? (Status indicators)
3. Have they delivered? (Completed items)

### For Supporters (Support tab)
1. How can I help? (Stake CTA)
2. What are the benefits? (Rewards info)
3. Is it secure? (Trust metrics)

## Implementation Order

1. **Phase 1**: Create tab structure + About tab
2. **Phase 2**: Development tab with existing components
3. **Phase 3**: Community tab with Twitter/Build In Public
4. **Phase 4**: Roadmap tab with timeline
5. **Phase 5**: Support tab with stake CTA
6. **Phase 6**: Polish all sections with premium CSS

## Preserved Functionality

All existing functionality will be preserved:
- Data fetching logic (untouched)
- Website iframe sandbox configuration
- GitHub analytics parsing
- Score history charts
- Milestone lock/variance logic
- Sticky CTA for mobile
- All external links and social integrations

