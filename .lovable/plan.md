

# Fix Timeout + Update Private Repo URLs

## Part 1: Update 6 Private Repo URLs

All 6 current URLs return 404 (private repos). Here are the verified public alternatives:

| Project | Current (private) | New (public) | Confidence |
|---|---|---|---|
| Jupiter Aggregator V6 | `jup-ag/jupiter-core` | `jup-ag/jupiter-quote-api-node` | High -- official Jupiter Quote API SDK, public with active development |
| Jupiter Limit Order V2 | `jup-ag/jupiter-limit-order` | *(keep as-is)* | N/A -- no public limit-order repo exists under jup-ag; all limit order repos are private |
| Jupiter Perpetuals | `jup-ag/perpetuals` | *(keep as-is)* | N/A -- no public perpetuals repo under jup-ag; `solana-labs/perpetuals` is archived and unrelated |
| Hxro Dexterity | `Hxro-Network/dexterity` | `Hxro-Network/dexterity-ts` | High -- public TypeScript SDK (3 stars), the `dexterity` core is private |
| Meteora Dynamic Pools | `MeteoraAg/meteora-pool-sdk` | `MeteoraAg/dlmm-sdk` | High -- 282 stars, Meteora's main public SDK, actively maintained |
| SPL Name Service | `solana-program/name-service` | `Bonfida/sns-sdk` | High -- official SNS SDK monorepo maintained by Bonfida (who run the Name Service) |

**4 URLs will be updated. 2 Jupiter repos (Limit Order, Perpetuals) have no public alternatives and will remain as-is.**

## Part 2: Fix Timeout with Batch Support

The current `refresh-all-profiles` function processes all 95 profiles sequentially with 2s delays between each. At ~10-15s per profile (4 API calls + wait), that's ~20+ minutes -- far beyond the edge function timeout.

**Solution**: Add `batch_size` and `offset` parameters so callers can paginate through profiles in manageable chunks.

### Changes to `refresh-all-profiles/index.ts`:

1. Accept `batch_size` (default: 10) and `offset` (default: 0) from request body
2. Apply `.range(offset, offset + batch_size - 1)` to the profile query
3. Return `next_offset` in the response so the caller knows where to continue
4. Reduce inter-profile delay from 2s to 1s (still respectful of rate limits)

### Example usage:

```text
POST /functions/v1/refresh-all-profiles
Body: { "batch_size": 10, "offset": 0 }
--> processes profiles 0-9, returns { next_offset: 10, has_more: true }

POST /functions/v1/refresh-all-profiles  
Body: { "batch_size": 10, "offset": 10 }
--> processes profiles 10-19, returns { next_offset: 20, has_more: true }

...and so on until has_more: false
```

This keeps each invocation well under the timeout limit (~2-3 minutes per batch of 10).

## Implementation Steps

1. Batch SQL UPDATE for the 4 private repo URLs
2. Modify `refresh-all-profiles` edge function to support `batch_size` and `offset`
3. Deploy and test with a small batch to verify it completes without timeout

