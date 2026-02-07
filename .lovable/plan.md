

# Program Detail Page Redesign - Premium Web3 Experience

## 1. Baseline Understanding - Current Implementation

### What Exists Today (Working & Must Remain)

| Component | Location | Function | Status |
|-----------|----------|----------|--------|
| `ProgramHeader` | Header zone | Logo, name, score, rank, social icons | WORKING - preserve functionality |
| `DescriptionSection` | Below header | About text with Read More drawer | WORKING - preserve |
| `PublicGitHubMetrics` | Metrics bar | Stars, forks, contributors, velocity | WORKING - preserve all data |
| `AnalyticsCharts` | Left 2/3 | Tabbed Score/Contributors/Activity | WORKING - preserve |
| `RecentEvents` | Right 1/3 | Unified timeline of events | WORKING - preserve |
| `MetricCards` | Grid row | Bytecode/GitHub/Staked/Admin | WORKING - preserve |
| `Verified Timeline` | Milestones | Roadmap cards | WORKING - preserve |
| `Website Preview` | Full-width iframe | 16:10 sandboxed preview | WORKING - MUST preserve |
| `Media Gallery` | Carousel | Images/YouTube/videos | WORKING - preserve |
| `SocialPulseSection` | Social links | Clickable social icons | WORKING - preserve |
| `Stake CTA` | Footer | Primary action to stake | WORKING - preserve |

### Fragile/Tightly Coupled Areas - DO NOT ALTER

1. **Data fetching logic** in `ProgramDetail.tsx` (lines 23-45) - complex dual-source resolution
2. **ClaimedProfile transformation** in `useClaimedProfiles.ts` - critical type mapping
3. **Website iframe sandbox** - security configuration must remain `allow-scripts allow-same-origin`
4. **GitHub analytics JSONB parsing** - complex nested object handling

### Current Section Hierarchy (12 Steps)

```text
1. Back to Explorer link
2. Verification Banner (conditional)
3. Program Header (logo, score, socials)
4. Description Section (About with drawer)
5. Public GitHub Metrics Bar
6. Analytics Charts + Recent Events (2/3 + 1/3 grid)
7. Metric Cards (4-column grid)
8. Verified Timeline (milestones)
9. Website Preview (full-width iframe)
10. Media Gallery & Social Pulse (2-column grid)
11. Stake CTA (footer)
```

---

## 2. Use Cases

### Must-Have (Core)

| Use Case | User | Current Support | Enhancement Needed |
|----------|------|-----------------|-------------------|
| Understand project at a glance | Public visitor | Partial | Hero section with key value prop |
| Verify project authenticity | Investor | Yes (verification badge) | Make more prominent |
| See development momentum | Developer | Yes (GitHub metrics) | Visual hierarchy improvement |
| View project roadmap | All users | Yes (milestones) | Timeline visualization |
| Watch builder updates | Community | NO | **NEW: Build In Public section** |
| See Twitter engagement | Community | NO | **NEW: Twitter Pulse section** |
| Preview the product | Public | Yes (website iframe) | Preserve as-is |
| Support the project | Staker | Yes (Stake CTA) | Make sticky/prominent |

### Nice-to-Have Enhancements

- Animated hero background with subtle Web3 patterns
- Interactive score breakdown visualization
- Live Twitter feed embed (beyond videos)
- Community sentiment indicators
- Project comparison feature

### Out-of-Scope (Parked)

- On-chain transaction history visualization
- Token price integration
- Discord member count API
- Automated project scoring AI narrative

---

## 3. Edge Cases & Stress Scenarios

### User Behavior

| Scenario | Current Behavior | Ideal Behavior |
|----------|------------------|----------------|
| First-time visitor, no context | Sees data-heavy page | Should see clear value proposition first |
| User abandons mid-scroll | No engagement tracking | Progressive disclosure to hook attention |
| Mobile user with slow connection | Heavy iframe loads everything | Lazy-load website preview |
| Visitor clicks Twitter video that 404s | Broken embed | Graceful fallback with "Video unavailable" |

### Data States

