
# Implementation Plan: README / Public Guide Page

## Executive Summary

Transform the "DOCS" nav link into an internal "README" page that serves as a comprehensive public guide explaining the Resilience platform's purpose, scoring methodology, all visual indicators, and user flows. This will be an in-app documentation page following the Bloomberg Terminal aesthetic.

---

## Strategic Approach

### Why In-App vs External Docs?
- **Immediate accessibility** - No context-switching for users
- **Brand consistency** - Same visual language (Bloomberg Terminal)
- **Real examples** - Can reference actual UI elements with exact colors/icons
- **SEO value** - Content lives on the main domain
- **Lower maintenance** - Single source of truth

### Target Audience
1. **New visitors** - "What is this platform?"
2. **Protocol builders** - "How do I improve my score?"
3. **Investors/Researchers** - "How can I trust these metrics?"
4. **Developers** - "What data sources power this?"

---

## Technical Implementation

### 1. Navigation Change

**File: `src/components/layout/Navigation.tsx`**

Update the `navLinks` array:
```typescript
// FROM:
{ href: 'https://docs.resilience.dev', label: 'DOCS', external: true },

// TO:
{ href: '/readme', label: 'README', external: false },
```

### 2. New Page Component

**File: `src/pages/Readme.tsx`** (NEW)

Create a comprehensive documentation page with the following sections:

```text
Structure:
├── Hero Section (What is Resilience?)
├── Quick Navigation (Sticky TOC)
├── Core Concepts
│   ├── What is the Resilience Score?
│   ├── Zero Proof Philosophy
│   └── Four Dimensions of Trust
├── Scoring Methodology
│   ├── Integrated Score Formula
│   ├── GitHub Activity (40%)
│   ├── Dependency Health (25%)
│   ├── Governance (20%)
│   └── TVL/Economic Health (15%)
├── Visual Indicator Reference
│   ├── Score Colors (70+ Healthy, 40-69 Stale, <40 Decaying)
│   ├── Health Dots (D/G/T indicators)
│   ├── Liveness Badges (ACTIVE, STALE, DECAYING)
│   ├── Status Icons (CheckCircle, AlertTriangle, XCircle)
│   └── Tier Labels (TITAN, ELITE, SOLID, MODERATE, AT RISK, CRITICAL)
├── Platform Features
│   ├── Explorer Registry
│   ├── Titan Watch Heatmap
│   ├── Profile Dashboard
│   ├── Build In Public Gallery
│   └── Staking (Coming Soon)
├── For Protocol Builders
│   ├── How to Join the Registry
│   ├── Verification Process
│   ├── Improving Your Score
│   └── Managing Your Profile
├── Data Provenance
│   ├── GitHub API Integration
│   ├── Crates.io Dependencies
│   ├── DeFiLlama TVL
│   ├── Solana RPC Governance
│   └── Refresh Cadence
└── FAQ
```

### 3. Route Registration

**File: `src/App.tsx`**

Add the new route:
```typescript
import Readme from "./pages/Readme";
// ...
<Route path="/readme" element={<Readme />} />
```

---

## Content Design Specifications

### Brand Compliance

| Element | Specification |
|---------|--------------|
| Background | `#0F1216` (Abyss) |
| Accent | `#00C2B6` (Signal Teal) |
| Warning | `#C24E00` (Rot) |
| Headlines | Space Grotesk, bold, uppercase |
| Body | Inter, regular |
| Data/Code | JetBrains Mono |
| Cards | `.card-lift`, `.card-premium` effects |

### Visual Indicator Legend (Exact Reproduction)

**Score Thresholds:**
```
┌─────────────────────────────────────────────────────┐
│  SCORE RANGE    │  COLOR         │  STATUS         │
├─────────────────┼────────────────┼─────────────────│
│  70 - 100       │  🟢 #00C2B6    │  HEALTHY        │
│  40 - 69        │  🟡 #F59E0B    │  STALE          │
│  1 - 39         │  🔴 #C24E00    │  DECAYING       │
│  0 / N/A        │  ⚫ #8B949E    │  UNKNOWN        │
└─────────────────────────────────────────────────────┘
```

**Health Dimension Dots (D/G/T):**
```
┌─────────────────────────────────────────────────────────────┐
│  DIMENSION      │  INDICATOR  │  THRESHOLDS                │
├─────────────────┼─────────────┼────────────────────────────│
│  Dependency (D) │  First dot  │  70+: Healthy              │
│                 │             │  40-69: Warning            │
│                 │             │  <40: Critical             │
├─────────────────┼─────────────┼────────────────────────────│
│  Governance (G) │  Second dot │  5+ tx/30d: Active         │
│                 │             │  1-4 tx: Dormant           │
│                 │             │  0 tx: None                │
├─────────────────┼─────────────┼────────────────────────────│
│  TVL (T)        │  Third dot  │  >$10M: Healthy            │
│                 │             │  $100K-$10M: Moderate      │
│                 │             │  <$100K or N/A: Low        │
└─────────────────────────────────────────────────────────────┘
```

**Icons Used in Platform:**
| Icon | Lucide Name | Purpose |
|------|-------------|---------|
| Activity | `Activity` | Liveness monitoring |
| Fingerprint | `Fingerprint` | Bytecode originality |
| Shield | `Shield` | Verification/Governance |
| Package | `Package` | Dependencies |
| DollarSign | `DollarSign` | TVL/Economic metrics |
| CheckCircle | `CheckCircle` | Healthy status |
| AlertTriangle | `AlertTriangle` | Warning/Needs attention |
| XCircle | `XCircle` | Critical/No data |
| RefreshCw | `RefreshCw` | Refresh action |
| TrendingUp | `TrendingUp` | Growth metrics |

