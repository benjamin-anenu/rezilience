

# Fix Logo CORS Issues + Increase Watermark Size

## What Changes

1. **Replace all favicon URLs** with CORS-friendly GitHub organization avatar URLs that always load reliably
2. **Increase watermark size** from 64px to 96px for a more premium, visible effect

## Technical Details

**File: `src/data/solana-grants.ts`** -- Replace `logoUrl` values:

| Provider | Current (broken) | New (CORS-friendly) |
|---|---|---|
| Solana Foundation (x2) | `solana.org/favicon.ico` | `https://avatars.githubusercontent.com/u/35608259` |
| Superteam | `superteam.fun/favicon.ico` | `https://avatars.githubusercontent.com/u/102339943` |
| Colosseum | `colosseum.org/favicon.ico` | `https://avatars.githubusercontent.com/u/147508312` |
| Marinade Finance | `marinade.finance/favicon.ico` | `https://avatars.githubusercontent.com/u/81361879` |
| Jupiter | `jup.ag/favicon.ico` | `https://avatars.githubusercontent.com/u/92518539` |
| Merge Club | `merge.club/favicon.ico` | `https://avatars.githubusercontent.com/u/35608259` (Solana fallback) |

**File: `src/pages/Grants.tsx`** -- Update watermark `<img>` styling:

- Size: `h-16 w-16` to `h-24 w-24` (64px to 96px)
- Opacity stays at `opacity-[0.08]` (larger logos will already feel more present)

