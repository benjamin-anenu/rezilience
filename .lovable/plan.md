

# Update README Page: Bytecode Verification & Helius RPC Infrastructure

## Summary
Add a new dedicated section to the /readme page documenting how Helius RPC powers the bytecode verification engine, covering the cryptographic verification pipeline, confidence tiers, and why a dedicated RPC matters for authenticity and performance.

## Changes

### 1. Add new TOC entry in `TableOfContents.tsx`
- Add `{ id: 'bytecode-verification', label: 'Bytecode Verification', level: 1 }` and two sub-items:
  - `{ id: 'helius-rpc', label: 'Helius RPC Infrastructure', level: 2 }`
  - `{ id: 'confidence-tiers', label: 'Confidence Tiers', level: 2 }`
- Place these between "Data Provenance" and "FAQ" in the TOC list

### 2. Add new section in `Readme.tsx`
Insert a new `<section id="bytecode-verification">` between the Data Provenance and FAQ sections, containing:

**Section Header:** "Bytecode Verification" with a Shield icon

**Card 1 -- How It Works (verification pipeline)**
- Overview paragraph explaining the purpose: independent cryptographic proof that deployed bytecode matches verified source code
- A numbered step flow:
  1. Fetch program account via Solana RPC to locate the `programData` address
  2. Extract the executable ELF binary (starting at offset 45 of the programData account)
  3. Compute SHA-256 hash of the trimmed executable bytes
  4. Cross-verify the hash against OtterSec's verified builds registry
  5. Detect forks by comparing the claimed GitHub repo against OtterSec's verified repo URL
  6. Track deploy slot to auto-detect program upgrades and trigger re-verification

**Card 2 -- Helius RPC Infrastructure (`id="helius-rpc"`)**
- Explain why a dedicated RPC endpoint is critical:
  - Program data accounts can be 1-5MB+ (too large for rate-limited public RPC)
  - Public Solana RPC (`api.mainnet-beta.solana.com`) has aggressive rate limits (e.g., 100 req/10s)
  - Batch profile refreshes can trigger dozens of `getAccountInfo` calls in parallel
- Helius benefits:
  - 100K+ requests/day capacity
  - Reliable retrieval of large account binaries
  - No rate-limiting during batch verification sweeps
  - Consistent latency for real-time verification on profile load
- Include a callout box noting this is a server-side integration (edge function only, no client exposure of API keys)

**Card 3 -- Confidence Tiers (`id="confidence-tiers"`)**
- A styled table showing the 5 confidence levels:
  - **HIGH** -- SHA-256 hash independently computed AND matches OtterSec's `on_chain_hash`, source repo matches claimed repo
  - **MEDIUM** -- OtterSec verified but independent hash computation was skipped/unavailable
  - **LOW** -- Program exists on-chain but not in OtterSec verified builds registry
  - **SUSPICIOUS** -- Hash mismatch between independent computation and OtterSec (possible tampering)
  - **NOT_DEPLOYED** -- Program not found on Solana mainnet
- A note on how confidence feeds into the Resilience Score: original code gets 1.0x multiplier, forks get 0.3x penalty

### 3. Update Data Provenance section
Add a new `DataSourceItem` for Helius RPC:
- **Name:** "Helius RPC (Solana)"
- **Description:** "Dedicated RPC for program account extraction and bytecode hash computation"
- **Refresh:** "On verification request + upgrade detection via slot tracking"

### 4. Add imports
- Add `Server` icon from lucide-react (for the Helius RPC card header) if needed, or reuse `Database`/`Shield`

## Technical Details
- All changes are in two files: `src/pages/Readme.tsx` and `src/components/readme/TableOfContents.tsx`
- No new components needed -- reuses existing `SectionHeader`, `Card`, `Badge`, and step/metric row patterns already in the page
- No backend changes required