### Scoring Formula Display

```
┌───────────────────────────────────────────────────────────┐
│                 INTEGRATED RESILIENCE SCORE               │
│                                                           │
│   R = 0.40×GitHub + 0.25×Deps + 0.20×Gov + 0.15×TVL      │
│                                                           │
│   ┌─────────────┬────────┬─────────────────────────────┐ │
│   │  DIMENSION  │ WEIGHT │  WHAT IT MEASURES           │ │
│   ├─────────────┼────────┼─────────────────────────────┤ │
│   │  GitHub     │  40%   │  Code activity, commits,    │ │
│   │             │        │  contributors, velocity     │ │
│   ├─────────────┼────────┼─────────────────────────────┤ │
│   │  Dependency │  25%   │  Supply chain health,       │ │
│   │             │        │  outdated/critical crates   │ │
│   ├─────────────┼────────┼─────────────────────────────┤ │
│   │  Governance │  20%   │  Multisig/DAO activity,     │ │
│   │             │        │  decentralization level     │ │
│   ├─────────────┼────────┼─────────────────────────────┤ │
│   │  TVL        │  15%   │  Economic impact,           │ │
│   │             │        │  risk ratio (TVL/commits)   │ │
│   └─────────────┴────────┴─────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### Decay Formula Display

```
DECAY RATE = (1 - e^(-0.00167 × days)) × 100%

Where:
- λ = 0.05/month (or 0.00167/day)
- days = Days since last commit

Examples:
- 30 days inactive → 4.9% decay
- 90 days inactive → 13.9% decay
- 180 days inactive → 25.9% decay
```

---

## Component Architecture

### New Components Needed

1. **`src/pages/Readme.tsx`** - Main page component
2. **`src/components/readme/TableOfContents.tsx`** - Sticky navigation
3. **`src/components/readme/ScoreExplainer.tsx`** - Interactive score visualization
4. **`src/components/readme/IndicatorLegend.tsx`** - Visual reference cards
5. **`src/components/readme/FormulaDisplay.tsx`** - Math formula blocks
6. **`src/components/readme/index.ts`** - Barrel export

### Reusable Existing Components

- `Card`, `Badge`, `Progress` from UI library
- `Accordion` for FAQ section
- `Tabs` for category switching
- `DimensionHealthIndicators` for live examples

---

## Content Sections Detail

### Section 1: Hero
- Large headline: "RESILIENCE README"
- Subtitle: "The definitive guide to decentralized protocol health"
- 3-stat banner: Registry Size | Avg Score | Active Projects
- CTA: "Explore the Registry" + "Join as Builder"

### Section 2: Core Philosophy
- "Zero Proof" baseline explanation
- "Reputation cannot be forked" philosophy
- Multi-dimensional trust model diagram

### Section 3: Scoring Deep Dive
- Interactive breakdown with actual color bars
- Live example using real score breakdown
- Hover effects matching main platform

### Section 4: Visual Reference (Critical)
This must exactly match production:
- Color swatches with hex codes
- Icon grid with Lucide names
- Badge variants with class names
- Example cards with exact styling

### Section 5: User Flows
**For Visitors:**
1. Browse Explorer → Click project → View Dashboard
2. Filter by status/category → Compare scores

**For Builders:**
1. Connect X account → Link GitHub → Verify ownership
2. Complete profile → Get analyzed → Improve score
3. Add Build In Public posts → Engage community

### Section 6: FAQ
Using Accordion component:
- "How often is data refreshed?"
- "Can I dispute my score?"
- "What if my project isn't on GitHub?"
- "How does staking work?"
- "Is this data public?"

---

## Edge Cases Handled

| Case | Handling |
|------|----------|
| Mobile responsiveness | Collapsible TOC, stacked cards |
| Long content scrolling | Sticky TOC with active state |
| External links | Open in new tab with icon |
| Code snippets | Syntax highlighting with JetBrains Mono |
| Deep linking | Anchor IDs on all sections |
| SEO | Proper heading hierarchy, meta tags |
| Accessibility | Proper contrast, focus states |

---

## Breaking Changes Avoided

1. **External docs link** - Users expecting docs.resilience.dev will now go to /readme (inform via redirect or notice)
2. **Route conflicts** - `/readme` does not conflict with existing routes
3. **Navigation order** - Kept as first nav item for discoverability

---

## Files to Create/Modify

### New Files:
- `src/pages/Readme.tsx` - Main documentation page
- `src/components/readme/TableOfContents.tsx` - Navigation component
- `src/components/readme/IndicatorLegend.tsx` - Visual reference
- `src/components/readme/index.ts` - Exports

### Modified Files:
- `src/components/layout/Navigation.tsx` - Change DOCS to README
- `src/App.tsx` - Add /readme route

---

## Implementation Sequence

1. Create basic page structure with Layout wrapper
2. Build TableOfContents with smooth scroll
3. Add Hero section with ecosystem stats
4. Build Core Concepts section
5. Add Scoring Methodology with visual formulas
6. Create IndicatorLegend component
7. Add Platform Features overview
8. Add Builder Guide section
9. Add Data Provenance section
10. Add FAQ with Accordion
11. Update Navigation link
12. Add route to App.tsx
13. Test all anchor links and mobile responsiveness
