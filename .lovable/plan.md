

# Enhanced Explorer Table Features

## Summary

This plan adds five new features to the Protocol Leaderboard table:

1. **Project Type Filter** - Add category/type filtering (DeFi, Infrastructure, etc.)
2. **Country Field & Filter** - Add country to onboarding, About tab, and filter
3. **Smart Program ID Display** - Show "Off-chain" instead of generated UUIDs
4. **Rank Movement Indicator** - Arrow icons showing position changes
5. **Sparkline Progress Chart** - Mini score trend visualization in each row

---

## Database Changes

### Add `country` column to `claimed_profiles`

```sql
ALTER TABLE claimed_profiles 
ADD COLUMN country VARCHAR(100);
```

---

## 1. Project Type (Category) Filter

### Current State
- `category` already exists in `claimed_profiles` table
- Categories defined in `src/types/index.ts`: defi, nft, infrastructure, gaming, social, dao, payments, developer-tools, other

### Changes Required

| File | Change |
|------|--------|
| `src/hooks/useExplorerProjects.ts` | Add `category` to ExplorerProject type and fetch |
| `src/pages/Explorer.tsx` | Add categoryFilter state and filtering logic |
| `src/components/explorer/SearchBar.tsx` | Add Category dropdown filter |
| `src/components/explorer/ProgramLeaderboard.tsx` | Display category badge in table |
| `src/components/explorer/MobileProgramCard.tsx` | Show category on mobile cards |

### UI Addition
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ All Status ▼ │ │ All Types ▼  │ │ All Countries│ │ Verification │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
                      NEW              NEW
```

---

## 2. Country Field & Filter

### Onboarding Flow Changes

| File | Change |
|------|--------|
| `src/pages/ClaimProfile.tsx` | Add country state and input field in Step 2 |
| `src/components/claim/CoreIdentityForm.tsx` | Add country selector (dropdown with common countries) |

### Explorer Changes

| File | Change |
|------|--------|
| `src/hooks/useExplorerProjects.ts` | Add `country` to ExplorerProject type |
| `src/pages/Explorer.tsx` | Add countryFilter state |
| `src/components/explorer/SearchBar.tsx` | Add Country dropdown filter |

### About Tab

| File | Change |
|------|--------|
| `src/components/program/tabs/AboutTabContent.tsx` | Display country with flag emoji |

### Country Options (Top Crypto-Active Countries)
```typescript
const COUNTRIES = [
  { value: 'us', label: 'United States', flag: '🇺🇸' },
  { value: 'uk', label: 'United Kingdom', flag: '🇬🇧' },
  { value: 'sg', label: 'Singapore', flag: '🇸🇬' },
  { value: 'de', label: 'Germany', flag: '🇩🇪' },
  { value: 'ch', label: 'Switzerland', flag: '🇨🇭' },
  { value: 'ae', label: 'UAE', flag: '🇦🇪' },
  { value: 'hk', label: 'Hong Kong', flag: '🇭🇰' },
  { value: 'jp', label: 'Japan', flag: '🇯🇵' },
  { value: 'kr', label: 'South Korea', flag: '🇰🇷' },
  { value: 'in', label: 'India', flag: '🇮🇳' },
  { value: 'br', label: 'Brazil', flag: '🇧🇷' },
  { value: 'ng', label: 'Nigeria', flag: '🇳🇬' },
  { value: 'other', label: 'Other', flag: '🌍' },
];
```

---

## 3. Smart Program ID Display

### Problem
Currently, if `program_id` is null, it falls back to the internal UUID which looks like `553d...c541`. This is confusing because it's not a real Solana program ID.

### Solution
Display "Off-chain" badge for projects without on-chain deployment.

### Changes

| File | Change |
|------|--------|
| `src/components/explorer/ProgramLeaderboard.tsx` | Update `truncateProgramId` logic |

```tsx
// Current
const truncateProgramId = (id: string) => {
  if (!id || id.length < 8) return id || '—';
  return `${id.slice(0, 4)}...${id.slice(-4)}`;
};

// New - Check if it's a real Solana address (Base58, typically 32-44 chars)
const formatProgramId = (programId: string, projectId: string) => {
  // If program_id equals project id (UUID fallback), it's off-chain
  if (!programId || programId === projectId) {
    return { display: 'Off-chain', isOnChain: false };
  }
  // Real Solana program IDs are Base58 encoded (32-44 chars)
  return { 
    display: `${programId.slice(0, 4)}...${programId.slice(-4)}`, 
    isOnChain: true 
  };
};
```

### Visual Treatment
```
Off-chain projects:
┌──────────────────┐
│ 🔗 Off-chain     │  <- Muted badge, no copy button
└──────────────────┘

