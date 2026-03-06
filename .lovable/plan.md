

# Navigation Redesign + Blue Ocean Public Goods Strategy

## Part 1: Navigation Restructure

### New Menu Architecture

```text
README  |  EXPLORE ▾  |  MONITOR ▾  |  TRACK ▾  |  BUILD ▾
```

**README** — Standalone link (unchanged)

**EXPLORE** — Discovery & intelligence
- Explorer — Browse and score Solana projects
- Dependency Map — Supply chain visualization
- Grants — Discover ecosystem funding

**MONITOR** — Real-time operational awareness
- Tools — RPC health, address lookup, tx decoder
- Ecosystem Status — Service uptime dashboard
- GPT — AI-powered Solana intelligence

**TRACK** — Accountability & governance
- DAO Tracker — Track milestone delivery across DAOs
- Projects — Claim work, submit evidence, earn SOL

**BUILD** — Learning & resources
- Library — Docs, blueprints, and learning paths
- Protocols — Integration registry
- Dictionary — Solana terminology

### Dropdown Design Upgrade
Current dropdowns are plain `PopoverContent` boxes. The upgrade:
- **Two-column layout** for groups with 3+ items: icon on left, label + description on right
- **Subtle left accent bar** on hover (matches the brand's border-l-2 pattern)
- **Category header** inside the dropdown with a thin separator
- **Glass-morphism** background (`bg-card/80 backdrop-blur-xl border-primary/10`)
- **Animated entry**: `animate-in fade-in-50 slide-in-from-top-2`
- Each item gets a semantic Lucide icon for visual scanning
- Mobile drawer updated to match the new five-section grouping

### Files Modified
- `src/components/layout/Navigation.tsx` — Full rewrite of nav items, dropdown component, and mobile drawer

---

## Part 2: Blue Ocean Public Goods — Making Rezilience the Daily Solana Builder Hub

After thorough analysis, here are features that would create **daily return visits** from the Solana ecosystem — things that don't exist elsewhere or are fragmented across many sites:

### Tier 1 — High-impact, build now (daily utility)

**1. Solana Deploy Feed** (new page under MONITOR)
- Real-time feed of program deployments and upgrades on mainnet
- Shows: program ID, authority, timestamp, verified/unverified status, size delta
- Builders check this daily to see what competitors shipped, what got upgraded, what's new
- Edge function polls on-chain data; displays as a live ticker
- *Why it's blue ocean*: No single place shows "what deployed today on Solana" in a human-readable way

**2. Airdrop & Token Launch Calendar** (new page under EXPLORE)
- Aggregated calendar of upcoming token launches, airdrops, and TGE events
- Community-submitted + editable (like a wiki), with upvote/verification
- *Why it's blue ocean*: Currently scattered across Twitter threads and Discord; no canonical Solana-specific calendar

**3. Builder Leaderboard — Weekly Commits** (enhancement to Explorer)
- Weekly ranking of Solana projects by GitHub commit velocity, PR merge rate, and contributor growth
- Public, transparent, gamified — builders want to see where they rank
- *Why it's blue ocean*: GitHub activity exists on individual profiles but no one aggregates it weekly across the ecosystem

### Tier 2 — Medium effort, strong retention

**4. Solana Fee & Priority Fee Tracker** (new tab in Tools)
- Real-time and historical priority fee trends (p50, p90, p99)
- Helps builders optimize transaction costs
- *Why it's blue ocean*: Only available via raw RPC calls or paid dashboards

**5. IDL Explorer** (new tab in Tools)
- Paste any program ID → get its IDL, decoded instruction set, account structures
- Like an "Etherscan for Solana program interfaces"
- *Why it's blue ocean*: Anchor IDLs exist but there's no universal browser for them

### Recommended Build Order
1. **Navigation redesign** (immediate — improves all UX)
2. **Solana Deploy Feed** (highest daily-return potential)
3. **Fee Tracker tab** (quick win, fits existing Tools page)
4. **Builder Leaderboard enhancement** (builds on existing Explorer data)
5. **IDL Explorer tab** (unique developer utility)
6. **Airdrop Calendar** (community-driven, longer effort)

