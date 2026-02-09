

# Implementation Plan: Eye Toggle Details Row in Explorer Table

## Overview

Add an expandable details row to the Program Leaderboard table with an eye toggle button. When clicked, it reveals additional project metadata in a collapsible sub-row. For unclaimed profiles with private repositories (no accessible data), display padlock icons for metrics.

---

## Feature Summary

### Eye Toggle Behavior
- Add an "EYE" column at the end of the table with an `Eye` icon button
- Clicking toggles open a details sub-row below the current row
- When expanded, the icon changes to `EyeOff`

### Details Row Content

| Field | Data Source | Display |
|-------|-------------|---------|
| GitHub Status | New field (infer from `github_analyzed_at`) | "PUBLIC" or "PRIVATE" badge |
| Website | `website_url` | Globe icon + clickable link |
| Contributors | `github_contributors` | Users icon + count |
| Source/Hackathon | New column `discovery_source` | Text badge (e.g., "Breakout 2025") |
| X Handle | `x_username` | X icon + @handle link |

### Private Repo Handling

For unclaimed profiles where `github_analyzed_at` is NULL (indicating we couldn't fetch data):

| Column | Normal Display | Private Repo Display |
|--------|----------------|----------------------|
| SCORE | Numeric score | `Lock` icon |
| HEALTH | D/G/T indicators | `Lock` icon |
| TREND | Sparkline | `Lock` icon |
| DECAY | Percentage | `Lock` icon |
| LIVENESS | Active/Stale/Decaying | "Private Repo" badge |

---

## Database Changes

Add a new column to track discovery source:

```sql
ALTER TABLE claimed_profiles
ADD COLUMN discovery_source VARCHAR(100) DEFAULT NULL;
```

This column will store values like:
- "Breakout 2025"
- "Solana Foundation"
- "Community Submission"
- NULL (for manual claims)

---

## Part 1: Update ExplorerProject Interface

**File: `src/hooks/useExplorerProjects.ts`**

Add new fields to the interface:

```typescript
export interface ExplorerProject {
  // ... existing fields ...
  
  // New fields for details toggle
  github_contributors: number;
  x_username: string | null;
  github_analyzed_at: string | null;
  discovery_source: string | null;
}
```

Update the query mapping to include these fields.

---

## Part 2: Update ProgramLeaderboard Component

**File: `src/components/explorer/ProgramLeaderboard.tsx`**

### Add State for Expanded Rows

```typescript
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

const toggleRowExpansion = (projectId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setExpandedRows(prev => {
    const newSet = new Set(prev);
    if (newSet.has(projectId)) {
      newSet.delete(projectId);
    } else {
      newSet.add(projectId);
    }
    return newSet;
  });
};
```

### Add Private Repo Detection

```typescript
const isPrivateRepo = (project: ExplorerProject): boolean => {
  return project.claimStatus === 'unclaimed' && !project.github_analyzed_at;
};
```

### Add DETAILS Column Header

```typescript
<TableHead className="w-12 text-center">DETAILS</TableHead>
```

### Add Eye Toggle Cell

```typescript
<TableCell className="text-center">
  <Button
    variant="ghost"
    size="icon"
    className="h-7 w-7"
    onClick={(e) => toggleRowExpansion(project.id, e)}
  >
    {expandedRows.has(project.id) ? (
      <EyeOff className="h-4 w-4 text-muted-foreground" />
    ) : (
      <Eye className="h-4 w-4 text-muted-foreground" />
    )}
  </Button>
</TableCell>
```

### Add Expanded Details Row

After each main row, conditionally render an expanded details row:

```typescript
{expandedRows.has(project.id) && (
  <TableRow className="bg-muted/30 hover:bg-muted/30">
    <TableCell colSpan={13} className="py-3">
      <div className="flex flex-wrap items-center gap-6 px-4">
        {/* GitHub Status */}
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className={isPrivateRepo(project) ? 'border-amber-500/50 text-amber-500' : 'border-primary/50 text-primary'}>
            {isPrivateRepo(project) ? 'PRIVATE' : 'PUBLIC'}
          </Badge>
        </div>
        
        {/* Website */}
        {project.website_url && (
          <a href={project.website_url} target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Globe className="h-4 w-4" />
            <span className="underline">Website</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        
        {/* Contributors */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{project.github_contributors || '—'}</span>
        </div>
        
        {/* Source/Hackathon */}
        {project.discovery_source && (
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Badge variant="outline" className="border-amber-500/50 text-amber-500">
              {project.discovery_source}
            </Badge>
          </div>
        )}
        
        {/* X Handle */}
        {project.x_username && (
          <a href={`https://x.com/${project.x_username}`} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <Twitter className="h-4 w-4" />
            <span>@{project.x_username}</span>
          </a>
        )}
      </div>
    </TableCell>
  </TableRow>
)}
```

### Update Metric Columns for Private Repos

Wrap Score, Health, Trend, Decay, and Liveness cells with private repo checks:

**Score Cell:**
```typescript
<TableCell className="text-right">
  {isPrivateRepo(project) ? (
    <Lock className="h-4 w-4 text-muted-foreground mx-auto" />
  ) : (
    <span className={cn('font-mono text-lg font-bold', getScoreColor(project.resilience_score))}>
      {Math.round(project.resilience_score)}
    </span>
  )}
</TableCell>
```

**Liveness Cell:**
```typescript
<TableCell className="hidden md:table-cell">
  {isPrivateRepo(project) ? (
    <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
      <Lock className="mr-1 h-3 w-3" />
      Private Repo
    </Badge>
  ) : (
    getStatusBadge(project.liveness_status)
  )}
</TableCell>
```

---

## Part 3: Update MobileProgramCard

**File: `src/components/explorer/MobileProgramCard.tsx`**

Add an expandable section at the bottom of each card with the same details.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useExplorerProjects.ts` | Add `github_contributors`, `x_username`, `github_analyzed_at`, `discovery_source` to interface and query |
| `src/components/explorer/ProgramLeaderboard.tsx` | Add eye toggle column, expanded details row, private repo handling |
| `src/components/explorer/MobileProgramCard.tsx` | Add collapsible details section |

## Database Migration

| Change | SQL |
|--------|-----|
| Add discovery source column | `ALTER TABLE claimed_profiles ADD COLUMN discovery_source VARCHAR(100) DEFAULT NULL;` |

---

## Visual Preview

**Collapsed State:**
```text
| RANK | PROJECT    | ... | DETAILS |
|------|------------|-----|---------|
| #1   | Jupiter    | ... |   👁    |
| #2   | Raydium    | ... |   👁    |
```

**Expanded State:**
```text
| RANK | PROJECT    | ... | DETAILS |
|------|------------|-----|---------|
| #1   | Jupiter    | ... |   👁‍🗨   |
|      | 🌐 PUBLIC | 🔗 Website | 👥 42 | ✨ Breakout 2025 | 𝕏 @JupiterExchange |
| #2   | Raydium    | ... |   👁    |
```

**Private Repo (Unclaimed):**
```text
| RANK | PROJECT    | SCORE | HEALTH | TREND | LIVENESS      | ... | DETAILS |
|------|------------|-------|--------|-------|---------------|-----|---------|
| #45  | MyProject  |  🔒   |   🔒   |  🔒   | 🔒 Private Repo | ... |   👁    |
```

---

## Import Additions

```typescript
import { Eye, EyeOff, Globe, Users, ExternalLink, Lock } from 'lucide-react';
```

Note: For the X/Twitter icon, we'll use a custom SVG or the existing pattern in the codebase since Lucide doesn't have an official X icon.

