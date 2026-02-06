

# Program Detail Page UI Improvements

## Issues Identified

1. **Chart Not Showing**: The `UpgradeChart` and `RecentEvents` components are conditionally rendered only when `project` exists (from the `projects` table). For registry-only entries, the chart never displays.

2. **About Section**: The description renders raw HTML/text without formatting, and there's no truncation with "Read More" option.

3. **Social Links Section**: 
   - Currently only shows socials that exist (X, Discord, Telegram, GitHub)
   - Missing: Program ID with icon and copy button in this section
   - Missing: Website icon
   - Unavailable socials are hidden instead of shown as disabled/greyed

---

## Implementation Plan

### 1. Always Show Chart & Events (Even When Empty)

**Current Logic (Line 182-192):**
```tsx
{project && (
  <div className="mb-6 grid gap-6 lg:grid-cols-3">
    <UpgradeChart projectId={project.id} />
    <RecentEvents projectId={project.id} />
  </div>
)}
```

**New Logic:**
- Always render the chart section regardless of whether `project` exists
- Pass the claimed profile ID as fallback: `projectId={project?.id || claimedProfile?.id || ''}`
- The `UpgradeChart` and `RecentEvents` components already handle empty states gracefully with "No data yet" messages

### 2. About Section with Truncation & Read More

**Changes:**
- Limit description to ~150 characters initially
- Add "Read More" button that expands to full text
- Properly render HTML content if it contains formatting (using dangerouslySetInnerHTML with sanitization or prose classes)
- Add `useState` for `isExpanded` toggle

**UI Design:**
```text
┌─────────────────────────────────────────────────────┐
│ ABOUT                                               │
├─────────────────────────────────────────────────────┤
│ This protocol provides decentralized...             │
│ [Read More]                                         │
│                                                     │
│ [DeFi]  ← Category badge                            │
└─────────────────────────────────────────────────────┘
```

### 3. Enhanced Social Pulse Section with All Icons

**New Design - Show ALL social options with disabled state for unavailable ones:**

| Social | Icon | Available State | Unavailable State |
|--------|------|-----------------|-------------------|
| Program ID | `Code` or `Hash` | Blue bg + Copy button | Grey, show "Not linked" |
| Website | `Globe` | Clickable link | Grey, disabled |
| X (Twitter) | `𝕏` symbol | Clickable link | Grey, disabled |
| Discord | `MessageCircle` | Clickable link | Grey, disabled |
| Telegram | `Send` | Clickable link | Grey, disabled |
| GitHub | `Github` | Green highlight | Grey, disabled |

**Component Structure:**
```tsx
// Social link item - reusable for each platform
interface SocialLinkItemProps {
  icon: React.ReactNode;
  label: string;
  url?: string;
  isAvailable: boolean;
  copyValue?: string; // For Program ID copy functionality
}
```

**Layout:**
```text
┌─────────────────────────────────────────────────────┐
│ SOCIAL PULSE                                        │
├─────────────────────────────────────────────────────┤
│ [#] Program ID: 11111...11111  [Copy] [Explorer] ← if exists, else greyed │
│ [🌐] Website                                        │
│ [𝕏] @username                                       │
│ [💬] Discord                                        │
│ [✈️] Telegram                                       │
│ [🐙] GitHub Connected ← highlighted if verified    │
└─────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProgramDetail.tsx` | Main implementation of all three fixes |

### Detailed Code Changes

#### A. Chart Section (Lines 182-192)

Remove the `{project && ...}` conditional wrapper so chart always shows:
- Chart and events will display empty states when no score history exists
- This provides visual consistency and shows where data will appear

#### B. About Section (Lines 159-180)

Add state and truncation logic:
```tsx
const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
const MAX_DESCRIPTION_LENGTH = 150;
const shouldTruncate = displayDescription && displayDescription.length > MAX_DESCRIPTION_LENGTH;
const truncatedDescription = shouldTruncate && !isDescriptionExpanded 
  ? displayDescription.slice(0, MAX_DESCRIPTION_LENGTH) + '...'
  : displayDescription;
```

Render with Read More button:
```tsx
<div 
  className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground"
  dangerouslySetInnerHTML={{ __html: truncatedDescription }}
/>
{shouldTruncate && (
  <Button variant="link" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
    {isDescriptionExpanded ? 'Show Less' : 'Read More'}
  </Button>
)}
```

#### C. Social Pulse Section (Lines 343-401)

Create a complete social links grid showing all platforms:

1. **Program ID row** (if programId exists or show disabled):
   - Use `Hash` or `Code` icon from Lucide
   - Truncate program ID for display
   - Copy button + Solana Explorer link

2. **Website row**:
   - Use `Globe` icon
   - Link to website or show disabled

3. **X/Twitter row**:
   - Use `𝕏` symbol
   - Link or disabled

4. **Discord row**:
   - Use `MessageCircle` icon
   - Link or disabled

5. **Telegram row**:
   - Use `Send` icon  
   - Link or disabled

6. **GitHub row** (highlighted for verified):
   - Use `Github` icon
   - Special green styling when connected

**Disabled State Styling:**
```tsx
className={cn(
  "flex items-center gap-3 rounded-sm border px-4 py-3",
  isAvailable 
    ? "border-border bg-muted/30 hover:bg-muted/50 cursor-pointer" 
    : "border-border/50 bg-muted/10 cursor-not-allowed opacity-50"
)}
```

---

## Technical Details

### New Imports Needed
```tsx
import { Hash, Globe, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
```

### Helper Function for Copy
```tsx
const copyToClipboard = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
};
```

---

## Visual Hierarchy After Changes

```text
1. Back to Explorer link
2. Verification Badge (if verified)
3. Header (name, score, status)
4. About Section (truncated with Read More)
5. Score History Chart + Recent Events (ALWAYS VISIBLE, even if empty)
6. Metric Cards
7. Verified Timeline (if milestones exist)
8. Website Preview (if verified + URL exists)
9. Media Gallery + Social Pulse (side by side)
   - Social Pulse shows ALL platforms (available = clickable, unavailable = greyed)
10. Stake CTA
```

