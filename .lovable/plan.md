
# Dependency Tree Visualization: Strategic Implementation Plan

## Executive Summary

This plan outlines the implementation of an interactive, sophisticated dependency tree visualization that displays both **inward dependencies** (what this project uses) and **outward dependents** (who uses this project). The feature will be accessible via a clickable icon within the existing "eye" popover in the Explorer leaderboard.

---

## 1. Business & Product Strategy Analysis

### Value Proposition
| Stakeholder | Value Delivered |
|-------------|-----------------|
| **Investors/Stakers** | Assess supply chain risk before committing capital |
| **Developers** | Understand ecosystem coupling and upgrade urgency |
| **Protocol Teams** | Showcase ecosystem influence (projects dependent on them) |
| **Ecosystem Analysts** | Map critical infrastructure dependencies |

### Success Metrics
- User engagement: Click-through rate on dependency tree icon
- Data completeness: % of Rust projects with parsed Cargo.toml
- Ecosystem insight: # of projects with mapped reverse dependencies

---

## 2. Technical Architecture

### Data Model Enhancement

```text
+----------------------+          +------------------------+
|   claimed_profiles   |          |   dependency_graph     |
+----------------------+          +------------------------+
| id (PK)              |<-------->| id (PK)                |
| project_name         |          | source_profile_id (FK) |
| github_url           |          | target_crate_name      |
| dependency_health... |          | current_version        |
+----------------------+          | latest_version         |
                                  | months_behind          |
                                  | is_critical            |
                                  | crates_io_dependents   |
                                  | analyzed_at            |
                                  +------------------------+
```

### New Database Table Schema

```sql
CREATE TABLE dependency_graph (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_profile_id UUID REFERENCES claimed_profiles(id) ON DELETE CASCADE,
  crate_name TEXT NOT NULL,
  current_version TEXT,
  latest_version TEXT,
  months_behind INTEGER DEFAULT 0,
  is_critical BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,
  crates_io_url TEXT,
  crates_io_dependents INTEGER DEFAULT 0, -- Reverse dependency count
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_profile_id, crate_name)
);

-- Enable RLS with public read access
ALTER TABLE dependency_graph ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON dependency_graph FOR SELECT USING (true);
```

---

## 3. System Design

### Component Flow Diagram

```text
+------------------+     +-------------------+     +---------------------+
|  LeaderboardRow  |     |  Eye Popover      |     |  DependencyTree     |
|  (Explorer)      |---->|  + Tree Icon      |---->|  Page (/deps/:id)   |
+------------------+     +-------------------+     +---------------------+
                                                            |
                    +---------------------------------------+
                    v
        +------------------------+
        |  Interactive Graph     |
        |  (React Flow / SVG)    |
        +------------------------+
                    |
        +-----------+-----------+
        |                       |
        v                       v
+---------------+       +------------------+
| Dependencies  |       | Dependents       |
| (Inward)      |       | (Reverse/Forks)  |
+---------------+       +------------------+
```

---

## 4. Implementation Phases

### Phase 1: Data Infrastructure (Backend)

**4.1.1 Database Migration**
- Create `dependency_graph` table to store parsed dependencies
- Add RLS policy for public read access
- Create index on `source_profile_id` for query performance

**4.1.2 Enhance Edge Function: `analyze-dependencies`**
- Store individual dependency records in `dependency_graph` table
- Add crates.io reverse dependency lookup (fetch dependent count per crate)
- Return structured data for frontend consumption

**4.1.3 New Hook: `useDependencyGraph`**
- Fetch dependency data for a specific profile
- Transform for tree visualization consumption

### Phase 2: UI Components (Frontend)

**4.2.1 Entry Point: Eye Popover Enhancement**
- Add a "Network" or "Dependencies" icon button inside the existing popover
- Icon click navigates to `/deps/:profileId`

**4.2.2 New Page: `DependencyTreePage`**
- Route: `/deps/:id`
- Full-screen, dark-themed visualization canvas
- Breadcrumb navigation back to Explorer/Profile

**4.2.3 Tree Visualization Component**
- **Technology Choice**: React Flow library (MIT licensed, supports expand/collapse)
- Interactive node-edge graph with:
  - Central node: The project being analyzed
  - Left branch: Dependencies (what it uses)
  - Right branch: Dependents (who uses it - forks, crates.io dependents)
- Expandable/collapsible nodes
- Color-coded status indicators:
  - Green: Current version
  - Amber: Outdated (1-6 months)
  - Red: Critical outdated (6+ months)
  - Gray: Unknown/unavailable

**4.2.4 Node Detail Panel**
- Side drawer that opens on node click
- Displays:
  - Crate name and version comparison
  - Months behind indicator
  - Link to crates.io page
  - Dependent count (ecosystem impact)
  - Security advisory status (future)