| Scenario | Current Behavior | Ideal Behavior |
|----------|------------------|----------------|
| No GitHub connected | Shows "No GitHub data" | Clear CTA for builder to connect |
| No milestones set | Empty section hidden | Show "Roadmap coming soon" placeholder |
| No Twitter videos | Section doesn't exist | Hide Build In Public section gracefully |
| Stale GitHub data (>7 days) | Shows with timestamp | Visual indicator of staleness |
| Zero resilience score | Shows "0" | Show "Not yet scored" with explanation |

### System Conditions

| Scenario | Current | Ideal |
|----------|---------|-------|
| GitHub API rate limited | Edge function fails silently | Show cached data with "last updated" notice |
| Website iframe blocked by CSP | Shows nothing or error | Show screenshot fallback with "Launch Site" CTA |
| Twitter embed fails to load | Broken iframe | oEmbed fallback or static preview card |

---

## 4. Touchpoints & System Interactions

### Components Affected by Redesign

```text
src/pages/ProgramDetail.tsx          - Main orchestrator (restructure layout only)
src/components/program/ProgramHeader.tsx - Visual refresh, add hero treatment
src/components/program/DescriptionSection.tsx - Minor styling updates
src/components/program/PublicGitHubMetrics.tsx - Keep data, improve visuals
src/components/program/AnalyticsCharts.tsx - Keep data, improve container
src/components/program/RecentEvents.tsx - Keep data, improve card styling
src/components/program/MetricCards.tsx - Visual refinement
src/components/program/SocialPulseSection.tsx - Move higher, add Twitter integration
```

### New Components Required

```text
src/components/program/HeroBanner.tsx         - NEW: Premium hero with gradient
src/components/program/BuildInPublicSection.tsx - NEW: Twitter video gallery
src/components/program/TwitterPulseSection.tsx  - NEW: Twitter engagement metrics
src/components/program/QuickStats.tsx          - NEW: Key metrics bar
```

### Database Schema Impact

New columns needed in `claimed_profiles`:

```sql
-- Build In Public videos (Twitter video URLs)
build_in_public_videos JSONB DEFAULT '[]'::jsonb,

-- Twitter engagement metrics (populated by edge function)
twitter_followers INTEGER DEFAULT 0,
twitter_following INTEGER DEFAULT 0,
twitter_recent_tweets JSONB DEFAULT '[]'::jsonb,
twitter_engagement_rate NUMERIC DEFAULT 0,
twitter_last_synced TIMESTAMP WITH TIME ZONE
```

### Edge Function Required

New `fetch-twitter-profile` function to:
1. Fetch user profile metrics (followers, following)
2. Fetch recent tweets with engagement (likes, retweets, replies)
3. Extract video URLs from tweets for Build In Public gallery

---

## 5. User Experience & Perception

### First-Time Visitor Journey

**Current State:**
- Lands on page -> sees data-heavy header -> overwhelmed by metrics

**Proposed State:**
1. Hero banner with project name, tagline, verification badge, and ONE key metric (Resilience Score)
2. Quick stats bar (4-5 key numbers in digestible format)
3. Progressive disclosure: About -> Development -> Community -> Roadmap -> Support

### Moments of Concern

| Moment | Issue | Solution |
|--------|-------|----------|
| Hero section | Score without context | Add "What is Resilience Score?" tooltip |
| GitHub metrics | Too technical for non-devs | Add layman descriptions on hover |
| Recent events | GitHub jargon (PushEvent) | Use friendly labels: "Code Update" |
| Build In Public | Empty if no videos | Show "No updates yet - check back soon" |
| Stake CTA | Hidden at bottom | Add sticky CTA or floating action button |

### Power User Needs

- Quick keyboard shortcuts (press `G` to go to GitHub)
- Copy all data as JSON for analysis
- Deep links to specific sections (`/program/xyz#roadmap`)
- Full-screen mode for website preview

---

## 6. Benefits & Trade-offs

### User Benefits

| Benefit | Impact |
|---------|--------|
| Clear project narrative | Faster decision-making for investors |
| Build In Public visibility | Builds trust through transparency |
| Twitter integration | Social proof and community engagement |
| Premium aesthetic | Positions platform as institutional-grade |
| Mobile-optimized design | Expands audience reach |

