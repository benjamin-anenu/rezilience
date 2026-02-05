
# Add "My Bonds" Portfolio Page

## Overview
Add the "My Bonds" page to complete the staking user flow. This page allows users to manage their staked bonds, view yield earnings, and claim/unstake based on protocol health (Resilience Score must be >= 70 to claim yield).

---

## Features to Implement

### 1. My Bonds Page (`src/pages/MyBonds.tsx`)
A complete bond portfolio management dashboard featuring:

**Portfolio Overview (4 stat cards):**
- Total Staked SOL (sum across all bonds)
- Total Yield Earned (accumulated rewards)
- Claimable Now (yield available when score >= 70)
- Active Bonds count

**Smart Yield Claiming Logic:**
- "CLAIM YIELD" button enabled when Resilience Score >= 70
- "CLAIM LOCKED" button disabled when score < 70
- Red warning banner explains why claiming is blocked for low-score protocols

**Lockup Management:**
- Lock-up end date for each bond
- "UNSTAKE" button enabled only after lockup expires
- "LOCKED" button shows when still in lockup period

**Bonds Table with columns:**
- Program name (clickable to program detail)
- Program ID (truncated, monospace)
- Staked amount
- Lock-up end date
- Current Resilience Score (color-coded)
- Accumulated yield
- Estimated APY
- Action buttons (Claim/Unstake)

### 2. Navigation Update
Add "MY BONDS" link to the navigation bar between "STAKING" and wallet button

### 3. Staking Page Enhancement
Add "VIEW MY BONDS" button in the staking page header for easy navigation

---

## Technical Details

### Files to Create
1. **`src/pages/MyBonds.tsx`** - New portfolio page adapted to use existing UI components (Card, Button, Alert, Table) and Tailwind classes from the project's design system

### Files to Modify
1. **`src/App.tsx`** - Add route for `/my-bonds`
2. **`src/components/layout/Navigation.tsx`** - Add "MY BONDS" nav link
3. **`src/pages/Staking.tsx`** - Add "VIEW MY BONDS" button in header

### Mock Data
Three sample bonds with different states:
- Bond 1: Score 94 (can claim, locked for unstake)
- Bond 2: Score 91 (can claim, locked for unstake)  
- Bond 3: Score 65 (can't claim due to low score - demonstrates the enforcement mechanism)

### Design Consistency
- Use existing UI components: Card, Button, Alert, Badge, Table
- Match the Bloomberg Terminal aesthetic with existing Tailwind CSS variables
- Use `font-display` for headers, `font-mono` for data values
- Color-coded scores: `text-primary` (teal) for healthy >= 70, `text-destructive` (orange) for low < 70

---

## User Flow Diagram

```text
Explorer → Program Detail → "STAKE" button
                               ↓
                        Staking Page
                         ↓        ↑
            "VIEW MY BONDS"      "CREATE NEW BOND"
                         ↓        ↑
                      My Bonds Page
                         ↓
              Claim Yield (if score >= 70)
              Unstake (if lockup expired)
```

---

## Acceptance Criteria (User Story 4.2: Yield Distribution)

| Requirement | Implementation |
|------------|---------------|
| Contract calculates yield based on time-weighted stake | Mock data shows accumulated yield per bond |
| Claim function enables withdrawal only if Score > 70 | `canClaim` logic based on `currentScore >= 70` |
| Visual feedback on bond health | Color-coded scores + warning banners |
| Clear messaging on requirements | Info banner explains yield claiming rules |
