

# Data Transparency & Provenance Update

## Overview
Transform the platform from "Marketing Mode" to "Data Intelligence Mode" by adding transparent labeling to all stats and a comprehensive Data Provenance section in the footer. This establishes credibility by being upfront about Phase 0 (Initial Registry Audit) status.

---

## Changes Summary

### 1. Hero Section Stats (HeroSection.tsx)
Update the 3 stats to include honest labeling with info tooltips:

| Current | New Label | Tooltip Explanation |
|---------|-----------|---------------------|
| "2,847 Programs Indexed" | "2,847 Initial Cohort" | "Curated registry of active Solana programs identified via on-chain history and public GitHub repositories." |
| "$1.28M Total Staked" | Remove this stat | Replace with "12K+ Weekly Heartbeats" (Estimated) |
| "73.4 Avg. Score" | "73.4 Beta Benchmark" | "Ecosystem average calculated from our Phase 0 audit. Claim your profile to see where you stand." |

New stat structure:
- **2,847** - "Initial Cohort" with info icon
- **12K+** - "Est. Weekly Heartbeats" with info icon  
- **73.4** - "Beta Benchmark" with info icon

### 2. Explorer Stats (EcosystemStats.tsx)
Update the 4 stat cards with transparent labeling:

| Current Label | New Label |
|--------------|-----------|
| "Programs Indexed" | "Initial Registry" |
| "Average Score" | "Beta Benchmark" |
| "Total Staked" | "Projected TVL" (with beta badge) |
| "Active Programs" | "Verified Active" |

Add small info icons with tooltips explaining data source.

### 3. Footer Data Provenance Section (Footer.tsx)
Add a new "Data Provenance" section above the copyright with collapsible details:

**Header:** `DATA PROVENANCE: PHASE 0 (INITIAL REGISTRY AUDIT)`

**Key Points (always visible):**
- "Stats derived from our curated Phase 0 Index. We do not use placeholder data."

**Expandable Details:**
- Registry Population: 2,847 curated cohort
- Activity Metrics: Rolling 30-day average from top 50 protocols
- Resilience Score: Mean average from Phase 0 audit
- Beta Status: Real-time telemetry restricted to Verified Builders

**CTA:** "Claim Your Profile" button to encourage data contribution

---

## Technical Implementation

### Files to Modify

1. **`src/components/landing/HeroSection.tsx`**
   - Import `Info` icon and Tooltip components
   - Update stats array with new labels and tooltip content
   - Add interactive tooltips on hover

2. **`src/components/explorer/EcosystemStats.tsx`**
   - Add tooltip explanations to each stat card
   - Update labels to reflect "Phase 0" transparency
   - Add small "PHASE 0" badge to stats

3. **`src/components/layout/Footer.tsx`**
   - Add new Data Provenance section between links and copyright
   - Use Collapsible component for expandable details
   - Include "Claim Your Profile" CTA button
   - Add visual separator

### New Components/Imports
```tsx
// HeroSection & EcosystemStats
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Footer
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Shield } from 'lucide-react';
```

### Hero Section Stats Structure
```tsx
const stats = [
  {
    value: '2,847',
    label: 'Initial Cohort',
    tooltip: 'Curated registry of active Solana programs identified via on-chain history and public GitHub repositories.'
  },
  {
    value: '12K+',
    label: 'Est. Weekly Heartbeats',
    tooltip: 'Rolling 30-day average from a verified sample of the top 50 protocols in our registry.'
  },
  {
    value: '73.4',
    label: 'Beta Benchmark',
    tooltip: 'Ecosystem average calculated from our Phase 0 audit. Claim your profile to see where you stand.'
  }
];
```

### Data Provenance Footer Section
```tsx
<div className="mt-8 border-t border-border pt-8">
  <div className="rounded-sm border border-primary/20 bg-primary/5 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="h-4 w-4 text-primary" />
      <span className="font-mono text-xs uppercase text-primary">
        DATA PROVENANCE: PHASE 0 (INITIAL REGISTRY AUDIT)
      </span>
    </div>
    <p className="text-xs text-muted-foreground mb-3">
      Stats are derived from our curated Phase 0 Index. Transparency is our only product; 
      we do not use placeholder data.
    </p>
    <Collapsible>
      <CollapsibleTrigger>View methodology</CollapsibleTrigger>
      <CollapsibleContent>
        {/* Detailed methodology */}
      </CollapsibleContent>
    </Collapsible>
  </div>
</div>
```

---

## Visual Design

### Tooltip Style
- Dark background with teal border accent
- Small info icon (h-3 w-3) next to stat labels
- Appears on hover with smooth fade-in animation

### Data Provenance Box
- Subtle teal-tinted background (`bg-primary/5`)
- Teal border accent (`border-primary/20`)
- Monospace header for technical credibility
- Collapsible details to avoid overwhelming users

### Phase Badge (for Explorer stats)
```tsx
<span className="ml-2 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary">
  PHASE 0
</span>
```

---

## User Experience Flow

1. **First Impression:** User sees stats with "Initial Cohort", "Est. Weekly Heartbeats", "Beta Benchmark" labels
2. **Curiosity:** Hovering over info icons reveals honest methodology
3. **Trust Building:** Footer provenance section shows commitment to transparency
4. **Conversion:** "Claim Your Profile" CTA encourages users to contribute their real data
5. **Engagement:** Users understand that claiming profiles transitions metrics from "Batch Audited" to "Real-Time"

---

## Expected Result
- Professional credibility through radical transparency
- Clear communication that this is Phase 0 with a path to Phase 1
- Stats become "challenges" that invite builders to improve accuracy by claiming profiles
- No risk of being called out for "fake data" since methodology is clearly explained
- Positions Resilience as pioneers, not pretenders

