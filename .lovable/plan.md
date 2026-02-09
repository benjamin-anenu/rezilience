

# Fix Table of Contents: List All Sub-Sections Under "For Solana Builders"

## Problem

The "For Solana Builders" section has 4 sub-sections in the actual page, but the Table of Contents only shows 2 of them. Also, "Claim Blacklist" is a misleading name -- it should just be "Blacklist".

## Current TOC (under For Solana Builders)
- Claim a Project (level 2)
- Claim Blacklist (level 2)

## New TOC (under For Solana Builders)
- Join the Registry (level 2)
- Claim a Project (level 2)
- Blacklist (level 2)
- Improve Continuity (level 2)

## Changes

### 1. `src/components/readme/TableOfContents.tsx`
- Add `{ id: 'join-registry', label: 'Join the Registry', level: 2 }` after the `for-builders` entry
- Rename `claim-blacklist` label from "Claim Blacklist" to "Blacklist"
- Add `{ id: 'improve-continuity', label: 'Improve Continuity', level: 2 }` after the blacklist entry

### 2. `src/pages/Readme.tsx`
- Add `id="join-registry"` and `className="scroll-mt-24"` to the "How to Join the Registry" card wrapper (currently has no id)
- Add `id="improve-continuity"` and `className="scroll-mt-24"` to the "How to Improve Continuity" card wrapper (currently has no id)
- Rename the "Anti-Abuse: Claim Blacklist" heading to "Anti-Abuse: Blacklist"

### Files Modified
1. `src/components/readme/TableOfContents.tsx` -- Add 2 new TOC entries, rename 1
2. `src/pages/Readme.tsx` -- Add 2 section IDs, rename blacklist heading
