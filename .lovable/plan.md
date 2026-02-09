

# Add Dependency Tree Navigation to Development Tab

## Overview

Add a **"View Dependency Tree"** button to the `DependencyHealthCard` on the Development tab, allowing users to navigate directly to the interactive dependency visualization at `/deps/:profileId`.

---

## Current State

- **DependencyHealthCard** displays health score, outdated count, and critical count
- Has optional `onRefresh` prop for re-analysis (not currently wired)
- Does NOT have navigation to the Dependency Tree page
- Dependency Tree page exists at `/deps/:id` route

---

## Implementation Plan

### Step 1: Enhance DependencyHealthCard Component

Add a new optional `profileId` prop and a "View Tree" button that links to `/deps/:profileId`.

**File**: `src/components/program/DependencyHealthCard.tsx`

**Changes**:
1. Add `profileId?: string` prop to interface
2. Import `Link` from `react-router-dom`
3. Add "View Dependency Tree" button/link with Network icon
4. Only show button when `profileId` is provided

**New UI Element**:
```
+----------------------------------+
| DEPENDENCY HEALTH     [↻] [🌐] |  <- Add Network/Tree icon button
| ✓ Healthy                        |
|                                  |
| Health Score              85/100 |
| ████████████████░░░░             |
|                                  |
| [2] Outdated                     |
|                                  |
| Supply chain health...           |
| Last analyzed: 2 hours ago       |
+----------------------------------+
```

### Step 2: Update DevelopmentTabContent

Pass `profileId` to `DependencyHealthCard` so the tree navigation works.

**File**: `src/components/program/tabs/DevelopmentTabContent.tsx`

**Changes**:
1. Pass `profileId={profileId}` to `DependencyHealthCard`

---

## Technical Details

### Props Update

```typescript
interface DependencyHealthCardProps {
  healthScore: number;
  outdatedCount: number;
  criticalCount: number;
  analyzedAt?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  profileId?: string;  // NEW: For tree navigation
}
```

### Button Implementation

```typescript
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';

// Inside CardHeader, next to refresh button
{profileId && (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="h-8 w-8"
      >
        <Link to={`/deps/${profileId}`}>
          <Network className="h-4 w-4" />
        </Link>
      </Button>
    </TooltipTrigger>
    <TooltipContent>View Dependency Tree</TooltipContent>
  </Tooltip>
)}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/program/DependencyHealthCard.tsx` | Modify | Add `profileId` prop and tree navigation button |
| `src/components/program/tabs/DevelopmentTabContent.tsx` | Modify | Pass `profileId` to DependencyHealthCard |

---

## User Flow

```
1. User views Development tab on program detail page
2. User sees Dependency Health card with metrics
3. User clicks "Network" icon button on card header
4. User navigates to /deps/:profileId
5. Interactive dependency tree loads with full visualization
```

---

## Edge Cases Handled

| Edge Case | Handling |
|-----------|----------|
| No `profileId` available | Button not rendered |
| No dependencies found | Tree page shows "No Dependencies" state |
| Mobile view | Button remains visible, tree page is responsive |

---

## Visual Consistency

- Uses same button style as existing refresh button
- Network icon aligns with the "dependency graph" mental model
- Tooltip provides clear action description
- Maintains card's compact, information-dense layout