### Phase 3: Dependents/Reverse Dependencies

**4.3.1 GitHub Forks Integration**
- Already tracked in database (`github_forks` column)
- Display fork count prominently as "Projects Derived From This"

**4.3.2 Crates.io Reverse Dependencies**
- Use crates.io API: `GET /api/v1/crates/{name}/reverse_dependencies`
- Parse and display in tree as "downstream" nodes
- Cache results to avoid rate limiting

**4.3.3 Cross-Registry Linking**
- Match crate names against other projects in `claimed_profiles`
- Create internal links for "Solana Projects Using This"

---

## 5. File Structure

```text
src/
  pages/
    DependencyTree.tsx           # New page
  components/
    dependency-tree/
      index.ts                   # Barrel export
      DependencyTreeCanvas.tsx   # React Flow wrapper
      DependencyNode.tsx         # Custom node component
      DependencyEdge.tsx         # Custom edge with status color
      NodeDetailPanel.tsx        # Side drawer for details
      DependencyLegend.tsx       # Color legend component
      TreeControls.tsx           # Zoom, expand all, collapse all
  hooks/
    useDependencyGraph.ts        # Data fetching hook
supabase/
  functions/
    analyze-dependencies/
      index.ts                   # Enhanced to store in graph table
```

---

## 6. User Experience Flow

```text
1. User browses Explorer
2. Clicks "Eye" icon on a project row
3. Popover shows project metadata
4. User clicks "View Dependency Tree" button
5. Navigates to /deps/:profileId
6. Sees animated loading state while data fetches
7. Tree renders with project at center
8. LEFT side: Dependencies (crates this project uses)
   - Color-coded by version status
   - Expandable to show transitive deps (Phase 2+)
9. RIGHT side: Dependents (who uses this project)
   - GitHub forks count
   - Crates.io reverse dependencies
   - Other Solana projects in registry
10. Click any node to open detail panel
11. Navigate away via breadcrumb or back button
```

---

## 7. Technical Considerations

### Edge Cases Handled
| Edge Case | Handling |
|-----------|----------|
| No Cargo.toml found | Display "Not a Rust/Solana project" message |
| Empty dependency list | Show central node only with "No dependencies" label |
| Private repository | Show "Private Repo - Analysis Unavailable" state |
| Rate limited by crates.io | Queue requests, show partial data with refresh option |
| Large dependency trees (50+) | Paginate, cluster, or collapse after 20 nodes |

### Breaking Changes Avoided
- Existing `analyze-dependencies` function returns same response shape
- New table is additive, no schema modifications to `claimed_profiles`
- Eye popover remains fully functional, new button is additive

### Performance Optimizations
- Lazy load dependency data only when tree page is visited
- Use React Flow's viewport culling for large graphs
- Cache dependency graph data with 24-hour stale time
- Progressive loading: show core deps first, expand on demand

---

## 8. Security Considerations

- RLS policy ensures read-only public access to dependency data
- No user input is executed as SQL (parameterized queries only)
- Crates.io API calls made server-side with rate limiting
- GitHub token used only for authenticated repo access

---

## 9. Package Dependencies

```json
{
  "@xyflow/react": "^12.0.0"
}
```

Note: This is the latest version of React Flow (formerly `reactflow`), which is MIT licensed and actively maintained.

---

## 10. Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Create `dependency_graph` database table | High |
| 2 | Enhance `analyze-dependencies` to store parsed deps | High |
| 3 | Install `@xyflow/react` package | High |
| 4 | Create `useDependencyGraph` hook | High |
| 5 | Build `DependencyTreePage` and route | High |
| 6 | Implement `DependencyTreeCanvas` with React Flow | High |
| 7 | Add entry point in Eye popover | Medium |
| 8 | Implement `NodeDetailPanel` drawer | Medium |
| 9 | Add crates.io reverse dependency fetching | Medium |
| 10 | Cross-link with registry projects | Low |
| 11 | Add GitHub forks as "derived projects" | Low |

---

## 11. Mobile Responsiveness

- On mobile: Tree displays as vertical scrollable list
- Nodes become collapsible accordions
- Detail panel becomes full-screen modal
- Touch-friendly tap targets (44px minimum)

---

## 12. Summary

This implementation provides a sophisticated, Bloomberg-terminal-quality dependency visualization that:
- Maintains existing architecture patterns
- Uses proven, MIT-licensed visualization library
- Provides clear value to all user personas
- Scales gracefully with data volume
- Respects API rate limits and performance constraints

The feature transforms raw dependency data into actionable supply chain intelligence, enabling users to assess project health at a glance and understand ecosystem coupling.

