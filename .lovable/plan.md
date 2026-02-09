

# Restructure README: Registration vs. Claiming

## The Problem

The current README has three separate sections that blur the distinction between **registering a new project** and **claiming a pre-listed project**. The user wants:

1. **"How to Register"** -- Expanded to fully explain the off-chain GitHub verification (public URL analysis vs OAuth for private repos)
2. **"Authority Verification"** renamed to **"Claim a Project on Registry"** -- This is specifically for projects already listed in the registry (pre-seeded). It should cover BOTH on-chain (wallet authority handshake) AND off-chain (GitHub OAuth) claim paths
3. **Blacklist** applies to both claim paths

## What Changes

### Card 1: "How to Join the Registry" (EXPAND existing, lines ~410-450)

Expand the 5 steps to give more detail on the GitHub verification sub-paths in Step 2:

1. **Connect X Account** -- Authenticate via X (Twitter) OAuth 2.0 PKCE to establish builder identity
2. **Link GitHub Repository** -- Expanded into two clearly documented sub-paths:
   - **Public repo path**: Paste the URL, system runs instant server-side analysis (stars, forks, contributors, commit velocity, liveness). No GitHub login required. Enables "Direct Submit"
   - **Private repo path**: Click "Connect GitHub" to initiate OAuth handshake. System requests `read:user`, `read:org`, and `repo` scopes. Server-side token exchange fetches metrics securely. Org owners must grant the Resilience OAuth App access for org-owned repos
3. **Complete Profile** -- Description, category, team, social links, media
4. **Verify Authority (Optional)** -- For on-chain programs only; sign with program authority wallet
5. **Get Analyzed** -- System computes Resilience Score using the same formula (GitHub x Deps x Gov x TVL)

Add a callout box under Step 2 with the public vs private repo distinction and the org-level access note.

### Card 2: Rename "Authority Verification" to "Claim a Project on Registry" (lines ~452-552)

This section is for projects **already listed** in the registry (pre-seeded with metadata). Restructure to cover both claim paths:

**Intro paragraph**: Explain that the registry is pre-seeded with 166+ Solana protocols. When you claim one, the system pre-populates your registration with existing metadata. But to prevent unauthorized claims, verification is required.

**Two verification paths presented side by side or sequentially:**

**Path A: On-Chain Programs (has Program ID)**
- Steps 1-6 remain as-is (Connect Wallet, Eligibility Check, On-Chain Lookup, Authority Match, SIWS Signature, Profile Locked)
- Outcome: VERIFIED TITAN badge

**Path B: Off-Chain Projects (no Program ID)**
- Step 1: Connect X Account (establish identity)
- Step 2: Connect GitHub via OAuth -- system verifies the connected GitHub account owns or has admin access to the repository linked to the pre-seeded profile
- Step 3: Repository match confirmed -- GitHub username/org matches the repo owner
- Step 4: Profile claimed -- project transitions from "unclaimed" to "claimed" with an "Off-chain" badge
- Outcome: Claimed badge (no VERIFIED TITAN since there is no on-chain authority to verify)

**Callout box updates:**
- Off-chain claims require GitHub OAuth (cannot use public URL paste alone, since ownership must be proven)
- On-chain claims require the authority wallet
- Both paths are subject to the blacklist system

### Card 3: "Anti-Abuse: Claim Blacklist" (lines ~554-608)

Update the intro text to clarify it covers both on-chain and off-chain claim attempts. Minor text tweak only.

### Table of Contents Update

Rename the `authority-verification` entry label from "Authority Verification" to "Claim a Project" in `TableOfContents.tsx`. Add the `offchain-verification` entry is not needed since both paths live under the same card now.

## Files Modified

1. **`src/pages/Readme.tsx`**
   - Expand Step 2 in "How to Join the Registry" with public/private repo sub-paths and callout
   - Rename "Authority Verification (Ownership Handshake)" to "Claim a Project on Registry"
   - Add intro paragraph about pre-seeded registry
   - Add "Path B: Off-Chain Projects" section after the existing on-chain steps
   - Update blacklist intro text to mention both paths
   - Add `Globe` icon to imports

2. **`src/components/readme/TableOfContents.tsx`**
   - Rename `authority-verification` label from "Authority Verification" to "Claim a Project"