### Business Benefits

| Benefit | Impact |
|---------|--------|
| Differentiation from competitors | No other registry has Build In Public showcase |
| Increased user engagement | More time on page = more staking conversions |
| Builder retention | Incentive to keep profile updated for visibility |
| SEO improvement | Rich content = better search ranking |

### Technical Benefits

| Benefit | Impact |
|---------|--------|
| Component modularization | Easier maintenance and testing |
| Lazy loading | Faster initial page load |
| Progressive enhancement | Works without JavaScript for SEO |

### Trade-offs & Risks

| Trade-off | Mitigation |
|-----------|------------|
| Twitter API rate limits | Cache aggressively (1-hour TTL), graceful degradation |
| Increased complexity | Feature flags for new sections, phased rollout |
| More database columns | Migration-safe additive changes only |
| Performance with video embeds | Lazy-load videos, intersection observer |
| Twitter API costs | Use free tier endpoints only, no premium features |

---

## 7. Scalability & Future-Proofing

### Scaling Considerations

| Dimension | Current Limit | Future State |
|-----------|---------------|--------------|
| Concurrent viewers | ~1000 (iframe heavy) | Lazy-load reduces to ~5000 |
| Build In Public videos | 10 per profile | Paginated infinite scroll |
| Twitter API calls | 500/month free tier | Batch processing with cron job |
| Score history data points | 365 per project | Aggregated monthly after 1 year |

### Extension Paths (Additive, Non-Destructive)

1. **Phase 1 (Now):** Visual refresh + new layout + empty states
2. **Phase 2:** Build In Public video gallery (Twitter video URLs stored in JSONB)
3. **Phase 3:** Twitter engagement metrics (new edge function)
4. **Phase 4:** Community sentiment analysis (future AI feature)

### Feature Flags Recommended

```typescript
const FEATURE_FLAGS = {
  BUILD_IN_PUBLIC_ENABLED: true,
  TWITTER_PULSE_ENABLED: false, // Enable after edge function deployed
  STICKY_STAKE_CTA: true,
  HERO_ANIMATION: true,
};
```

---

## 8. Safe Evolution Strategy

### Non-Breaking Changes (Immediate)

1. **CSS-only visual refresh** - Update card styling, add gradients, refine typography
2. **Layout restructuring** - Reorder sections in `ProgramDetail.tsx` without changing component APIs
3. **New optional sections** - Add `BuildInPublicSection` with graceful empty state

### Backward-Compatible Interfaces

```typescript
// Old prop interface (preserved)
interface ProgramHeaderProps {
  program: Program;
  websiteUrl?: string;
  xUsername?: string;
  // ...existing props
}

// Extended with optional new props
interface ProgramHeaderProps {
  program: Program;
  websiteUrl?: string;
  xUsername?: string;
  // NEW optional props - defaults preserve old behavior
  showHeroMode?: boolean;
  heroTagline?: string;
}
```

### What NOT to Change

1. `useClaimedProfile` hook signature and return type
2. `useScoreHistory` data structure
3. Website iframe sandbox configuration
4. GitHub analytics JSONB structure
5. Existing database column names

---

## 9. Risk & Regression Guardrails

### High-Risk Areas

| Area | Risk | Guardrail |
|------|------|-----------|
| Data fetching logic | Breaking profile resolution | Add integration test for all ID types |
| Website iframe | Security vulnerability | Keep sandbox attributes unchanged |
| Mobile layout | Breaking existing responsive design | Test on 5 device sizes before merge |
| Twitter API | Rate limiting | Implement circuit breaker pattern |

### Tests to Add

```typescript
// Unit tests
- ProgramDetail renders with project-only data
- ProgramDetail renders with claimed-profile-only data
- ProgramDetail renders with both data sources
- BuildInPublicSection handles empty video array
- TwitterPulseSection handles null engagement data

// Integration tests
- Full page render under 2 seconds
- Website iframe loads without console errors
- Mobile layout has no horizontal scroll
```

### Monitoring Signals

