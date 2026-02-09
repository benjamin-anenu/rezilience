

# Update Org-Only GitHub URLs for 23 Profiles

## Overview

23 profiles currently point to GitHub organization pages instead of specific repositories. This prevents dependency analysis from working. Each will be updated via SQL UPDATE statements to point to the correct main repository.

## URL Mapping

| # | Project | Current (org-only) | New (specific repo) | Notes |
|---|---------|-------------------|---------------------|-------|
| 1 | Arcium | github.com/arcium-hq | github.com/arcium-hq/elusiv | Elusiv Solana program library (Rust) |
| 2 | BlockMesh | github.com/block-mesh | github.com/block-mesh/block-mesh-monorepo | Main monorepo |
| 3 | Corbits | github.com/corbits-tech | *(keep as-is)* | No public repos found |
| 4 | Credix | github.com/credix-finance | github.com/credix-finance/credix-app-v2 | Archived but only public repo with code |
| 5 | deBridge | github.com/debridge-finance | github.com/debridge-finance/debridge-solana-sdk | Solana SDK |
| 6 | Dual Finance | github.com/dual-finance | github.com/Dual-Finance/staking-options | Core staking program (Rust, 6 stars) |
| 7 | Hubble Protocol | github.com/hubble-exchange | github.com/hubbleprotocol/hubble-common | Correct org is hubbleprotocol, not hubble-exchange |
| 8 | Lifinity V2 | github.com/Lifinity-Labs | github.com/Lifinity-Labs/flare-staking | Most active repo (TypeScript) |
| 9 | Magic Eden V2 | github.com/magiceden-oss | github.com/me-foundation/magicdrop | magiceden-oss has no public repos; me-foundation does |
| 10 | Magicblock Engine | github.com/magicblock-labs | github.com/magicblock-labs/Solana.Unity-SDK | Main SDK (highest stars) |
| 11 | Nosana | github.com/nosana-ci | github.com/nosana-ci/nosana-programs | Nosana Program Library (Rust) |
| 12 | OpenSOL | github.com/opensol-project | *(keep as-is)* | No public repos found under this org |
| 13 | Sanctum | github.com/sanctum-solana | github.com/igneous-labs/S | Sanctum's main code is under igneous-labs org |
| 14 | Solayer | github.com/solayer-labs | github.com/solayer-labs/solayer-pm | Project management / main public repo |
| 15 | Step Finance | github.com/step-finance | github.com/step-finance/step-staking | Core staking program (62 stars) |
| 16 | Supersize | github.com/supersize-gg | github.com/supersizegg/supersize-programs | Note: org is "supersizegg" not "supersize-gg" |
| 17 | Symmetry | github.com/symmetry-protocol | github.com/symmetry-protocol/baskets-ui | Main UI repo |
| 18 | Tensor Swap | github.com/tensor-foundation | github.com/tensor-foundation/tensorswap-sdk | Core SDK |
| 19 | Torque | github.com/torque-labs | github.com/torque-labs/torque-poc | Advertising protocol PoC |
| 20 | Tulip Protocol | github.com/sol-farm | github.com/sol-farm/tulipv2-sdk | Tulip V2 vaults SDK (Rust, 19 stars) |
| 21 | Txtx | github.com/txtx | github.com/txtx/txtx | Main repo: "Terraform for web3" |
| 22 | Urani | github.com/urani-labs | github.com/urani-trade/urani-swap-ts | Note: code is under urani-trade org |
| 23 | UXD Protocol | github.com/UXDProtocol | github.com/UXDProtocol/uxd-program | Core Solana program |

## Profiles Skipped (no valid repo found)

- **Corbits** - No public repositories found under corbits-tech
- **OpenSOL** - No public repositories found under opensol-project

These 2 will keep their current org-only URLs. The analyzer will now return a clear error message for them instead of silently failing.

## Implementation

Run 21 individual UPDATE statements against the `claimed_profiles` table using the data insertion tool (not migrations, since this is data, not schema).

## Expected Impact

- 21 profiles will gain dependency analysis capability
- Next time `refresh-all-profiles` runs or manual analysis is triggered, dependencies will populate
- 2 profiles (Corbits, OpenSOL) will remain without dependency data until valid repos are identified

