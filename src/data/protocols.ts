export interface ProtocolLink {
  official: string;
  docs: string;
  github: string;
  discord?: string;
  twitter?: string;
}

export interface QuickFact {
  useCase: string;
  maturity: 'Production' | 'Beta' | 'Alpha';
  maintainer: string;
  license: string;
}

export interface CommonIssue {
  problem: string;
  solution: string;
  code?: string;
}

export interface Protocol {
  id: string;
  slug: string;
  name: string;
  category: string;
  tier: number;
  description: string;
  status: 'Active' | 'Maintained' | 'Deprecated';
  lastUpdated: string;
  links: ProtocolLink;
  quickFacts: QuickFact;
  integrationDifficulty: 'Easy' | 'Medium' | 'Advanced';
  estimatedIntegrationTime: string;
  installCommands: string[];
  codeExample: string;
  commonIssues: CommonIssue[];
  whenToUse: string[];
  whenNotToUse: string[];
  keywords: string[];
}

export const protocols: Protocol[] = [
  {
    id: 'jupiter',
    slug: 'jupiter',
    name: 'Jupiter',
    category: 'defi',
    tier: 1,
    description: 'The leading DEX aggregator on Solana. Routes trades across multiple AMMs to find the best price with minimal slippage.',
    status: 'Active',
    lastUpdated: '2025-01-15',
    links: {
      official: 'https://jup.ag',
      docs: 'https://station.jup.ag/docs',
      github: 'https://github.com/jup-ag',
      discord: 'https://discord.gg/jup',
      twitter: 'https://twitter.com/JupiterExchange',
    },
    quickFacts: {
      useCase: 'Token swaps with best execution across all Solana DEXs',
      maturity: 'Production',
      maintainer: 'Jupiter Team',
      license: 'BSL',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 30 min',
    installCommands: ['npm install @jup-ag/api'],
    codeExample: `import { createJupiterApiClient } from '@jup-ag/api';

const jupiterApi = createJupiterApiClient();

// Get a quote for SOL -> USDC
const quote = await jupiterApi.quoteGet({
  inputMint: 'So11111111111111111111111111111111111111112',
  outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount: 1_000_000_000, // 1 SOL in lamports
  slippageBps: 50,
});

console.log('Best price:', quote);`,
    commonIssues: [
      {
        problem: 'Route not found for token pair',
        solution: 'Ensure both mint addresses are correct and the pair has sufficient liquidity. Use the /tokens endpoint to verify supported mints.',
      },
      {
        problem: 'Transaction simulation failed',
        solution: 'Check that the wallet has enough SOL for rent and transaction fees. Increase slippage tolerance for volatile pairs.',
        code: `// Increase slippage to 1%
const quote = await jupiterApi.quoteGet({
  ...params,
  slippageBps: 100,
});`,
      },
    ],
    whenToUse: [
      'Building any app that needs token swaps',
      'Want best execution across all Solana DEXs',
      'Need limit orders or DCA functionality',
      'Integrating swap into wallets or dApps',
    ],
    whenNotToUse: [
      'Building your own AMM (use Raydium SDK instead)',
      'Need cross-chain swaps (use Wormhole or deBridge)',
      'Simple SOL transfers only',
    ],
    keywords: ['swap', 'dex', 'aggregator', 'trade', 'exchange', 'amm', 'liquidity', 'token'],
  },
  {
    id: 'anchor',
    slug: 'anchor',
    name: 'Anchor',
    category: 'developer-tools',
    tier: 1,
    description: 'The standard framework for building Solana programs. Provides IDL generation, account validation, and a testing suite.',
    status: 'Active',
    lastUpdated: '2025-01-20',
    links: {
      official: 'https://www.anchor-lang.com',
      docs: 'https://www.anchor-lang.com/docs',
      github: 'https://github.com/coral-xyz/anchor',
      discord: 'https://discord.gg/NHHGSXAnXk',
      twitter: 'https://twitter.com/ancaborlang',
    },
    quickFacts: {
      useCase: 'Building and testing Solana programs with less boilerplate',
      maturity: 'Production',
      maintainer: 'Coral (formerly Armani Ferrante)',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '2-4 hours',
    installCommands: [
      'cargo install --git https://github.com/coral-xyz/anchor avm --force',
      'avm install latest',
      'avm use latest',
    ],
    codeExample: `use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID");

#[program]
pub mod my_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Counter {
    pub count: u64,
}`,
    commonIssues: [
      {
        problem: 'anchor build fails with version mismatch',
        solution: 'Ensure your Anchor CLI version matches the anchor-lang version in Cargo.toml. Use `avm use` to switch versions.',
        code: `# Check current version
anchor --version

# Switch to matching version
avm install 0.30.1
avm use 0.30.1`,
      },
      {
        problem: 'IDL not generating correctly',
        solution: 'Run `anchor build` first, then check target/idl/ directory. Ensure all types derive AnchorSerialize and AnchorDeserialize.',
      },
    ],
    whenToUse: [
      'Building any new Solana program from scratch',
      'Need automatic account validation and serialization',
      'Want integrated testing framework',
      'Team is new to Solana development',
    ],
    whenNotToUse: [
      'Optimizing for minimal compute units (raw Solana SDK is leaner)',
      'Building client-side only applications',
      'Existing program already uses raw Solana SDK',
    ],
    keywords: ['framework', 'program', 'smart contract', 'rust', 'idl', 'testing', 'build'],
  },
  {
    id: 'metaplex',
    slug: 'metaplex',
    name: 'Metaplex',
    category: 'nfts',
    tier: 1,
    description: 'The NFT standard on Solana. Provides token metadata, candy machine minting, and digital asset management.',
    status: 'Active',
    lastUpdated: '2025-01-10',
    links: {
      official: 'https://metaplex.com',
      docs: 'https://developers.metaplex.com',
      github: 'https://github.com/metaplex-foundation',
      discord: 'https://discord.gg/metaplex',
      twitter: 'https://twitter.com/metaplex',
    },
    quickFacts: {
      useCase: 'Creating, minting, and managing NFTs and digital assets on Solana',
      maturity: 'Production',
      maintainer: 'Metaplex Foundation',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-3 hours',
    installCommands: ['npm install @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi'],
    codeExample: `import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(mplTokenMetadata());

const mint = generateSigner(umi);

await createNft(umi, {
  mint,
  name: 'My NFT',
  uri: 'https://arweave.net/metadata.json',
  sellerFeeBasisPoints: percentAmount(5),
}).sendAndConfirm(umi);`,
    commonIssues: [
      {
        problem: 'Umi wallet adapter setup confusion',
        solution: 'Use @metaplex-foundation/umi-signer-wallet-adapters to bridge your existing wallet adapter with Umi.',
      },
      {
        problem: 'Metadata upload fails',
        solution: 'Upload metadata JSON to Arweave or IPFS first, then pass the URI to createNft. Use Irys (formerly Bundlr) for Arweave uploads.',
      },
    ],
    whenToUse: [
      'Minting NFTs or NFT collections',
      'Building NFT marketplaces',
      'Need token metadata standard compliance',
      'Creating candy machine drops',
    ],
    whenNotToUse: [
      'Fungible token operations only (use SPL Token)',
      'Need cross-chain NFTs',
      'Simple token transfers without metadata',
    ],
    keywords: ['nft', 'mint', 'metadata', 'candy machine', 'digital asset', 'collection', 'art'],
  },
  {
    id: 'helius',
    slug: 'helius',
    name: 'Helius',
    category: 'infrastructure',
    tier: 1,
    description: 'Premium RPC and API infrastructure for Solana. Provides enhanced APIs for transactions, DAS (Digital Asset Standard), and webhooks.',
    status: 'Active',
    lastUpdated: '2025-02-01',
    links: {
      official: 'https://helius.dev',
      docs: 'https://docs.helius.dev',
      github: 'https://github.com/helius-labs',
      discord: 'https://discord.gg/helius',
      twitter: 'https://twitter.com/heaboruslabs',
    },
    quickFacts: {
      useCase: 'Reliable RPC, enhanced transaction APIs, and webhooks for Solana apps',
      maturity: 'Production',
      maintainer: 'Helius Labs',
      license: 'Proprietary (free tier available)',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 15 min',
    installCommands: ['npm install helius-sdk'],
    codeExample: `import { Helius } from 'helius-sdk';

const helius = new Helius('YOUR_API_KEY');

// Get enriched transaction history
const history = await helius.parseTransactions(
  '3gZ...txSignature',
);

// Get all NFTs for a wallet
const nfts = await helius.rpc.getAssetsByOwner({
  ownerAddress: 'WALLETAddress...',
  page: 1,
});

console.log('Parsed transactions:', history);
console.log('NFTs owned:', nfts.items.length);`,
    commonIssues: [
      {
        problem: 'Rate limit exceeded on free tier',
        solution: 'Free tier allows 100 RPC requests/second. Add retry logic with exponential backoff, or upgrade to a paid plan for higher limits.',
      },
      {
        problem: 'Webhook not receiving events',
        solution: 'Ensure your webhook URL is publicly accessible and returns a 200 status. Check the Helius dashboard for delivery logs.',
      },
    ],
    whenToUse: [
      'Need reliable, fast RPC for production apps',
      'Want parsed/enriched transaction data',
      'Building webhook-driven architectures',
      'Need DAS API for compressed NFTs',
    ],
    whenNotToUse: [
      'Local development only (use localhost validator)',
      'Need custom RPC modifications',
      'Budget is zero and free tier is insufficient',
    ],
    keywords: ['rpc', 'api', 'webhook', 'infrastructure', 'das', 'transaction', 'node'],
  },
  {
    id: 'pyth',
    slug: 'pyth',
    name: 'Pyth Network',
    category: 'infrastructure',
    tier: 1,
    description: 'High-frequency oracle network delivering real-time price feeds for DeFi applications on Solana and 40+ chains.',
    status: 'Active',
    lastUpdated: '2025-01-25',
    links: {
      official: 'https://pyth.network',
      docs: 'https://docs.pyth.network',
      github: 'https://github.com/pyth-network',
      discord: 'https://discord.gg/pythnetwork',
      twitter: 'https://twitter.com/PythNetwork',
    },
    quickFacts: {
      useCase: 'Real-time price feeds for DeFi protocols (SOL/USD, BTC/USD, etc.)',
      maturity: 'Production',
      maintainer: 'Pyth Data Association',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-2 hours',
    installCommands: ['npm install @pythnetwork/price-service-client'],
    codeExample: `import { PriceServiceConnection } from '@pythnetwork/price-service-client';

const connection = new PriceServiceConnection(
  'https://hermes.pyth.network'
);

// SOL/USD price feed ID
const SOL_USD = '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d';

const priceFeeds = await connection.getLatestPriceFeeds([SOL_USD]);
const solPrice = priceFeeds?.[0].getPriceNoOlderThan(60);

console.log('SOL/USD:', solPrice?.price);`,
    commonIssues: [
      {
        problem: 'Price feed returns null or stale data',
        solution: 'Use getPriceNoOlderThan() with a reasonable staleness threshold (e.g., 60 seconds). Fall back to getPriceUnchecked() only for display purposes.',
      },
      {
        problem: 'Wrong price feed ID',
        solution: 'Price feed IDs differ between mainnet and devnet. Check https://pyth.network/developers/price-feed-ids for the correct IDs.',
      },
    ],
    whenToUse: [
      'Building DeFi protocols that need price data',
      'Liquidation engines requiring low-latency prices',
      'Portfolio trackers with real-time valuations',
      'Any app needing reliable SOL/USD or crypto prices',
    ],
    whenNotToUse: [
      'Need historical price charts (use a charting API)',
      'Non-financial applications',
      'Need stock or forex data (Pyth focuses on crypto)',
    ],
    keywords: ['oracle', 'price', 'feed', 'defi', 'data', 'real-time', 'pyth'],
  },
  {
    id: 'phantom',
    slug: 'phantom',
    name: 'Phantom',
    category: 'wallets',
    tier: 1,
    description: 'The most popular Solana wallet. Provides browser extension and mobile app with built-in swap, staking, and dApp browser.',
    status: 'Active',
    lastUpdated: '2025-01-30',
    links: {
      official: 'https://phantom.app',
      docs: 'https://docs.phantom.app',
      github: 'https://github.com/nicholasgasior/solana-wallet-adapter',
      twitter: 'https://twitter.com/phantom',
    },
    quickFacts: {
      useCase: 'Connecting users\' wallets to your Solana dApp for signing transactions',
      maturity: 'Production',
      maintainer: 'Phantom Technologies',
      license: 'Proprietary',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 30 min',
    installCommands: [
      'npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets',
    ],
    codeExample: `import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

function ConnectWallet() {
  const { publicKey, connected } = useWallet();

  return (
    <div>
      <WalletMultiButton />
      {connected && (
        <p>Connected: {publicKey?.toBase58()}</p>
      )}
    </div>
  );
}`,
    commonIssues: [
      {
        problem: 'Wallet adapter not detecting Phantom',
        solution: 'Ensure the WalletProvider is wrapping your app at the top level. Phantom injects window.solana after page load.',
      },
      {
        problem: 'Transaction signing fails silently',
        solution: 'Check that the transaction is properly constructed with a recent blockhash. Use connection.getLatestBlockhash() before signing.',
      },
    ],
    whenToUse: [
      'Any dApp that needs user wallet connection',
      'Need transaction signing in the browser',
      'Building consumer-facing Solana applications',
      'Want the widest wallet compatibility',
    ],
    whenNotToUse: [
      'Server-side transaction signing (use Keypair directly)',
      'Automated bots or scripts',
      'Backend-only applications',
    ],
    keywords: ['wallet', 'connect', 'sign', 'phantom', 'adapter', 'browser', 'extension'],
  },
  {
    id: 'solana-web3js',
    slug: 'solana-web3js',
    name: 'Solana Web3.js',
    category: 'infrastructure',
    tier: 1,
    description: 'The official JavaScript SDK for interacting with the Solana blockchain. Handles connections, transactions, accounts, and RPC calls.',
    status: 'Active',
    lastUpdated: '2025-02-05',
    links: {
      official: 'https://solana.com',
      docs: 'https://solana-labs.github.io/solana-web3.js',
      github: 'https://github.com/solana-labs/solana-web3.js',
      discord: 'https://discord.gg/solana',
      twitter: 'https://twitter.com/solana',
    },
    quickFacts: {
      useCase: 'Core SDK for all Solana blockchain interactions from JavaScript/TypeScript',
      maturity: 'Production',
      maintainer: 'Solana Labs / Anza',
      license: 'MIT',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 15 min',
    installCommands: ['npm install @solana/web3.js'],
    codeExample: `import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Get SOL balance
const publicKey = new PublicKey('YOUR_WALLET_ADDRESS');
const balance = await connection.getBalance(publicKey);

console.log('Balance:', balance / LAMPORTS_PER_SOL, 'SOL');

// Get recent blockhash
const { blockhash } = await connection.getLatestBlockhash();
console.log('Latest blockhash:', blockhash);`,
    commonIssues: [
      {
        problem: 'Connection timeout on mainnet',
        solution: 'Use a dedicated RPC provider (Helius, QuickNode) instead of the public endpoint. The public endpoint has strict rate limits.',
      },
      {
        problem: 'Transaction too large error',
        solution: 'Solana transactions have a 1232-byte limit. Split complex operations into multiple transactions or use versioned transactions with lookup tables.',
      },
    ],
    whenToUse: [
      'Any Solana application (this is the base SDK)',
      'Reading account data and balances',
      'Constructing and sending transactions',
      'Subscribing to account changes',
    ],
    whenNotToUse: [
      'Building Solana programs (use Anchor or native Rust SDK)',
      'Need higher-level abstractions (use Jupiter, Metaplex, etc.)',
    ],
    keywords: ['sdk', 'web3', 'connection', 'transaction', 'account', 'rpc', 'solana', 'core'],
  },
  {
    id: 'spl-token',
    slug: 'spl-token',
    name: 'SPL Token',
    category: 'infrastructure',
    tier: 1,
    description: 'The Solana Program Library token standard. Create, mint, transfer, and manage fungible and non-fungible tokens.',
    status: 'Active',
    lastUpdated: '2025-01-18',
    links: {
      official: 'https://spl.solana.com/token',
      docs: 'https://spl.solana.com/token',
      github: 'https://github.com/solana-labs/solana-program-library',
      discord: 'https://discord.gg/solana',
    },
    quickFacts: {
      useCase: 'Creating and managing fungible tokens (SPL tokens) on Solana',
      maturity: 'Production',
      maintainer: 'Solana Labs',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-2 hours',
    installCommands: ['npm install @solana/spl-token'],
    codeExample: `import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const payer = Keypair.generate();

// Create a new token mint
const mint = await createMint(
  connection,
  payer,
  payer.publicKey,  // mint authority
  null,             // freeze authority
  9                 // decimals
);

// Create token account
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, payer.publicKey
);

// Mint tokens
await mintTo(connection, payer, mint, tokenAccount.address, payer, 1_000_000_000);`,
    commonIssues: [
      {
        problem: 'Token account does not exist',
        solution: 'Use getOrCreateAssociatedTokenAccount() instead of getAssociatedTokenAddress(). It creates the account if missing.',
      },
      {
        problem: 'Insufficient funds for rent',
        solution: 'Creating token accounts requires ~0.002 SOL for rent. Ensure the payer has enough SOL before token operations.',
      },
    ],
    whenToUse: [
      'Creating new fungible tokens',
      'Token transfers and balance checks',
      'Building token-gated features',
      'Managing token accounts programmatically',
    ],
    whenNotToUse: [
      'NFTs with metadata (use Metaplex instead)',
      'Token swaps (use Jupiter)',
      'Just reading token balances (Web3.js getTokenAccountBalance is simpler)',
    ],
    keywords: ['token', 'spl', 'mint', 'transfer', 'fungible', 'create', 'balance'],
  },
  {
    id: 'raydium',
    slug: 'raydium',
    name: 'Raydium',
    category: 'defi',
    tier: 1,
    description: 'Leading AMM and liquidity protocol on Solana. Powers concentrated liquidity pools, farms, and the AcceleRaytor launchpad.',
    status: 'Active',
    lastUpdated: '2025-01-12',
    links: {
      official: 'https://raydium.io',
      docs: 'https://docs.raydium.io',
      github: 'https://github.com/raydium-io',
      discord: 'https://discord.gg/raydium',
      twitter: 'https://twitter.com/RaydiumProtocol',
    },
    quickFacts: {
      useCase: 'Providing and managing liquidity pools, building AMM integrations',
      maturity: 'Production',
      maintainer: 'Raydium Team',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Advanced',
    estimatedIntegrationTime: '4-8 hours',
    installCommands: ['npm install @raydium-io/raydium-sdk-v2'],
    codeExample: `import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const raydium = await Raydium.load({
  connection,
  owner: wallet, // Keypair or wallet adapter
});

// Fetch pool info
const poolInfo = await raydium.api.fetchPoolById({
  ids: 'POOL_ID_HERE',
});

console.log('Pool TVL:', poolInfo);`,
    commonIssues: [
      {
        problem: 'SDK v2 breaking changes from v1',
        solution: 'Raydium SDK v2 has a completely different API surface. Follow the migration guide at docs.raydium.io. Key change: use Raydium.load() instead of individual util functions.',
      },
      {
        problem: 'Pool not found',
        solution: 'Pool IDs change between CLMM and standard AMM pools. Use the Raydium API to discover pool IDs for a given token pair.',
      },
    ],
    whenToUse: [
      'Building custom AMM integrations',
      'Creating liquidity provision interfaces',
      'Need direct pool interaction (not via aggregator)',
      'Building yield farming or LP management tools',
    ],
    whenNotToUse: [
      'Simple token swaps (use Jupiter for better routing)',
      'Just need price data (use Pyth or Birdeye)',
      'Building on a different chain',
    ],
    keywords: ['amm', 'liquidity', 'pool', 'defi', 'farm', 'swap', 'clmm', 'lp'],
  },
  {
    id: 'marinade',
    slug: 'marinade',
    name: 'Marinade Finance',
    category: 'defi',
    tier: 1,
    description: 'The leading liquid staking protocol on Solana. Stake SOL and receive mSOL, a liquid staking derivative usable across DeFi.',
    status: 'Active',
    lastUpdated: '2025-01-08',
    links: {
      official: 'https://marinade.finance',
      docs: 'https://docs.marinade.finance',
      github: 'https://github.com/marinade-finance',
      discord: 'https://discord.gg/marinade',
      twitter: 'https://twitter.com/MarinadeFinance',
    },
    quickFacts: {
      useCase: 'Liquid staking SOL to earn yield while maintaining liquidity via mSOL',
      maturity: 'Production',
      maintainer: 'Marinade Finance',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-2 hours',
    installCommands: ['npm install @marinade.finance/marinade-ts-sdk'],
    codeExample: `import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const config = new MarinadeConfig({ connection });
const marinade = new Marinade(config);

// Get mSOL/SOL exchange rate
const state = await marinade.getMarinadeState();
console.log('mSOL price:', state.mSolPrice.toNumber());

// Stake 1 SOL
const { transaction } = await marinade.deposit(
  1_000_000_000 // 1 SOL in lamports
);`,
    commonIssues: [
      {
        problem: 'mSOL balance not updating after stake',
        solution: 'mSOL is delivered to the associated token account. Check getOrCreateAssociatedTokenAccount for the mSOL mint address.',
      },
      {
        problem: 'Unstake delay',
        solution: 'Delayed unstake takes 1-2 epochs (~2-4 days). For instant liquidity, use the liquid unstake method which swaps mSOL on DEXs.',
      },
    ],
    whenToUse: [
      'Adding staking yield to your application',
      'Building DeFi products that use mSOL as collateral',
      'Want to offer one-click staking to users',
      'Portfolio apps showing staking positions',
    ],
    whenNotToUse: [
      'Need native staking (validator-specific delegation)',
      'Cross-chain staking',
      'Non-SOL token staking',
    ],
    keywords: ['staking', 'liquid', 'msol', 'yield', 'defi', 'stake', 'delegate', 'validator'],
  },
  {
    id: 'orca',
    slug: 'orca',
    name: 'Orca',
    category: 'defi',
    tier: 2,
    description: 'Leading concentrated liquidity DEX on Solana. Whirlpools provide capital-efficient trading with tight spreads.',
    status: 'Active',
    lastUpdated: '2025-01-22',
    links: {
      official: 'https://www.orca.so',
      docs: 'https://docs.orca.so',
      github: 'https://github.com/orca-so',
      discord: 'https://discord.gg/nSwGWn5KSG',
      twitter: 'https://twitter.com/orca_so',
    },
    quickFacts: {
      useCase: 'Capital-efficient token swaps and concentrated liquidity provision',
      maturity: 'Production',
      maintainer: 'Orca Team',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-3 hours',
    installCommands: ['npm install @orca-so/whirlpools-sdk @orca-so/common-sdk'],
    codeExample: `import { WhirlpoolContext, buildWhirlpoolClient, ORCA_WHIRLPOOL_PROGRAM_ID } from '@orca-so/whirlpools-sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const ctx = WhirlpoolContext.from(connection, wallet, ORCA_WHIRLPOOL_PROGRAM_ID);
const client = buildWhirlpoolClient(ctx);

// Fetch a whirlpool
const poolAddress = 'POOL_ADDRESS';
const whirlpool = await client.getPool(poolAddress);
const data = whirlpool.getData();

console.log('Current price:', data.sqrtPrice);`,
    commonIssues: [
      {
        problem: 'Whirlpool SDK version mismatch',
        solution: 'Ensure @orca-so/whirlpools-sdk and @orca-so/common-sdk versions are compatible. Check the Orca GitHub releases for matching versions.',
      },
      {
        problem: 'Position out of range',
        solution: 'Concentrated liquidity positions only earn fees when the price is within your range. Monitor positions and rebalance as needed.',
      },
    ],
    whenToUse: [
      'Building concentrated liquidity integrations',
      'Need direct Whirlpool pool interaction',
      'Creating LP management dashboards',
      'Want capital-efficient liquidity provision',
    ],
    whenNotToUse: [
      'Simple token swaps (use Jupiter for routing)',
      'Need cross-DEX aggregation',
      'Building on non-Solana chains',
    ],
    keywords: ['dex', 'clmm', 'whirlpool', 'liquidity', 'swap', 'concentrated', 'orca', 'lp'],
  },
  {
    id: 'drift',
    slug: 'drift',
    name: 'Drift Protocol',
    category: 'defi',
    tier: 2,
    description: 'Decentralized perpetuals and spot exchange on Solana. Supports up to 10x leverage with cross-margin and insurance fund.',
    status: 'Active',
    lastUpdated: '2025-01-18',
    links: {
      official: 'https://www.drift.trade',
      docs: 'https://docs.drift.trade',
      github: 'https://github.com/drift-labs',
      discord: 'https://discord.gg/driftprotocol',
      twitter: 'https://twitter.com/DriftProtocol',
    },
    quickFacts: {
      useCase: 'Perpetual futures and spot trading with leverage on Solana',
      maturity: 'Production',
      maintainer: 'Drift Labs',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Advanced',
    estimatedIntegrationTime: '4-8 hours',
    installCommands: ['npm install @drift-labs/sdk'],
    codeExample: `import { DriftClient, initialize } from '@drift-labs/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const wallet = { publicKey: Keypair.generate().publicKey };

const sdkConfig = initialize({ env: 'mainnet-beta' });
const driftClient = new DriftClient({
  connection,
  wallet,
  programID: sdkConfig.DRIFT_PROGRAM_ID,
});

await driftClient.subscribe();
const markets = driftClient.getPerpMarketAccounts();
console.log('Perp markets:', markets.length);`,
    commonIssues: [
      {
        problem: 'SDK subscription timeout',
        solution: 'Use a dedicated RPC with websocket support (Helius, Triton). The public endpoint often drops websocket connections.',
      },
      {
        problem: 'Insufficient collateral error',
        solution: 'Ensure the user account has deposited USDC as collateral before opening positions. Use getUser().getTotalCollateral() to check.',
      },
    ],
    whenToUse: [
      'Building perpetual trading interfaces',
      'Need leveraged trading capabilities',
      'Creating portfolio margin systems',
      'Building trading bots on Solana',
    ],
    whenNotToUse: [
      'Simple spot token swaps (use Jupiter)',
      'Non-trading applications',
      'Need options trading (use different protocol)',
    ],
    keywords: ['perpetuals', 'perps', 'leverage', 'trading', 'futures', 'margin', 'drift', 'dex'],
  },
  {
    id: 'marginfi',
    slug: 'marginfi',
    name: 'Marginfi',
    category: 'defi',
    tier: 2,
    description: 'Decentralized lending and borrowing protocol on Solana. Deposit assets to earn yield or borrow against collateral.',
    status: 'Active',
    lastUpdated: '2025-01-14',
    links: {
      official: 'https://www.marginfi.com',
      docs: 'https://docs.marginfi.com',
      github: 'https://github.com/mrgnlabs',
      discord: 'https://discord.gg/marginfi',
      twitter: 'https://twitter.com/marginaborfi',
    },
    quickFacts: {
      useCase: 'Lending, borrowing, and earning yield on deposited Solana assets',
      maturity: 'Production',
      maintainer: 'mrgn labs',
      license: 'Apache-2.0',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '2-4 hours',
    installCommands: ['npm install @mrgnlabs/marginfi-client-v2'],
    codeExample: `import { MarginfiClient, getConfig } from '@mrgnlabs/marginfi-client-v2';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const config = getConfig('production');

const client = await MarginfiClient.fetch(config, wallet, connection);

// Get all available banks (lending pools)
const banks = client.banks;
for (const [address, bank] of banks) {
  console.log(bank.label, 'APY:', bank.computeInterestRates());
}`,
    commonIssues: [
      {
        problem: 'Account not initialized',
        solution: 'Users need to create a marginfi account first via client.createMarginfiAccount() before depositing or borrowing.',
      },
      {
        problem: 'Borrow capacity exceeded',
        solution: 'Check the health factor and available borrow capacity. Use account.computeHealthComponents() to verify before borrowing.',
      },
    ],
    whenToUse: [
      'Building lending/borrowing interfaces',
      'Need yield generation for deposited assets',
      'Creating leverage strategies via borrow loops',
      'Portfolio apps showing lending positions',
    ],
    whenNotToUse: [
      'Simple token transfers',
      'Need perpetual futures (use Drift)',
      'Cross-chain lending',
    ],
    keywords: ['lending', 'borrowing', 'yield', 'defi', 'collateral', 'interest', 'marginfi', 'loan'],
  },
  {
    id: 'switchboard',
    slug: 'switchboard',
    name: 'Switchboard',
    category: 'infrastructure',
    tier: 2,
    description: 'Decentralized oracle network for Solana. Provides customizable data feeds, VRF (verifiable random functions), and serverless functions.',
    status: 'Active',
    lastUpdated: '2025-01-20',
    links: {
      official: 'https://switchboard.xyz',
      docs: 'https://docs.switchboard.xyz',
      github: 'https://github.com/switchboard-xyz',
      discord: 'https://discord.gg/switchboardxyz',
      twitter: 'https://twitter.com/switchboardxyz',
    },
    quickFacts: {
      useCase: 'Custom oracle data feeds, VRF for randomness, and serverless compute on-chain',
      maturity: 'Production',
      maintainer: 'Switchboard Labs',
      license: 'MIT',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '2-3 hours',
    installCommands: ['npm install @switchboard-xyz/solana.js'],
    codeExample: `import { SwitchboardProgram, AggregatorAccount } from '@switchboard-xyz/solana.js';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const program = await SwitchboardProgram.load('mainnet-beta', connection);

// Read a data feed
const aggregatorPubkey = new PublicKey('FEED_ADDRESS');
const aggregator = new AggregatorAccount(program, aggregatorPubkey);

const result = await aggregator.fetchLatestValue();
console.log('Feed value:', result?.toNumber());`,
    commonIssues: [
      {
        problem: 'Feed returns stale data',
        solution: 'Check the aggregator minUpdateDelaySeconds config. Some feeds update infrequently. Use Switchboard Explorer to verify feed freshness.',
      },
      {
        problem: 'VRF callback not executing',
        solution: 'Ensure your program has the VRF callback handler properly implemented and the VRF account is funded with enough SOL for compute.',
      },
    ],
    whenToUse: [
      'Need custom oracle data feeds beyond crypto prices',
      'Require verifiable on-chain randomness (VRF)',
      'Building protocols that need off-chain data',
      'Want an alternative to Pyth for specific data',
    ],
    whenNotToUse: [
      'Only need standard crypto price feeds (Pyth is simpler)',
      'Client-side data fetching only',
      'Non-blockchain applications',
    ],
    keywords: ['oracle', 'vrf', 'randomness', 'data feed', 'switchboard', 'off-chain', 'compute'],
  },
  {
    id: 'sablier',
    slug: 'sablier',
    name: 'Sablier (formerly Clockwork)',
    category: 'infrastructure',
    tier: 2,
    description: 'On-chain automation for Solana. Schedule cron jobs, recurring transactions, and time-based triggers directly on the blockchain.',
    status: 'Active',
    lastUpdated: '2024-12-15',
    links: {
      official: 'https://sablier.com',
      docs: 'https://docs.sablier.com',
      github: 'https://github.com/sablier-labs',
      twitter: 'https://twitter.com/Sablier_Labs',
    },
    quickFacts: {
      useCase: 'Scheduling automated on-chain transactions and cron-like jobs on Solana',
      maturity: 'Beta',
      maintainer: 'Sablier Labs',
      license: 'AGPL-3.0',
    },
    integrationDifficulty: 'Advanced',
    estimatedIntegrationTime: '3-6 hours',
    installCommands: ['npm install @sablier/sdk'],
    codeExample: `// Sablier thread creation (conceptual)
import { Connection, PublicKey } from '@solana/web3.js';

// Create an automation thread
// Threads execute your instruction at specified intervals
const thread = {
  authority: wallet.publicKey,
  trigger: { cron: { schedule: '0 */6 * * *' } }, // Every 6 hours
  instructions: [
    // Your instruction to execute automatically
  ],
};

console.log('Thread created for recurring execution');`,
    commonIssues: [
      {
        problem: 'Thread not executing on schedule',
        solution: 'Ensure the thread account has enough SOL to pay for execution fees. Each execution costs a small amount of SOL.',
      },
      {
        problem: 'Migration from Clockwork to Sablier',
        solution: 'Sablier is the successor to Clockwork. Check the migration guide for updated APIs and program IDs.',
      },
    ],
    whenToUse: [
      'Need recurring on-chain transactions',
      'Building automated DeFi strategies (auto-compound, rebalance)',
      'Scheduling governance proposal execution',
      'Time-based unlock or vesting schedules',
    ],
    whenNotToUse: [
      'One-time transactions (just send them directly)',
      'Off-chain automation (use traditional cron jobs)',
      'High-frequency operations (block time limits apply)',
    ],
    keywords: ['automation', 'cron', 'scheduler', 'clockwork', 'sablier', 'thread', 'recurring'],
  },
  {
    id: 'tensor',
    slug: 'tensor',
    name: 'Tensor',
    category: 'nfts',
    tier: 2,
    description: 'Professional NFT trading platform on Solana. Provides real-time analytics, AMM-based NFT liquidity, and advanced trading tools.',
    status: 'Active',
    lastUpdated: '2025-01-28',
    links: {
      official: 'https://www.tensor.trade',
      docs: 'https://docs.tensor.trade',
      github: 'https://github.com/tensor-hq',
      discord: 'https://discord.gg/tensor',
      twitter: 'https://twitter.com/tensor_hq',
    },
    quickFacts: {
      useCase: 'NFT trading, analytics, and AMM-based liquidity for NFT collections',
      maturity: 'Production',
      maintainer: 'Tensor Foundation',
      license: 'Proprietary',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '2-4 hours',
    installCommands: ['npm install @tensor-oss/tensorswap-sdk'],
    codeExample: `import { TensorSwapSDK } from '@tensor-oss/tensorswap-sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

const sdk = new TensorSwapSDK({ provider: { connection } });

// Fetch active listings for a collection
// Use Tensor API for collection-level data
const response = await fetch('https://api.tensor.so/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`{ activeListings(slug: "mad_lads") { mint price } }\`,
  }),
});

console.log('Listings:', await response.json());`,
    commonIssues: [
      {
        problem: 'API rate limiting',
        solution: 'Tensor API has rate limits for free usage. Cache responses and implement backoff. Contact Tensor for higher limits.',
      },
      {
        problem: 'TensorSwap SDK initialization',
        solution: 'The SDK requires a valid Anchor provider. Use AnchorProvider.env() or construct one with your connection and wallet.',
      },
    ],
    whenToUse: [
      'Building NFT trading interfaces',
      'Need floor price and collection analytics',
      'Creating NFT portfolio trackers',
      'Want AMM-based NFT liquidity',
    ],
    whenNotToUse: [
      'Minting new NFTs (use Metaplex)',
      'Fungible token trading',
      'Need cross-chain NFT support',
    ],
    keywords: ['nft', 'trading', 'marketplace', 'analytics', 'tensor', 'floor price', 'collection'],
  },
  {
    id: 'solana-playground',
    slug: 'solana-playground',
    name: 'Solana Playground',
    category: 'developer-tools',
    tier: 2,
    description: 'Browser-based IDE for writing, building, testing, and deploying Solana programs. No local setup required.',
    status: 'Active',
    lastUpdated: '2025-01-25',
    links: {
      official: 'https://beta.solpg.io',
      docs: 'https://docs.solpg.io',
      github: 'https://github.com/nicholasgasior/solana-playground',
      twitter: 'https://twitter.com/nicholasgasor',
    },
    quickFacts: {
      useCase: 'Rapid prototyping and learning Solana program development in the browser',
      maturity: 'Production',
      maintainer: 'acheron (community)',
      license: 'GPL-3.0',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 5 min',
    installCommands: ['# No installation needed — open https://beta.solpg.io in your browser'],
    codeExample: `// In Solana Playground (beta.solpg.io):
// 1. Click "New Project" → Select "Anchor"
// 2. Write your program in lib.rs:

use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod hello {
    use super::*;

    pub fn say_hello(ctx: Context<SayHello>) -> Result<()> {
        msg!("Hello, Solana!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SayHello {}

// 3. Click "Build" → "Deploy" → "Test"`,
    commonIssues: [
      {
        problem: 'Deploy fails with insufficient SOL',
        solution: 'Click the wallet icon in Playground and airdrop devnet SOL. Each deploy costs ~2-3 SOL on devnet.',
      },
      {
        problem: 'Build takes too long',
        solution: 'Solana Playground builds on remote servers. During peak times, builds may queue. Refresh and retry if it stalls over 2 minutes.',
      },
    ],
    whenToUse: [
      'Learning Solana development for the first time',
      'Quick prototyping without local setup',
      'Teaching workshops or demos',
      'Testing small program changes rapidly',
    ],
    whenNotToUse: [
      'Production program development (use local Anchor setup)',
      'Large multi-file projects',
      'Need custom toolchain or dependencies',
    ],
    keywords: ['ide', 'browser', 'playground', 'prototyping', 'learn', 'deploy', 'devnet', 'beginner'],
  },
  {
    id: 'seahorse',
    slug: 'seahorse',
    name: 'Seahorse',
    category: 'developer-tools',
    tier: 2,
    description: 'Write Solana programs in Python that compile to Anchor Rust. Lowers the barrier for Python developers entering Solana.',
    status: 'Maintained',
    lastUpdated: '2024-11-20',
    links: {
      official: 'https://seahorse-lang.org',
      docs: 'https://seahorse-lang.org/docs',
      github: 'https://github.com/ameliatastic/seahorse-lang',
      twitter: 'https://twitter.com/seahaborselang',
    },
    quickFacts: {
      useCase: 'Writing Solana programs in Python syntax for developers unfamiliar with Rust',
      maturity: 'Beta',
      maintainer: 'ameliatastic (community)',
      license: 'MIT',
    },
    integrationDifficulty: 'Medium',
    estimatedIntegrationTime: '1-2 hours',
    installCommands: [
      'pip install seahorse-lang',
      'seahorse init my_project',
    ],
    codeExample: `# programs_py/counter.py
from seahorse.prelude import *

declare_id('11111111111111111111111111111111')

class Counter(Account):
    count: u64

@instruction
def initialize(counter: Empty[Counter], signer: Signer):
    counter = counter.init(payer=signer, seeds=[])
    counter.count = 0

@instruction
def increment(counter: Counter):
    counter.count += 1

# Compiles to Anchor Rust automatically!`,
    commonIssues: [
      {
        problem: 'Seahorse not compiling to valid Rust',
        solution: 'Seahorse supports a subset of Python. Avoid advanced Python features (generators, decorators beyond @instruction). Check supported types in docs.',
      },
      {
        problem: 'Missing Anchor features',
        solution: 'Some Anchor features (custom errors, events) have limited Seahorse support. For complex programs, write the Rust directly.',
      },
    ],
    whenToUse: [
      'Python developers learning Solana',
      'Rapid prototyping before writing Rust',
      'Educational settings teaching blockchain concepts',
      'Simple programs that fit within Seahorse\'s feature set',
    ],
    whenNotToUse: [
      'Production programs (use Anchor directly for full control)',
      'Complex programs with advanced Rust features',
      'Need latest Anchor features immediately',
    ],
    keywords: ['python', 'seahorse', 'compile', 'anchor', 'beginner', 'learn', 'transpile'],
  },
  {
    id: 'bankrun',
    slug: 'bankrun',
    name: 'Bankrun',
    category: 'developer-tools',
    tier: 2,
    description: 'Blazing-fast Solana program testing framework. Runs a lightweight BanksServer instead of a full validator for instant test execution.',
    status: 'Active',
    lastUpdated: '2025-01-10',
    links: {
      official: 'https://github.com/kevinheavey/solana-bankrun',
      docs: 'https://kevinheavey.github.io/solana-bankrun',
      github: 'https://github.com/kevinheavey/solana-bankrun',
      twitter: 'https://twitter.com/kevinheavey',
    },
    quickFacts: {
      useCase: 'Fast unit and integration testing for Solana programs without a full validator',
      maturity: 'Production',
      maintainer: 'Kevin Heavey (community)',
      license: 'MIT',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 30 min',
    installCommands: ['npm install solana-bankrun'],
    codeExample: `import { start } from 'solana-bankrun';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

// Start a lightweight test environment
const context = await start([], []);
const client = context.banksClient;
const payer = context.payer;

// Create and send a transaction
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: new PublicKey('11111111111111111111111111111111'),
    lamports: 1_000_000,
  })
);

tx.recentBlockhash = context.lastBlockhash;
tx.sign(payer);
await client.processTransaction(tx);

console.log('Transaction processed instantly!');`,
    commonIssues: [
      {
        problem: 'Program not found in test context',
        solution: 'Load your program BPF file in the start() call: start([{ name: "my_program", programId: MY_PROGRAM_ID }], []).',
      },
      {
        problem: 'Clock not advancing',
        solution: 'Use context.warpToSlot() or context.warpToEpoch() to simulate time progression in tests.',
      },
    ],
    whenToUse: [
      'Unit testing Solana programs (10-100x faster than solana-test-validator)',
      'CI/CD pipelines needing fast test execution',
      'Testing account state changes and transactions',
      'Programs with time-dependent logic (warp slots)',
    ],
    whenNotToUse: [
      'Testing RPC-specific behavior',
      'Need full validator features (gossip, voting)',
      'Integration tests with external services',
    ],
    keywords: ['testing', 'bankrun', 'fast', 'unit test', 'ci', 'validator', 'banks', 'mock'],
  },
  {
    id: 'solflare',
    slug: 'solflare',
    name: 'Solflare',
    category: 'wallets',
    tier: 2,
    description: 'Multi-platform Solana wallet with built-in staking, swaps, and NFT management. Available as browser extension, mobile, and web app.',
    status: 'Active',
    lastUpdated: '2025-01-30',
    links: {
      official: 'https://solflare.com',
      docs: 'https://docs.solflare.com',
      github: 'https://github.com/nicholasgasior/solflare-wallet',
      twitter: 'https://twitter.com/solflare_wallet',
    },
    quickFacts: {
      useCase: 'Alternative wallet connection for Solana dApps with built-in staking and portfolio features',
      maturity: 'Production',
      maintainer: 'Solflare Team',
      license: 'Proprietary',
    },
    integrationDifficulty: 'Easy',
    estimatedIntegrationTime: '< 15 min',
    installCommands: [
      'npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets',
    ],
    codeExample: `import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Add Solflare to your wallet list
const wallets = [
  new SolflareWalletAdapter(),
  // ... other wallets
];

// Use with WalletProvider (same as Phantom)
// <WalletProvider wallets={wallets}>
//   <WalletMultiButton />
// </WalletProvider>

// Solflare also supports Solana Mobile Stack
// for in-app wallet on mobile devices`,
    commonIssues: [
      {
        problem: 'Solflare not appearing in wallet list',
        solution: 'Import SolflareWalletAdapter from @solana/wallet-adapter-wallets and add it to the wallets array in your WalletProvider.',
      },
      {
        problem: 'Mobile deep linking issues',
        solution: 'For mobile dApps, use the Solana Mobile Wallet Adapter standard. Solflare supports the MWA protocol for native mobile connections.',
      },
    ],
    whenToUse: [
      'Want to support multiple wallets beyond Phantom',
      'Users prefer built-in staking in their wallet',
      'Building mobile-first Solana apps',
      'Need hardware wallet support (Ledger via Solflare)',
    ],
    whenNotToUse: [
      'Only targeting Phantom users',
      'Server-side applications',
      'Automated transaction signing',
    ],
    keywords: ['wallet', 'solflare', 'staking', 'mobile', 'extension', 'connect', 'multi-platform'],
  },
];

export function getProtocolBySlug(slug: string): Protocol | undefined {
  return protocols.find((p) => p.slug === slug);
}

export function getProtocolsByCategory(categoryId: string): Protocol[] {
  return protocols.filter((p) => p.category === categoryId);
}

export function getRecentlyUpdated(limit = 5): Protocol[] {
  return [...protocols]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, limit);
}
