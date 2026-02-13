export type DocsCategory = 'RPC & Data' | 'DeFi' | 'Wallets' | 'NFTs' | 'Dev Tools' | 'MEV' | 'Oracles' | 'Automation' | 'Marketplaces' | 'Messaging' | 'Infrastructure' | 'Cross-Chain';

export interface DocSection {
  title: string;
  description: string;
  url: string;
  content: string;
}

export interface SolanaService {
  name: string;
  slug: string;
  logoUrl: string;
  docsUrl: string;
  description: string;
  category: DocsCategory;
  tags: string[];
  sections: DocSection[];
}

export const docsCategories: DocsCategory[] = [
  'RPC & Data', 'DeFi', 'Dev Tools', 'Wallets', 'NFTs', 'MEV', 'Oracles', 'Automation', 'Marketplaces', 'Messaging', 'Infrastructure', 'Cross-Chain',
];

export const solanaServices: SolanaService[] = [
  {
    name: 'Helius',
    slug: 'helius',
    logoUrl: 'https://docs.helius.dev/img/helius-logo.png',
    docsUrl: 'https://docs.helius.dev',
    description: 'Enterprise-grade RPC infrastructure, DAS API for compressed NFTs, webhooks, and enhanced transaction APIs.',
    category: 'RPC & Data',
    tags: ['rpc', 'das', 'webhooks', 'enhanced transactions', 'priority fees'],
    sections: [
      {
        title: 'RPC Nodes',
        description: 'Dedicated and shared Solana RPC endpoints with rate limiting and analytics.',
        url: 'https://docs.helius.dev/solana-rpc-nodes/solana-rpc-nodes',
        content: `## RPC Nodes

Helius provides dedicated and shared Solana RPC endpoints optimized for performance and reliability.

### Quick Start

\`\`\`typescript
import { Connection } from '@solana/web3.js';

const connection = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY'
);

const balance = await connection.getBalance(publicKey);
\`\`\`

### Endpoint Types

| Type | Use Case | Rate Limit |
|------|----------|------------|
| **Shared** | Development, low-traffic apps | 50 RPS |
| **Dedicated** | Production, high-traffic apps | Custom |

### Key Features
- **Global Load Balancing** — Requests routed to nearest data center
- **Analytics Dashboard** — Monitor RPS, latency, and error rates
- **Staked Connections** — Priority access during network congestion
- **WebSocket Support** — Real-time account and program subscriptions

### Supported Networks
- Mainnet-Beta, Devnet, and custom endpoints

> **Tip:** Use staked connections for transaction-heavy applications to improve landing rates during congestion.`
      },
      {
        title: 'DAS API',
        description: 'Digital Asset Standard API for querying compressed NFTs, token metadata, and ownership.',
        url: 'https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api',
        content: `## DAS API (Digital Asset Standard)

The DAS API provides a unified interface for querying all digital assets on Solana — regular NFTs, compressed NFTs (cNFTs), and fungible tokens.

### Quick Start

\`\`\`typescript
const response = await fetch('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 'my-id',
    method: 'getAssetsByOwner',
    params: {
      ownerAddress: 'WALLET_ADDRESS',
      page: 1,
      limit: 100
    }
  })
});
\`\`\`

### Core Methods

| Method | Description |
|--------|-------------|
| \`getAsset\` | Fetch a single asset by its ID |
| \`getAssetsByOwner\` | All assets owned by a wallet |
| \`getAssetsByGroup\` | Assets in a collection |
| \`getAssetsByCreator\` | Assets by creator address |
| \`searchAssets\` | Full-text search across metadata |

### Key Features
- **Compressed NFT support** — Query cNFTs without Merkle tree complexity
- **Pagination** — Efficient cursor-based pagination for large collections
- **Fungible token metadata** — Includes token logos, symbols, and prices

> **Note:** DAS is the recommended way to query NFTs on Solana, replacing legacy \`getProgramAccounts\` calls.`
      },
      {
        title: 'Webhooks',
        description: 'Real-time event streaming for on-chain activity — account changes, transactions, and program events.',
        url: 'https://docs.helius.dev/webhooks-and-websockets/webhooks',
        content: `## Webhooks

Helius webhooks deliver real-time notifications for on-chain events to your HTTP endpoint.

### Setup

\`\`\`typescript
const webhook = await fetch('https://api.helius.xyz/v0/webhooks?api-key=YOUR_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    webhookURL: 'https://your-server.com/webhook',
    transactionTypes: ['NFT_SALE', 'TOKEN_TRANSFER'],
    accountAddresses: ['ADDRESS_TO_MONITOR'],
    webhookType: 'enhanced'
  })
});
\`\`\`

### Webhook Types

| Type | Description |
|------|-------------|
| **Enhanced** | Human-readable parsed transaction data |
| **Raw** | Full transaction data in Solana's native format |
| **Discord** | Pre-formatted messages sent directly to Discord channels |

### Supported Transaction Types
- \`NFT_SALE\`, \`NFT_LISTING\`, \`NFT_MINT\`
- \`TOKEN_TRANSFER\`, \`SWAP\`, \`BURN\`
- \`STAKE_SOL\`, \`UNSTAKE_SOL\`
- And 100+ more types

### Key Features
- **Automatic retries** with exponential backoff
- **Filter by address, type, or program**
- **Enhanced parsing** — Get human-readable descriptions
- **Webhook management API** — Create, update, and delete programmatically

> **Tip:** Use "enhanced" type for most use cases — it saves you from parsing raw transaction data.`
      },
      {
        title: 'Enhanced Transactions',
        description: 'Human-readable transaction parsing with enriched metadata and type classification.',
        url: 'https://docs.helius.dev/solana-apis/enhanced-transactions-api',
        content: `## Enhanced Transactions API

Parse raw Solana transactions into human-readable, enriched formats with type classification and metadata.

### Quick Start

\`\`\`typescript
const response = await fetch(
  'https://api.helius.xyz/v0/transactions/?api-key=YOUR_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transactions: ['TRANSACTION_SIGNATURE']
    })
  }
);

const parsed = await response.json();
// Returns: type, description, fee, accounts involved, token transfers, etc.
\`\`\`

### Response Structure
- **type** — Classification (e.g., \`NFT_SALE\`, \`SWAP\`, \`TRANSFER\`)
- **description** — Human-readable summary
- **fee** / **feePayer** — Transaction costs
- **nativeTransfers** — SOL movements
- **tokenTransfers** — SPL token movements with metadata
- **events** — Structured event data (NFT sales, swaps, etc.)

### Use Cases
- **Portfolio trackers** — Parse all wallet activity into readable history
- **Analytics dashboards** — Classify and aggregate transaction types
- **Notification systems** — Generate alerts based on transaction types

> **Note:** Supports batch parsing of up to 100 transactions per request.`
      },
      {
        title: 'Priority Fee API',
        description: 'Estimate optimal priority fees for transaction landing.',
        url: 'https://docs.helius.dev/solana-apis/priority-fee-api',
        content: `## Priority Fee API

Estimate optimal priority fees to maximize transaction landing rates during network congestion.

### Quick Start

\`\`\`typescript
const response = await fetch('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: '1',
    method: 'getPriorityFeeEstimate',
    params: [{
      accountKeys: ['PROGRAM_ID'],
      options: { priorityLevel: 'High' }
    }]
  })
});
\`\`\`

### Priority Levels

| Level | Percentile | Use Case |
|-------|-----------|----------|
| **Min** | 0th | Non-urgent transactions |
| **Low** | 25th | Standard operations |
| **Medium** | 50th | Default recommended |
| **High** | 75th | Time-sensitive txns |
| **VeryHigh** | 95th | Critical/competitive |
| **UnsafeMax** | 100th | Absolute priority |

### Key Concepts
- Fees are estimated per **compute unit** (microlamports)
- Estimates are based on **recent slot data** for the specified accounts
- Use \`evaluateEmptySlotAsZero: true\` for more conservative estimates

> **Tip:** For most applications, "Medium" provides a good balance between cost and landing probability.`
      },
    ],
  },
  {
    name: 'Jupiter',
    slug: 'jupiter',
    logoUrl: 'https://station.jup.ag/img/jupiter-logo.svg',
    docsUrl: 'https://station.jup.ag/docs',
    description: 'Solana\'s leading DEX aggregator — swap, limit orders, DCA, and perpetual futures.',
    category: 'DeFi',
    tags: ['swap', 'dex', 'limit orders', 'dca', 'perpetuals', 'aggregator'],
    sections: [
      {
        title: 'Swap API',
        description: 'Get the best swap routes across all Solana DEXs with a single API call.',
        url: 'https://station.jup.ag/docs/apis/swap-api',
        content: `## Swap API

Jupiter aggregates liquidity across all Solana DEXs to find the best swap route for any token pair.

### Quick Start

\`\`\`typescript
// Step 1: Get a quote
const quoteResponse = await fetch(
  'https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
    inputMint: 'So11111111111111111111111111111111111111112', // SOL
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    amount: '100000000', // 0.1 SOL in lamports
    slippageBps: '50' // 0.5%
  })
);
const quote = await quoteResponse.json();

// Step 2: Get the swap transaction
const swapResponse = await fetch('https://quote-api.jup.ag/v6/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quoteResponse: quote,
    userPublicKey: wallet.publicKey.toString()
  })
});
const { swapTransaction } = await swapResponse.json();
\`\`\`

### Key Parameters
- **slippageBps** — Max slippage tolerance in basis points (50 = 0.5%)
- **onlyDirectRoutes** — Skip multi-hop routes for simpler execution
- **asLegacyTransaction** — Use legacy format instead of versioned transactions

### Features
- Routes across **20+ DEXs** simultaneously
- **Split routes** for large orders to minimize price impact
- **Auto-retry** and fee optimization built in

> **Note:** Always use versioned transactions for better instruction limits and address lookup tables.`
      },
      {
        title: 'Limit Orders',
        description: 'Place on-chain limit orders with automatic execution when price targets are met.',
        url: 'https://station.jup.ag/docs/limit-order',
        content: `## Limit Orders

Place on-chain limit orders that execute automatically when your target price is reached. Orders are filled by Jupiter's keeper network.

### Quick Start

\`\`\`typescript
import { LimitOrderProvider } from '@jup-ag/limit-order-sdk';

const limitOrder = new LimitOrderProvider(connection);

const { tx } = await limitOrder.createOrder({
  owner: wallet.publicKey,
  inAmount: new BN(1_000_000), // 1 USDC
  outAmount: new BN(50_000_000), // 0.05 SOL
  inputMint: USDC_MINT,
  outputMint: SOL_MINT,
  expiredAt: null // No expiry
});
\`\`\`

### Key Features
- **No gas fees** until the order executes
- **Partial fills** — Orders can be filled incrementally
- **Expiry options** — Set time-based expiration or keep open indefinitely
- **Cancel anytime** — Reclaim your tokens before execution

### How It Works
1. You deposit tokens into the limit order program
2. Jupiter keepers monitor prices across all DEXs
3. When target price is met, keepers execute the swap
4. You receive output tokens directly to your wallet

> **Tip:** Limit orders are ideal for accumulating tokens at specific price levels without constant monitoring.`
      },
      {
        title: 'DCA (Dollar Cost Average)',
        description: 'Automate periodic token purchases at regular intervals.',
        url: 'https://station.jup.ag/docs/dca',
        content: `## DCA (Dollar Cost Average)

Automate periodic token purchases at configurable intervals. Jupiter's DCA splits your total amount across multiple swaps to reduce price impact and average your entry.

### Quick Start

\`\`\`typescript
import { DCA } from '@jup-ag/dca-sdk';

const dca = new DCA(connection, wallet);

const { tx } = await dca.createDCA({
  payer: wallet.publicKey,
  inputMint: USDC_MINT,
  outputMint: SOL_MINT,
  inAmount: new BN(100_000_000), // 100 USDC total
  inAmountPerCycle: new BN(10_000_000), // 10 USDC per cycle
  cycleFrequency: new BN(86400), // Every 24 hours
  minOutAmount: null, // No minimum
  maxOutAmount: null  // No maximum
});
\`\`\`

### Parameters
- **inAmount** — Total amount to DCA
- **inAmountPerCycle** — Amount per swap
- **cycleFrequency** — Seconds between each swap
- **minOutAmount / maxOutAmount** — Optional price bounds

### Key Features
- **Automated execution** by Jupiter keepers
- **Customizable frequency** — Minutes to months
- **Price bounds** — Skip swaps outside your range
- **Withdraw anytime** — Cancel and reclaim remaining funds

> **Note:** DCA orders use Jupiter's aggregation for best prices on each individual swap.`
      },
      {
        title: 'Perpetuals',
        description: 'Leverage trading on Solana with up to 100x leverage on major pairs.',
        url: 'https://station.jup.ag/docs/perpetual-exchange',
        content: `## Perpetuals

Jupiter Perpetuals offers leveraged trading on Solana with up to 100x leverage on SOL, ETH, and BTC pairs.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Long/Short** | Bet on price going up or down |
| **Leverage** | Multiply exposure (1x–100x) |
| **Collateral** | SOL, USDC, or USDT as margin |
| **Funding Rate** | Periodic payment between longs and shorts |
| **Liquidation** | Position closed when losses approach collateral |

### Architecture
- Uses a **JLP (Jupiter Liquidity Pool)** as counterparty
- Oracle-based pricing from **Pyth** — no order book needed
- **Zero price impact** for trades under pool capacity

### JLP (Liquidity Provider)
\`\`\`
JLP Pool = SOL + ETH + BTC + USDC + USDT
Yield = Trading fees + Borrowing fees + Liquidation fees
\`\`\`

### Key Features
- **Market and limit orders** for opening positions
- **Stop-loss and take-profit** orders
- **No sign-up required** — Trade directly from your wallet
- **Low fees** compared to centralized exchanges

> **Important:** Leverage trading carries significant risk. Start with low leverage and small positions.`
      },
      {
        title: 'Payments API',
        description: 'Accept any SPL token and receive your preferred output token.',
        url: 'https://station.jup.ag/docs/apis/payments-api',
        content: `## Payments API

Accept payments in any SPL token and automatically receive your preferred token (e.g., USDC). Jupiter handles the swap behind the scenes.

### Quick Start

\`\`\`typescript
// User pays with any token, merchant receives USDC
const quoteResponse = await fetch(
  'https://quote-api.jup.ag/v6/quote?' + new URLSearchParams({
    inputMint: userTokenMint,
    outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    amount: requiredUsdcAmount.toString(),
    swapMode: 'ExactOut' // Guarantees exact output amount
  })
);
\`\`\`

### Key Concepts
- **ExactOut mode** — Specify the exact amount you want to receive
- **ExactIn mode** — Specify the exact amount the user pays
- **Any token accepted** — Users pay with whatever they hold

### Use Cases
- **E-commerce** — Accept crypto payments, receive stablecoins
- **Subscriptions** — Users pay in their preferred token
- **Donations** — Accept any SPL token, auto-convert

> **Tip:** Use ExactOut mode for invoicing to guarantee you receive the exact amount regardless of which token the user pays with.`
      },
    ],
  },
  {
    name: 'Metaplex',
    slug: 'metaplex',
    logoUrl: 'https://developers.metaplex.com/assets/metaplex-logo.png',
    docsUrl: 'https://developers.metaplex.com',
    description: 'The NFT standard on Solana — token metadata, compressed NFTs, candy machines, and the Umi SDK.',
    category: 'NFTs',
    tags: ['nft', 'metadata', 'cnft', 'candy machine', 'umi', 'bubblegum'],
    sections: [
      {
        title: 'Token Metadata',
        description: 'The standard for attaching metadata to fungible and non-fungible tokens on Solana.',
        url: 'https://developers.metaplex.com/token-metadata',
        content: `## Token Metadata

The Token Metadata program is the standard for attaching rich metadata (name, symbol, image, attributes) to any SPL token on Solana.

### Create an NFT with Umi

\`\`\`typescript
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const mint = generateSigner(umi);

await createNft(umi, {
  mint,
  name: 'My NFT',
  symbol: 'MNFT',
  uri: 'https://arweave.net/metadata.json',
  sellerFeeBasisPoints: percentAmount(5.5), // 5.5% royalty
}).sendAndConfirm(umi);
\`\`\`

### Metadata Structure
- **name** — Display name of the token
- **symbol** — Short ticker symbol
- **uri** — Link to off-chain JSON metadata (image, attributes, etc.)
- **sellerFeeBasisPoints** — Royalty percentage on secondary sales
- **creators** — Array of creator addresses with share percentages

### Token Standards
| Standard | Description |
|----------|-------------|
| **NonFungible** | Classic 1-of-1 NFTs |
| **FungibleAsset** | Semi-fungible (editions) |
| **Fungible** | Standard SPL tokens with metadata |
| **ProgrammableNonFungible** | NFTs with enforced royalties |

> **Note:** Use ProgrammableNonFungible for new collections to enforce royalties on all marketplaces.`
      },
      {
        title: 'Bubblegum (cNFTs)',
        description: 'Create and manage compressed NFTs at scale using state compression.',
        url: 'https://developers.metaplex.com/bubblegum',
        content: `## Bubblegum (Compressed NFTs)

Bubblegum enables minting millions of NFTs at a fraction of the cost using Solana's state compression (Merkle trees).

### Cost Comparison

| Collection Size | Regular NFTs | Compressed NFTs |
|----------------|-------------|-----------------|
| 1,000 | ~$2,000 | ~$5 |
| 100,000 | ~$200,000 | ~$50 |
| 1,000,000 | ~$2,000,000 | ~$500 |

### Mint a cNFT

\`\`\`typescript
import { mintV1 } from '@metaplex-foundation/mpl-bubblegum';

await mintV1(umi, {
  leafOwner: recipientPublicKey,
  merkleTree: treePublicKey,
  metadata: {
    name: 'Compressed NFT #1',
    uri: 'https://arweave.net/metadata.json',
    sellerFeeBasisPoints: 500,
    collection: { key: collectionMint, verified: false },
    creators: [{ address: umi.identity.publicKey, verified: false, share: 100 }]
  }
}).sendAndConfirm(umi);
\`\`\`

### Key Concepts
- **Merkle Tree** — Must be created first; tree size determines max capacity
- **Proof** — Needed for transfers and burns (fetched via DAS API)
- **DAS API** — Required to query cNFT ownership and metadata (Helius, Triton, etc.)

> **Important:** Choose tree depth carefully — a depth of 20 supports ~1M NFTs but costs more to create than depth 14 (~16K NFTs).`
      },
      {
        title: 'Candy Machine',
        description: 'Configurable minting program with guards for allowlists, payments, and gating.',
        url: 'https://developers.metaplex.com/candy-machine',
        content: `## Candy Machine

A fully configurable NFT minting program with pluggable "guards" for access control, payments, and minting logic.

### Create a Candy Machine

\`\`\`typescript
import { create } from '@metaplex-foundation/mpl-candy-machine';

await create(umi, {
  candyMachine: generateSigner(umi),
  collectionMint: collectionAddress,
  collectionUpdateAuthority: umi.identity,
  itemsAvailable: 10000,
  guards: {
    solPayment: { lamports: sol(0.5), destination: treasury },
    startDate: { date: dateTime('2024-01-01T00:00:00Z') },
    mintLimit: { id: 1, limit: 3 }
  }
}).sendAndConfirm(umi);
\`\`\`

### Popular Guards

| Guard | Description |
|-------|-------------|
| **solPayment** | Require SOL payment to mint |
| **tokenPayment** | Require SPL token payment |
| **startDate / endDate** | Time-based minting windows |
| **mintLimit** | Max mints per wallet |
| **allowList** | Merkle-based allowlist (whitelist) |
| **nftGate** | Require NFT ownership to mint |
| **freezeSolPayment** | Lock SOL until a thaw event |

### Key Features
- **Guard groups** — Different rules for different phases (e.g., WL vs public)
- **Hidden settings** — Reveal metadata after mint (for mystery boxes)
- **Bot protection** — Built-in anti-bot measures

> **Tip:** Use guard groups to create multi-phase mints (allowlist → public) in a single Candy Machine.`
      },
      {
        title: 'Umi SDK',
        description: 'Modular TypeScript framework for interacting with Metaplex programs.',
        url: 'https://developers.metaplex.com/umi',
        content: `## Umi SDK

Umi is a modular TypeScript framework that provides a unified interface for interacting with all Metaplex programs.

### Setup

\`\`\`typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';

const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(mplTokenMetadata())
  .use(walletAdapterIdentity(wallet));
\`\`\`

### Core Concepts

| Concept | Description |
|---------|-------------|
| **Umi Instance** | Central context object (RPC, identity, programs) |
| **Identity** | The signer (wallet adapter, keypair, etc.) |
| **Plugins** | Register programs (Token Metadata, Bubblegum, etc.) |
| **Signers** | \`generateSigner(umi)\` for creating new accounts |
| **Public Keys** | \`publicKey('...')\` to wrap address strings |

### Key Features
- **Plugin system** — Add only the programs you need
- **Serialization** — Built-in account and instruction serialization
- **Transaction builders** — Chain multiple instructions with \`.add()\`
- **Mock testing** — \`createUmi()\` with mock plugins for unit tests

> **Note:** Umi replaces the older \`@metaplex-foundation/js\` SDK. All new development should use Umi.`
      },
      {
        title: 'Core',
        description: 'Next-generation NFT standard with plugins for royalties, freezing, and attributes.',
        url: 'https://developers.metaplex.com/core',
        content: `## Core (Next-Gen NFT Standard)

Metaplex Core is a new NFT standard that replaces Token Metadata with a simpler, cheaper, and more flexible design using a plugin architecture.

### Create a Core NFT

\`\`\`typescript
import { createV1 } from '@metaplex-foundation/mpl-core';

await createV1(umi, {
  asset: generateSigner(umi),
  name: 'Core NFT',
  uri: 'https://arweave.net/metadata.json',
  plugins: [
    { type: 'Royalties', basisPoints: 500, creators: [...], ruleSet: 'None' },
    { type: 'FreezeDelegate', frozen: false },
    { type: 'Attributes', attributeList: [{ key: 'level', value: '5' }] }
  ]
}).sendAndConfirm(umi);
\`\`\`

### Advantages Over Token Metadata
- **Single account** — No separate metadata or edition accounts
- **~80% cheaper** to mint and transfer
- **Plugin system** — Royalties, freeze, burn, attributes as composable plugins
- **Collection-level plugins** — Apply rules to entire collections
- **No token account needed** — Asset ownership tracked in the asset account

### Available Plugins
- **Royalties** — Enforce creator royalties
- **FreezeDelegate** — Lock/unlock transfers
- **Attributes** — On-chain key-value metadata
- **BurnDelegate** — Allow delegated burning
- **TransferDelegate** — Allow delegated transfers
- **UpdateDelegate** — Allow delegated metadata updates

> **Tip:** Core is recommended for all new NFT projects. It's simpler, cheaper, and more flexible than Token Metadata + Editions.`
      },
    ],
  },
  {
    name: 'Anchor',
    slug: 'anchor',
    logoUrl: 'https://www.anchor-lang.com/logo.png',
    docsUrl: 'https://www.anchor-lang.com/docs',
    description: 'The most popular Solana development framework — write, test, and deploy programs in Rust with less boilerplate.',
    category: 'Dev Tools',
    tags: ['framework', 'rust', 'idl', 'testing', 'cli', 'program'],
    sections: [
      {
        title: 'Getting Started',
        description: 'Install Anchor, scaffold a project, and deploy your first program.',
        url: 'https://www.anchor-lang.com/docs/getting-started',
        content: `## Getting Started with Anchor

Anchor is the most popular framework for building Solana programs in Rust.

### Installation

\`\`\`bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install latest
avm use latest

# Verify installation
anchor --version
\`\`\`

### Create a New Project

\`\`\`bash
anchor init my-project
cd my-project
\`\`\`

### Project Structure
\`\`\`
my-project/
├── programs/my-project/src/lib.rs  # Program code
├── tests/my-project.ts             # Integration tests
├── Anchor.toml                     # Configuration
├── migrations/deploy.ts            # Deploy script
└── target/                         # Build artifacts
\`\`\`

### Build & Deploy

\`\`\`bash
anchor build                    # Compile the program
anchor test                     # Run tests on localnet
anchor deploy                   # Deploy to configured cluster
solana config set --url devnet  # Switch to devnet
anchor deploy                   # Deploy to devnet
\`\`\`

### Prerequisites
- **Rust** — Install via rustup.rs
- **Solana CLI** — \`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"\`
- **Node.js** — v16+ for testing

> **Tip:** Use \`anchor test --skip-local-validator\` to test against an already-running validator.`
      },
      {
        title: 'Program Structure',
        description: 'Understand accounts, instructions, context, and error handling in Anchor.',
        url: 'https://www.anchor-lang.com/docs/the-program-module',
        content: `## Program Structure

Anchor programs are structured around three core concepts: instructions, accounts, and state.

### Basic Program

\`\`\`rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.data = data;
        account.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 8)]
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MyAccount {
    pub authority: Pubkey,
    pub data: u64,
}
\`\`\`

### Key Concepts

| Concept | Description |
|---------|-------------|
| **\`#[program]\`** | Module containing instruction handlers |
| **\`Context<T>\`** | Provides validated accounts to each instruction |
| **\`#[derive(Accounts)]\`** | Defines and validates account constraints |
| **\`#[account]\`** | Defines serializable on-chain data structures |
| **\`Signer\`** | Verifies the account signed the transaction |
| **\`#[account(init)]\`** | Creates and initializes a new account |

### Space Calculation
\`\`\`
space = 8 (discriminator) + field sizes
Pubkey = 32 bytes, u64 = 8, bool = 1, String = 4 + len
\`\`\`

> **Important:** Always include the 8-byte discriminator in your space calculation.`
      },
      {
        title: 'IDL (Interface Definition)',
        description: 'Auto-generated interface definitions for client-side program interaction.',
        url: 'https://www.anchor-lang.com/docs/idl',
        content: `## IDL (Interface Definition Language)

Anchor auto-generates an IDL (JSON schema) from your Rust program, enabling type-safe client interaction.

### Generated IDL
After \`anchor build\`, find the IDL at \`target/idl/my_program.json\`:

\`\`\`json
{
  "version": "0.1.0",
  "name": "my_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        { "name": "myAccount", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true }
      ],
      "args": [{ "name": "data", "type": "u64" }]
    }
  ],
  "accounts": [
    {
      "name": "MyAccount",
      "type": { "kind": "struct", "fields": [...] }
    }
  ]
}
\`\`\`

### Client Usage

\`\`\`typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import idl from './idl/my_program.json';

const program = new Program(idl, provider);

// Call instructions with full type safety
await program.methods
  .initialize(new BN(42))
  .accounts({ myAccount, authority: wallet.publicKey })
  .rpc();

// Fetch accounts
const account = await program.account.myAccount.fetch(myAccount);
\`\`\`

### Key Features
- **Type-safe clients** auto-generated from IDL
- **Account fetching** with automatic deserialization
- **Event parsing** for program logs
- **Publish on-chain** with \`anchor idl init\` for verification

> **Tip:** Use \`anchor idl upgrade\` to update the on-chain IDL after program upgrades.`
      },
      {
        title: 'Testing',
        description: 'Write TypeScript integration tests using Anchor\'s testing framework.',
        url: 'https://www.anchor-lang.com/docs/testing',
        content: `## Testing

Anchor provides a built-in testing framework using Mocha and a local validator.

### Basic Test

\`\`\`typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { MyProgram } from '../target/types/my_program';
import { expect } from 'chai';

describe('my_program', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it('initializes an account', async () => {
    const myAccount = anchor.web3.Keypair.generate();

    await program.methods
      .initialize(new anchor.BN(42))
      .accounts({
        myAccount: myAccount.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([myAccount])
      .rpc();

    const account = await program.account.myAccount.fetch(myAccount.publicKey);
    expect(account.data.toNumber()).to.equal(42);
  });
});
\`\`\`

### Running Tests
\`\`\`bash
anchor test                          # Starts local validator + runs tests
anchor test --skip-local-validator   # Use existing validator
anchor test --detach                 # Keep validator running after tests
\`\`\`

### Testing Patterns
- **Error testing** — Use \`try/catch\` with \`AnchorError\` to verify error codes
- **PDA testing** — Derive PDAs with \`PublicKey.findProgramAddressSync\`
- **Time manipulation** — Use \`provider.connection.requestAirdrop\` for funding test accounts

> **Tip:** Generate TypeScript types with \`anchor build\` — they're in \`target/types/\`.`
      },
      {
        title: 'CLI Reference',
        description: 'Build, deploy, verify, and manage programs from the command line.',
        url: 'https://www.anchor-lang.com/docs/cli',
        content: `## CLI Reference

The Anchor CLI provides commands for the complete program development lifecycle.

### Essential Commands

| Command | Description |
|---------|-------------|
| \`anchor init <name>\` | Create a new project |
| \`anchor build\` | Compile programs and generate IDL |
| \`anchor test\` | Build, start validator, run tests |
| \`anchor deploy\` | Deploy to configured cluster |
| \`anchor verify <program-id>\` | Verify on-chain bytecode matches source |
| \`anchor idl init\` | Publish IDL on-chain |
| \`anchor idl upgrade\` | Update on-chain IDL |
| \`anchor keys list\` | Show program keypair addresses |
| \`anchor keys sync\` | Sync program IDs in source code |

### Anchor.toml Configuration

\`\`\`toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
my_program = "PROGRAM_ID_HERE"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
\`\`\`

### Cluster Management
\`\`\`bash
anchor config set --provider.cluster devnet
anchor config set --provider.cluster mainnet
anchor config set --provider.wallet ~/.config/solana/id.json
\`\`\`

> **Tip:** Use \`anchor verify\` to prove your deployed program matches the published source code.`
      },
    ],
  },
  {
    name: 'Solana Web3.js',
    slug: 'solana-web3js',
    logoUrl: 'https://solana.com/favicon.ico',
    docsUrl: 'https://solana-labs.github.io/solana-web3.js',
    description: 'The official JavaScript SDK for Solana — build transactions, manage keypairs, and interact with the network.',
    category: 'Dev Tools',
    tags: ['sdk', 'javascript', 'typescript', 'transactions', 'keypairs', 'connection'],
    sections: [
      {
        title: 'Connection',
        description: 'Establish RPC connections and query cluster state, balances, and accounts.',
        url: 'https://solana-labs.github.io/solana-web3.js/classes/Connection.html',
        content: `## Connection

The \`Connection\` class is your gateway to the Solana network — use it to query state, send transactions, and subscribe to events.

### Quick Start

\`\`\`typescript
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

// Query balance
const balance = await connection.getBalance(publicKey);
console.log(\`Balance: \${balance / LAMPORTS_PER_SOL} SOL\`);

// Get recent blockhash
const { blockhash } = await connection.getLatestBlockhash();

// Get account info
const accountInfo = await connection.getAccountInfo(publicKey);
\`\`\`

### Key Methods

| Method | Returns |
|--------|---------|
| \`getBalance()\` | SOL balance in lamports |
| \`getAccountInfo()\` | Raw account data + owner program |
| \`getLatestBlockhash()\` | Blockhash for transaction building |
| \`sendTransaction()\` | Send signed transaction |
| \`confirmTransaction()\` | Wait for confirmation |
| \`getSignaturesForAddress()\` | Transaction history |
| \`getProgramAccounts()\` | All accounts owned by a program |

### Commitment Levels
- **processed** — Fastest, not guaranteed finalized
- **confirmed** — Voted on by supermajority (recommended)
- **finalized** — Irreversible, highest certainty

> **Tip:** Use \`confirmed\` commitment for most reads. Use \`finalized\` only when you need absolute certainty.`
      },
      {
        title: 'Transaction',
        description: 'Build, sign, and send transactions with instructions and signers.',
        url: 'https://solana-labs.github.io/solana-web3.js/classes/Transaction.html',
        content: `## Transaction

Build and send transactions containing one or more instructions to the Solana network.

### Basic Transfer

\`\`\`typescript
import {
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: recipient,
    lamports: 0.1 * LAMPORTS_PER_SOL
  })
);

const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [sender] // signers array
);
\`\`\`

### Key Concepts
- **Instructions** — Individual operations (transfer, create account, etc.)
- **Signers** — Keypairs that must sign the transaction
- **Blockhash** — Recent blockhash for deduplication (auto-fetched)
- **Fee payer** — First signer pays transaction fees

### Multiple Instructions

\`\`\`typescript
const tx = new Transaction()
  .add(instruction1)
  .add(instruction2)
  .add(instruction3);
// All execute atomically — if any fails, all revert
\`\`\`

### Transaction Limits
- Max size: **1232 bytes**
- Max instructions: Varies (typically 5-20 depending on complexity)
- For more, use **VersionedTransaction** with address lookup tables

> **Important:** Transactions are atomic — all instructions succeed or all fail. Use this for safe multi-step operations.`
      },
      {
        title: 'Keypair',
        description: 'Generate and manage Ed25519 keypairs for signing transactions.',
        url: 'https://solana-labs.github.io/solana-web3.js/classes/Keypair.html',
        content: `## Keypair

Generate and manage Ed25519 keypairs for signing transactions and deriving public keys.

### Usage

\`\`\`typescript
import { Keypair } from '@solana/web3.js';

// Generate a random keypair
const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toBase58());

// Create from secret key (Uint8Array)
const restored = Keypair.fromSecretKey(secretKeyBytes);

// Create from seed (deterministic)
const seeded = Keypair.fromSeed(seedBytes); // 32-byte seed
\`\`\`

### Key Properties

| Property | Type | Description |
|----------|------|-------------|
| \`publicKey\` | \`PublicKey\` | The public address |
| \`secretKey\` | \`Uint8Array\` | 64-byte secret key (first 32 = seed, last 32 = public key) |

### Common Patterns

\`\`\`typescript
// Save/load keypair from file
import fs from 'fs';
const keyData = JSON.parse(fs.readFileSync('keypair.json', 'utf-8'));
const keypair = Keypair.fromSecretKey(Uint8Array.from(keyData));

// Use as signer
const tx = new Transaction().add(instruction);
await sendAndConfirmTransaction(connection, tx, [keypair]);
\`\`\`

> **Warning:** Never expose secret keys in client-side code or commit them to repositories. Use wallet adapters for browser applications.`
      },
      {
        title: 'PublicKey',
        description: 'Work with Solana public keys, PDAs, and address derivation.',
        url: 'https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html',
        content: `## PublicKey

Represent and manipulate Solana addresses, derive PDAs, and validate public keys.

### Usage

\`\`\`typescript
import { PublicKey } from '@solana/web3.js';

// Create from string
const pubkey = new PublicKey('11111111111111111111111111111111');

// Validate
PublicKey.isOnCurve(pubkey.toBytes()); // true for normal keys, false for PDAs

// Compare
pubkey.equals(otherPubkey); // boolean
\`\`\`

### Program Derived Addresses (PDAs)

\`\`\`typescript
// Derive a PDA
const [pda, bump] = PublicKey.findProgramAddressSync(
  [
    Buffer.from('user-account'),
    userPublicKey.toBuffer()
  ],
  programId
);

// PDAs are deterministic — same seeds always produce the same address
// PDAs are NOT on the Ed25519 curve — they can only sign via the program
\`\`\`

### Common System Program IDs

| Program | Address |
|---------|---------|
| **System Program** | \`11111111111111111111111111111111\` |
| **Token Program** | \`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\` |
| **Associated Token** | \`ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL\` |
| **Rent Sysvar** | \`SysvarRent111111111111111111111111111111111\` |

> **Key Concept:** PDAs are the primary pattern for creating program-owned accounts with deterministic addresses.`
      },
      {
        title: 'VersionedTransaction',
        description: 'Build transactions with address lookup tables for more instructions per tx.',
        url: 'https://solana-labs.github.io/solana-web3.js/classes/VersionedTransaction.html',
        content: `## VersionedTransaction

Versioned transactions support Address Lookup Tables (ALTs) — allowing more accounts and instructions per transaction.

### Quick Start

\`\`\`typescript
import {
  VersionedTransaction,
  TransactionMessage,
  AddressLookupTableAccount
} from '@solana/web3.js';

// Fetch lookup table
const lookupTableAccount = await connection
  .getAddressLookupTable(lookupTableAddress)
  .then(res => res.value);

// Build versioned transaction
const messageV0 = new TransactionMessage({
  payerKey: wallet.publicKey,
  recentBlockhash: blockhash,
  instructions: [instruction1, instruction2, ...]
}).compileToV0Message([lookupTableAccount]);

const transaction = new VersionedTransaction(messageV0);
transaction.sign([wallet]);

const signature = await connection.sendTransaction(transaction);
\`\`\`

### Why Versioned Transactions?
- **More accounts** — ALTs compress account references from 32 bytes to 1 byte
- **Bigger transactions** — Fit more instructions in the 1232-byte limit
- **Required by many DeFi protocols** — Jupiter, Raydium, etc. return versioned transactions

### Address Lookup Tables
\`\`\`typescript
// Create a lookup table
const [createIx, lookupTableAddress] = AddressLookupTableProgram.createLookupTable({
  authority: wallet.publicKey,
  payer: wallet.publicKey,
  recentSlot: slot
});

// Extend with addresses
const extendIx = AddressLookupTableProgram.extendLookupTable({
  lookupTable: lookupTableAddress,
  authority: wallet.publicKey,
  payer: wallet.publicKey,
  addresses: [addr1, addr2, addr3]
});
\`\`\`

> **Note:** Most modern Solana applications should use versioned transactions. Legacy transactions are limited to ~35 unique accounts.`
      },
    ],
  },
  {
    name: 'Phantom',
    slug: 'phantom',
    logoUrl: 'https://phantom.app/img/phantom-logo.svg',
    docsUrl: 'https://docs.phantom.app',
    description: 'The most popular Solana wallet — provider API, deeplinks, and wallet adapter integration.',
    category: 'Wallets',
    tags: ['wallet', 'provider', 'deeplinks', 'adapter', 'signing'],
    sections: [
      {
        title: 'Detecting the Provider',
        description: 'Check if Phantom is installed and access the Solana provider object.',
        url: 'https://docs.phantom.app/solana/detecting-the-provider',
        content: `## Detecting the Provider

Check if Phantom is installed in the user's browser and access the Solana provider.

### Detection

\`\`\`typescript
const getProvider = () => {
  if ('phantom' in window) {
    const provider = (window as any).phantom?.solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
  // Phantom not installed — redirect to download
  window.open('https://phantom.app/', '_blank');
  return null;
};
\`\`\`

### Provider Properties

| Property | Type | Description |
|----------|------|-------------|
| \`isPhantom\` | \`boolean\` | Always \`true\` for Phantom |
| \`isConnected\` | \`boolean\` | Whether wallet is connected |
| \`publicKey\` | \`PublicKey | null\` | Connected wallet address |

### Events
\`\`\`typescript
provider.on('connect', (publicKey) => console.log('Connected:', publicKey.toBase58()));
provider.on('disconnect', () => console.log('Disconnected'));
provider.on('accountChanged', (publicKey) => {
  if (publicKey) console.log('Switched to:', publicKey.toBase58());
  else console.log('Disconnected from Phantom');
});
\`\`\`

> **Recommendation:** Use the Solana Wallet Adapter instead of direct provider detection for multi-wallet support.`
      },
      {
        title: 'Connecting',
        description: 'Request wallet connection and handle user approval.',
        url: 'https://docs.phantom.app/solana/connecting',
        content: `## Connecting

Request a connection to the user's Phantom wallet. The user will see an approval popup.

### Connect

\`\`\`typescript
const provider = getProvider();

try {
  const response = await provider.connect();
  console.log('Connected:', response.publicKey.toBase58());
} catch (err) {
  console.error('User rejected connection');
}
\`\`\`

### Eager Connect (Silent)
\`\`\`typescript
// Reconnect silently if user previously approved
try {
  const response = await provider.connect({ onlyIfTrusted: true });
  console.log('Auto-connected:', response.publicKey.toBase58());
} catch {
  // User hasn't approved before — don't show popup
}
\`\`\`

### Disconnect
\`\`\`typescript
await provider.disconnect();
\`\`\`

### Key Behaviors
- **First connect** — Shows approval popup
- **\`onlyIfTrusted\`** — Connects silently if previously approved (no popup)
- **Disconnect** — Revokes the app's permission, requiring re-approval on next connect
- **Auto-lock** — Phantom may lock after inactivity, requiring reconnection

> **Tip:** Use \`onlyIfTrusted\` on page load for a seamless returning-user experience.`
      },
      {
        title: 'Signing Transactions',
        description: 'Sign and send transactions, or sign messages for verification.',
        url: 'https://docs.phantom.app/solana/signing-a-transaction',
        content: `## Signing Transactions

Sign transactions and messages with Phantom wallet.

### Sign & Send Transaction

\`\`\`typescript
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: provider.publicKey,
    toPubkey: recipient,
    lamports: 0.1 * LAMPORTS_PER_SOL
  })
);

transaction.feePayer = provider.publicKey;
transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

const { signature } = await provider.signAndSendTransaction(transaction);
await connection.confirmTransaction(signature);
\`\`\`

### Sign Without Sending
\`\`\`typescript
const signedTx = await provider.signTransaction(transaction);
// You can inspect or broadcast later
const signature = await connection.sendRawTransaction(signedTx.serialize());
\`\`\`

### Sign Message (for verification)
\`\`\`typescript
const message = new TextEncoder().encode('Sign this message to verify your identity');
const { signature } = await provider.signMessage(message, 'utf8');
// Verify on server with nacl.sign.detached.verify()
\`\`\`

### Sign Multiple Transactions
\`\`\`typescript
const signedTransactions = await provider.signAllTransactions([tx1, tx2, tx3]);
\`\`\`

> **Note:** \`signAndSendTransaction\` is preferred over \`signTransaction\` — it handles submission and retries automatically.`
      },
      {
        title: 'Deeplinks',
        description: 'Build mobile deeplinks for connecting, signing, and sending transactions.',
        url: 'https://docs.phantom.app/phantom-deeplinks/deeplinks-ios-and-android',
        content: `## Deeplinks

Build mobile deeplinks to interact with Phantom on iOS and Android without a browser extension.

### Connect via Deeplink

\`\`\`typescript
const connectUrl = new URL('https://phantom.app/ul/v1/connect');
connectUrl.searchParams.set('app_url', 'https://yourapp.com');
connectUrl.searchParams.set('dapp_encryption_public_key', dappPublicKey);
connectUrl.searchParams.set('redirect_link', 'yourapp://callback');
connectUrl.searchParams.set('cluster', 'mainnet-beta');

// Open in mobile browser
window.location.href = connectUrl.toString();
\`\`\`

### Deeplink Actions

| Action | URL Path | Description |
|--------|----------|-------------|
| **Connect** | \`/ul/v1/connect\` | Request wallet connection |
| **SignAndSendTransaction** | \`/ul/v1/signAndSendTransaction\` | Sign and submit a transaction |
| **SignTransaction** | \`/ul/v1/signTransaction\` | Sign without submitting |
| **SignMessage** | \`/ul/v1/signMessage\` | Sign an arbitrary message |
| **Disconnect** | \`/ul/v1/disconnect\` | End the session |

### Key Concepts
- **Encryption** — All payloads are encrypted with a shared secret (X25519)
- **Redirect** — Results are returned via your app's redirect URL
- **Session** — A session token persists across multiple deeplink calls
- **Universal Links** — Use \`https://phantom.app/ul/\` for both iOS and Android

> **Important:** Deeplinks require encryption key exchange. Use the \`@phantom/browser-sdk\` for simplified integration.`
      },
      {
        title: 'Wallet Adapter',
        description: 'Integrate Phantom via the Solana Wallet Adapter standard.',
        url: 'https://docs.phantom.app/solana/integrating-phantom',
        content: `## Wallet Adapter

Integrate Phantom (and 20+ other wallets) using the standard Solana Wallet Adapter.

### Setup

\`\`\`typescript
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [new PhantomWalletAdapter()];

function App() {
  return (
    <ConnectionProvider endpoint={rpcEndpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <YourApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
\`\`\`

### Using the Wallet

\`\`\`typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function MyComponent() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const handleSend = async () => {
    const tx = new Transaction().add(/* instruction */);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature);
  };

  return (
    <div>
      <WalletMultiButton /> {/* Pre-built connect/disconnect button */}
      {publicKey && <p>Connected: {publicKey.toBase58()}</p>}
    </div>
  );
}
\`\`\`

### Key Hooks
- \`useWallet()\` — Access publicKey, sendTransaction, signMessage, connected state
- \`useConnection()\` — Access the RPC connection
- \`useAnchorWallet()\` — Wallet compatible with Anchor's Provider

> **Tip:** Use \`autoConnect\` in WalletProvider to silently reconnect returning users.`
      },
    ],
  },
  {
    name: 'Marinade',
    slug: 'marinade',
    logoUrl: 'https://marinade.finance/favicon.ico',
    docsUrl: 'https://docs.marinade.finance',
    description: 'Liquid staking on Solana — stake SOL, receive mSOL, and earn yield while maintaining liquidity.',
    category: 'DeFi',
    tags: ['staking', 'liquid staking', 'msol', 'native stake', 'yield'],
    sections: [
      {
        title: 'Liquid Staking',
        description: 'Stake SOL and receive mSOL — a yield-bearing liquid staking token.',
        url: 'https://docs.marinade.finance/marinade-protocol/liquid-staking',
        content: `## Liquid Staking

Stake SOL and receive mSOL — a yield-bearing token that appreciates in value relative to SOL as staking rewards accrue.

### How It Works
1. Deposit SOL into Marinade's stake pool
2. Receive mSOL (exchange rate increases over time)
3. Use mSOL in DeFi (lending, LPing, collateral)
4. Unstake anytime — instant or delayed (delayed = 0 fee)

### Key Metrics
- **APY:** ~7-8% (varies with Solana staking rewards)
- **Exchange Rate:** 1 mSOL > 1 SOL (grows over time)
- **Instant Unstake Fee:** ~0.3% (uses liquidity pool)
- **Delayed Unstake:** Free (waits 1-2 epochs)

### mSOL in DeFi
| Protocol | Use Case |
|----------|----------|
| **Jupiter** | Swap mSOL ↔ SOL |
| **Marginfi** | Lend mSOL for yield |
| **Kamino** | LP in mSOL/SOL vaults |
| **Orca** | Provide mSOL liquidity |

> **Key Benefit:** Unlike native staking, mSOL stays liquid — you earn staking rewards AND can use it as DeFi collateral simultaneously.`
      },
      {
        title: 'Native Staking',
        description: 'Delegate SOL to validators without a liquid token, earning direct rewards.',
        url: 'https://docs.marinade.finance/marinade-protocol/native-staking',
        content: `## Native Staking

Delegate SOL directly to validators through Marinade's smart delegation algorithm without receiving a liquid token.

### How It Works
1. Deposit SOL into Marinade Native
2. SOL is delegated across high-performing validators
3. Staking rewards accrue directly to your stake account
4. Unstake with standard Solana epoch delays

### Advantages
- **No liquid token risk** — Your SOL stays as SOL
- **Algorithmic delegation** — Distributed across 400+ validators for decentralization
- **MEV rewards** — Validators using Jito pass MEV tips to stakers
- **Same APY** as liquid staking, minus the liquidity premium

### Native vs Liquid Staking

| Feature | Native | Liquid (mSOL) |
|---------|--------|---------------|
| Token received | None | mSOL |
| DeFi composable | No | Yes |
| Unstake time | 1-2 epochs | Instant (0.3% fee) |
| Smart contract risk | Lower | Higher |
| Ideal for | HODLers | DeFi users |

> **Tip:** Use Native Staking if you want to support decentralization without smart contract exposure.`
      },
      {
        title: 'SDK Integration',
        description: 'TypeScript SDK for programmatic staking, unstaking, and mSOL operations.',
        url: 'https://docs.marinade.finance/developers/sdk',
        content: `## SDK Integration

Use the Marinade TypeScript SDK to integrate staking operations into your application.

### Installation & Setup

\`\`\`typescript
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';

const config = new MarinadeConfig({
  connection,
  publicKey: wallet.publicKey
});
const marinade = new Marinade(config);
\`\`\`

### Stake SOL → mSOL

\`\`\`typescript
const { transaction } = await marinade.deposit(
  new BN(1 * LAMPORTS_PER_SOL) // 1 SOL
);
const signature = await wallet.sendTransaction(transaction, connection);
\`\`\`

### Unstake mSOL → SOL

\`\`\`typescript
// Instant unstake (small fee)
const { transaction } = await marinade.liquidUnstake(
  new BN(1 * LAMPORTS_PER_SOL)
);

// Delayed unstake (free, 1-2 epochs)
const { transaction } = await marinade.depositStakeAccount(stakeAccount);
\`\`\`

### Query State
\`\`\`typescript
const state = await marinade.getMarinadeState();
console.log('mSOL price:', state.mSolPrice);
console.log('Total staked:', state.totalStaked);
\`\`\`

> **Note:** Always check the current mSOL/SOL exchange rate before displaying conversion amounts to users.`
      },
      {
        title: 'Directed Stake',
        description: 'Direct your stake to specific validators supporting decentralization.',
        url: 'https://docs.marinade.finance/marinade-protocol/directed-stake',
        content: `## Directed Stake

Choose specific validators to receive your stake delegation, supporting decentralization while earning rewards.

### How It Works
1. Select validators you want to support
2. Stake SOL or mSOL through Marinade
3. Your stake is directed to your chosen validators
4. Earn staking rewards plus MNDE governance tokens

### Validator Selection Criteria
- **Performance** — Uptime, vote success rate, commission
- **Decentralization** — Stake concentration, data center diversity
- **MEV sharing** — Validators passing Jito MEV tips to stakers
- **Community** — Validator contributions to the ecosystem

### MNDE Rewards
Directed stakers earn MNDE tokens as additional incentive:
- Rewards scale with stake amount and duration
- MNDE is Marinade's governance token
- Used for voting on protocol parameters and validator scoring

### Benefits
- **Support decentralization** — Reduce stake concentration
- **Higher potential rewards** — MEV-sharing validators
- **Governance participation** — Shape Marinade's future
- **Transparent scoring** — Open validator performance metrics

> **Tip:** Diversify across multiple validators in different data centers and geographies for maximum decentralization impact.`
      },
    ],
  },
  {
    name: 'Raydium',
    slug: 'raydium',
    logoUrl: 'https://raydium.io/favicon.ico',
    docsUrl: 'https://docs.raydium.io',
    description: 'Solana\'s hybrid AMM — concentrated liquidity, standard pools, and launchpad.',
    category: 'DeFi',
    tags: ['amm', 'clmm', 'liquidity', 'launchpad', 'swap'],
    sections: [
      {
        title: 'AMM SDK',
        description: 'Interact with standard constant-product AMM pools programmatically.',
        url: 'https://docs.raydium.io/raydium/traders/trade-api',
        content: `## AMM SDK

Interact with Raydium's constant-product AMM pools for swaps, liquidity provision, and pool queries.

### Swap via API

\`\`\`typescript
const response = await fetch('https://api.raydium.io/v2/main/swap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputMint: SOL_MINT,
    outputMint: USDC_MINT,
    amount: 1000000000, // 1 SOL
    slippage: 0.5
  })
});
\`\`\`

### Key Concepts
- **Constant Product** — x * y = k formula for pricing
- **LP Tokens** — Received when providing liquidity
- **Fees** — 0.25% per swap (0.22% to LPs, 0.03% to RAY buyback)

### Pool Information
\`\`\`typescript
// Fetch pool data
const pools = await fetch('https://api.raydium.io/v2/main/pairs');
// Returns: TVL, volume, APR, token pairs, liquidity depth
\`\`\`

> **Note:** For best execution, consider using Jupiter aggregator which routes through Raydium pools automatically.`
      },
      {
        title: 'Concentrated Liquidity (CLMM)',
        description: 'Provide liquidity in custom price ranges for higher capital efficiency.',
        url: 'https://docs.raydium.io/raydium/liquidity-providers/concentrated-liquidity',
        content: `## Concentrated Liquidity (CLMM)

Provide liquidity in custom price ranges for dramatically higher capital efficiency compared to standard AMM pools.

### Key Concepts
- **Price Range** — You choose the min/max price for your liquidity
- **Tighter range = higher fees** but more impermanent loss risk
- **Out of range** — Your position earns no fees if price moves outside your range

### Capital Efficiency Example
| Range Width | Capital Efficiency vs Full Range |
|-------------|-------------------------------|
| ±1% | ~200x |
| ±5% | ~40x |
| ±10% | ~20x |
| Full range | 1x (same as standard AMM) |

### Strategies
- **Stablecoin pairs** — Very tight range (±0.1%) for maximum efficiency
- **Correlated assets** — Medium range (±5-10%) for LST/SOL pairs
- **Volatile pairs** — Wider range (±20-50%) to stay in range longer

### Fees & Rewards
- Trading fees accrue only when your position is in range
- Additional farm rewards may be available for incentivized pools
- Fees must be manually harvested (not auto-compounded)

> **Important:** CLMM positions require active management. Rebalance when price moves outside your range to continue earning fees.`
      },
      {
        title: 'AcceleRaytor',
        description: 'Launchpad for new Solana projects with tiered allocation system.',
        url: 'https://docs.raydium.io/raydium/acceleRaytor/acceleRaytor',
        content: `## AcceleRaytor

Raydium's launchpad for new Solana projects — participate in token sales with a tiered allocation system based on RAY staking.

### How It Works
1. **Projects apply** to launch via AcceleRaytor
2. **Users stake RAY** to qualify for allocation tiers
3. **Pools open** at scheduled time with fixed token price
4. **Tokens distributed** after the sale concludes

### Allocation Tiers
| Tier | RAY Required | Max Allocation |
|------|-------------|----------------|
| Community | 0 RAY | Base allocation |
| Tier 1 | 100 RAY | 2x base |
| Tier 2 | 500 RAY | 5x base |
| Tier 3 | 2000 RAY | 10x base |

### Key Features
- **Fair launch** — Transparent allocation based on staking
- **Vesting schedules** — Tokens may vest over time
- **Immediate liquidity** — Projects create Raydium pools post-launch
- **KYC requirements** — Some launches require identity verification

> **Note:** AcceleRaytor launches are competitive. Stake RAY early to secure your tier before the snapshot.`
      },
      {
        title: 'Pool Creation',
        description: 'Create new liquidity pools with configurable fees and parameters.',
        url: 'https://docs.raydium.io/raydium/liquidity-providers/creating-a-pool',
        content: `## Pool Creation

Create new liquidity pools on Raydium with configurable parameters.

### Standard AMM Pool
1. Navigate to Raydium's pool creation interface
2. Select the two tokens for your pair
3. Set initial liquidity amounts (determines starting price)
4. Configure fee tier
5. Submit the creation transaction

### CLMM Pool Creation
1. Select token pair
2. Choose fee tier (0.01%, 0.05%, 0.25%, 1%)
3. Set initial price
4. The pool is created — anyone can add liquidity

### Fee Tiers

| Fee Tier | Best For |
|----------|----------|
| 0.01% | Stablecoin pairs (USDC/USDT) |
| 0.05% | Correlated assets (mSOL/SOL) |
| 0.25% | Standard pairs (SOL/USDC) |
| 1% | Exotic/low-liquidity pairs |

### Requirements
- **OpenBook market** — Required for standard AMM pools (not for CLMM)
- **Initial liquidity** — Both tokens must be provided at creation
- **SOL for fees** — Pool creation costs ~0.5-2 SOL in rent

> **Tip:** For new token launches, create a CLMM pool — it doesn't require an OpenBook market and offers better capital efficiency.`
      },
    ],
  },
  {
    name: 'Squads',
    slug: 'squads',
    logoUrl: 'https://squads.so/favicon.ico',
    docsUrl: 'https://docs.squads.so',
    description: 'Multisig and program management on Solana — secure team operations with multi-signature approvals.',
    category: 'Dev Tools',
    tags: ['multisig', 'governance', 'program management', 'security', 'treasury'],
    sections: [
      {
        title: 'Multisig SDK',
        description: 'Create and manage multisig vaults with configurable thresholds.',
        url: 'https://docs.squads.so/main/development/general',
        content: `## Multisig SDK

Create and manage multisig wallets requiring M-of-N signatures for transaction approval.

### Setup

\`\`\`typescript
import * as multisig from '@sqds/multisig';

const multisigPda = multisig.getMultisigPda({
  createKey: createKeypair.publicKey
})[0];

// Create a 2-of-3 multisig
const createIx = multisig.instructions.multisigCreateV2({
  createKey: createKeypair.publicKey,
  creator: wallet.publicKey,
  multisigPda,
  configAuthority: null,
  threshold: 2,
  members: [
    { key: member1, permissions: multisig.types.Permissions.all() },
    { key: member2, permissions: multisig.types.Permissions.all() },
    { key: member3, permissions: multisig.types.Permissions.all() }
  ],
  timeLock: 0
});
\`\`\`

### Transaction Flow
1. **Propose** — Any member creates a transaction proposal
2. **Approve** — Members vote to approve (threshold = 2)
3. **Execute** — Once threshold is met, anyone can execute

### Key Features
- **Configurable threshold** (M-of-N)
- **Member permissions** — Propose, vote, execute separately
- **Time locks** — Enforce delays before execution
- **Spending limits** — Cap per-transaction amounts
- **Transaction history** — Full audit trail on-chain

> **Tip:** Use Squads multisig for program upgrade authority to prevent single-point-of-failure in protocol governance.`
      },
      {
        title: 'Program Manager',
        description: 'Manage program upgrades through multisig-controlled authority.',
        url: 'https://docs.squads.so/main/navigating-your-squad/program-manager',
        content: `## Program Manager

Manage Solana program upgrades through multisig-controlled authority — ensuring no single developer can modify deployed code.

### Why Program Manager?
- **Security** — Multiple approvals required for upgrades
- **Transparency** — All upgrades visible on-chain
- **Accountability** — Clear audit trail of who approved what
- **Standard practice** — Expected by investors and users

### Workflow
1. **Transfer upgrade authority** from developer wallet to Squads multisig
2. **Propose upgrade** — Upload new program binary, create proposal
3. **Review & approve** — Team members review diff and vote
4. **Execute** — Once threshold met, upgrade executes on-chain

### Buffer Management
\`\`\`bash
# Deploy program buffer
solana program write-buffer target/deploy/program.so

# Transfer buffer authority to multisig
solana program set-buffer-authority <BUFFER> --new-buffer-authority <MULTISIG_VAULT>
\`\`\`

### Best Practices
- **Never use a single EOA** as upgrade authority in production
- **Set threshold to majority** (e.g., 3-of-5)
- **Include time lock** for critical protocol upgrades
- **Verify buffer** contents before approving upgrades

> **Important:** Transferring upgrade authority to a multisig is considered a security baseline for production Solana programs.`
      },
      {
        title: 'v4 Protocol',
        description: 'Latest Squads protocol with improved UX and batched transactions.',
        url: 'https://docs.squads.so/main/development/v4-overview',
        content: `## v4 Protocol

Squads v4 is the latest version with improved UX, batched transactions, and enhanced security features.

### What's New in v4
- **Batched transactions** — Propose multiple instructions in one transaction
- **Config transactions** — Change multisig settings (add/remove members, change threshold)
- **Spending limits** — Set per-token, per-period spending caps
- **Improved permissions** — Granular control over who can propose, vote, execute
- **Rent recovery** — Reclaim rent from completed proposals

### Architecture
\`\`\`
Multisig Account → Vault PDA (holds assets)
                 → Proposals (pending transactions)
                 → Config Transactions (settings changes)
                 → Spending Limits (automated approvals)
\`\`\`

### Spending Limits
\`\`\`typescript
// Create a spending limit: 100 USDC per day
const createLimitIx = multisig.instructions.spendingLimitCreate({
  multisigPda,
  spendingLimit: spendingLimitPda,
  createKey: limitKey.publicKey,
  mint: USDC_MINT,
  amount: 100_000_000, // 100 USDC
  period: multisig.types.Period.Day,
  members: [operatorKey],
  destinations: [vendorWallet]
});
\`\`\`

> **Tip:** Use spending limits for operational expenses (hosting, services) to avoid full multisig approval for routine payments.`
      },
      {
        title: 'Treasury Management',
        description: 'Manage team funds, token allocations, and payment flows.',
        url: 'https://docs.squads.so/main/navigating-your-squad/squad-vault',
        content: `## Treasury Management

Use Squads vaults to securely manage team funds, token allocations, and payment flows with multisig approval.

### Vault Structure
- **Default Vault (index 0)** — Primary treasury
- **Additional Vaults** — Create separate vaults for different purposes (operations, grants, etc.)
- **Each vault** has its own SOL balance and token accounts

### Common Operations
- **Send SOL/SPL tokens** — Propose transfer, team approves, execute
- **Swap tokens** — Jupiter integration for in-vault swaps
- **Stake SOL** — Native or liquid staking from the vault
- **NFT management** — Hold and transfer NFTs

### DeFi Integration
Squads vaults can interact with DeFi protocols:
| Protocol | Action |
|----------|--------|
| **Marinade** | Stake SOL for mSOL |
| **Jupiter** | Swap tokens |
| **Marginfi** | Lend idle treasury assets |
| **Orca** | Provide liquidity |

### Best Practices
- **Separate operational and reserve vaults** — Different approval thresholds
- **Regular audits** — Review transaction history monthly
- **Multi-currency** — Keep stablecoins for expenses, SOL for operations
- **Emergency procedures** — Document recovery steps for lost member keys

> **Note:** Squads vaults are program-derived addresses (PDAs) — they can interact with any Solana program, not just token transfers.`
      },
    ],
  },
  {
    name: 'Jito',
    slug: 'jito',
    logoUrl: 'https://www.jito.network/favicon.ico',
    docsUrl: 'https://jito-labs.gitbook.io/mev',
    description: 'MEV infrastructure on Solana — bundles, tip program, and block engine for transaction ordering.',
    category: 'MEV',
    tags: ['mev', 'bundles', 'tips', 'block engine', 'searcher'],
    sections: [
      {
        title: 'Bundles',
        description: 'Submit atomic transaction bundles with guaranteed ordering and execution.',
        url: 'https://jito-labs.gitbook.io/mev/searcher-resources/bundles',
        content: `## Bundles

Jito bundles allow you to submit multiple transactions as an atomic group with guaranteed ordering. All transactions in a bundle either execute together or not at all.

### How Bundles Work
1. Create 2-5 transactions
2. Attach a tip to the last transaction
3. Submit to the Jito Block Engine
4. Validator includes the entire bundle atomically

### Submitting a Bundle

\`\`\`typescript
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';

const client = SearcherClient.connect('https://mainnet.block-engine.jito.wtf');

const bundle = [tx1, tx2, tipTx];
const bundleId = await client.sendBundle(bundle);
\`\`\`

### Key Properties
- **Atomic execution** — All-or-nothing (no partial execution)
- **Ordered** — Transactions execute in the order submitted
- **Max 5 transactions** per bundle
- **Tips required** — Must include a tip to incentivize inclusion

### Use Cases
- **Arbitrage** — Sandwich-free atomic arb execution
- **Liquidations** — Guaranteed ordering for multi-step liquidations
- **Token launches** — Ensure your buy tx lands immediately after pool creation

> **Important:** Bundles compete with other bundles. Higher tips increase the probability of inclusion.`
      },
      {
        title: 'Tip Program',
        description: 'Attach tips to transactions for priority inclusion by Jito validators.',
        url: 'https://jito-labs.gitbook.io/mev/searcher-resources/tip-program',
        content: `## Tip Program

Attach SOL tips to transactions for priority inclusion by Jito validators. Tips are paid to validators as an incentive.

### Adding a Tip

\`\`\`typescript
import { SystemProgram } from '@solana/web3.js';

// Tip accounts rotate — fetch the current one
const tipAccounts = await client.getTipAccounts();
const tipAccount = tipAccounts[Math.floor(Math.random() * tipAccounts.length)];

const tipIx = SystemProgram.transfer({
  fromPubkey: wallet.publicKey,
  toPubkey: new PublicKey(tipAccount),
  lamports: 10000 // 0.00001 SOL tip
});

// Add tip as the LAST instruction in the LAST transaction
transaction.add(tipIx);
\`\`\`

### Tip Guidelines
| Scenario | Suggested Tip |
|----------|---------------|
| Standard transaction | 1,000-10,000 lamports |
| Time-sensitive | 50,000-100,000 lamports |
| Competitive (arb/liquidation) | 100,000+ lamports |

### Key Concepts
- **Tip accounts** — 8 rotating accounts managed by Jito
- **Minimum tip** — 1,000 lamports (0.000001 SOL)
- **Tip = priority** — Higher tips = higher chance of inclusion
- **Failed bundles** — No tip charged if bundle doesn't land

> **Tip:** Even for non-MEV transactions, adding a small Jito tip often provides better landing rates than priority fees alone.`
      },
      {
        title: 'Block Engine',
        description: 'Connect to the Jito block engine for submitting bundles and transactions.',
        url: 'https://jito-labs.gitbook.io/mev/searcher-resources/block-engine',
        content: `## Block Engine

The Jito Block Engine is the entry point for submitting bundles and priority transactions to Jito validators.

### Endpoints

| Region | URL |
|--------|-----|
| **Mainnet (NY)** | \`https://mainnet.block-engine.jito.wtf\` |
| **Mainnet (Amsterdam)** | \`https://amsterdam.mainnet.block-engine.jito.wtf\` |
| **Mainnet (Frankfurt)** | \`https://frankfurt.mainnet.block-engine.jito.wtf\` |
| **Mainnet (Tokyo)** | \`https://tokyo.mainnet.block-engine.jito.wtf\` |

### Connection

\`\`\`typescript
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';

const client = SearcherClient.connect(
  'https://mainnet.block-engine.jito.wtf',
  authKeypair // Optional authentication
);

// Subscribe to bundle results
client.onBundleResult((result) => {
  console.log('Bundle status:', result.bundleId, result.status);
});
\`\`\`

### Submission Methods
- **sendBundle** — Submit atomic bundle (2-5 transactions)
- **sendTransaction** — Submit single transaction with tip

### Key Features
- **Global distribution** — Multiple regions for low latency
- **Real-time feedback** — Bundle result streaming
- **Authentication** — Optional keypair auth for rate limit increases

> **Tip:** Use the Block Engine endpoint closest to your server for lowest latency. For Tokyo-based servers, use the Tokyo endpoint.`
      },
      {
        title: 'Searcher Guide',
        description: 'Build MEV strategies with the Jito searcher client SDK.',
        url: 'https://jito-labs.gitbook.io/mev/searcher-resources/getting-started',
        content: `## Searcher Guide

Build MEV (Maximum Extractable Value) strategies using the Jito infrastructure on Solana.

### Getting Started

\`\`\`bash
npm install jito-ts @solana/web3.js
\`\`\`

\`\`\`typescript
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
import { BundleResult } from 'jito-ts/dist/gen/block-engine/bundle';

const client = SearcherClient.connect(blockEngineUrl);

// Build your strategy
const searcherTx = buildArbitrageTransaction(opportunity);
const tipTx = buildTipTransaction(tipAmount);

const bundleId = await client.sendBundle([searcherTx, tipTx]);
\`\`\`

### Common MEV Strategies on Solana

| Strategy | Description |
|----------|-------------|
| **Arbitrage** | Price differences between DEXs |
| **Liquidation** | Under-collateralized lending positions |
| **JIT Liquidity** | Just-in-time liquidity provision |
| **Backrunning** | Capture price impact from large trades |

### Key Considerations
- **No front-running** — Jito's design prevents sandwich attacks
- **Competition** — Other searchers submit competing bundles
- **Latency matters** — Co-locate with block engine for speed
- **Simulation** — Always simulate bundles before submission

### Tools
- **jito-ts** — TypeScript SDK for bundle submission
- **jito-solana** — Modified validator client with bundle support
- **Block Engine API** — REST/gRPC for bundle management

> **Warning:** MEV searching is highly competitive. Success depends on speed, strategy sophistication, and capital efficiency.`
      },
    ],
  },
  {
    name: 'Orca',
    slug: 'orca',
    logoUrl: 'https://www.orca.so/favicon.ico',
    docsUrl: 'https://docs.orca.so',
    description: 'Concentrated liquidity DEX on Solana — Whirlpools, fair-price swaps, and developer-friendly SDK.',
    category: 'DeFi',
    tags: ['dex', 'clmm', 'whirlpools', 'swap', 'liquidity'],
    sections: [
      {
        title: 'Whirlpools SDK',
        description: 'Interact with concentrated liquidity pools — open positions, add/remove liquidity.',
        url: 'https://docs.orca.so/whirlpools/whirlpools-sdk',
        content: `## Whirlpools SDK

Interact with Orca's concentrated liquidity pools programmatically.

### Setup

\`\`\`typescript
import { WhirlpoolContext, buildWhirlpoolClient } from '@orca-so/whirlpools-sdk';

const ctx = WhirlpoolContext.from(connection, wallet, ORCA_WHIRLPOOL_PROGRAM_ID);
const client = buildWhirlpoolClient(ctx);

// Fetch a whirlpool
const whirlpool = await client.getPool(poolAddress);
const data = whirlpool.getData();
console.log('Current price:', data.sqrtPrice);
\`\`\`

### Open a Position

\`\`\`typescript
const { tx, positionMint } = await whirlpool.openPosition(
  PriceMath.priceToTickIndex(lowerPrice, decimalsA, decimalsB),
  PriceMath.priceToTickIndex(upperPrice, decimalsA, decimalsB),
  { tokenA: amountA, tokenB: amountB }
);
await tx.buildAndExecute();
\`\`\`

### Key Operations
- \`openPosition()\` — Create new liquidity position in price range
- \`increaseLiquidity()\` — Add more liquidity to existing position
- \`decreaseLiquidity()\` — Remove liquidity from position
- \`collectFees()\` — Harvest accrued trading fees
- \`collectReward()\` — Harvest farm reward emissions
- \`closePosition()\` — Remove all liquidity and close

> **Tip:** Use the Orca SDK's \`PriceMath\` utilities to convert between human-readable prices and tick indices.`
      },
      {
        title: 'Swap API',
        description: 'Execute token swaps through Orca pools with optimal routing.',
        url: 'https://docs.orca.so/developer-resources/orca-swap',
        content: `## Swap API

Execute token swaps through Orca's Whirlpool pools with optimal routing and minimal slippage.

### Quick Swap

\`\`\`typescript
const whirlpool = await client.getPool(SOL_USDC_POOL);

const quote = await swapQuoteByInputToken(
  whirlpool,
  inputTokenMint,
  new BN(1_000_000_000), // 1 SOL
  Percentage.fromFraction(5, 1000), // 0.5% slippage
  ORCA_WHIRLPOOL_PROGRAM_ID,
  fetcher
);

console.log('Expected output:', quote.estimatedAmountOut.toString());
console.log('Min output:', quote.otherAmountThreshold.toString());

const tx = await whirlpool.swap(quote);
await tx.buildAndExecute();
\`\`\`

### Quote Types
- **swapQuoteByInputToken** — "I want to swap exactly X tokens"
- **swapQuoteByOutputToken** — "I want to receive exactly Y tokens"

### Key Parameters
- **Slippage** — Max acceptable price deviation
- **Token mint** — Which token you're swapping from
- **Amount** — In token's smallest unit (lamports/decimals)

> **Note:** For multi-hop swaps or best-price routing across all DEXs, use Jupiter aggregator which includes Orca pools.`
      },
      {
        title: 'Pool Creation',
        description: 'Create and initialize new Whirlpool markets with custom parameters.',
        url: 'https://docs.orca.so/whirlpools/creating-a-whirlpool',
        content: `## Pool Creation

Create new Whirlpool concentrated liquidity markets for any token pair.

### Create a Whirlpool

\`\`\`typescript
const { poolAddress, tx } = await client.createPool(
  whirlpoolsConfigAddress,
  tokenMintA,
  tokenMintB,
  tickSpacing, // Determines fee tier
  initialSqrtPrice,
  wallet.publicKey
);
await tx.buildAndExecute();
\`\`\`

### Tick Spacing & Fee Tiers

| Tick Spacing | Fee Rate | Best For |
|-------------|----------|----------|
| 1 | 0.01% | Stablecoins (USDC/USDT) |
| 8 | 0.05% | Correlated (mSOL/SOL) |
| 64 | 0.30% | Standard pairs |
| 128 | 1.00% | Exotic/volatile |

### Post-Creation
1. **Initialize tick arrays** — Required before LPs can add liquidity at various prices
2. **Seed initial liquidity** — The creator typically adds first liquidity to set the price
3. **Announce** — Share the pool address for other LPs and traders

### Requirements
- Both tokens must exist as SPL mints
- Creator pays rent for pool account (~0.03 SOL)
- Token ordering is deterministic (lower mint address = token A)

> **Tip:** Choose tick spacing carefully — it cannot be changed after creation. Lower spacing allows finer position granularity but costs more in tick array initialization.`
      },
      {
        title: 'Fees & Rewards',
        description: 'Collect trading fees and reward emissions from liquidity positions.',
        url: 'https://docs.orca.so/whirlpools/collecting-fees-and-rewards',
        content: `## Fees & Rewards

Earn trading fees and optional reward emissions from your Whirlpool liquidity positions.

### Fee Collection

\`\`\`typescript
// Fetch position
const position = await client.getPosition(positionAddress);

// Collect accrued fees
const tx = await position.collectFees();
await tx.buildAndExecute();
\`\`\`

### Reward Collection

\`\`\`typescript
// Collect reward emissions (up to 3 reward tokens per pool)
const tx = await position.collectReward(rewardIndex); // 0, 1, or 2
await tx.buildAndExecute();
\`\`\`

### How Fees Accrue
- Trading fees accumulate only when your position is **in range**
- Fees are denominated in the pool's token pair (token A + token B)
- Fee rate depends on the pool's tick spacing / fee tier
- Fees are **not auto-compounded** — you must collect and re-deposit

### Reward Emissions
- Pool operators can add up to **3 reward tokens**
- Rewards distributed proportionally to in-range liquidity
- Common rewards: protocol tokens, partner incentives

### Calculating Returns
\`\`\`
APR = (Fees earned + Rewards) / Liquidity provided × (365 / days)
\`\`\`

> **Tip:** Collect and reinvest fees regularly to benefit from compounding. Some third-party vaults (Kamino, Hawksight) automate this.`
      },
    ],
  },
  {
    name: 'Tensor',
    slug: 'tensor',
    logoUrl: 'https://www.tensor.trade/favicon.ico',
    docsUrl: 'https://docs.tensor.so',
    description: 'Advanced NFT marketplace and AMM — real-time trading, collection bids, and compressed NFT support.',
    category: 'Marketplaces',
    tags: ['nft', 'marketplace', 'amm', 'trading', 'compressed nft'],
    sections: [
      {
        title: 'Trade API',
        description: 'List, buy, bid, and delist NFTs programmatically via Tensor APIs.',
        url: 'https://docs.tensor.so/developers/trade-api',
        content: `## Trade API

Programmatically list, buy, bid, and manage NFT trades on Tensor.

### Key Endpoints

\`\`\`typescript
// Get collection floor and listings
const listings = await fetch('https://api.tensor.so/graphql', {
  method: 'POST',
  body: JSON.stringify({
    query: \`query { activeListings(slug: "mad_lads") { mint price seller } }\`
  })
});

// Buy an NFT
const buyTx = await tensorClient.buy({
  mint: nftMintAddress,
  buyer: wallet.publicKey,
  maxPrice: listingPrice
});
\`\`\`

### Operations
| Action | Description |
|--------|-------------|
| **List** | Put NFT for sale at fixed price |
| **Buy** | Purchase a listed NFT |
| **Bid** | Place an offer on a specific NFT |
| **Collection Bid** | Bid on any NFT in a collection |
| **Delist** | Remove listing |

### Features
- **GraphQL API** for flexible data queries
- **Real-time WebSocket** feeds for price updates
- **Compressed NFT support** via DAS integration
- **Royalty enforcement** options

> **Note:** Tensor offers the most liquid NFT trading on Solana with the tightest spreads.`
      },
      {
        title: 'Collection Bids',
        description: 'Place floor-level bids across entire NFT collections.',
        url: 'https://docs.tensor.so/developers/collection-bids',
        content: `## Collection Bids

Place bids that apply to any NFT within a collection — ideal for floor sweeping and market making.

### How It Works
1. Deposit SOL into your Tensor bid account
2. Set a bid price and target collection
3. Any seller can fill your bid with a matching NFT
4. You receive the NFT, seller receives your SOL

### Key Features
- **Margin system** — Deposit once, bid across multiple collections
- **Auto-fill** — Bids execute automatically when a seller accepts
- **Quantity** — Place multiple bids at the same price
- **Price filters** — Filter by traits, rarity, or specific attributes

### Use Cases
- **Floor sweeping** — Accumulate NFTs at or below floor price
- **Market making** — Provide bid liquidity and earn the spread
- **Trait sniping** — Bid on specific traits at below-market prices
- **DCA into collections** — Gradually accumulate at target prices

### Bid Management
- Bids can be canceled anytime (funds returned)
- Partial fills allowed (if quantity > 1)
- Expired bids auto-return funds

> **Tip:** Collection bids with trait filters can find undervalued NFTs that floor bids miss.`
      },
      {
        title: 'AMM Pools',
        description: 'Create NFT liquidity pools with bonding curves for instant buy/sell.',
        url: 'https://docs.tensor.so/developers/amm',
        content: `## AMM Pools

Create NFT liquidity pools with bonding curves that enable instant buy and sell at algorithmically determined prices.

### How It Works
- Pool holds NFTs + SOL
- **Buy** — Pay SOL, receive NFT (price increases after each buy)
- **Sell** — Deposit NFT, receive SOL (price decreases after each sell)
- **Bonding curve** — Price adjusts automatically based on supply

### Pool Types

| Type | Description |
|------|-------------|
| **Linear** | Price changes by fixed amount per trade |
| **Exponential** | Price changes by percentage per trade |

### Creating a Pool
1. Select a collection
2. Choose pool type (linear/exponential)
3. Set starting price and delta (price change per trade)
4. Deposit initial NFTs and/or SOL
5. Pool goes live — anyone can trade against it

### Use Cases
- **Instant liquidity** — Trade NFTs without waiting for a buyer
- **Market making** — Earn the spread between buy and sell prices
- **Collection exits** — Sell entire collections gradually
- **Price discovery** — Let the market determine fair value

> **Important:** AMM pools carry impermanent loss risk. The pool may end up holding all NFTs (if price drops) or all SOL (if price rises).`
      },
      {
        title: 'Compressed NFTs',
        description: 'Trade and index compressed NFTs via Tensor with DAS integration.',
        url: 'https://docs.tensor.so/developers/compressed-nfts',
        content: `## Compressed NFTs on Tensor

Trade compressed NFTs (cNFTs) on Tensor with full marketplace support powered by DAS API integration.

### How It Works
- Tensor indexes cNFTs via DAS providers (Helius, Triton)
- Listings, bids, and trades work identically to regular NFTs
- Transfer proofs are fetched automatically during trades

### Supported Operations
- **List** cNFTs for sale
- **Buy** listed cNFTs
- **Bid** on individual cNFTs
- **Collection bid** across cNFT collections
- **Transfer** cNFTs between wallets

### Key Differences from Regular NFTs
| Feature | Regular NFT | Compressed NFT |
|---------|------------|-----------------|
| Storage | On-chain account | Merkle tree leaf |
| Transfer cost | ~0.005 SOL | ~0.00005 SOL |
| Proof required | No | Yes (via DAS) |
| Indexing | getProgramAccounts | DAS API only |

### Developer Notes
- cNFT trades require Merkle proofs (handled by Tensor's backend)
- Use DAS API (\`getAssetsByOwner\`) to query cNFT holdings
- Collection-level features (floor price, volume) work across both regular and compressed

> **Note:** Compressed NFTs are significantly cheaper to mint and transfer but require specialized indexing infrastructure.`
      },
    ],
  },
  {
    name: 'Magic Eden',
    slug: 'magic-eden',
    logoUrl: 'https://magiceden.io/favicon.ico',
    docsUrl: 'https://docs.magiceden.io',
    description: 'Leading multi-chain NFT marketplace — listing, auction, and launchpad APIs for Solana and beyond.',
    category: 'Marketplaces',
    tags: ['nft', 'marketplace', 'auction', 'launchpad', 'multi-chain'],
    sections: [
      {
        title: 'Marketplace API',
        description: 'Query collections, listings, activities, and token metadata.',
        url: 'https://docs.magiceden.io/reference/solana-overview',
        content: `## Marketplace API

Query NFT collections, listings, sales activity, and token metadata on Magic Eden.

### Key Endpoints

\`\`\`typescript
// Get collection stats
const stats = await fetch('https://api-mainnet.magiceden.dev/v2/collections/mad_lads/stats');
// Returns: floorPrice, listedCount, volumeAll, avgPrice24hr

// Get listings for a collection
const listings = await fetch(
  'https://api-mainnet.magiceden.dev/v2/collections/mad_lads/listings?offset=0&limit=20'
);

// Get NFT metadata
const nft = await fetch('https://api-mainnet.magiceden.dev/v2/tokens/MINT_ADDRESS');
\`\`\`

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| \`/collections/{symbol}/stats\` | Floor price, volume, listed count |
| \`/collections/{symbol}/listings\` | Active listings with prices |
| \`/collections/{symbol}/activities\` | Sales, listings, delistings |
| \`/tokens/{mint}\` | Single NFT metadata and status |
| \`/wallets/{address}/tokens\` | NFTs held by a wallet |

### Rate Limits
- **Public API** — 120 requests per minute
- **API Key** — Higher limits available upon request

> **Tip:** Use the \`/activities\` endpoint to build real-time sales feeds and track collection momentum.`
      },
      {
        title: 'Listing & Buying',
        description: 'Create listings, execute purchases, and manage offers on-chain.',
        url: 'https://docs.magiceden.io/reference/solana-instructions',
        content: `## Listing & Buying

Create listings, execute purchases, and manage offers on Magic Eden programmatically.

### List an NFT

\`\`\`typescript
const listResponse = await fetch('https://api-mainnet.magiceden.dev/v2/instructions/sell', {
  method: 'GET',
  params: {
    seller: wallet.publicKey.toString(),
    auctionHouseAddress: ME_AUCTION_HOUSE,
    tokenMint: nftMint,
    tokenAccount: nftTokenAccount,
    price: 10.5 // SOL
  }
});
const { tx } = await listResponse.json();
// Sign and send the transaction
\`\`\`

### Buy an NFT

\`\`\`typescript
const buyResponse = await fetch('https://api-mainnet.magiceden.dev/v2/instructions/buy_now', {
  method: 'GET',
  params: {
    buyer: wallet.publicKey.toString(),
    seller: sellerAddress,
    auctionHouseAddress: ME_AUCTION_HOUSE,
    tokenMint: nftMint,
    price: listingPrice
  }
});
\`\`\`

### Operations Flow
1. **List** → Creates an escrow-less listing (NFT stays in your wallet)
2. **Buy** → Transfers SOL to seller, NFT to buyer atomically
3. **Cancel** → Revokes the listing
4. **Bid** → Places an offer (SOL escrowed)

### Fees
- **Seller fee:** 2% marketplace fee
- **Creator royalties:** Configurable (0-10% typically)

> **Note:** Magic Eden uses escrow-less listings — your NFT stays in your wallet until someone buys it.`
      },
      {
        title: 'Launchpad',
        description: 'Launch new NFT collections with configurable mint mechanics.',
        url: 'https://docs.magiceden.io/reference/launchpad',
        content: `## Launchpad

Launch new NFT collections on Magic Eden with configurable mint mechanics, marketing support, and immediate marketplace listing.

### Application Process
1. Submit collection details and artwork samples
2. Magic Eden team reviews for quality and originality
3. If approved, configure mint mechanics
4. Launch on Magic Eden with built-in audience

### Configurable Features
- **Mint price** — Fixed price in SOL
- **Supply** — Total number of NFTs
- **Phases** — Allowlist → public mint
- **Reveal** — Immediate or delayed reveal
- **Royalties** — Set creator royalty percentage

### Benefits
- **Built-in audience** — Access to Magic Eden's user base
- **Marketing support** — Featured placement on the homepage
- **Immediate secondary** — Listed on marketplace right after mint
- **Bot protection** — Captcha and rate limiting

### Post-Launch
- Collection appears in Magic Eden marketplace immediately
- Analytics dashboard for tracking sales and volume
- Optional partnership for continued promotion

> **Note:** Launchpad acceptance is competitive. Strong art, community, and utility increase approval chances.`
      },
      {
        title: 'Wallet Actions',
        description: 'Fetch wallet-level holdings, activities, and offer history.',
        url: 'https://docs.magiceden.io/reference/solana-wallet-actions',
        content: `## Wallet Actions

Query wallet-level NFT holdings, activity history, and active offers.

### Get Wallet NFTs

\`\`\`typescript
const tokens = await fetch(
  'https://api-mainnet.magiceden.dev/v2/wallets/WALLET_ADDRESS/tokens?' +
  new URLSearchParams({
    offset: '0',
    limit: '100',
    listedOnly: 'false'
  })
);
// Returns: mint, name, image, collection, listing status, price
\`\`\`

### Get Wallet Activity

\`\`\`typescript
const activities = await fetch(
  'https://api-mainnet.magiceden.dev/v2/wallets/WALLET_ADDRESS/activities?' +
  new URLSearchParams({ offset: '0', limit: '50' })
);
// Returns: type (buy/sell/list), price, time, counterparty
\`\`\`

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| \`/wallets/{addr}/tokens\` | All NFTs in wallet |
| \`/wallets/{addr}/activities\` | Buy/sell/list history |
| \`/wallets/{addr}/offers_made\` | Active bids placed |
| \`/wallets/{addr}/offers_received\` | Bids on owned NFTs |
| \`/wallets/{addr}/escrow_balance\` | SOL in bid escrow |

### Use Cases
- **Portfolio tracking** — Display all NFTs with current values
- **Activity feeds** — Show recent buys, sells, and listings
- **Offer management** — Track and manage active bids
- **P&L calculation** — Compare buy vs. current floor price

> **Tip:** Combine wallet activities with collection stats to calculate portfolio performance over time.`
      },
    ],
  },
  {
    name: 'Pyth Network',
    slug: 'pyth',
    logoUrl: 'https://pyth.network/favicon.ico',
    docsUrl: 'https://docs.pyth.network',
    description: 'High-fidelity price feeds from institutional sources — real-time data for DeFi protocols on Solana.',
    category: 'Oracles',
    tags: ['oracle', 'price feed', 'data', 'defi', 'real-time'],
    sections: [
      {
        title: 'Price Feeds',
        description: 'Consume real-time price data with confidence intervals for 350+ assets.',
        url: 'https://docs.pyth.network/price-feeds',
        content: `## Price Feeds

Pyth provides real-time price data from institutional sources (exchanges, market makers) for 350+ assets with confidence intervals.

### Key Concepts
- **Price** — Current aggregated price from data providers
- **Confidence** — Statistical uncertainty range (±)
- **Exponent** — Decimal precision (e.g., -8 means divide by 10^8)
- **Status** — Trading, halted, or unknown

### Reading Prices On-Chain (Solana)

\`\`\`rust
use pyth_solana_receiver_sdk::price_update::PriceUpdateV2;

// In your Anchor instruction
let price_update = &ctx.accounts.price_feed;
let price = price_update.get_price_no_older_than(
    &Clock::get()?,
    60, // max age in seconds
    &sol_usd_feed_id
)?;

let sol_price = price.price as f64 * 10f64.powi(price.exponent);
\`\`\`

### Available Feeds
| Category | Examples |
|----------|---------|
| **Crypto** | SOL/USD, BTC/USD, ETH/USD |
| **Forex** | EUR/USD, GBP/USD |
| **Equities** | AAPL, TSLA, SPY |
| **Commodities** | Gold, Silver, Oil |

### Key Features
- **Sub-second updates** — 400ms update frequency
- **Confidence intervals** — Know the uncertainty of each price
- **Pull oracle** — On-demand price updates (cheaper than push)
- **Cross-chain** — Same feeds available on 40+ chains

> **Important:** Always check \`price.confidence\` — a wide confidence interval means the price may be unreliable. DeFi protocols should pause operations when confidence is too wide.`
      },
      {
        title: 'Solana SDK',
        description: 'Integrate Pyth price feeds into Solana programs with the on-chain SDK.',
        url: 'https://docs.pyth.network/price-feeds/use-real-time-data/solana',
        content: `## Solana SDK

Integrate Pyth price feeds into your Solana programs for on-chain price data.

### Anchor Integration

\`\`\`rust
use anchor_lang::prelude::*;
use pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, get_feed_id_from_hex};

#[derive(Accounts)]
pub struct CheckPrice<'info> {
    pub price_update: Account<'info, PriceUpdateV2>,
}

pub fn check_price(ctx: Context<CheckPrice>) -> Result<()> {
    let price_update = &ctx.accounts.price_update;
    
    let feed_id = get_feed_id_from_hex(
        "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d" // SOL/USD
    )?;
    
    let price = price_update.get_price_no_older_than(
        &Clock::get()?,
        60, // max staleness (seconds)
        &feed_id
    )?;
    
    msg!("SOL price: {} × 10^{}", price.price, price.exponent);
    Ok(())
}
\`\`\`

### Client-Side (Post Price Update)

\`\`\`typescript
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';

const pythReceiver = new PythSolanaReceiver({ connection, wallet });
const priceUpdateAccount = await pythReceiver.fetchPriceUpdateAccount(feedId);

// Pass as account to your program instruction
await program.methods.checkPrice()
  .accounts({ priceUpdate: priceUpdateAccount })
  .rpc();
\`\`\`

### Feed IDs
Find feed IDs at [pyth.network/developers/price-feed-ids](https://pyth.network/developers/price-feed-ids)

> **Tip:** Always set a reasonable \`maxStaleness\` to reject outdated prices. 60 seconds is standard for most DeFi applications.`
      },
      {
        title: 'Benchmarks',
        description: 'Access historical price data for settlement and analytics.',
        url: 'https://docs.pyth.network/benchmarks',
        content: `## Benchmarks

Access historical Pyth price data for settlement, analytics, and backtesting.

### API Access

\`\`\`typescript
// Get historical price at a specific timestamp
const response = await fetch(
  'https://benchmarks.pyth.network/v1/shims/tradingview/history?' +
  new URLSearchParams({
    symbol: 'Crypto.SOL/USD',
    resolution: '1',     // 1-minute candles
    from: '1700000000',  // Unix timestamp
    to: '1700003600'
  })
);
\`\`\`

### Use Cases
- **Settlement** — Resolve predictions, options, and perpetuals at historical prices
- **Backtesting** — Test trading strategies against real price data
- **Analytics** — Build price charts and volatility analysis
- **Audit trails** — Prove prices at specific points in time

### Data Availability
- **Resolution:** 1-second to daily candles
- **History:** Multiple months of data available
- **Assets:** All Pyth-supported price feeds
- **Format:** OHLCV (Open, High, Low, Close, Volume)

### Key Features
- **TradingView compatible** — Standard charting data format
- **REST API** — Simple HTTP requests
- **Free access** — No API key required for basic usage

> **Note:** Benchmark prices are finalized and immutable — ideal for on-chain settlement where the price at a specific timestamp matters.`
      },
      {
        title: 'TradingView Integration',
        description: 'Use Pyth data with TradingView charting for front-end price displays.',
        url: 'https://docs.pyth.network/price-feeds/integrations/tradingview',
        content: `## TradingView Integration

Display Pyth price feeds using TradingView's charting library for professional-grade price displays.

### Setup

\`\`\`typescript
import { widget } from 'charting_library';

const tvWidget = new widget({
  symbol: 'Crypto.SOL/USD',
  datafeed: {
    onReady: (callback) => {
      callback({ supported_resolutions: ['1', '5', '15', '60', 'D'] });
    },
    getBars: async (symbolInfo, resolution, from, to, onResult) => {
      const data = await fetch(
        \`https://benchmarks.pyth.network/v1/shims/tradingview/history?symbol=\${symbolInfo.ticker}&resolution=\${resolution}&from=\${from}&to=\${to}\`
      );
      const bars = await data.json();
      onResult(bars, { noData: bars.length === 0 });
    },
    // ... other datafeed methods
  },
  container: 'tv_chart_container',
  library_path: '/charting_library/',
  locale: 'en',
  theme: 'dark'
});
\`\`\`

### Available Symbols
- **Crypto:** \`Crypto.SOL/USD\`, \`Crypto.BTC/USD\`, \`Crypto.ETH/USD\`
- **Forex:** \`FX.EUR/USD\`, \`FX.GBP/USD\`
- **Equities:** \`Equity.US.AAPL/USD\`

### Features
- Real-time price streaming
- Historical candlestick data
- Technical indicators
- Drawing tools

> **Tip:** Use the Pyth TradingView data feed endpoint directly — it's compatible with TradingView's UDF protocol out of the box.`
      },
    ],
  },
  {
    name: 'Switchboard',
    slug: 'switchboard',
    logoUrl: 'https://switchboard.xyz/favicon.ico',
    docsUrl: 'https://docs.switchboard.xyz',
    description: 'Permissionless oracle network — custom data feeds, verifiable randomness, and serverless functions on Solana.',
    category: 'Oracles',
    tags: ['oracle', 'vrf', 'randomness', 'data feed', 'serverless'],
    sections: [
      {
        title: 'Data Feeds',
        description: 'Create and consume custom oracle data feeds with configurable update intervals.',
        url: 'https://docs.switchboard.xyz/solana/data-feeds',
        content: `## Data Feeds

Create permissionless custom oracle data feeds with configurable sources, update intervals, and aggregation methods.

### Reading a Feed On-Chain

\`\`\`rust
use switchboard_solana::AggregatorAccountData;

let feed = AggregatorAccountData::new(feed_account)?;
let value = feed.get_result()?.try_into_f64()?;
let staleness = Clock::get()?.unix_timestamp - feed.latest_confirmed_round.round_open_timestamp;

require!(staleness < 60, ErrorCode::StaleFeed);
msg!("Feed value: {}", value);
\`\`\`

### Creating a Custom Feed
1. Define data sources (APIs, on-chain data, computations)
2. Configure aggregation (median, mean, min, max)
3. Set update interval and minimum oracle responses
4. Fund the feed's escrow for oracle payments

### Key Features
- **Permissionless** — Anyone can create feeds
- **Custom sources** — Any public API or on-chain data
- **Configurable aggregation** — Choose how values are combined
- **History buffer** — Store historical values on-chain

### Feed Types
| Type | Description |
|------|-------------|
| **Price feeds** | Token prices from multiple exchanges |
| **Sports data** | Scores, stats for prediction markets |
| **Weather** | Temperature, conditions for parametric insurance |
| **Custom** | Any off-chain data you need on-chain |

> **Key Advantage:** Unlike Pyth (which focuses on financial data from institutions), Switchboard lets you create feeds for ANY type of data.`
      },
      {
        title: 'Randomness (VRF)',
        description: 'Generate provably fair random numbers on-chain for games and lotteries.',
        url: 'https://docs.switchboard.xyz/solana/randomness',
        content: `## Randomness (VRF)

Generate provably fair, verifiable random numbers on-chain using Switchboard's Verifiable Random Function.

### How VRF Works
1. Your program requests randomness
2. Switchboard oracles generate a random proof
3. Proof is verified on-chain (provably fair)
4. Random result delivered to your program's callback

### On-Chain Usage

\`\`\`rust
use switchboard_solana::VrfAccountData;

// In your callback instruction
let vrf = VrfAccountData::new(vrf_account)?;
let result = vrf.get_result()?;

// Use the random bytes
let random_value = result[0] as u64 % 100; // Random 0-99
\`\`\`

### Key Properties
- **Verifiable** — Anyone can verify the randomness proof
- **Unpredictable** — Neither requester nor oracle can manipulate
- **On-chain proof** — Verification happens in the Solana runtime
- **Callback pattern** — Results delivered asynchronously

### Use Cases
- **Gaming** — Loot drops, card draws, dice rolls
- **Lotteries** — Provably fair winner selection
- **NFT reveals** — Random trait assignment
- **Raffles** — Transparent winner picking

> **Important:** VRF results are delivered asynchronously. Design your program with a "request" instruction and a separate "consume" callback instruction.`
      },
      {
        title: 'Serverless Functions',
        description: 'Run off-chain compute in TEEs and post results on-chain trustlessly.',
        url: 'https://docs.switchboard.xyz/solana/functions',
        content: `## Serverless Functions

Run arbitrary off-chain computation in Trusted Execution Environments (TEEs) and post verified results on-chain.

### How It Works
1. Write a function in Rust/TypeScript
2. Function runs inside a TEE (Intel SGX)
3. TEE produces an attestation proof
4. Results + proof posted on-chain and verified

### Example Function

\`\`\`rust
use switchboard_solana::prelude::*;

#[switchboard_function]
pub async fn my_function(runner: FunctionRunner, params: Vec<u8>) -> Result<()> {
    // Fetch external data
    let resp = reqwest::get("https://api.example.com/data").await?;
    let data: MyData = resp.json().await?;
    
    // Build Solana instruction with result
    let ix = Instruction {
        program_id: my_program_id,
        accounts: vec![...],
        data: data.serialize()
    };
    
    runner.emit(vec![ix]).await?;
    Ok(())
}
\`\`\`

### Use Cases
- **Complex computations** — ML inference, statistical analysis
- **API integrations** — Fetch and verify external API data
- **Cross-chain reads** — Query other blockchain states
- **Privacy-preserving** — Process sensitive data in TEEs

### Key Features
- **Trustless** — TEE attestation ensures code ran unmodified
- **Scheduled** — Run on cron schedules or on-demand
- **Composable** — Emit arbitrary Solana instructions
- **Permissionless** — Anyone can deploy functions

> **Tip:** Switchboard Functions are ideal for computations too complex or expensive to run on-chain, while maintaining trustlessness.`
      },
      {
        title: 'SDK & CLI',
        description: 'TypeScript SDK and CLI for managing feeds, queues, and oracles.',
        url: 'https://docs.switchboard.xyz/solana/sdk',
        content: `## SDK & CLI

TypeScript SDK and CLI for creating and managing Switchboard feeds, randomness, and functions.

### Installation

\`\`\`bash
npm install @switchboard-xyz/solana.js
\`\`\`

### SDK Usage

\`\`\`typescript
import { SwitchboardProgram, AggregatorAccount } from '@switchboard-xyz/solana.js';

const program = await SwitchboardProgram.load(connection);

// Read a feed
const aggregator = new AggregatorAccount(program, feedPubkey);
const result = await aggregator.fetchLatestValue();
console.log('Current value:', result?.toNumber());

// Create a new feed
const [aggregator, tx] = await AggregatorAccount.create(program, {
  queueAccount,
  batchSize: 3,
  minRequiredOracleResults: 2,
  minUpdateDelaySeconds: 30,
  name: 'My Custom Feed'
});
\`\`\`

### CLI Commands
\`\`\`bash
# Install CLI
npm install -g @switchboard-xyz/cli

# Create a feed
sb solana aggregator create --keypair wallet.json

# Read a feed value
sb solana aggregator print <FEED_ADDRESS>

# Fund a feed
sb solana aggregator fund <FEED_ADDRESS> --amount 0.1
\`\`\`

### Key Objects
| Object | Description |
|--------|-------------|
| **AggregatorAccount** | Data feed with configurable sources |
| **OracleQueueAccount** | Queue of oracles serving requests |
| **VrfAccount** | Randomness request and result |
| **FunctionAccount** | Serverless function definition |

> **Tip:** Use the CLI for quick prototyping and the SDK for production integrations.`
      },
    ],
  },
  {
    name: 'Clockwork',
    slug: 'clockwork',
    logoUrl: 'https://clockwork.xyz/favicon.ico',
    docsUrl: 'https://docs.clockwork.xyz',
    description: 'Automation infrastructure for Solana — schedule transactions, cron jobs, and recurring on-chain operations.',
    category: 'Automation',
    tags: ['automation', 'cron', 'scheduler', 'threads', 'recurring'],
    sections: [
      {
        title: 'Threads',
        description: 'Create automated transaction threads that execute on a schedule or trigger condition.',
        url: 'https://docs.clockwork.xyz/developers/threads',
        content: `## Threads

Clockwork threads are automated execution units that trigger Solana transactions based on schedules or conditions.

### Create a Thread

\`\`\`typescript
import { ClockworkProvider } from '@clockwork-xyz/sdk';

const clockwork = ClockworkProvider.fromAnchorProvider(provider);

const thread = await clockwork.threadCreate(
  wallet.publicKey,
  'my-automation',
  [targetInstruction], // Instructions to execute
  { cron: { schedule: '0 */5 * * * *' } }, // Every 5 minutes
  new BN(0.1 * LAMPORTS_PER_SOL) // Thread funding
);
\`\`\`

### Trigger Types
| Type | Description |
|------|-------------|
| **Cron** | Execute on a cron schedule |
| **Account** | Execute when account data changes |
| **Now** | Execute immediately |
| **Epoch** | Execute at specific epoch boundaries |

### Key Features
- **Self-sustaining** — Thread pays for its own transactions from its balance
- **Permissionless** — Anyone can create threads
- **Composable** — Execute any Solana instruction
- **Monitoring** — Track execution history and failures

### Thread Management
- **Pause / Resume** — Temporarily stop execution
- **Update** — Change schedule or target instructions
- **Delete** — Remove thread and reclaim rent + remaining balance
- **Fund** — Add SOL to keep the thread running

> **Important:** Threads need SOL balance to pay for transaction fees. Monitor and top up regularly to prevent pauses.`
      },
      {
        title: 'Cron Schedules',
        description: 'Define cron-style schedules for recurring on-chain operations.',
        url: 'https://docs.clockwork.xyz/developers/threads/cron-trigger',
        content: `## Cron Schedules

Define cron-style schedules to trigger on-chain transactions at precise intervals.

### Cron Syntax
\`\`\`
┌──────── second (0-59)
│ ┌────── minute (0-59)
│ │ ┌──── hour (0-23)
│ │ │ ┌── day of month (1-31)
│ │ │ │ ┌ month (1-12)
│ │ │ │ │ ┌ day of week (0-6, Sun=0)
│ │ │ │ │ │
* * * * * *
\`\`\`

### Common Patterns
| Schedule | Cron Expression |
|----------|----------------|
| Every minute | \`0 * * * * *\` |
| Every 5 minutes | \`0 */5 * * * *\` |
| Every hour | \`0 0 * * * *\` |
| Daily at midnight | \`0 0 0 * * *\` |
| Every Monday | \`0 0 0 * * 1\` |
| First of month | \`0 0 0 1 * *\` |

### Use Cases
- **DeFi** — Auto-compound yield positions
- **Governance** — Schedule proposal execution
- **Data feeds** — Periodic on-chain data updates
- **Payments** — Recurring token distributions
- **Maintenance** — Clean up expired accounts

> **Note:** Clockwork uses a 6-field cron format (including seconds), unlike the standard 5-field Unix cron.`
      },
      {
        title: 'Account Triggers',
        description: 'Trigger threads based on on-chain account state changes.',
        url: 'https://docs.clockwork.xyz/developers/threads/account-trigger',
        content: `## Account Triggers

Trigger thread execution automatically when a specific on-chain account's data changes.

### Setup

\`\`\`typescript
const thread = await clockwork.threadCreate(
  wallet.publicKey,
  'price-watcher',
  [rebalanceInstruction],
  {
    account: {
      address: priceAccountPubkey,
      offset: 8,  // byte offset to watch
      size: 8     // number of bytes to monitor
    }
  },
  new BN(0.1 * LAMPORTS_PER_SOL)
);
\`\`\`

### How It Works
1. Specify an account address and byte range to monitor
2. Clockwork nodes watch for changes in those bytes
3. When data changes, your thread's instructions execute
4. Thread re-arms automatically for the next change

### Parameters
| Field | Description |
|-------|-------------|
| **address** | Account to monitor |
| **offset** | Starting byte position to watch |
| **size** | Number of bytes to compare |

### Use Cases
- **Price-based actions** — Execute when oracle price changes
- **State machine transitions** — React to program state changes
- **Liquidation bots** — Monitor health factors
- **Event listeners** — Respond to on-chain events

> **Tip:** Combine account triggers with conditional logic in your program to create sophisticated automated strategies (e.g., rebalance only when price deviates >5%).`
      },
      {
        title: 'SDK',
        description: 'Rust and TypeScript SDKs for creating and managing automation threads.',
        url: 'https://docs.clockwork.xyz/developers/sdk',
        content: `## SDK

TypeScript and Rust SDKs for creating and managing Clockwork automation threads.

### TypeScript SDK

\`\`\`typescript
import { ClockworkProvider } from '@clockwork-xyz/sdk';

const clockwork = ClockworkProvider.fromAnchorProvider(provider);

// Create thread
const threadPda = clockwork.getThreadPDA(wallet.publicKey, 'my-thread');
await clockwork.threadCreate(
  wallet.publicKey, 'my-thread',
  instructions, trigger, fundingAmount
);

// Read thread state
const thread = await clockwork.getThreadAccount(threadPda);
console.log('Executions:', thread.execContext?.execs_since_slot);

// Manage
await clockwork.threadPause(wallet.publicKey, threadPda);
await clockwork.threadResume(wallet.publicKey, threadPda);
await clockwork.threadDelete(wallet.publicKey, threadPda);
\`\`\`

### Rust SDK (On-Chain)

\`\`\`rust
use clockwork_sdk::state::Thread;

// In your Anchor program
#[derive(Accounts)]
pub struct AutoExecute<'info> {
    #[account(
        signer,
        constraint = thread.authority == authority.key()
    )]
    pub thread: Account<'info, Thread>,
    pub authority: Signer<'info>,
}
\`\`\`

### Thread Lifecycle
1. **Create** → Thread is initialized with trigger and instructions
2. **Active** → Executes based on trigger conditions
3. **Paused** → Temporarily stopped, can be resumed
4. **Deleted** → Removed, rent + balance returned

> **Note:** The TypeScript SDK wraps Anchor under the hood — you need an AnchorProvider to initialize it.`
      },
    ],
  },
  {
    name: 'Helium',
    slug: 'helium',
    logoUrl: 'https://docs.helium.com/img/icons/logoblack.svg',
    docsUrl: 'https://docs.helium.com',
    description: 'Decentralized wireless network built on Solana — IoT and mobile hotspot coverage with token incentives.',
    category: 'Infrastructure',
    tags: ['iot', 'wireless', 'hotspot', 'mobile', 'depin', 'hnt'],
    sections: [
      {
        title: 'Network Overview',
        description: 'Understand the Helium network architecture, subDAOs, and token economics on Solana.',
        url: 'https://docs.helium.com/solana/',
        content: `## Network Overview

Helium is the world's largest decentralized wireless network, migrated to Solana for scalability and composability.

### Architecture
- **Helium Network** — Decentralized IoT and mobile coverage
- **Solana L1** — All state, tokens, and governance on Solana
- **SubDAOs** — Separate governance for IoT and Mobile networks

### Token Economics
| Token | Purpose |
|-------|---------|
| **HNT** | Main governance and utility token |
| **MOBILE** | Rewards for 5G hotspot operators |
| **IOT** | Rewards for IoT (LoRaWAN) hotspot operators |
| **DC** | Data Credits (burned for network usage, pegged to $0.00001) |

### Key Concepts
- **Proof of Coverage** — Hotspots prove they're providing wireless coverage
- **Data Transfer** — IoT devices and mobile users pay DC for connectivity
- **Hotspot NFTs** — Each hotspot is represented as an NFT on Solana
- **Treasury** — HNT can be redeemed for IOT or MOBILE via subDAO treasuries

### Why Solana?
- **Speed** — Handle millions of hotspot heartbeats and rewards
- **Cost** — Sub-cent transaction fees for frequent micro-rewards
- **Composability** — HNT/MOBILE/IOT tradeable on all Solana DEXs

> **Note:** Helium's migration to Solana in April 2023 was the largest L1 migration in crypto history, moving 1M+ hotspot NFTs and all governance on-chain.`
      },
      {
        title: 'Hotspot Onboarding',
        description: 'Register and manage IoT and mobile hotspots on the Helium network.',
        url: 'https://docs.helium.com/hotspot-makers/hotspot-integration-guide',
        content: `## Hotspot Onboarding

Register new IoT (LoRaWAN) and mobile (5G) hotspots on the Helium network.

### Onboarding Process
1. **Manufacture** — Build hotspot hardware meeting Helium specifications
2. **Register** — Mint a Hotspot NFT on Solana representing the device
3. **Assert Location** — Declare the hotspot's physical location on-chain
4. **Activate** — Hotspot begins Proof of Coverage and earns rewards

### Hotspot Types
| Type | Technology | Token |
|------|-----------|-------|
| **IoT** | LoRaWAN (long range, low power) | IOT |
| **Mobile** | 5G/LTE CBRS | MOBILE |

### Maker Requirements
- **HIP-19 approval** — Apply to become an approved hotspot maker
- **Security** — Implement secure element for device identity
- **Firmware** — Run Helium-compatible firmware
- **Onboarding fees** — Pay DC for location assertion and registration

### Earning Rewards
- **Proof of Coverage** — Earn tokens for verifying wireless coverage
- **Data Transfer** — Earn tokens when IoT devices use your hotspot
- **Location verification** — Periodic checks ensure accurate placement

> **Important:** Hotspot placement matters — earnings depend on coverage utility, not just being online. Urban areas with sensor demand earn more.`
      },
      {
        title: 'Token Migration',
        description: 'Details on HNT, MOBILE, and IOT token migration from L1 to Solana.',
        url: 'https://docs.helium.com/solana/migration/',
        content: `## Token Migration

All Helium tokens (HNT, MOBILE, IOT, DC) migrated from the Helium L1 to Solana in April 2023.

### What Migrated
- **HNT** → SPL token on Solana
- **MOBILE** → SPL token on Solana
- **IOT** → SPL token on Solana
- **Hotspots** → NFTs on Solana (via Metaplex)
- **Governance** → Helium Vote on Solana (via Realms)

### Token Addresses
| Token | Solana Mint |
|-------|-------------|
| HNT | \`hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux\` |
| MOBILE | \`mb1eu7TzEc71KxDpsmsKoucSSuuo6KWC499aAt5Q3MOY\` |
| IOT | \`iotEVVZLEywoTn1QdwNPddxPWszn3zFhEot3MfL9fns\` |

### Post-Migration Benefits
- **DeFi integration** — Trade on Jupiter, Orca, Raydium
- **Wallet support** — Use Phantom, Solflare, Backpack
- **Composability** — Build dApps on Helium data
- **Speed** — Faster rewards distribution and governance

### For Token Holders
- Tokens were automatically migrated
- Same amounts, same ownership
- Access via any Solana wallet
- Staking and governance via Helium Vote (Realms)

> **Note:** Data Credits (DC) are non-transferable utility tokens burned for network usage. They are not traded on DEXs.`
      },
      {
        title: 'Governance',
        description: 'Participate in Helium Improvement Proposals (HIPs) and network governance.',
        url: 'https://docs.helium.com/governance/',
        content: `## Governance

Participate in Helium network governance through Helium Improvement Proposals (HIPs) and on-chain voting.

### How Governance Works
1. **Propose** — Anyone can author a HIP (Helium Improvement Proposal)
2. **Discuss** — Community reviews on GitHub and Discord
3. **Vote** — Token holders vote on-chain via Helium Vote (Realms)
4. **Execute** — Approved proposals are implemented by the core team

### Voting Power
| Token | Votes In |
|-------|----------|
| **HNT** | Network-wide proposals |
| **IOT** | IoT subDAO proposals |
| **MOBILE** | Mobile subDAO proposals |
| **veHNT** | Boosted voting with locked staking |

### SubDAO Governance
- **IoT subDAO** — Governs LoRaWAN network parameters
- **Mobile subDAO** — Governs 5G/mobile network parameters
- Each subDAO has independent treasury and token economics

### Key Governance Areas
- Network parameters (reward splits, emission schedules)
- New hotspot types and makers
- Protocol upgrades and feature additions
- Treasury allocations and grants

### How to Vote
1. Hold HNT, IOT, or MOBILE tokens
2. Visit [heliumvote.com](https://heliumvote.com)
3. Connect your Solana wallet
4. Lock tokens (optional) for boosted voting power
5. Cast your vote on active proposals

> **Tip:** Lock HNT as veHNT for significantly higher voting power — longer lock periods give more weight.`
      },
    ],
  },
  {
    name: 'Dialect',
    slug: 'dialect',
    logoUrl: 'https://www.dialect.to/favicon.ico',
    docsUrl: 'https://docs.dialect.to',
    description: 'On-chain messaging and notifications for Solana — wallet-to-wallet chat, dApp alerts, and NFT-gated channels.',
    category: 'Messaging',
    tags: ['messaging', 'notifications', 'chat', 'alerts', 'wallet'],
    sections: [
      {
        title: 'Blinks (Blockchain Links)',
        description: 'Create shareable, interactive transaction links that work across any Solana app.',
        url: 'https://docs.dialect.to/documentation/actions/what-are-actions',
        content: `## Blinks (Blockchain Links)

Blinks are shareable URLs that unfurl into interactive Solana transaction interfaces anywhere they're shared — Twitter, Discord, websites, etc.

### How Blinks Work
1. Create an **Action** (API endpoint that returns transaction instructions)
2. Share the **Blink URL** (e.g., \`https://dial.to/?action=solana-action:https://yourapi.com/donate\`)
3. Compatible clients render an interactive card with buttons
4. Users click to sign and execute the transaction in-line

### Example Action API

\`\`\`typescript
// GET /api/action — Returns action metadata
app.get('/api/action', (req, res) => {
  res.json({
    icon: 'https://yoursite.com/logo.png',
    title: 'Donate to Project',
    description: 'Support open-source Solana development',
    label: 'Donate',
    links: {
      actions: [
        { label: '0.1 SOL', href: '/api/action?amount=0.1' },
        { label: '1 SOL', href: '/api/action?amount=1' },
        { label: 'Custom', href: '/api/action?amount={amount}', parameters: [{ name: 'amount', label: 'SOL Amount' }] }
      ]
    }
  });
});

// POST /api/action — Returns transaction to sign
app.post('/api/action', (req, res) => {
  const { account } = req.body; // User's wallet
  const tx = buildDonateTransaction(account, amount);
  res.json({ transaction: tx.serialize().toString('base64') });
});
\`\`\`

### Use Cases
- **Donations** — One-click tipping and funding
- **NFT minting** — Mint directly from a tweet
- **Token swaps** — Swap tokens from a shared link
- **Governance** — Vote on proposals from social media

> **Key Insight:** Blinks turn any URL into a mini-dApp. They dramatically lower the friction for on-chain actions by meeting users where they already are.`
      },
      {
        title: 'Actions SDK',
        description: 'Build Solana Actions — transaction-ready URLs that can be shared and executed anywhere.',
        url: 'https://docs.dialect.to/documentation/actions/sdk',
        content: `## Actions SDK

Build Solana Actions — standardized API endpoints that return transaction instructions for Blinks and other clients.

### Installation

\`\`\`bash
npm install @solana/actions
\`\`\`

### Action Server Example

\`\`\`typescript
import { createActionHeaders, ActionGetResponse, ActionPostResponse } from '@solana/actions';

// GET handler — describe the action
export function GET(): ActionGetResponse {
  return {
    icon: 'https://example.com/icon.png',
    title: 'Stake SOL',
    description: 'Stake SOL with our validator',
    label: 'Stake',
  };
}

// POST handler — build the transaction
export async function POST(req: Request): Promise<ActionPostResponse> {
  const { account } = await req.json();
  const transaction = buildStakeTransaction(account);
  
  return {
    transaction: Buffer.from(
      transaction.serialize()
    ).toString('base64'),
    message: 'Successfully staked SOL!'
  };
}
\`\`\`

### Actions Spec
- **GET** returns metadata (icon, title, description, buttons)
- **POST** receives user's public key, returns serialized transaction
- **CORS headers** required for cross-origin Blink rendering
- **actions.json** at domain root for discovery

### Hosting
Actions can be hosted anywhere — Vercel, Cloudflare Workers, your own server. The key requirement is proper CORS headers.

> **Tip:** Use the \`@solana/actions\` package for helper functions and type definitions that ensure spec compliance.`
      },
      {
        title: 'Notifications',
        description: 'Send wallet-targeted notifications and alerts from your dApp to users.',
        url: 'https://docs.dialect.to/documentation/notifications',
        content: `## Notifications

Send targeted notifications to users' wallets from your dApp — alerts, updates, and event notifications.

### How It Works
1. Register your dApp with Dialect
2. Users subscribe to your notifications (opt-in)
3. Send notifications via API
4. Users receive alerts in Dialect-compatible wallets and apps

### Sending Notifications

\`\`\`typescript
import { Dialect } from '@dialectlabs/sdk';

const dialect = Dialect.sdk({ environment: 'production' });

await dialect.dapps.messages.send({
  title: 'Position Liquidation Warning',
  message: 'Your SOL/USDC position health is below 1.2. Consider adding collateral.',
  recipients: [walletAddress],
  actions: [
    { label: 'Add Collateral', url: 'https://yourapp.com/positions' }
  ]
});
\`\`\`

### Notification Types
- **Alerts** — Urgent notifications (liquidation warnings, price alerts)
- **Updates** — Informational (governance votes, protocol updates)
- **Transactions** — Confirmations and receipts
- **Marketing** — New features, promotions (with user consent)

### Delivery Channels
- **In-app** — Dialect notification center
- **Email** — If user provides email
- **Telegram** — Via Dialect Telegram bot
- **Wallet** — Native wallet notification support

> **Note:** Users must opt-in to receive notifications. Respect user preferences and avoid spamming to maintain trust.`
      },
      {
        title: 'Smart Messaging',
        description: 'Integrate wallet-to-wallet messaging with token-gated and NFT-gated channels.',
        url: 'https://docs.dialect.to/documentation/messaging',
        content: `## Smart Messaging

Wallet-to-wallet messaging with token-gating, NFT-gated channels, and dApp-integrated chat.

### Features
- **Wallet-to-wallet chat** — Direct messaging between Solana wallets
- **Group channels** — Token or NFT-gated community channels
- **dApp integration** — Embed chat into your application
- **On-chain verification** — Messages signed by wallet

### Token-Gated Channels

\`\`\`typescript
// Create a channel gated by NFT ownership
const channel = await dialect.channels.create({
  name: 'Holders Only',
  description: 'Exclusive channel for NFT holders',
  gate: {
    type: 'nft',
    collection: collectionMintAddress,
    minAmount: 1
  }
});
\`\`\`

### Gate Types
| Type | Requirement |
|------|-------------|
| **NFT** | Hold specific NFT collection |
| **Token** | Hold minimum token amount |
| **Token + Amount** | Hold ≥ X tokens |
| **Program** | Have interacted with a program |

### Use Cases
- **DAO communication** — Token-gated governance discussions
- **NFT communities** — Holder-only channels
- **Support** — Direct wallet-to-dApp messaging
- **Trading** — P2P negotiation with verified wallets

> **Tip:** Token-gated channels create high-signal communities where membership is proven on-chain — no impersonation possible.`
      },
    ],
  },
  {
    name: 'Solflare',
    slug: 'solflare',
    logoUrl: 'https://solflare.com/favicon.ico',
    docsUrl: 'https://docs.solflare.com',
    description: 'Feature-rich Solana wallet — staking, swaps, NFT gallery, and hardware wallet support with MetaMask Snaps.',
    category: 'Wallets',
    tags: ['wallet', 'staking', 'nft', 'hardware', 'metamask snaps'],
    sections: [
      { title: 'Wallet Adapter', description: 'Integrate Solflare via the standard Solana Wallet Adapter for seamless dApp connections.', url: 'https://docs.solflare.com/solflare/integrations/wallet-adapter', content: `## Wallet Adapter\n\nIntegrate Solflare using the standard Solana Wallet Adapter.\n\n### Setup\n\n\`\`\`typescript\nimport { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';\n\nconst wallets = [\n  new SolflareWalletAdapter()\n];\n// Use with WalletProvider as shown in Phantom docs\n\`\`\`\n\n### Key Features\n- **Standard adapter** — Works with any Wallet Adapter-compatible dApp\n- **Auto-detect** — Solflare browser extension detected automatically\n- **Mobile support** — Works in Solflare mobile browser\n- **Hardware wallet** — Supports Ledger via Solflare\n\n### Solflare-Specific Features\n- Transaction simulation preview\n- Token auto-detection\n- Built-in swap interface\n- NFT gallery with metadata\n\n> **Tip:** Including both Phantom and Solflare adapters gives you coverage for the majority of Solana wallet users.` },
      { title: 'MetaMask Snaps', description: 'Use Solflare through MetaMask via the Solana Snap extension.', url: 'https://docs.solflare.com/solflare/integrations/metamask-snap', content: `## MetaMask Snaps\n\nSolflare's MetaMask Snap allows MetaMask users to interact with Solana dApps without installing a separate wallet.\n\n### How It Works\n1. User has MetaMask installed\n2. Your dApp prompts to install the Solana Snap\n3. Snap creates a Solana keypair derived from MetaMask's seed\n4. User can sign Solana transactions through MetaMask\n\n### Integration\n\`\`\`typescript\nimport { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';\n\n// The Solflare adapter automatically detects and offers MetaMask Snap\nconst wallets = [new SolflareWalletAdapter()];\n\`\`\`\n\n### Benefits\n- **No new wallet** — Existing MetaMask users can use Solana\n- **Same seed phrase** — Derived from MetaMask's existing keys\n- **Cross-chain** — One wallet for ETH and SOL\n- **Onboarding** — Lower barrier for Ethereum users\n\n> **Note:** MetaMask Snaps are in beta. The UX may differ from native Solflare wallet.` },
      { title: 'Staking', description: 'Delegate SOL to validators directly from the wallet with performance analytics.', url: 'https://docs.solflare.com/solflare/staking', content: `## Staking\n\nDelegate SOL to validators directly from Solflare with performance analytics and reward tracking.\n\n### Staking from Solflare\n1. Open Solflare wallet\n2. Navigate to Staking tab\n3. Choose a validator (sorted by performance, commission, stake)\n4. Enter amount to stake\n5. Confirm transaction\n\n### Validator Metrics\n| Metric | Description |\n|--------|-------------|\n| **APY** | Annual percentage yield |\n| **Commission** | % of rewards kept by validator |\n| **Uptime** | Historical reliability |\n| **Total Stake** | SOL delegated to validator |\n| **Skip Rate** | Percentage of missed slots |\n\n### Key Features\n- **Validator comparison** — Side-by-side performance metrics\n- **Reward tracking** — Historical rewards with charts\n- **Auto-delegation** — Stake new SOL to existing validator\n- **Split stake** — Delegate to multiple validators\n\n### Unstaking\n- Unstaking takes **2-3 days** (current + next epoch)\n- Rewards continue until deactivation completes\n- Funds return to main wallet automatically\n\n> **Tip:** Choose validators with low commission, high uptime, and reasonable stake to support decentralization.` },
      { title: 'Transaction Simulation', description: 'Preview transaction effects before signing to prevent malicious approvals.', url: 'https://docs.solflare.com/solflare/security', content: `## Transaction Simulation\n\nSolflare simulates transactions before signing to show you exactly what will happen — protecting against malicious dApps.\n\n### What Simulation Shows\n- **SOL changes** — How much SOL you'll send or receive\n- **Token changes** — SPL token balance changes\n- **NFT transfers** — Which NFTs will move\n- **Approval changes** — Token approvals being granted\n- **Program interactions** — Which programs the tx calls\n\n### Risk Indicators\n| Level | Description |\n|-------|-------------|\n| ✅ **Safe** | Standard transfer or known program |\n| ⚠️ **Caution** | Unusual pattern or unknown program |\n| 🔴 **Danger** | Suspicious approval or known scam pattern |\n\n### How It Works\n1. dApp sends transaction to Solflare for signing\n2. Solflare simulates the transaction against current state\n3. Results displayed in human-readable format\n4. User reviews and approves or rejects\n\n### Protection Against\n- **Drainer contracts** — Detects approvals to known malicious programs\n- **Unexpected transfers** — Alerts when tx sends more than expected\n- **Spoofed tokens** — Identifies fake token metadata\n\n> **Important:** Always review simulation results carefully. If a "free mint" transaction shows it's transferring your valuable NFTs, reject it immediately.` },
    ],
  },
  {
    name: 'Light Protocol',
    slug: 'light-protocol',
    logoUrl: 'https://www.lightprotocol.com/favicon.ico',
    docsUrl: 'https://www.zkcompression.com',
    description: 'ZK Compression on Solana — reduce on-chain state costs by 1000x using zero-knowledge proofs for compressed accounts.',
    category: 'Infrastructure',
    tags: ['zk', 'compression', 'state', 'scaling', 'zero-knowledge'],
    sections: [
      { title: 'Overview', description: 'Understand ZK Compression and how it reduces Solana state costs dramatically.', url: 'https://www.zkcompression.com/introduction/intro', content: `## ZK Compression Overview\n\nZK Compression is a primitive on Solana that reduces state costs by ~1000x using zero-knowledge proofs to compress account data.\n\n### How It Works\n1. Instead of storing full account data on-chain (expensive), store only a **hash** in a Merkle tree\n2. Full data is stored off-chain by RPC providers (Photon nodes)\n3. ZK proofs verify data integrity when reading/writing\n4. Result: same security guarantees at a fraction of the cost\n\n### Cost Comparison\n| Operation | Standard | Compressed |\n|-----------|---------|------------|\n| Create account | ~0.002 SOL | ~0.000002 SOL |\n| Token account | ~0.002 SOL | ~0.000005 SOL |\n| 1M token accounts | ~2,000 SOL | ~5 SOL |\n\n### Key Concepts\n- **Compressed Account** — Account whose data is stored as a Merkle tree leaf\n- **Photon** — RPC node that indexes compressed state\n- **State Tree** — Concurrent Merkle tree holding account hashes\n- **Validity Proof** — ZK proof that compressed data is authentic\n\n### Use Cases\n- **Token airdrops** — Send tokens to millions of wallets cheaply\n- **DePIN** — Store IoT device state at scale\n- **Gaming** — Millions of player inventories on-chain\n- **Social** — On-chain profiles and interactions\n\n> **Key Insight:** ZK Compression makes Solana's state layer as cheap as its execution layer, unlocking use cases that were previously cost-prohibitive.` },
      { title: 'Compressed Tokens', description: 'Mint and transfer SPL tokens using compressed accounts for massive cost savings.', url: 'https://www.zkcompression.com/developers/compressed-tokens', content: `## Compressed Tokens\n\nMint and transfer SPL-compatible tokens using compressed accounts — same functionality at ~1/5000th the cost.\n\n### Mint Compressed Tokens\n\n\`\`\`typescript\nimport { CompressedTokenProgram } from '@lightprotocol/compressed-token';\nimport { Rpc } from '@lightprotocol/stateless.js';\n\nconst rpc = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT);\n\n// Create compressed token mint\nconst { mint, transactionSignature } = await CompressedTokenProgram.createMint(\n  rpc, payer, payer.publicKey, 9 // decimals\n);\n\n// Mint to recipients\nawait CompressedTokenProgram.mintTo(\n  rpc, payer, mint, payer.publicKey,\n  [{ address: recipient, amount: 1_000_000_000 }]\n);\n\`\`\`\n\n### Transfer\n\`\`\`typescript\nawait CompressedTokenProgram.transfer(\n  rpc, payer, mint,\n  amount, payer, // owner\n  recipientPublicKey\n);\n\`\`\`\n\n### Compatibility\n- Same mint address works with both compressed and regular token accounts\n- Can decompress to standard SPL token account anytime\n- Compatible with existing Solana wallets (with indexer support)\n\n> **Tip:** Use compressed tokens for airdrops, rewards, and any scenario involving thousands+ of token holders.` },
      { title: 'TypeScript SDK', description: 'Build applications with compressed state using the stateless.js client library.', url: 'https://www.zkcompression.com/developers/typescript-client', content: `## TypeScript SDK (stateless.js)\n\nBuild applications with ZK Compressed state using the stateless.js client library.\n\n### Installation\n\n\`\`\`bash\nnpm install @lightprotocol/stateless.js @lightprotocol/compressed-token\n\`\`\`\n\n### Setup\n\n\`\`\`typescript\nimport { createRpc, Rpc } from '@lightprotocol/stateless.js';\n\nconst connection = createRpc(\n  'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY',  // Solana RPC\n  'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY',  // Compression RPC (Photon)\n  'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'   // Prover\n);\n\`\`\`\n\n### Core Operations\n\n\`\`\`typescript\n// Create compressed account\nconst tx = await LightSystemProgram.createAccount(\n  rpc, payer, seedBytes, programId\n);\n\n// Read compressed account\nconst accounts = await rpc.getCompressedAccountsByOwner(programId);\n\n// Transfer compressed SOL\nconst tx = await LightSystemProgram.transfer(\n  rpc, payer, lamports, recipientPublicKey\n);\n\`\`\`\n\n### RPC Methods\n| Method | Description |\n|--------|-------------|\n| \`getCompressedAccount\` | Fetch single compressed account |\n| \`getCompressedAccountsByOwner\` | All accounts for a program |\n| \`getCompressedTokenBalancesByOwner\` | Token balances |\n| \`getValidityProof\` | ZK proof for state transition |\n\n> **Note:** You need a Photon-compatible RPC provider (Helius, Triton) to query compressed state.` },
      { title: 'Node Operators', description: 'Run a Photon RPC node to index and serve compressed account data.', url: 'https://www.zkcompression.com/node-operators/run-a-node', content: `## Node Operators\n\nRun a Photon node to index compressed account data and serve ZK Compression RPC requests.\n\n### What is Photon?\nPhoton is a specialized indexer that:\n- Monitors Solana for compressed account state transitions\n- Stores full account data off-chain\n- Generates Merkle proofs for compressed accounts\n- Serves ZK Compression RPC methods\n\n### Requirements\n- **Hardware:** 16+ CPU cores, 128GB RAM, 2TB NVMe SSD\n- **Network:** 1Gbps+ connection\n- **Solana RPC:** Access to a full Solana node\n- **Software:** Photon indexer binary\n\n### Setup\n\`\`\`bash\n# Clone and build\ngit clone https://github.com/helius-labs/photon\ncd photon && cargo build --release\n\n# Run with Solana RPC\n./target/release/photon --rpc-url https://your-rpc.com\n\`\`\`\n\n### Use Cases for Running a Node\n- **Low latency** — Direct access without third-party rate limits\n- **Data sovereignty** — Keep compressed data under your control\n- **Custom indexing** — Extend Photon for application-specific queries\n- **RPC provider** — Offer compression RPC as a service\n\n> **Note:** For most developers, using Helius or Triton's hosted Photon endpoints is simpler than running your own node.` },
    ],
  },
  {
    name: 'Wormhole',
    slug: 'wormhole',
    logoUrl: 'https://wormhole.com/favicon.ico',
    docsUrl: 'https://docs.wormhole.com',
    description: 'Cross-chain messaging and bridging protocol — transfer tokens and data between Solana and 30+ blockchains.',
    category: 'Cross-Chain',
    tags: ['bridge', 'cross-chain', 'messaging', 'interoperability', 'multichain'],
    sections: [
      { title: 'Solana Integration', description: 'Send and receive cross-chain messages from Solana programs via Wormhole.', url: 'https://docs.wormhole.com/docs/build/start-building/supported-networks/solana/', content: `## Solana Integration\n\nSend and receive cross-chain messages from Solana programs using Wormhole's messaging protocol.\n\n### How It Works\n1. Your Solana program posts a message to the Wormhole Core Bridge\n2. Wormhole Guardians (19 validators) observe and sign the message\n3. The signed VAA (Verified Action Approval) can be submitted on the destination chain\n4. Destination program verifies signatures and processes the message\n\n### Posting a Message (Solana)\n\n\`\`\`rust\nuse wormhole_anchor_sdk::wormhole;\n\n// Post a cross-chain message\nwormhole::post_message(\n    CpiContext::new_with_signer(\n        ctx.accounts.wormhole_program.to_account_info(),\n        wormhole::PostMessage {\n            config: ctx.accounts.wormhole_config.to_account_info(),\n            message: ctx.accounts.wormhole_message.to_account_info(),\n            emitter: ctx.accounts.emitter.to_account_info(),\n            ...\n        },\n        signer_seeds\n    ),\n    0, // nonce\n    payload, // your message bytes\n    wormhole::Finality::Confirmed\n)?;\n\`\`\`\n\n### Supported Chains\nSolana ↔ Ethereum, BSC, Polygon, Avalanche, Arbitrum, Optimism, Base, Sui, Aptos, and 20+ more.\n\n> **Note:** Cross-chain messages typically take 15-30 seconds (waiting for Guardian consensus). Use Wormhole's relayer network for automatic delivery.` },
      { title: 'Token Transfers', description: 'Bridge tokens between Solana and other chains using Wormhole Token Bridge.', url: 'https://docs.wormhole.com/docs/build/transfers/', content: `## Token Transfers\n\nBridge tokens between Solana and 30+ blockchains using Wormhole's Token Bridge.\n\n### How Token Bridging Works\n1. **Lock** — Tokens locked in Wormhole contract on source chain\n2. **Attest** — Guardians sign a VAA confirming the lock\n3. **Mint** — Wrapped tokens minted on destination chain\n4. **Redeem** — User claims wrapped tokens on destination\n\n### Using the SDK\n\n\`\`\`typescript\nimport { Wormhole } from '@wormhole-foundation/sdk';\nimport { SolanaChain } from '@wormhole-foundation/sdk-solana';\n\nconst wh = new Wormhole('Mainnet');\nconst solana = wh.getChain('Solana');\nconst ethereum = wh.getChain('Ethereum');\n\n// Transfer SOL from Solana to Ethereum\nconst transfer = await wh.tokenTransfer(\n  'Native',              // Token type\n  1_000_000_000,         // 1 SOL in lamports\n  solana.address(senderAddress),\n  ethereum.address(recipientAddress),\n  false                  // automatic = false (manual redemption)\n);\n\nawait transfer.initiateTransfer(signer);\n\`\`\`\n\n### Token Types\n| Type | Description |\n|------|-------------|\n| **Native** | SOL, ETH (wrapped on destination) |\n| **Wrapped** | Wormhole-wrapped tokens |\n| **USDC (CCTP)** | Native USDC via Circle's CCTP |\n\n> **Tip:** For USDC transfers, use CCTP (Circle's Cross-Chain Transfer Protocol) through Wormhole for native USDC on both sides — no wrapped tokens.` },
      { title: 'Wormhole SDK', description: 'TypeScript SDK for building cross-chain applications with Wormhole messaging.', url: 'https://docs.wormhole.com/docs/build/applications/wormhole-sdk/', content: `## Wormhole SDK\n\nTypeScript SDK for building cross-chain applications with Wormhole messaging and token transfers.\n\n### Installation\n\n\`\`\`bash\nnpm install @wormhole-foundation/sdk\nnpm install @wormhole-foundation/sdk-solana\n\`\`\`\n\n### Setup\n\n\`\`\`typescript\nimport { Wormhole } from '@wormhole-foundation/sdk';\nimport solana from '@wormhole-foundation/sdk/solana';\nimport evm from '@wormhole-foundation/sdk/evm';\n\nconst wh = await Wormhole.create('Mainnet', [solana, evm]);\n\`\`\`\n\n### Core Operations\n\n\`\`\`typescript\n// Get chain context\nconst sol = wh.getChain('Solana');\n\n// Token bridge transfer\nconst xfer = await wh.tokenTransfer(token, amount, sender, receiver, automatic);\nawait xfer.initiateTransfer(signer);\n\n// Check VAA status\nconst vaa = await wh.getVaa(txHash, 'TokenBridge:Transfer');\n\n// Complete transfer on destination\nawait xfer.completeTransfer(destinationSigner);\n\`\`\`\n\n### SDK Modules\n| Module | Purpose |\n|--------|--------|\n| **Core** | Message posting and VAA parsing |\n| **TokenBridge** | Token locking and minting |\n| **CCTP** | Native USDC transfers |\n| **Relayer** | Automatic message delivery |\n\n> **Note:** The SDK abstracts chain-specific details. The same API works for Solana ↔ Ethereum, Solana ↔ Avalanche, etc.` },
      { title: 'Queries', description: 'Pull cross-chain data on-demand without waiting for finality using Wormhole Queries.', url: 'https://docs.wormhole.com/docs/build/applications/queries/', content: `## Queries\n\nPull cross-chain data on-demand from any Wormhole-connected chain without waiting for finality.\n\n### How Queries Work\n1. Submit a query request specifying chain, contract, and data\n2. Wormhole Guardians fetch the data from the target chain\n3. Guardians sign the response (same trust model as messages)\n4. Receive verified cross-chain data in seconds\n\n### Use Cases\n- **Cross-chain price feeds** — Read Uniswap prices from Solana\n- **State verification** — Check ETH contract state from Solana\n- **NFT verification** — Verify Ethereum NFT ownership on Solana\n- **Balance checks** — Read token balances across chains\n\n### Query Types\n| Type | Description |\n|------|-------------|\n| **eth_call** | Read EVM contract state |\n| **sol_account** | Read Solana account data |\n| **sol_pda** | Read Solana PDA data |\n\n### Key Benefits\n- **No finality wait** — Data returned in seconds\n- **Guardian-signed** — Same security as Wormhole messages\n- **Pull-based** — Only pay when you need data\n- **Any chain** — Query any Wormhole-connected chain\n\n> **Tip:** Queries are ideal for applications that need occasional cross-chain reads without the complexity of setting up continuous oracle feeds.` },
    ],
  },
  {
    name: 'DFlow',
    slug: 'dflow',
    logoUrl: 'https://www.dflow.net/favicon.ico',
    docsUrl: 'https://docs.dflow.net',
    description: 'Decentralized order flow marketplace — route retail order flow to market makers with best execution guarantees on Solana.',
    category: 'DeFi',
    tags: ['order flow', 'market making', 'execution', 'retail', 'dex'],
    sections: [
      { title: 'Protocol Overview', description: 'Understand how DFlow creates a transparent marketplace for order flow on Solana.', url: 'https://docs.dflow.net/introduction', content: `## Protocol Overview\n\nDFlow creates a transparent, decentralized marketplace for order flow on Solana — connecting retail traders with market makers for better execution.\n\n### The Problem\n- Traditional finance: order flow is sold privately (PFOF)\n- DeFi: retail trades get sandwiched by MEV bots\n- Result: retail traders get worse prices\n\n### DFlow's Solution\n1. **Order Flow Auctions** — Market makers bid for the right to fill retail orders\n2. **Price Improvement** — Winners must provide better prices than the open market\n3. **Transparency** — All auctions and fills are on-chain and verifiable\n\n### Key Concepts\n| Concept | Description |\n|---------|-------------|\n| **Order Flow Source** | Wallet/dApp sending retail trades |\n| **Market Maker** | Entity bidding to fill orders |\n| **Endorsement** | Cryptographic proof that order is "retail" |\n| **Price Improvement** | How much better than AMM price |\n\n### Benefits\n- **Retail traders** — Better execution prices, no sandwich attacks\n- **Market makers** — Access to non-toxic order flow\n- **Wallets/dApps** — Revenue share from auctions\n\n> **Key Insight:** DFlow aligns incentives so everyone benefits — retail gets better prices, market makers get quality flow, and dApps earn revenue.` },
      { title: 'Order Flow Auctions', description: 'Market makers bid for retail order flow with guaranteed price improvement.', url: 'https://docs.dflow.net/order-flow-auctions', content: `## Order Flow Auctions\n\nMarket makers compete in real-time auctions to fill retail orders, guaranteeing price improvement over public markets.\n\n### Auction Mechanics\n1. Retail order is submitted to DFlow with an endorsement\n2. Market makers see the order and submit bids\n3. Best bid (highest price improvement) wins\n4. Winner fills the order at their bid price\n5. Trader receives better price than AMM\n\n### Price Improvement\n\`\`\`\nAMM price:  1 SOL = 100.00 USDC\nDFlow bid:  1 SOL = 100.15 USDC  (15¢ improvement)\nTrader saves: 0.15% per trade\n\`\`\`\n\n### Auction Parameters\n| Parameter | Description |\n|-----------|-------------|\n| **Duration** | Milliseconds for bidding window |\n| **Min improvement** | Minimum price improvement required |\n| **Notional cap** | Maximum order size per auction |\n| **Flow type** | Token pairs and order types accepted |\n\n### For Market Makers\n- Access high-quality, non-toxic retail flow\n- Predictable order patterns (no adverse selection)\n- Revenue from bid-ask spread after price improvement\n\n> **Note:** DFlow auctions happen in milliseconds — the UX for traders is indistinguishable from a normal swap.` },
      { title: 'Integration Guide', description: 'Integrate DFlow into your application to route trades through the order flow marketplace.', url: 'https://docs.dflow.net/integration', content: `## Integration Guide\n\nIntegrate DFlow into your wallet or dApp to route trades through the order flow marketplace for better execution.\n\n### For Wallet/dApp Developers\n1. **Register** as an Order Flow Source on DFlow\n2. **Endorse** transactions from your application\n3. **Route** endorsed trades through DFlow's auction\n4. **Earn** revenue share from auction proceeds\n\n### Revenue Model\n- Wallets/dApps earn a share of the auction revenue\n- Revenue scales with order flow volume\n- Transparent, on-chain accounting\n\n### Integration Options\n| Method | Complexity | Description |\n|--------|-----------|-------------|\n| **API** | Low | REST API for order submission |\n| **SDK** | Medium | TypeScript SDK with full auction integration |\n| **Direct** | High | On-chain program integration |\n\n### Best Practices\n- Endorse only genuine retail orders (not bot traffic)\n- Set reasonable notional caps per user\n- Monitor fill rates and price improvement metrics\n- Display price improvement to users for transparency\n\n> **Tip:** Showing users their DFlow price improvement (e.g., "You saved $0.15 on this trade") builds trust and differentiates your wallet.` },
      { title: 'Endorsement Protocol', description: 'Endorse transactions to certify order flow quality and earn protocol incentives.', url: 'https://docs.dflow.net/endorsement-protocol', content: `## Endorsement Protocol\n\nEndorse transactions to cryptographically certify that order flow is genuine retail — the foundation of DFlow's quality guarantees.\n\n### What is an Endorsement?\nA cryptographic signature from a registered Order Flow Source that:\n- Certifies the trade comes from a real user (not a bot)\n- Attests to the user's trading pattern (retail, not institutional)\n- Enables the order to enter DFlow's auction system\n\n### How It Works\n1. User initiates a trade in your wallet/dApp\n2. Your backend creates an endorsement signature\n3. Endorsed order is submitted to DFlow auction\n4. Market makers trust the endorsement and bid accordingly\n\n### Endorsement Criteria\n| Criterion | Description |\n|-----------|-------------|\n| **User verification** | Real user, not automated |\n| **Order size** | Within retail bounds |\n| **Frequency** | Normal trading patterns |\n| **Source reputation** | Wallet/dApp track record |\n\n### Incentives\n- Higher quality endorsements → more market maker interest\n- More competition → better prices for your users\n- Better prices → more user volume → more revenue\n\n> **Important:** Endorsement quality directly impacts your users' price improvement. Accurate endorsements attract more market makers and better bids.` },
    ],
  },
  {
    name: 'Underdog Protocol',
    slug: 'underdog-protocol',
    logoUrl: 'https://underdogprotocol.com/favicon.ico',
    docsUrl: 'https://docs.underdogprotocol.com',
    description: 'NFT infrastructure for loyalty programs, memberships, and token-gated access — mint millions of NFTs via simple REST APIs.',
    category: 'NFTs',
    tags: ['nft', 'loyalty', 'membership', 'token-gating', 'api', 'compressed nft'],
    sections: [
      { title: 'API Reference', description: 'RESTful API for creating projects, minting NFTs, and managing collections at scale.', url: 'https://docs.underdogprotocol.com/api-reference', content: `## API Reference\n\nSimple REST API for minting and managing NFTs at scale — no blockchain knowledge required.\n\n### Create a Project\n\n\`\`\`bash\ncurl -X POST https://api.underdogprotocol.com/v2/projects \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "name": "Loyalty Program",\n    "symbol": "LOYAL",\n    "image": "https://example.com/logo.png"\n  }'\n\`\`\`\n\n### Mint an NFT\n\n\`\`\`bash\ncurl -X POST https://api.underdogprotocol.com/v2/projects/1/nfts \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d '{\n    "name": "Gold Member #1",\n    "image": "https://example.com/gold.png",\n    "receiverAddress": "WALLET_ADDRESS",\n    "attributes": {\n      "tier": "Gold",\n      "points": "5000"\n    }\n  }'\n\`\`\`\n\n### Key Endpoints\n| Endpoint | Description |\n|----------|-------------|\n| \`POST /projects\` | Create NFT collection |\n| \`POST /projects/:id/nfts\` | Mint NFT to wallet |\n| \`PATCH /projects/:id/nfts/:id\` | Update NFT metadata |\n| \`POST /projects/:id/nfts/:id/transfer\` | Transfer NFT |\n| \`GET /projects/:id/nfts\` | List all NFTs |\n\n> **Key Advantage:** Underdog abstracts all blockchain complexity — you interact with a simple REST API, and they handle Solana transactions, metadata storage, and compression automatically.` },
      { title: 'Compressed NFTs', description: 'Mint compressed NFTs for pennies using Solana state compression.', url: 'https://docs.underdogprotocol.com/introduction/compressed-nfts', content: `## Compressed NFTs\n\nMint compressed NFTs (cNFTs) through Underdog's API for dramatically lower costs — ideal for large-scale distribution.\n\n### Cost Comparison\n| Scale | Regular NFTs | Compressed (Underdog) |\n|-------|-------------|----------------------|\n| 1,000 | ~$200 | ~$0.50 |\n| 100,000 | ~$20,000 | ~$10 |\n| 1,000,000 | ~$200,000 | ~$100 |\n\n### Minting Compressed NFTs\n\`\`\`bash\ncurl -X POST https://api.underdogprotocol.com/v2/projects \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d '{\n    "name": "Membership Cards",\n    "type": "cnft"\n  }'\n\`\`\`\n\nThen mint as usual — the API handles compression automatically.\n\n### Features\n- **Same API** — No code changes vs regular NFTs\n- **Auto-compression** — Merkle trees managed by Underdog\n- **Updateable** — Metadata can be updated after mint\n- **Transferable** — Standard transfer via DAS API\n\n### Use Cases\n- **Loyalty programs** — Millions of membership NFTs\n- **Event tickets** — Large-scale ticketing\n- **Certificates** — Educational or achievement badges\n- **Airdrops** — Mass NFT distribution\n\n> **Tip:** Use compressed NFTs for any project expecting 1,000+ mints. The cost savings are enormous with no functionality trade-offs.` },
      { title: 'Webhooks', description: 'Receive real-time notifications for mint events, transfers, and burns.', url: 'https://docs.underdogprotocol.com/webhooks', content: `## Webhooks\n\nReceive real-time HTTP notifications when NFT events occur — mints, transfers, burns, and metadata updates.\n\n### Setup\nConfigure webhooks in your Underdog dashboard or via API:\n\n\`\`\`bash\ncurl -X POST https://api.underdogprotocol.com/v2/webhooks \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d '{\n    "url": "https://your-server.com/webhook",\n    "events": ["nft.minted", "nft.transferred", "nft.burned"]\n  }'\n\`\`\`\n\n### Event Types\n| Event | Trigger |\n|-------|--------|\n| \`nft.minted\` | New NFT minted |\n| \`nft.transferred\` | NFT ownership changed |\n| \`nft.burned\` | NFT destroyed |\n| \`nft.updated\` | Metadata updated |\n| \`project.created\` | New collection created |\n\n### Webhook Payload\n\`\`\`json\n{\n  "event": "nft.minted",\n  "data": {\n    "projectId": 1,\n    "nftId": 42,\n    "mintAddress": "...",\n    "ownerAddress": "...",\n    "name": "Gold Member #42"\n  }\n}\n\`\`\`\n\n> **Tip:** Use webhooks to sync NFT state with your database — update user tiers, grant access, or trigger downstream workflows.` },
      { title: 'Token Gating', description: 'Verify NFT ownership to gate access to content, communities, and features.', url: 'https://docs.underdogprotocol.com/token-gating', content: `## Token Gating\n\nVerify NFT ownership to restrict access to content, features, or communities based on which NFTs a user holds.\n\n### How It Works\n1. User connects their wallet\n2. Your app checks if they hold the required NFT\n3. If verified, grant access to gated content\n4. If not, show the claim/purchase flow\n\n### Verification\n\`\`\`typescript\n// Check if wallet holds NFT from your project\nconst response = await fetch(\n  \`https://api.underdogprotocol.com/v2/projects/\${projectId}/nfts?ownerAddress=\${walletAddress}\`,\n  { headers: { 'Authorization': \`Bearer \${apiKey}\` } }\n);\n\nconst { results } = await response.json();\nconst hasAccess = results.length > 0;\n\n// Check specific attributes (e.g., tier)\nconst isGold = results.some(nft => \n  nft.attributes?.tier === 'Gold'\n);\n\`\`\`\n\n### Gating Strategies\n| Strategy | Description |\n|----------|-------------|\n| **Collection gate** | Hold any NFT from collection |\n| **Trait gate** | Hold NFT with specific attribute |\n| **Quantity gate** | Hold minimum number of NFTs |\n| **Tiered access** | Different access levels per trait |\n\n### Use Cases\n- **Premium content** — Articles, videos, courses\n- **Discord roles** — Auto-assign based on NFT ownership\n- **App features** — Unlock premium functionality\n- **Events** — Ticket verification\n\n> **Note:** For real-time gating, verify ownership on each access. NFTs can be transferred, so cached verifications may become stale.` },
    ],
  },
  {
    name: 'Ankr',
    slug: 'ankr',
    logoUrl: 'https://www.ankr.com/favicon.ico',
    docsUrl: 'https://www.ankr.com/docs',
    description: 'Multi-chain RPC provider with premium Solana endpoints, advanced APIs, and Web3 infrastructure tools.',
    category: 'RPC & Data',
    tags: ['rpc', 'multi-chain', 'api', 'node', 'infrastructure'],
    sections: [
      { title: 'Solana RPC', description: 'Dedicated and shared Solana RPC endpoints with global load balancing.', url: 'https://www.ankr.com/docs/rpc-service/chains/chains-list/#solana', content: `## Solana RPC\n\nAnkr provides globally distributed Solana RPC endpoints with automatic load balancing.\n\n### Quick Start\n\n\`\`\`typescript\nimport { Connection } from '@solana/web3.js';\n\n// Public endpoint (rate-limited)\nconst connection = new Connection('https://rpc.ankr.com/solana');\n\n// Premium endpoint (higher limits)\nconst premiumConnection = new Connection(\n  'https://rpc.ankr.com/solana/YOUR_API_KEY'\n);\n\`\`\`\n\n### Features\n| Feature | Free | Premium |\n|---------|------|--------|\n| Rate limit | 30 RPS | 1,500+ RPS |\n| WebSocket | ✓ | ✓ |\n| Archival | ✗ | ✓ |\n| Global routing | ✓ | ✓ |\n| SLA | Best effort | 99.9% |\n\n### Supported Methods\n- All standard Solana JSON-RPC methods\n- WebSocket subscriptions (\`accountSubscribe\`, \`programSubscribe\`, etc.)\n- Archival queries (premium only)\n\n> **Tip:** Ankr's free Solana endpoint is great for development. Switch to premium for production workloads needing higher throughput.` },
      { title: 'Advanced API', description: 'Query token balances, NFTs, and transaction history across chains with a single API.', url: 'https://www.ankr.com/docs/advanced-api/overview', content: `## Advanced API\n\nQuery token balances, NFTs, and transaction history across multiple blockchains with a single unified API.\n\n### Multi-Chain Queries\n\n\`\`\`typescript\n// Get token balances across all chains\nconst balances = await fetch('https://rpc.ankr.com/multichain', {\n  method: 'POST',\n  body: JSON.stringify({\n    jsonrpc: '2.0',\n    method: 'ankr_getAccountBalance',\n    params: {\n      walletAddress: 'WALLET_ADDRESS',\n      blockchain: ['solana', 'eth', 'polygon']\n    }\n  })\n});\n\`\`\`\n\n### Available Methods\n| Method | Description |\n|--------|-------------|\n| \`ankr_getAccountBalance\` | Token balances across chains |\n| \`ankr_getNFTsByOwner\` | NFTs held by address |\n| \`ankr_getTokenHolders\` | All holders of a token |\n| \`ankr_getTransactionsByAddress\` | Transaction history |\n| \`ankr_getTokenPrice\` | Current token prices |\n\n### Key Benefits\n- **Single endpoint** for multi-chain data\n- **Normalized responses** — Same format across chains\n- **Real-time** — Up-to-date on-chain data\n- **No indexing required** — Pre-indexed data ready to query\n\n> **Use Case:** Build portfolio trackers, multi-chain wallets, or analytics dashboards without running separate indexers per chain.` },
      { title: 'Premium Endpoints', description: 'Rate-limited premium endpoints with guaranteed uptime and priority routing.', url: 'https://www.ankr.com/docs/rpc-service/getting-started', content: `## Premium Endpoints\n\nAnkr's premium RPC tier provides guaranteed uptime, higher rate limits, and priority routing.\n\n### Getting Started\n1. Sign up at [ankr.com](https://www.ankr.com)\n2. Create a project and get your API key\n3. Use the premium endpoint: \`https://rpc.ankr.com/solana/YOUR_KEY\`\n\n### Premium Features\n- **1,500+ RPS** per endpoint\n- **99.9% SLA** uptime guarantee\n- **Priority routing** — Your requests processed first\n- **Archival access** — Historical state queries\n- **WebSocket** — Full subscription support\n- **Analytics** — Request monitoring dashboard\n\n### Pricing\n- Pay-per-request model\n- Free tier: 30 RPS, 1M requests/month\n- Premium: Starting at $49/month for 3M requests\n- Enterprise: Custom pricing and SLA\n\n### Best Practices\n- Use connection pooling for high-throughput apps\n- Implement retry logic with exponential backoff\n- Monitor rate limit headers in responses\n- Use WebSocket for real-time subscriptions (cheaper than polling)\n\n> **Tip:** Start with the free tier for development, then upgrade to premium when you need production-grade reliability.` },
    ],
  },
  {
    name: 'Marginfi',
    slug: 'marginfi',
    logoUrl: 'https://app.marginfi.com/favicon.ico',
    docsUrl: 'https://docs.marginfi.com',
    description: 'Lending and borrowing protocol on Solana — earn yield on deposits, borrow against collateral, and build on margin accounts.',
    category: 'DeFi',
    tags: ['lending', 'borrowing', 'yield', 'margin', 'collateral'],
    sections: [
      { title: 'Protocol Overview', description: 'Understand marginfi lending pools, risk tiers, and interest rate models.', url: 'https://docs.marginfi.com', content: `## Protocol Overview\n\nMarginfi is a decentralized lending protocol on Solana where users deposit assets to earn yield and borrow against collateral.\n\n### How It Works\n1. **Deposit** assets (SOL, USDC, mSOL, etc.) into marginfi\n2. **Earn yield** from borrowers paying interest\n3. **Borrow** against your deposits as collateral\n4. **Maintain health** — Keep collateral ratio above liquidation threshold\n\n### Risk Tiers\n| Tier | Assets | Use |\n|------|--------|-----|\n| **Isolated** | New/volatile tokens | Cannot be combined as collateral |\n| **Global** | Established tokens | Can be cross-collateralized |\n\n### Interest Rate Model\n- Rates are **dynamic** based on pool utilization\n- Low utilization → low rates (encourages borrowing)\n- High utilization → high rates (encourages deposits)\n- **Optimal utilization** target: typically 80%\n\n### Key Metrics\n- **Supply APY** — What depositors earn\n- **Borrow APY** — What borrowers pay\n- **Health Factor** — Collateral ratio (>1 = safe, <1 = liquidatable)\n- **LTV** — Loan-to-Value ratio per asset\n\n> **Important:** Monitor your health factor. If it drops below 1.0, your position can be liquidated with a penalty.` },
      { title: 'TypeScript SDK', description: 'Interact with marginfi programmatically — deposit, borrow, repay, and manage accounts.', url: 'https://docs.marginfi.com/typescript-sdk', content: `## TypeScript SDK\n\nInteract with marginfi lending pools programmatically.\n\n### Setup\n\n\`\`\`typescript\nimport { MarginfiClient } from '@mrgnlabs/marginfi-client-v2';\n\nconst client = await MarginfiClient.fetch(\n  { connection, wallet }\n);\n\`\`\`\n\n### Core Operations\n\n\`\`\`typescript\n// Create margin account\nconst account = await client.createMarginfiAccount();\n\n// Deposit\nawait account.deposit(amount, bankAddress);\n\n// Borrow\nawait account.borrow(amount, bankAddress);\n\n// Repay\nawait account.repay(amount, bankAddress);\n\n// Withdraw\nawait account.withdraw(amount, bankAddress);\n\`\`\`\n\n### Query State\n\`\`\`typescript\n// Get all banks (lending pools)\nconst banks = client.banks;\nfor (const [address, bank] of banks) {\n  console.log(bank.label, 'Supply APY:', bank.computeSupplyApy());\n  console.log(bank.label, 'Borrow APY:', bank.computeBorrowApy());\n}\n\n// Get account health\nconst health = account.computeHealthComponents();\nconsole.log('Health factor:', health.healthFactor);\n\`\`\`\n\n> **Tip:** Always check health factor after borrowing. Build in safety margins — don't borrow up to the maximum LTV.` },
      { title: 'Liquidation', description: 'Monitor and execute liquidations on undercollateralized margin accounts.', url: 'https://docs.marginfi.com/concepts/liquidations', content: `## Liquidation\n\nWhen a marginfi account's health factor drops below 1.0, it becomes eligible for liquidation. Liquidators repay debt and receive collateral at a discount.\n\n### How Liquidation Works\n1. Account health factor drops below 1.0\n2. Liquidator identifies the account\n3. Liquidator repays portion of the debt\n4. Liquidator receives collateral at a discount (liquidation bonus)\n5. Account health factor improves\n\n### Liquidation Parameters\n| Parameter | Description |\n|-----------|-------------|\n| **Health Factor** | < 1.0 triggers liquidation |\n| **Liquidation Bonus** | 5-15% discount on collateral |\n| **Close Factor** | Max % of debt that can be liquidated per tx |\n| **Insurance Fund** | Covers bad debt if collateral < debt |\n\n### For Liquidators\n\`\`\`typescript\n// Find liquidatable accounts\nconst accounts = await client.getAllMarginfiAccounts();\nconst liquidatable = accounts.filter(\n  a => a.computeHealthComponents().healthFactor < 1.0\n);\n\n// Execute liquidation\nawait liquidatorAccount.liquidate(\n  targetAccount,\n  repayBankAddress,\n  collateralBankAddress,\n  repayAmount\n);\n\`\`\`\n\n> **Note:** Liquidation is competitive. Multiple liquidators often race to liquidate the same accounts. Speed and gas optimization matter.` },
      { title: 'Risk Engine', description: 'Understand how marginfi calculates health factors and risk-weighted assets.', url: 'https://docs.marginfi.com/concepts/risk-engine', content: `## Risk Engine\n\nMarginfi's risk engine calculates health factors, sets LTV ratios, and determines liquidation thresholds per asset.\n\n### Health Factor Calculation\n\`\`\`\nHealth Factor = Weighted Collateral Value / Weighted Debt Value\n\nWeighted Collateral = Σ (asset_value × collateral_weight)\nWeighted Debt = Σ (debt_value / liability_weight)\n\`\`\`\n\n### Risk Parameters Per Asset\n| Parameter | Description | Example (SOL) |\n|-----------|-------------|---------------|\n| **Collateral Weight** | How much collateral counts | 0.80 (80%) |\n| **Liability Weight** | Debt multiplier | 1.20 (120%) |\n| **Max LTV** | Maximum loan-to-value | 65% |\n| **Liquidation Threshold** | When liquidation triggers | 80% |\n\n### Oracle Integration\n- Prices from **Pyth** and **Switchboard** oracles\n- **TWAP** (Time-Weighted Average Price) for smoothing\n- **Confidence intervals** considered for conservative pricing\n- **Fallback oracles** if primary fails\n\n### Risk Tiers\n- **Global** assets can cross-collateralize with each other\n- **Isolated** assets can only collateralize their own borrows\n- **Tier upgrades** require governance approval\n\n> **Key Insight:** The risk engine is intentionally conservative — collateral weights are always < 1.0 and liability weights > 1.0 to create a safety buffer.` },
    ],
  },
  {
    name: 'Kamino',
    slug: 'kamino',
    logoUrl: 'https://app.kamino.finance/favicon.ico',
    docsUrl: 'https://docs.kamino.finance',
    description: 'Automated liquidity vaults, lending, and leveraged yield strategies on Solana — optimized DeFi in one protocol.',
    category: 'DeFi',
    tags: ['liquidity', 'vaults', 'lending', 'leverage', 'yield', 'clmm'],
    sections: [
      { title: 'Liquidity Vaults', description: 'Automated concentrated liquidity management with auto-rebalancing strategies.', url: 'https://docs.kamino.finance/products/liquidity', content: `## Liquidity Vaults\n\nKamino automates concentrated liquidity management on Orca and Raydium — depositors earn trading fees without manual rebalancing.\n\n### How Vaults Work\n1. Deposit tokens into a Kamino vault\n2. Kamino deploys liquidity into concentrated CLMM positions\n3. Auto-rebalance when price moves out of range\n4. Auto-compound trading fees into the position\n5. Withdraw anytime\n\n### Key Features\n- **Auto-rebalancing** — Positions automatically adjusted when price drifts\n- **Auto-compounding** — Earned fees reinvested for compound returns\n- **Optimal ranges** — Algorithmic range selection for capital efficiency\n- **Multiple strategies** — Conservative (wide) to aggressive (narrow)\n\n### Vault Strategies\n| Strategy | Range | Risk | Yield |\n|----------|-------|------|-------|\n| **Wide** | ±50% | Low | Lower |\n| **Medium** | ±10% | Medium | Higher |\n| **Narrow** | ±2% | High | Highest |\n\n### Supported Pools\n- SOL/USDC, mSOL/SOL, JitoSOL/SOL\n- Various stablecoin pairs\n- Long-tail asset vaults\n\n> **Key Advantage:** Kamino removes the need to actively manage CLMM positions — you get concentrated liquidity yields with a simple deposit/withdraw interface.` },
      { title: 'Kamino Lend', description: 'Supply and borrow assets with dynamic interest rates and risk isolation.', url: 'https://docs.kamino.finance/products/lending', content: `## Kamino Lend\n\nSupply assets to earn yield and borrow against collateral with dynamic interest rates and risk isolation.\n\n### Core Operations\n1. **Supply** — Deposit assets to earn lending yield\n2. **Borrow** — Take loans against your collateral\n3. **Repay** — Return borrowed assets + interest\n4. **Withdraw** — Remove supplied assets\n\n### Key Features\n- **Dynamic rates** — Interest rates adjust based on utilization\n- **Risk isolation** — Separate lending markets for different risk profiles\n- **Multi-collateral** — Cross-collateralize across supported assets\n- **eMode** — Enhanced borrowing for correlated assets (e.g., SOL/mSOL)\n\n### eMode (Efficiency Mode)\n| Pair | Normal LTV | eMode LTV |\n|------|-----------|----------|\n| SOL/mSOL | 65% | 90% |\n| USDC/USDT | 80% | 95% |\n\neMode allows higher LTV for closely correlated assets, improving capital efficiency.\n\n### Supported Assets\nSOL, USDC, USDT, mSOL, JitoSOL, bSOL, and more.\n\n> **Tip:** Use eMode when supplying and borrowing correlated assets (like SOL → borrow mSOL) for maximum capital efficiency with minimal liquidation risk.` },
      { title: 'Multiply (Leverage)', description: 'One-click leveraged yield strategies on LSTs and stablecoin pairs.', url: 'https://docs.kamino.finance/products/multiply', content: `## Multiply (Leverage)\n\nOne-click leveraged yield strategies that loop deposits and borrows to amplify returns on correlated asset pairs.\n\n### How Multiply Works\n1. Deposit SOL into a Multiply vault\n2. Kamino supplies SOL as collateral\n3. Borrows a correlated asset (e.g., mSOL) against it\n4. Swaps borrowed asset back to SOL\n5. Redeposits for more collateral\n6. Repeats (loops) to achieve target leverage\n\n### Example: SOL/mSOL Multiply\n\`\`\`\nDeposit: 10 SOL\nLeverage: 3x\nEffective position: 30 SOL equivalent\nYield: ~7% base × 3 = ~21% APY\nCost: mSOL borrow rate (~3%)\nNet: ~18% APY\n\`\`\`\n\n### Available Strategies\n| Strategy | Base Yield | Leverage | Net APY* |\n|----------|-----------|----------|----------|\n| SOL/JitoSOL | 7% | 3x | ~15-20% |\n| mSOL/SOL | 7% | 3x | ~15-20% |\n| USDC/USDT | 5% | 5x | ~20-25% |\n\n*APYs are approximate and vary with market conditions\n\n### Risks\n- **Liquidation** — If correlation breaks, positions can be liquidated\n- **Rate changes** — Borrow costs can increase, reducing net yield\n- **Smart contract** — Additional protocol risk from multiple DeFi interactions\n\n> **Warning:** Leverage amplifies both gains AND losses. Start with low leverage until you understand the dynamics.` },
      { title: 'SDK & API', description: 'TypeScript SDK for programmatic interaction with Kamino vaults and lending markets.', url: 'https://docs.kamino.finance/developers/sdk', content: `## SDK & API\n\nTypeScript SDK for interacting with Kamino's vaults, lending, and leverage products programmatically.\n\n### Installation\n\n\`\`\`bash\nnpm install @kamino-finance/klend-sdk @kamino-finance/kliquidity-sdk\n\`\`\`\n\n### Lending Operations\n\n\`\`\`typescript\nimport { KaminoMarket } from '@kamino-finance/klend-sdk';\n\nconst market = await KaminoMarket.load(connection, marketAddress);\n\n// Supply\nconst supplyIx = await market.makeDepositIxs(\n  wallet.publicKey,\n  amount,\n  mintAddress\n);\n\n// Borrow\nconst borrowIx = await market.makeBorrowIxs(\n  wallet.publicKey,\n  amount,\n  mintAddress\n);\n\`\`\`\n\n### Vault Operations\n\n\`\`\`typescript\nimport { Kamino } from '@kamino-finance/kliquidity-sdk';\n\nconst kamino = new Kamino('mainnet-beta', connection);\n\n// Get vault info\nconst strategy = await kamino.getStrategyByAddress(vaultAddress);\nconsole.log('TVL:', strategy.totalValueLocked);\nconsole.log('APY:', strategy.apy);\n\n// Deposit into vault\nconst depositIx = await kamino.deposit(strategy, amount, wallet.publicKey);\n\`\`\`\n\n> **Tip:** Use the SDK's built-in simulation methods to preview transaction effects before executing.` },
    ],
  },
  {
    name: 'Sanctum',
    slug: 'sanctum',
    logoUrl: 'https://app.sanctum.so/favicon.ico',
    docsUrl: 'https://docs.sanctum.so',
    description: 'Liquid staking aggregator on Solana — the LST liquidity layer, Infinity pool, and instant unstaking.',
    category: 'DeFi',
    tags: ['liquid staking', 'lst', 'infinity pool', 'unstaking', 'validators'],
    sections: [
      { title: 'Infinity Pool', description: 'A multi-LST liquidity pool enabling instant swaps between any liquid staking tokens.', url: 'https://docs.sanctum.so/infinity', content: `## Infinity Pool\n\nThe Infinity Pool is a multi-LST liquidity pool that enables instant swaps between any Solana liquid staking tokens.\n\n### How It Works\n- Single pool holds multiple LSTs (mSOL, JitoSOL, bSOL, etc.)\n- Swap any LST to any other LST with zero slippage\n- Pool rebalances via staking/unstaking mechanisms\n- LPs earn from swap fees across all pairs\n\n### Key Features\n- **Zero slippage** for LST ↔ LST swaps\n- **Deep liquidity** — All LST pairs share the same pool\n- **Fair pricing** — Based on staking exchange rates\n- **LP yield** — Earn swap fees + staking rewards\n\n### Supported LSTs\nmSOL, JitoSOL, bSOL, INF, cgntSOL, compassSOL, and 20+ more.\n\n### INF Token\n- **INF** is Sanctum's yield-bearing LST\n- Backed by the Infinity Pool's diversified LST holdings\n- Earns staking yield + swap fee revenue\n- Instant liquidity via the pool\n\n> **Key Insight:** The Infinity Pool solves the LST fragmentation problem — instead of needing separate pools for every LST pair, one pool handles all swaps.` },
      { title: 'Router', description: 'Route LST swaps through the best paths for optimal pricing and zero slippage.', url: 'https://docs.sanctum.so/router', content: `## Router\n\nSanctum's router finds the optimal path for LST swaps — direct pool swaps, multi-hop routes, or stake/unstake paths.\n\n### How Routing Works\n1. User requests: swap mSOL → JitoSOL\n2. Router evaluates all possible paths:\n   - Direct: mSOL → JitoSOL (if pool exists)\n   - Via SOL: mSOL → SOL → JitoSOL\n   - Via Infinity: mSOL → INF → JitoSOL\n3. Best price route selected automatically\n\n### Route Types\n| Route | Speed | Slippage |\n|-------|-------|----------|\n| **Direct pool** | Instant | Near zero |\n| **Via Infinity** | Instant | Zero |\n| **Stake/unstake** | 1-2 epochs | Zero |\n\n### Integration\n\`\`\`typescript\n// Get best route\nconst route = await sanctum.getRoute({\n  inputMint: MSOL_MINT,\n  outputMint: JITOSOL_MINT,\n  amount: 1_000_000_000 // 1 mSOL\n});\n\nconsole.log('Output:', route.expectedOutput);\nconsole.log('Path:', route.path);\n\`\`\`\n\n> **Tip:** The router is integrated into Jupiter — LST swaps on Jupiter often route through Sanctum for best pricing.` },
      { title: 'Validator LSTs', description: 'Launch custom liquid staking tokens for individual validators.', url: 'https://docs.sanctum.so/validator-lsts', content: `## Validator LSTs\n\nLaunch custom liquid staking tokens for individual Solana validators — giving delegators liquidity while supporting specific validators.\n\n### How It Works\n1. Validator registers with Sanctum\n2. Sanctum creates a custom LST (e.g., "xyzSOL")\n3. Delegators stake SOL and receive xyzSOL\n4. xyzSOL is immediately liquid via Sanctum's pools\n5. Validator retains their delegation\n\n### Benefits for Validators\n- **Attract more stake** — Delegators get liquidity\n- **Reduce churn** — Less unstaking due to liquid token\n- **Brand identity** — Custom token representing your validator\n- **DeFi integration** — Your LST tradeable on DEXs\n\n### Benefits for Delegators\n- **Liquidity** — Swap your validator LST anytime\n- **DeFi usage** — Use as collateral, LP, etc.\n- **Supporting decentralization** — Stake with smaller validators\n- **Same rewards** — Staking yield continues accruing\n\n### Active Validator LSTs\nSanctum supports 100+ validator LSTs, each representing delegation to a specific validator.\n\n> **Key Innovation:** Validator LSTs solve the "liquidity vs. decentralization" problem — delegators can support small validators without locking up their capital.` },
      { title: 'Reserve Pool', description: 'Instant SOL unstaking from any LST via the Sanctum reserve.', url: 'https://docs.sanctum.so/reserve', content: `## Reserve Pool\n\nInstantly unstake any LST to SOL without waiting for epoch boundaries.\n\n### How It Works\n1. User wants to convert LST → SOL instantly\n2. Sanctum's Reserve Pool provides SOL immediately\n3. Sanctum holds the LST and unstakes normally (1-2 epochs)\n4. Small fee charged for instant liquidity\n\n### Parameters\n| Feature | Value |\n|---------|-------|\n| **Speed** | Instant (single transaction) |\n| **Fee** | ~0.01-0.1% depending on reserve utilization |\n| **Min amount** | No minimum |\n| **Max amount** | Limited by reserve SOL balance |\n\n### Supported LSTs\nAll LSTs registered with Sanctum can be instantly unstaked via the reserve.\n\n### Reserve Utilization\n- Low utilization → lower fees (plenty of SOL available)\n- High utilization → higher fees (supply is constrained)\n- Reserve is replenished as staked SOL deactivates\n\n### Comparison\n| Method | Time | Fee |\n|--------|------|-----|\n| Sanctum Reserve | Instant | 0.01-0.1% |\n| Marinade Instant | Instant | ~0.3% |\n| Native unstaking | 2-3 days | Free |\n\n> **Tip:** The Reserve Pool is the cheapest instant unstaking option on Solana for most LSTs.` },
    ],
  },
  {
    name: 'TipLink',
    slug: 'tiplink',
    logoUrl: 'https://tiplink.io/favicon.ico',
    docsUrl: 'https://docs.tiplink.io',
    description: 'Send crypto and NFTs via shareable links — no wallet required for recipients. Perfect for onboarding and airdrops.',
    category: 'Wallets',
    tags: ['wallet', 'links', 'onboarding', 'airdrop', 'no-wallet'],
    sections: [
      { title: 'TipLink API', description: 'Create and manage TipLinks programmatically for bulk distribution and airdrops.', url: 'https://docs.tiplink.io/api', content: `## TipLink API\n\nCreate shareable links containing SOL, SPL tokens, or NFTs — recipients claim without needing a wallet.\n\n### Create a TipLink\n\n\`\`\`typescript\nimport { TipLink } from '@tiplink/api';\n\nconst tipLink = await TipLink.create();\nconsole.log('URL:', tipLink.url.toString());\nconsole.log('Public Key:', tipLink.keypair.publicKey.toString());\n\n// Fund the TipLink\nconst tx = new Transaction().add(\n  SystemProgram.transfer({\n    fromPubkey: wallet.publicKey,\n    toPubkey: tipLink.keypair.publicKey,\n    lamports: 0.1 * LAMPORTS_PER_SOL\n  })\n);\nawait sendTransaction(tx);\n\`\`\`\n\n### How It Works\n1. TipLink generates a keypair and encodes the secret in a URL\n2. You fund the keypair's address with tokens/SOL\n3. Share the URL (email, QR code, social media)\n4. Recipient opens the link and claims to their wallet\n5. If no wallet, TipLink creates a custodial account\n\n### Bulk Creation\n\`\`\`typescript\nconst links = await Promise.all(\n  Array.from({ length: 1000 }, () => TipLink.create())\n);\n// Fund all links, then distribute URLs\n\`\`\`\n\n### Use Cases\n- **Conference swag** — QR codes with token/NFT claims\n- **Marketing** — Embed crypto in email campaigns\n- **Onboarding** — Send crypto to non-crypto users\n- **Payroll** — Distribute payments via links\n\n> **Key Benefit:** TipLink is the easiest way to get crypto into the hands of people who don't have wallets yet.` },
      { title: 'TipLink Wallet Adapter', description: 'Integrate TipLink as a wallet option so users can connect without installing anything.', url: 'https://docs.tiplink.io/wallet-adapter', content: `## TipLink Wallet Adapter\n\nAdd TipLink as a wallet option in your dApp — users can connect and transact without installing any wallet software.\n\n### Integration\n\n\`\`\`typescript\nimport { TipLinkWalletAdapter } from '@tiplink/wallet-adapter';\n\nconst wallets = [\n  new TipLinkWalletAdapter({\n    title: 'Your App',\n    clientId: 'YOUR_CLIENT_ID'\n  }),\n  new PhantomWalletAdapter(),\n  new SolflareWalletAdapter()\n];\n\n// Use with standard WalletProvider\n<WalletProvider wallets={wallets} autoConnect>\n  <WalletModalProvider>\n    <App />\n  </WalletModalProvider>\n</WalletProvider>\n\`\`\`\n\n### How It Works\n1. User clicks "Connect" and selects TipLink\n2. TipLink creates a wallet via social login (Google, email)\n3. User can sign transactions through the TipLink interface\n4. No extension installation required\n\n### Benefits\n- **Zero friction** — No wallet download needed\n- **Social login** — Google, Apple, email authentication\n- **Standard adapter** — Works with all Wallet Adapter-compatible dApps\n- **Gradual onboarding** — Users can export keys to a full wallet later\n\n> **Tip:** Include TipLink alongside Phantom and Solflare to capture users who don't have a wallet installed yet.` },
      { title: 'Campaigns', description: 'Run mass distribution campaigns with tracking, analytics, and claim flows.', url: 'https://docs.tiplink.io/campaigns', content: `## Campaigns\n\nRun mass token and NFT distribution campaigns with built-in tracking, analytics, and customizable claim flows.\n\n### Campaign Features\n- **Bulk creation** — Generate thousands of TipLinks at once\n- **Branding** — Custom landing pages for claim flows\n- **Analytics** — Track claims, views, and engagement\n- **Expiry** — Set expiration dates for unclaimed links\n- **Recovery** — Reclaim funds from expired links\n\n### Campaign Types\n| Type | Use Case |\n|------|----------|\n| **Airdrop** | Distribute tokens to a list of recipients |\n| **QR codes** | Print for events and physical distribution |\n| **Email blast** | Embed claim links in marketing emails |\n| **Social** | Share links on Twitter, Discord, Telegram |\n\n### Analytics Dashboard\n- Total links created and funded\n- Claims over time\n- Geographic distribution of claims\n- Claim completion rates\n- Unclaimed fund recovery status\n\n### Best Practices\n- Set expiration dates to recover unclaimed funds\n- Use branded claim pages for recognition\n- Test with small batches before large campaigns\n- Include clear instructions for crypto newcomers\n\n> **Tip:** Combine TipLink campaigns with NFTs for event attendance badges — attendees scan QR codes to claim their proof-of-attendance NFT.` },
    ],
  },
  {
    name: 'Backpack',
    slug: 'backpack',
    logoUrl: 'https://backpack.app/favicon.ico',
    docsUrl: 'https://docs.backpack.exchange',
    description: 'Multi-chain wallet and exchange built for Solana — xNFT apps, mobile-first design, and integrated trading.',
    category: 'Wallets',
    tags: ['wallet', 'exchange', 'xnft', 'mobile', 'multi-chain'],
    sections: [
      { title: 'Wallet Integration', description: 'Integrate Backpack wallet connection into your dApp using the Solana wallet adapter.', url: 'https://docs.backpack.exchange/introduction', content: `## Wallet Integration\n\nIntegrate Backpack wallet into your dApp using the standard Solana Wallet Adapter.\n\n### Setup\n\n\`\`\`typescript\nimport { BackpackWalletAdapter } from '@solana/wallet-adapter-wallets';\n\nconst wallets = [\n  new BackpackWalletAdapter()\n];\n// Use with WalletProvider as standard\n\`\`\`\n\n### Backpack Features\n- **Multi-chain** — Solana, Ethereum, and more in one wallet\n- **xNFT support** — Run dApps directly inside the wallet\n- **Mobile-first** — iOS and Android apps\n- **Built-in exchange** — Trade directly from the wallet\n\n### Detection\n\`\`\`typescript\nconst isBackpackInstalled = window?.backpack?.isBackpack;\n\`\`\`\n\n### Key Differences from Other Wallets\n- **xNFTs** — Backpack can run executable NFTs (mini-apps inside the wallet)\n- **Integrated DEX** — Swap tokens without leaving the wallet\n- **Multi-chain** — Single seed phrase for Solana + EVM chains\n\n> **Tip:** Include Backpack in your wallet adapter list alongside Phantom and Solflare for maximum user coverage.` },
      { title: 'Exchange API', description: 'Access the Backpack exchange — order placement, market data, and account management.', url: 'https://docs.backpack.exchange/exchange/api', content: `## Exchange API\n\nProgrammatic access to Backpack Exchange — place orders, query market data, and manage your account.\n\n### Authentication\n\`\`\`typescript\nconst headers = {\n  'X-API-Key': YOUR_API_KEY,\n  'X-Timestamp': Date.now().toString(),\n  'X-Signature': computeSignature(payload)\n};\n\`\`\`\n\n### Key Endpoints\n\n| Endpoint | Method | Description |\n|----------|--------|-------------|\n| \`/api/v1/markets\` | GET | List all trading pairs |\n| \`/api/v1/ticker\` | GET | 24h ticker data |\n| \`/api/v1/depth\` | GET | Order book depth |\n| \`/api/v1/order\` | POST | Place an order |\n| \`/api/v1/orders\` | GET | Open orders |\n| \`/api/v1/balances\` | GET | Account balances |\n\n### Place an Order\n\`\`\`typescript\nconst order = await fetch('https://api.backpack.exchange/api/v1/order', {\n  method: 'POST',\n  headers,\n  body: JSON.stringify({\n    symbol: 'SOL_USDC',\n    side: 'Bid',\n    orderType: 'Limit',\n    price: '100.50',\n    quantity: '1.0'\n  })\n});\n\`\`\`\n\n### Rate Limits\n- 10 requests/second for order placement\n- 30 requests/second for market data\n\n> **Note:** Backpack Exchange is a centralized exchange (CEX) built on Solana — it requires KYC for trading.` },
      { title: 'WebSocket Streams', description: 'Real-time market data, order updates, and trade streams via WebSocket.', url: 'https://docs.backpack.exchange/exchange/websocket-streams', content: `## WebSocket Streams\n\nReal-time market data and order updates via WebSocket connections.\n\n### Connection\n\`\`\`typescript\nconst ws = new WebSocket('wss://ws.backpack.exchange');\n\n// Subscribe to order book\nws.send(JSON.stringify({\n  method: 'SUBSCRIBE',\n  params: ['depth.SOL_USDC']\n}));\n\n// Subscribe to trades\nws.send(JSON.stringify({\n  method: 'SUBSCRIBE',\n  params: ['trades.SOL_USDC']\n}));\n\nws.onmessage = (event) => {\n  const data = JSON.parse(event.data);\n  console.log('Update:', data);\n};\n\`\`\`\n\n### Available Streams\n| Stream | Data |\n|--------|------|\n| \`depth.{symbol}\` | Order book updates |\n| \`trades.{symbol}\` | Real-time trades |\n| \`ticker.{symbol}\` | 24h price ticker |\n| \`kline.{symbol}.{interval}\` | Candlestick data |\n\n### Private Streams (Authenticated)\n- \`orders\` — Your order updates (fills, cancels)\n- \`balances\` — Account balance changes\n\n### Key Features\n- **Low latency** — Sub-second updates\n- **Compressed** — Efficient binary encoding\n- **Auto-reconnect** — Handle connection drops gracefully\n\n> **Tip:** Use WebSocket streams for real-time trading UIs. Poll the REST API for initial state, then keep updated via WebSocket.` },
    ],
  },
  {
    name: 'DRiP',
    slug: 'drip',
    logoUrl: 'https://drip.haus/favicon.ico',
    docsUrl: 'https://docs.drip.haus',
    description: 'Free NFT distribution platform — artists and creators send collectibles directly to subscriber wallets every week.',
    category: 'NFTs',
    tags: ['nft', 'distribution', 'creators', 'collectibles', 'free-mint'],
    sections: [
      { title: 'Creator Onboarding', description: 'Set up your creator channel, upload artwork, and start distributing to collectors.', url: 'https://docs.drip.haus/creators', content: `## Creator Onboarding\n\nSet up your DRiP creator channel to distribute free NFT art to subscribers.\n\n### Getting Started\n1. Apply as a creator on [drip.haus](https://drip.haus)\n2. Get approved by the DRiP team\n3. Set up your creator profile and channel\n4. Upload artwork for your first drop\n5. Schedule your distribution\n\n### Drop Structure\n- **Weekly drops** — New artwork distributed every week\n- **Editions** — Each drop has multiple editions (common, rare, legendary)\n- **Free for collectors** — No cost to receive drops\n- **Compressed NFTs** — Minted as cNFTs for cost efficiency\n\n### Edition Tiers\n| Tier | Rarity | Distribution |\n|------|--------|-------------|\n| **Common** | High supply | All subscribers |\n| **Rare** | Medium supply | Random selection |\n| **Legendary** | Very low supply | Rare random |\n| **1 of 1** | Single edition | Most engaged collector |\n\n### Revenue Model\n- Creators earn from secondary market royalties\n- DRiP covers minting costs\n- Additional revenue from brand partnerships\n\n> **Tip:** Consistent, high-quality weekly drops build a loyal collector base. The most successful creators maintain a regular schedule and engage with their community.` },
      { title: 'Collector Guide', description: 'Subscribe to channels, manage your collection, and trade on secondary markets.', url: 'https://docs.drip.haus/collectors', content: `## Collector Guide\n\nSubscribe to creator channels to receive free NFT drops directly to your Solana wallet.\n\n### Getting Started\n1. Connect your Solana wallet to [drip.haus](https://drip.haus)\n2. Browse creator channels\n3. Subscribe to channels you like (free)\n4. Receive drops automatically every week\n5. Trade or collect your NFTs\n\n### How Drops Work\n- **Automatic** — NFTs appear in your wallet after each drop\n- **Random rarity** — You might get common, rare, or legendary editions\n- **Compressed** — Drops are cNFTs (low cost, same functionality)\n- **Transferable** — Trade on Tensor, Magic Eden, etc.\n\n### Managing Your Collection\n- View all drops on your DRiP profile\n- Track rarity across your collection\n- See which creators you're subscribed to\n- Unsubscribe from channels anytime\n\n### Trading\n- List drops for sale on NFT marketplaces\n- Rare editions often command premium prices\n- Track floor prices per creator/drop\n\n> **Note:** DRiP drops are compressed NFTs. Use marketplaces that support cNFTs (Tensor, Magic Eden) for trading.` },
      { title: 'API Reference', description: 'Programmatic access to DRiP drops, channels, and collection metadata.', url: 'https://docs.drip.haus/api', content: `## API Reference\n\nAccess DRiP data programmatically — channels, drops, collections, and collector information.\n\n### Key Endpoints\n\n| Endpoint | Description |\n|----------|-------------|\n| \`/channels\` | List all creator channels |\n| \`/channels/:id/drops\` | Drops for a specific channel |\n| \`/drops/:id\` | Single drop details |\n| \`/collections/:id\` | Collection metadata |\n| \`/wallets/:address/drops\` | Drops received by wallet |\n\n### Data Available\n- Channel metadata (creator info, description, subscriber count)\n- Drop details (artwork, editions, distribution date)\n- Edition rarity and supply\n- Secondary market activity\n- Collector statistics\n\n### Use Cases\n- **Portfolio apps** — Display DRiP drops in wallet UIs\n- **Analytics** — Track creator performance and drop values\n- **Notifications** — Alert users about new drops\n- **Marketplaces** — Display DRiP metadata in listings\n\n> **Note:** The DRiP API is primarily read-only. Distribution and minting are handled by the DRiP platform.` },
    ],
  },
  {
    name: 'Streamflow',
    slug: 'streamflow',
    logoUrl: 'https://streamflow.finance/favicon.ico',
    docsUrl: 'https://docs.streamflow.finance',
    description: 'Token vesting, payroll streaming, and multi-sig payment infrastructure for Solana teams and DAOs.',
    category: 'DeFi',
    tags: ['vesting', 'streaming', 'payroll', 'token-lock', 'multisig'],
    sections: [
      { title: 'Vesting Contracts', description: 'Create token vesting schedules with cliff periods, linear unlocks, and revocable streams.', url: 'https://docs.streamflow.finance/help/vesting', content: `## Vesting Contracts\n\nCreate token vesting schedules for team allocations, investor lockups, and advisor grants.\n\n### How It Works\n1. Deposit tokens into a vesting contract\n2. Set cliff period, duration, and unlock schedule\n3. Recipient can claim tokens as they vest\n4. Optionally make the contract revocable\n\n### Vesting Parameters\n| Parameter | Description |\n|-----------|-------------|\n| **Cliff** | Initial lock period before any tokens vest |\n| **Duration** | Total vesting period |\n| **Release frequency** | How often tokens unlock (daily, weekly, monthly) |\n| **Amount** | Total tokens to vest |\n| **Cancelable** | Whether sender can revoke unvested tokens |\n| **Transferable** | Whether recipient can transfer the stream |\n\n### Example Schedule\n\`\`\`\nTotal: 1,000,000 tokens\nCliff: 6 months\nDuration: 24 months\nFrequency: Monthly\n\nMonth 0-6: 0 tokens (cliff period)\nMonth 6: 250,000 tokens (cliff release)\nMonth 7-24: ~41,667 tokens/month (linear)\nMonth 24: All tokens vested\n\`\`\`\n\n### Key Features\n- **On-chain enforcement** — Vesting cannot be manipulated\n- **Transparent** — Anyone can verify the schedule\n- **Revocable option** — Useful for employee grants\n- **Multi-token** — Any SPL token supported\n\n> **Tip:** For investor tokens, use non-cancelable vesting. For employee grants, use cancelable to handle departures.` },
      { title: 'Payment Streaming', description: 'Stream SPL tokens in real-time — payroll, subscriptions, and continuous payments.', url: 'https://docs.streamflow.finance/help/streams', content: `## Payment Streaming\n\nStream tokens continuously in real-time — perfect for payroll, subscriptions, and ongoing service payments.\n\n### How Streaming Works\n1. Sender deposits tokens and sets a duration\n2. Tokens accrue to the recipient every second\n3. Recipient can withdraw accumulated tokens anytime\n4. Stream ends when duration expires or sender cancels\n\n### Create a Stream\n\`\`\`typescript\nimport { StreamflowSolana } from '@streamflow/stream';\n\nconst client = new StreamflowSolana.SolanaStreamClient(clusterUrl);\n\nconst stream = await client.create({\n  recipient: recipientAddress,\n  mint: tokenMint,\n  depositedAmount: new BN(10000 * 1e6), // 10,000 USDC\n  period: 1,           // Release every 1 second\n  cliff: 0,            // No cliff\n  cliffAmount: new BN(0),\n  amountPerPeriod: new BN(3858), // ~10K USDC over 30 days\n  name: 'Monthly Salary',\n  canTopup: true,\n  cancelableBySender: true,\n  cancelableByRecipient: false,\n  transferableBySender: false,\n  transferableByRecipient: true\n});\n\`\`\`\n\n### Use Cases\n- **Payroll** — Stream salaries in USDC/USDT\n- **Subscriptions** — Pay-per-second SaaS billing\n- **Grants** — DAO grant disbursement\n- **Freelancing** — Real-time payment for work\n\n> **Key Benefit:** Recipients don't have to wait for monthly payments — they can withdraw earned tokens at any time.` },
      { title: 'JavaScript SDK', description: 'Integrate Streamflow vesting and streaming into your app with the TypeScript SDK.', url: 'https://docs.streamflow.finance/developers/sdk', content: `## JavaScript SDK\n\nIntegrate Streamflow vesting and streaming into your application.\n\n### Installation\n\n\`\`\`bash\nnpm install @streamflow/stream\n\`\`\`\n\n### Core Operations\n\n\`\`\`typescript\nimport { StreamflowSolana, Types } from '@streamflow/stream';\n\nconst client = new StreamflowSolana.SolanaStreamClient(rpcUrl);\n\n// Create a stream\nconst { tx, id } = await client.create(createParams);\n\n// Withdraw from stream\nawait client.withdraw({ id: streamId, amount: withdrawAmount });\n\n// Cancel stream (if cancelable)\nawait client.cancel({ id: streamId });\n\n// Top up stream\nawait client.topup({ id: streamId, amount: topupAmount });\n\n// Transfer stream\nawait client.transfer({ id: streamId, newRecipient: newAddress });\n\`\`\`\n\n### Query Streams\n\`\`\`typescript\n// Get all streams for a wallet\nconst streams = await client.get({\n  wallet: walletAddress,\n  type: Types.StreamType.All,\n  direction: Types.StreamDirection.All\n});\n\nfor (const [id, stream] of Object.entries(streams)) {\n  console.log('Stream:', stream.name);\n  console.log('Withdrawable:', stream.withdrawableAmount);\n}\n\`\`\`\n\n> **Tip:** Use \`stream.withdrawableAmount\` to show users their current claimable balance in real-time.` },
      { title: 'Token Lock', description: 'Lock tokens with configurable unlock schedules for team allocations and investor lockups.', url: 'https://docs.streamflow.finance/help/token-lock', content: `## Token Lock\n\nLock tokens with configurable unlock schedules — ensuring transparency and trust for token distributions.\n\n### How Token Locks Work\n1. Deposit tokens into a lock contract\n2. Tokens are provably locked on-chain\n3. Tokens unlock according to the schedule\n4. Anyone can verify the lock status\n\n### Lock vs. Vesting\n| Feature | Token Lock | Vesting |\n|---------|-----------|--------|\n| Recipient | Self (team treasury) | Specific wallet |\n| Purpose | Prove tokens are locked | Distribute to individuals |\n| Visibility | Public proof | Public schedule |\n| Typical use | Team/treasury tokens | Employee/investor grants |\n\n### Common Schedules\n\`\`\`\nTeam tokens: 12-month cliff, 36-month linear\nTreasury: 6-month cliff, 24-month linear\nAdvisors: 3-month cliff, 12-month linear\n\`\`\`\n\n### Key Features\n- **Proof of lock** — On-chain verification that tokens are locked\n- **Configurable schedule** — Any cliff + linear combination\n- **Multi-token** — Lock any SPL token\n- **Verifiable** — Anyone can check lock status on-chain\n- **Non-custodial** — Only the schedule controls unlock\n\n> **Important:** Publishing token lock addresses in your documentation builds trust with investors and community. Transparent tokenomics = higher confidence.` },
    ],
  },
  {
    name: 'Sphere Pay',
    slug: 'sphere-pay',
    logoUrl: 'https://spherepay.co/favicon.ico',
    docsUrl: 'https://docs.spherepay.co',
    description: 'Crypto payment infrastructure — accept stablecoin payments, invoicing, and merchant checkout on Solana.',
    category: 'Infrastructure',
    tags: ['payments', 'checkout', 'invoicing', 'stablecoins', 'merchant'],
    sections: [
      { title: 'Payment Links', description: 'Generate shareable payment links for one-time or recurring crypto payments.', url: 'https://docs.spherepay.co/documentation/payment-links', content: `## Payment Links\n\nGenerate shareable payment links for one-time or recurring crypto payments.\n\n### Create a Payment Link\n\`\`\`typescript\nconst link = await sphere.paymentLinks.create({\n  name: 'Pro Subscription',\n  description: 'Monthly subscription to Pro plan',\n  amount: 29.99,\n  currency: 'USDC',\n  type: 'oneTime', // or 'recurring'\n  successUrl: 'https://yourapp.com/success',\n  cancelUrl: 'https://yourapp.com/cancel'\n});\n\nconsole.log('Payment URL:', link.url);\n\`\`\`\n\n### Link Types\n| Type | Description |\n|------|-------------|\n| **One-time** | Single payment, single use |\n| **Recurring** | Subscription (monthly, yearly) |\n| **Pay-what-you-want** | User chooses amount |\n| **Multi-use** | Same link, multiple payments |\n\n### Features\n- **Shareable** — Send via email, embed in website, QR code\n- **Multi-currency** — Accept USDC, USDT, SOL\n- **Hosted page** — Sphere handles the checkout UI\n- **Webhooks** — Get notified on payment events\n- **Fiat conversion** — Display prices in fiat, settle in crypto\n\n> **Tip:** Payment links are the easiest way to start accepting crypto — no coding required. Just create a link and share it.` },
      { title: 'Checkout Integration', description: 'Embed Sphere checkout into your app for seamless stablecoin payment flows.', url: 'https://docs.spherepay.co/documentation/checkout', content: `## Checkout Integration\n\nEmbed Sphere's checkout directly into your application for seamless payment flows.\n\n### Embedded Checkout\n\n\`\`\`typescript\nimport { SphereCheckout } from '@spherepay/checkout';\n\nconst checkout = new SphereCheckout({\n  apiKey: 'YOUR_PUBLIC_KEY',\n  onSuccess: (payment) => {\n    console.log('Payment confirmed:', payment.id);\n    // Grant access, deliver product, etc.\n  },\n  onError: (error) => {\n    console.error('Payment failed:', error);\n  }\n});\n\n// Open checkout modal\ncheckout.open({\n  amount: 49.99,\n  currency: 'USDC',\n  metadata: {\n    orderId: 'ORDER_123',\n    customer: 'user@example.com'\n  }\n});\n\`\`\`\n\n### Checkout Flow\n1. User clicks "Pay" in your app\n2. Sphere checkout modal opens\n3. User connects wallet and confirms payment\n4. Payment settles on Solana (1-2 seconds)\n5. Webhook + callback confirm payment\n6. You deliver the product/service\n\n### Supported Tokens\n- USDC, USDT (stablecoins preferred)\n- SOL\n- Custom SPL tokens (by request)\n\n> **Key Advantage:** Sphere handles all the complexity — wallet connection, transaction building, confirmation — you just receive a callback when payment succeeds.` },
      { title: 'API Reference', description: 'Full REST API for creating payments, managing customers, and tracking transactions.', url: 'https://docs.spherepay.co/api-reference', content: `## API Reference\n\nFull REST API for managing payments, customers, products, and transactions.\n\n### Authentication\n\`\`\`typescript\nconst headers = {\n  'Authorization': \`Bearer \${SPHERE_SECRET_KEY}\`,\n  'Content-Type': 'application/json'\n};\n\`\`\`\n\n### Key Endpoints\n\n| Resource | Endpoints |\n|----------|----------|\n| **Payments** | Create, retrieve, list, refund |\n| **Customers** | Create, update, list |\n| **Products** | Create, update, list |\n| **Prices** | Create with currency and amount |\n| **Subscriptions** | Create, cancel, update |\n| **Webhooks** | Configure event notifications |\n\n### Create a Payment\n\`\`\`typescript\nconst payment = await fetch('https://api.spherepay.co/v1/payments', {\n  method: 'POST',\n  headers,\n  body: JSON.stringify({\n    amount: 100,\n    currency: 'USDC',\n    customer: 'cust_123',\n    description: 'Annual subscription',\n    metadata: { plan: 'enterprise' }\n  })\n});\n\`\`\`\n\n### Webhook Events\n- \`payment.completed\` — Payment confirmed on-chain\n- \`payment.failed\` — Payment failed or expired\n- \`subscription.created\` — New subscription started\n- \`subscription.cancelled\` — Subscription ended\n\n> **Note:** Always verify webhook signatures to prevent spoofed events. Use the signing secret from your Sphere dashboard.` },
      { title: 'Webhooks', description: 'Receive real-time notifications for payment events — confirmations, refunds, and disputes.', url: 'https://docs.spherepay.co/documentation/webhooks', content: `## Webhooks\n\nReceive real-time HTTP notifications for payment events.\n\n### Setup\nConfigure webhook endpoints in your Sphere dashboard or via API.\n\n### Event Types\n| Event | Description |\n|-------|-------------|\n| \`payment.completed\` | Payment confirmed on-chain |\n| \`payment.pending\` | Payment submitted, awaiting confirmation |\n| \`payment.failed\` | Payment failed or expired |\n| \`payment.refunded\` | Payment refunded |\n| \`subscription.active\` | Subscription payment succeeded |\n| \`subscription.past_due\` | Subscription payment failed |\n| \`subscription.cancelled\` | Subscription ended |\n\n### Webhook Handler\n\`\`\`typescript\napp.post('/webhooks/sphere', (req, res) => {\n  // Verify signature\n  const signature = req.headers['sphere-signature'];\n  const isValid = verifyWebhookSignature(req.body, signature, webhookSecret);\n  \n  if (!isValid) return res.status(401).send('Invalid signature');\n  \n  const event = req.body;\n  switch (event.type) {\n    case 'payment.completed':\n      // Fulfill order\n      await fulfillOrder(event.data.metadata.orderId);\n      break;\n    case 'subscription.cancelled':\n      // Revoke access\n      await revokeAccess(event.data.customerId);\n      break;\n  }\n  \n  res.status(200).send('OK');\n});\n\`\`\`\n\n### Best Practices\n- **Always verify signatures** — Prevent webhook spoofing\n- **Respond quickly** — Return 200 within 5 seconds\n- **Idempotency** — Handle duplicate events gracefully\n- **Retry logic** — Sphere retries failed deliveries\n\n> **Important:** Always use webhook signature verification in production. Never trust webhook payloads without cryptographic verification.` },
    ],
  },
];

export default solanaServices;