- Page load time (P95 target: <3s)
- Iframe load success rate (target: >95%)
- Twitter API error rate (alert if >10%)
- User scroll depth (engagement metric)

### Rollback Strategy

1. Feature flags for all new sections
2. CSS changes in separate stylesheet for easy revert
3. Database columns are additive only (no migrations to revert)
4. Deploy canary to 10% before full rollout

---

## 10. Decision Summary

### Proceed Now (Phase 1)

| Change | Type | Risk |
|--------|------|------|
| Hero banner visual treatment | CSS + new component | Low |
| Reorder sections for better flow | Layout change | Low |
| Add Quick Stats bar | New component | Low |
| Improve card styling (Web3 aesthetic) | CSS only | Very Low |
| Add empty states for missing data | UX improvement | Low |
| Sticky Stake CTA on mobile | CSS + positioning | Low |

### Defer (Phase 2 - Requires DB Migration)

| Change | Dependency | Reason |
|--------|------------|--------|
| Build In Public video gallery | `build_in_public_videos` column | Requires schema change |
| Twitter engagement display | `twitter_*` columns + edge function | Requires API integration |
| Live Twitter feed embed | X API v2 oEmbed | Rate limit concerns |

### Avoid Entirely

| Change | Reason |
|--------|--------|
| Changing data fetching hooks | Too tightly coupled, high regression risk |
| Modifying website iframe sandbox | Security implications |
| Removing existing metric cards | Would break user expectations |
| Auto-playing video content | Poor UX, accessibility concerns |

---

## Proposed New Section Hierarchy

```text
1.  Back to Explorer (navigation)
2.  HERO BANNER [NEW] - Large, immersive with project name, tagline, score, verification
3.  QUICK STATS BAR [NEW] - 5 key metrics in horizontal bar (GitHub stars, forks, contributors, commits, releases)
4.  Description Section (About with "Learn More" drawer)
5.  BUILD IN PUBLIC [NEW] - Twitter video carousel (when videos exist)
6.  Public GitHub Metrics (development health)
7.  Analytics Charts + Recent Events (2/3 + 1/3)
8.  TWITTER PULSE [NEW] - Recent tweets, engagement, followers (Phase 2)
9.  Verified Timeline (roadmap milestones)
10. Website Preview (full-width iframe - PRESERVED)
11. Media Gallery + Social Pulse (side by side)
12. Metric Cards (trust signals)
13. STICKY STAKE CTA [NEW] - Fixed bottom bar on mobile

```

---

## Technical Implementation Outline

### New Components

**1. HeroBanner.tsx**
- Full-width gradient background with subtle Web3 pattern
- Large project name + optional tagline
- Resilience Score prominently displayed with animated ring
- Verification badge with glow effect
- Social icons row

**2. QuickStats.tsx**
- Horizontal scrollable bar on mobile
- 5 stat pills: Stars, Forks, Contributors, 30d Commits, Score
- Monospace numbers, animated count-up on load

**3. BuildInPublicSection.tsx**
- Horizontal carousel of Twitter video embeds
- Source: `claimed_profiles.build_in_public_videos` JSONB array
- Empty state: "No updates yet - follow @handle for the latest"
- Each card shows: Video embed + tweet text + engagement metrics

**4. TwitterPulseSection.tsx (Phase 2)**
- Follower count + following
- Recent tweets grid (3 most recent)
- Engagement rate badge
- "Follow on X" CTA

### Database Migration (Phase 2)

```sql
ALTER TABLE claimed_profiles
ADD COLUMN IF NOT EXISTS build_in_public_videos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS twitter_followers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_engagement_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_recent_tweets JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS twitter_last_synced TIMESTAMP WITH TIME ZONE;
```

### Visual Design Tokens

- Hero gradient: `linear-gradient(135deg, #0F1216 0%, #1a2a35 50%, #0F1216 100%)`
- Glow accent: `box-shadow: 0 0 40px rgba(0, 194, 182, 0.15)`
- Card borders: `border: 1px solid rgba(0, 194, 182, 0.1)`
- Section dividers: Subtle 1px lines with 50% opacity

