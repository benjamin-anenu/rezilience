

# Grant Card Provider Logo Watermarks

## What Changes

Each grant card will display the provider's logo as a **subtle, semi-transparent watermark** positioned in the **bottom-right corner** of the card. The logos will have low opacity (~10-15%) to create a premium watermark effect without distracting from card content.

## Approach

Since these are external brand logos, we will use each provider's publicly available favicon/logo URL (from their official websites) as the image source. This avoids needing to download and store assets locally.

## Technical Details

**File: `src/data/solana-grants.ts`**

1. Add a `logoUrl` field to the `SolanaGrant` interface
2. Add logo URLs for each provider:
   - Solana Foundation: `https://solana.org/favicon.ico`
   - Superteam: `https://superteam.fun/favicon.ico`
   - Colosseum: `https://www.colosseum.org/favicon.ico`
   - Marinade Finance: `https://marinade.finance/favicon.ico`
   - Jupiter: `https://www.jup.ag/favicon.ico`
   - Merge Club: `https://merge.club/favicon.ico`

**File: `src/pages/Grants.tsx`**

3. Add a `relative overflow-hidden` to the card wrapper div (line ~23)
4. Add an `<img>` element inside the card body, positioned with:
   - `absolute bottom-3 right-3` for bottom-right placement
   - `w-16 h-16` size (64px)
   - `opacity-[0.08]` for a subtle watermark effect
   - `pointer-events-none select-none` so it doesn't interfere with interactions
   - `grayscale` filter to keep it monochromatic and on-brand

