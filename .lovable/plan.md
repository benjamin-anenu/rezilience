

## Add 70+ Solana Engineering Terms to Dictionary

### What's Already Covered (skip these)
The dictionary already has solid entries for: PDAs, Seeds, Bump Seeds, CPI, Lamports, SOL, Rent, Account, Space, Discriminator, Instruction, Transaction, Blockhash, Versioned Transactions, ALTs, Compute Units, Priority Fees, Signer, Keypair, SPL Token, Token-2022, Mint, ATA, AMM, LP, TVL, Slippage, MEV, IDL, Anchor, NFT, cNFT, State Compression, Merkle Tree, RPC, Multisig, Governance, DAO, Program Authority, Stake, Devnet, Mainnet, WebSocket, Transfer Hook, Realms, Slot, Epoch, Validator, Impermanent Loss.

### Search Field
The dictionary page already has a working search bar. No changes needed here -- it already filters by term name, abbreviation, definition, and category.

### New Terms to Add (~70 entries)

Grouped by category:

**Accounts (8 new)**
- Account Ownership Rules
- Account Data Layout Design
- Zero-Copy Accounts
- Account Realloc Patterns
- Writable vs Readonly Accounts
- Account Locking and Parallel Execution
- Upgradeable Buffer Accounts
- Durable Nonce Accounts

**Transactions (10 new)**
- Transaction Size Limits (1232 bytes)
- Atomic Transaction Guarantees
- Transaction Simulation vs Execution
- Preflight Checks
- Partial Signing Transactions
- Offline Transaction Signing
- Transaction Landing Optimization
- Transaction Confirmation UX Design
- Failed Transaction Debugging Workflow
- Instruction Replay Safety

**Consensus (8 new)**
- Proof of History (PoH)
- Leader Schedule and Block Production
- Turbine Block Propagation
- Gulf Stream Transaction Forwarding
- QUIC Networking in Solana
- Replay Stage and Fork Choice
- Commitment Levels
- Forks and Rollback Handling

**Infrastructure (7 new)**
- Concurrent Merkle Trees
- Indexer Architecture
- Event Indexing from Logs
- RPC Rate Limiting Strategies
- RPC Consistency Guarantees
- Devnet vs Mainnet Behavioral Differences
- Sysvars

**Development (14 new)**
- System Program Responsibilities
- Upgradeable Program Loader Internals
- Borsh Serialization
- Anchor Account Validation Pipeline
- Anchor Constraint Macros
- Anchor Events vs Logs
- Program Logs and Debugging Strategy
- LiteSVM vs Local Validator Testing
- Test Validator Architecture
- BPF Execution Model
- LLVM to SBF Compilation Pipeline
- Program Deployment Lifecycle
- Compute Profiling Techniques
- Program Size Optimization

**Security (12 new)**
- Reentrancy in Solana
- Upgradeable Program Security Risks
- Replay Attack Prevention
- Signature Verification Flow
- Ed25519 Program Usage
- Secp256k1 Verification Program
- Compute Exhaustion Attacks
- Account Inflation Attacks
- Rent Draining Vectors
- CPI Depth Limits
- Stack Frame Limits
- Heap Allocation Constraints

**Tokens (3 new)**
- Mint Authority vs Freeze Authority
- Delegation Mechanics
- Metaplex Metadata Accounts

**NFTs (2 new)**
- Candy Machine Architecture
- On-Chain Randomness Limitations

**DeFi (4 new)**
- Oracle Design Patterns (Pyth/Switchboard)
- Escrow Design Patterns
- Jito Bundles and Block Engines
- Wallet Adapter Lifecycle

**Governance (1 new)**
- Time-Locked Accounts / Vesting Contracts

**Runtime (mapped to existing categories)**
- Sealevel Runtime Scheduling (Infrastructure)
- Optimistic Concurrency Model (Consensus)
- Deterministic Execution Constraints (Development)
- Serialization Cost vs Compute Tradeoffs (Development)
- Idempotent Instruction Design (Development)
- State Machine Modeling On-Chain (Development)
- Optimistic UI vs Finalized State (Development)
- State Migration Strategies (Development)
- Backward-Compatible Account Upgrades (Development)
- Deterministic Randomness Strategies (Security)
- Priority Fee Auctions (Transactions)
- MEV on Solana / Jito (already partially covered by MEV entry)

### Technical Implementation

**File: `src/data/dictionary.ts`**
- Add ~70 new `DictionaryEntry` objects to the `dictionary` array
- Each entry includes: id, term, abbreviation (where applicable), category, definition, whenToUse, example (code snippet), relatedTerms
- Cross-reference related terms between new and existing entries
- All entries use existing categories (no new categories needed)

### No other files need changes
- The dictionary page (`LibraryDictionary.tsx`) already has search, category filtering, and the timeline UI
- The `DictionaryEntryCard` component already handles expansion, code blocks, and "Ask GPT"
- The `searchDictionary` function already searches across term, abbreviation, definition, and category

