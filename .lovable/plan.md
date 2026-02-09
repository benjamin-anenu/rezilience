

# Add "Claiming & Verification" Documentation to README

## Location

Inside the existing **"For Solana Builders"** section (`id="for-builders"`), between the current "How to Join the Registry" steps card and the "How to Improve Continuity" accordion card. This is the natural home because:
- It's already where builders learn about joining the registry
- The existing 5 steps are a high-level overview; this new section provides the deep-dive on the most critical step (authority verification)
- It flows logically: Join -> Verify -> Improve

## New Content: Two New Cards

### Card 1: "Authority Verification (Ownership Handshake)"
A detailed walkthrough of the cryptographic verification process, structured as a visual step-by-step flow:

1. **Connect Wallet** -- Connect the Solana wallet that holds the program's upgrade authority
2. **Eligibility Check** -- System checks if the wallet has been blacklisted from claiming this project
3. **On-Chain Authority Lookup** -- Fetches the program's `upgradeAuthority` from Solana RPC via the `programData` account
4. **Authority Match** -- Three possible outcomes:
   - **Direct Match** -- Wallet IS the upgrade authority (proceed to signing)
   - **Multisig Detected** -- Authority is a Squads multisig; user can verify as a member or open Squads dashboard
   - **Mismatch** -- Wallet does NOT match; failed attempt is recorded
5. **SIWS Signature** -- Sign a structured "Resilience Registry Claim" message (no on-chain transaction) to cryptographically prove ownership
6. **Profile Locked** -- Authority wallet is permanently associated with the profile

Also includes a callout box explaining:
- Immutable programs (no upgrade authority) cannot be claimed via this flow
- Multisig support covers Squads v3 and v4
- The signature does NOT authorize any blockchain transaction

### Card 2: "Anti-Abuse: Claim Blacklist"
Documents the security system that prevents unauthorized claims:

- Every failed authority verification is recorded (wallet + project pair)
- After **3 failed attempts**: Warning displayed showing remaining attempts
- After **5 failed attempts**: Wallet is **permanently blocked** from claiming that specific project
- Blacklist is per-project, per-wallet (not global)
- Legitimate owners who are blocked can contact support with proof of ownership

Includes a visual escalation table:

| Attempts | System Response |
|----------|----------------|
| 1-2 | Silent tracking |
| 3-4 | Warning: "X attempts remaining" |
| 5+ | Permanent ban for this project |

## Table of Contents Update

Add two new sub-items under "For Solana Builders" in `TableOfContents.tsx`:
- `{ id: 'authority-verification', label: 'Authority Verification', level: 2 }`
- `{ id: 'claim-blacklist', label: 'Claim Blacklist', level: 2 }`

## Screenshots

Unfortunately, I cannot take screenshots and embed them as static images in the README page. However, since this is a live app, I will instead include a prominent CTA button linking directly to `/claim-profile` so readers can experience the flow themselves.

## Files Modified

1. **`src/pages/Readme.tsx`** -- Add two new cards inside the `for-builders` section (between lines ~445 and ~448)
2. **`src/components/readme/TableOfContents.tsx`** -- Add 2 new TOC entries after the "For Solana Builders" item
3. **`src/pages/Readme.tsx`** -- Add `Shield`, `Ban`, `KeyRound`, `Wallet` to the icon imports (some may already be imported)

