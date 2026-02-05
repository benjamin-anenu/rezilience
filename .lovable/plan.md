

# Resilience - On-Chain Assurance Layer

## Overview
Building the **Resilience** frontend - a Bloomberg Terminal-styled application that provides trust metrics for Solana programs. This phase focuses on the core public pages with real wallet integration, interactive charts, and responsive design.

---

## Design System

**Colors:**
- Background: `#0F1216` (Abyss)
- Text: `#EBEFF5` (Foundation)  
- Accent: `#00C2B6` (Signal/Teal)
- Secondary: `#2D333B` (Concrete)
- Muted: `#8B949E` (Steel)
- Warning: `#C24E00` (Rot)

**Typography:**
- Headlines: Space Grotesk (bold, uppercase)
- Body: Inter
- Code/Data: JetBrains Mono

**Style:**
- Subtle border radius (2-4px)
- High data density
- Dark terminal aesthetic
- Sharp, professional feel

---

## Pages to Build (Phase 1)

### 1. Landing Page
- **Hero section** with "MAINTENANCE IS RESILIENCE" headline
- **Abstract geometric illustration** with connected nodes
- **Problem/Solution comparison** (Red Ocean vs Blue Ocean)
- **How It Works diagram** showing data flow pipeline
- **Three pillars:** Liveness Indexer, Bytecode Originality, Staked Assurance
- **Use Cases section** for Protocol Risk, DAO Diligence, Compliance

### 2. Explorer Page
- **Ecosystem Overview** stats bar (programs indexed, average score, total staked)
- **Search bar** with filter options
- **Program Leaderboard** table with columns:
  - Rank, Program Name, Program ID
  - Resilience Score, Liveness status
  - Originality badge, Staked Assurance, Last Upgrade
- Rows clickable to navigate to Program Detail

### 3. Program Detail Page
- **Header card** with program name, ID, score, and liveness indicator
- **Interactive line chart** (Recharts) showing upgrade frequency over 12 months
- **Recent Events** timeline sidebar
- **Three metric cards:**
  - Bytecode Originality (fingerprint icon)
  - Staked Assurance (shield icon)  
  - Admin Constraints (lock icon)

### 4. Staking Page
- **3-step form flow:**
  1. Select Program (paste ID + verify)
  2. Define Stake Amount (with Max button)
  3. Set Lockup Period (slider: 6mo - 2yr)
- **Bond Summary panel** with score impact visualization
- **Financial Details** breakdown
- **Risk Disclosure** warning box
- **Solana wallet integration** (Phantom, Solflare, etc.)
- **CREATE BOND** button with wallet signature requirement

---

## Shared Components

### Navigation
- Resilience logo (stylized R icon)
- Links: Docs, Explorer, Grants, Staking/Dashboard
- Wallet connect button (shows truncated address + balance when connected)

### Footer
- Logo + tagline
- Documentation, GitHub, Twitter links

---

## Technical Implementation

### Wallet Integration
- Use `@solana/wallet-adapter-react` for Solana wallet connections
- Support Phantom, Solflare, and other popular wallets
- Display connected wallet address and SOL balance

### Charts
- Recharts for the upgrade frequency graph
- Interactive tooltips, smooth animations
- Teal color scheme matching brand

### Data
- Mock data for all program information
- Realistic Solana program IDs and scores
- Static but convincing for grant demos

### Responsive Design
- Desktop-optimized layout (1280px+)
- Graceful degradation for tablet/mobile
- Key content remains accessible on smaller screens

---

## What's Coming Later (Phase 2)
- Enterprise Dashboard (Overview, API Keys, Webhooks, Reports, Billing)
- Alert Rules configuration
- Real backend integration with Supabase
- Actual on-chain data fetching