On-chain projects:
┌──────────────────┐
│ 5kX3...xY7z [📋] │  <- Truncated address + copy button
└──────────────────┘
```

---

## 4. Rank Movement Indicator

### Data Source
Compare current score with the previous snapshot from `score_history` table.

### New Hook

| File | Change |
|------|--------|
| `src/hooks/useRankHistory.ts` | **New file** - Fetch previous scores for all profiles |

```typescript
// Fetch last 2 snapshots per profile to calculate movement
export function useRankMovement(profileIds: string[]) {
  return useQuery({
    queryKey: ['rank-movement', profileIds],
    queryFn: async () => {
      // Get latest 2 scores per profile to compare
      const { data } = await supabase.rpc('get_score_changes', { 
        profile_ids: profileIds 
      });
      return data; // { profileId: 'up' | 'down' | 'stable' }
    }
  });
}
```

### Database Function (More Efficient)

```sql
CREATE OR REPLACE FUNCTION get_score_changes(profile_ids UUID[])
RETURNS TABLE(profile_id UUID, movement TEXT) AS $$
  WITH ranked_scores AS (
    SELECT 
      claimed_profile_id,
      score,
      ROW_NUMBER() OVER (PARTITION BY claimed_profile_id ORDER BY snapshot_date DESC) as rn
    FROM score_history
    WHERE claimed_profile_id = ANY(profile_ids)
  )
  SELECT 
    claimed_profile_id as profile_id,
    CASE 
      WHEN curr.score > prev.score THEN 'up'
      WHEN curr.score < prev.score THEN 'down'
      ELSE 'stable'
    END as movement
  FROM (SELECT * FROM ranked_scores WHERE rn = 1) curr
  LEFT JOIN (SELECT * FROM ranked_scores WHERE rn = 2) prev 
    ON curr.claimed_profile_id = prev.claimed_profile_id;
$$ LANGUAGE SQL;
```

### Visual Display

| File | Change |
|------|--------|
| `src/components/explorer/ProgramLeaderboard.tsx` | Add movement indicator next to rank |

```tsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// In the RANK column
<TableCell className="font-mono text-muted-foreground">
  <div className="flex items-center gap-1">
    <span>#{index + 1}</span>
    {movement === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
    {movement === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
    {movement === 'stable' && <Minus className="h-3 w-3 text-muted-foreground" />}
  </div>
</TableCell>
```

---

## 5. Sparkline Progress Chart

### Purpose
Show a mini trend line of the last 7 score snapshots directly in the table row.

### Implementation Options

**Option A: Recharts Mini Chart (Recommended)**
```tsx
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Sparkline = ({ data }: { data: number[] }) => (
  <div className="w-16 h-6">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ v, i }))}>
        <Line 
          type="monotone" 
          dataKey="v" 
          stroke="hsl(var(--primary))" 
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
```

**Option B: SVG Path (Lightweight)**
```tsx
const Sparkline = ({ values }: { values: number[] }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  
  const points = values.map((v, i) => 
    `${(i / (values.length - 1)) * 60},${20 - ((v - min) / range) * 16}`
  ).join(' ');
  
  return (
    <svg width="60" height="20" className="text-primary">
      <polyline 
        points={points} 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
    </svg>
  );
};
```

### Data Fetching

| File | Change |
|------|--------|
| `src/hooks/useExplorerProjects.ts` | Fetch last 7 score snapshots per profile |

Add to query:
```typescript
// Fetch sparkline data for all profiles in one query
const { data: sparklines } = await supabase
  .from('score_history')
  .select('claimed_profile_id, score, snapshot_date')
  .in('claimed_profile_id', profileIds)
  .order('snapshot_date', { ascending: false })
  .limit(7);
```

### Table Column

| File | Change |
|------|--------|
| `src/components/explorer/ProgramLeaderboard.tsx` | Add TREND column with sparkline |

```tsx
<TableHead className="hidden xl:table-cell w-20">TREND</TableHead>

// In row
<TableCell className="hidden xl:table-cell">
  <Sparkline values={project.scoreHistory || [project.resilience_score]} />
</TableCell>
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useRankMovement.ts` | Fetch score changes for movement indicators |
| `src/components/explorer/Sparkline.tsx` | Reusable mini chart component |
| `src/lib/countries.ts` | Country list with codes and flags |

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useExplorerProjects.ts` | Add category, country, scoreHistory to type and fetch |
| `src/pages/Explorer.tsx` | Add categoryFilter and countryFilter state |
| `src/components/explorer/SearchBar.tsx` | Add Category and Country dropdowns |
| `src/components/explorer/ProgramLeaderboard.tsx` | Add TREND column, movement indicator, smart program ID |
| `src/components/explorer/MobileProgramCard.tsx` | Add category badge, movement indicator |
| `src/pages/ClaimProfile.tsx` | Add country field |
| `src/components/claim/CoreIdentityForm.tsx` | Add country selector |
| `src/components/program/tabs/AboutTabContent.tsx` | Display country |
| Database | Add country column, create get_score_changes function |

---

## Updated Table Layout

```
┌──────┬────────────────┬──────────────┬───────┬──────────┬──────────┬────────┬─────────────┬───────┐
│ RANK │ PROTOCOL       │ TYPE         │ PROG  │ SCORE    │ LIVENESS │ TREND  │ STAKED      │ LAST  │
│      │                │              │ ID    │          │          │        │             │ ACTIV │
├──────┼────────────────┼──────────────┼───────┼──────────┼──────────┼────────┼─────────────┼───────┤
│ #1 ▲ │ [R] Resilience │ Infra        │Off-ch │ 85       │ Active   │ ╱╲╱╲   │ 150K SOL    │ 2d ago│
│ #2 — │ [S] SomeProto  │ DeFi         │5kX3...│ 72       │ Active   │ ─╱─    │ 80K SOL     │ 5d ago│
│ #3 ▼ │ [N] NewProject │ Gaming       │Off-ch │ 45       │ Decaying │ ╲╱─    │ 20K SOL     │ 30d   │
└──────┴────────────────┴──────────────┴───────┴──────────┴──────────┴────────┴─────────────┴───────┘
```

---

## Technical Notes

### Performance Considerations
- Sparkline data fetched in a single batch query (not N+1)
- Rank movement calculated via SQL function (not client-side)
- Country filter uses indexed column

### Mobile Responsive
- TYPE column hidden on mobile (shown as badge)
- TREND column hidden below XL breakpoint
- Country shown as flag emoji only on small screens

