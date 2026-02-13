export type DocsCategory = 'RPC & Data' | 'DeFi' | 'Wallets' | 'NFTs' | 'Dev Tools' | 'MEV';

export interface DocSection {
  title: string;
  description: string;
  url: string;
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
  'RPC & Data', 'DeFi', 'Dev Tools', 'Wallets', 'NFTs', 'MEV',
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
      { title: 'RPC Nodes', description: 'Dedicated and shared Solana RPC endpoints with rate limiting and analytics.', url: 'https://docs.helius.dev/solana-rpc-nodes/solana-rpc-nodes' },
      { title: 'DAS API', description: 'Digital Asset Standard API for querying compressed NFTs, token metadata, and ownership.', url: 'https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api' },
      { title: 'Webhooks', description: 'Real-time event streaming for on-chain activity — account changes, transactions, and program events.', url: 'https://docs.helius.dev/webhooks-and-websockets/webhooks' },
      { title: 'Enhanced Transactions', description: 'Human-readable transaction parsing with enriched metadata and type classification.', url: 'https://docs.helius.dev/solana-apis/enhanced-transactions-api' },
      { title: 'Priority Fee API', description: 'Estimate optimal priority fees for transaction landing.', url: 'https://docs.helius.dev/solana-apis/priority-fee-api' },
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
      { title: 'Swap API', description: 'Get the best swap routes across all Solana DEXs with a single API call.', url: 'https://station.jup.ag/docs/apis/swap-api' },
      { title: 'Limit Orders', description: 'Place on-chain limit orders with automatic execution when price targets are met.', url: 'https://station.jup.ag/docs/limit-order' },
      { title: 'DCA (Dollar Cost Average)', description: 'Automate periodic token purchases at regular intervals.', url: 'https://station.jup.ag/docs/dca' },
      { title: 'Perpetuals', description: 'Leverage trading on Solana with up to 100x leverage on major pairs.', url: 'https://station.jup.ag/docs/perpetual-exchange' },
      { title: 'Payments API', description: 'Accept any SPL token and receive your preferred output token.', url: 'https://station.jup.ag/docs/apis/payments-api' },
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
      { title: 'Token Metadata', description: 'The standard for attaching metadata to fungible and non-fungible tokens on Solana.', url: 'https://developers.metaplex.com/token-metadata' },
      { title: 'Bubblegum (cNFTs)', description: 'Create and manage compressed NFTs at scale using state compression.', url: 'https://developers.metaplex.com/bubblegum' },
      { title: 'Candy Machine', description: 'Configurable minting program with guards for allowlists, payments, and gating.', url: 'https://developers.metaplex.com/candy-machine' },
      { title: 'Umi SDK', description: 'Modular TypeScript framework for interacting with Metaplex programs.', url: 'https://developers.metaplex.com/umi' },
      { title: 'Core', description: 'Next-generation NFT standard with plugins for royalties, freezing, and attributes.', url: 'https://developers.metaplex.com/core' },
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
      { title: 'Getting Started', description: 'Install Anchor, scaffold a project, and deploy your first program.', url: 'https://www.anchor-lang.com/docs/getting-started' },
      { title: 'Program Structure', description: 'Understand accounts, instructions, context, and error handling in Anchor.', url: 'https://www.anchor-lang.com/docs/the-program-module' },
      { title: 'IDL (Interface Definition)', description: 'Auto-generated interface definitions for client-side program interaction.', url: 'https://www.anchor-lang.com/docs/idl' },
      { title: 'Testing', description: 'Write TypeScript integration tests using Anchor\'s testing framework.', url: 'https://www.anchor-lang.com/docs/testing' },
      { title: 'CLI Reference', description: 'Build, deploy, verify, and manage programs from the command line.', url: 'https://www.anchor-lang.com/docs/cli' },
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
      { title: 'Connection', description: 'Establish RPC connections and query cluster state, balances, and accounts.', url: 'https://solana-labs.github.io/solana-web3.js/classes/Connection.html' },
      { title: 'Transaction', description: 'Build, sign, and send transactions with instructions and signers.', url: 'https://solana-labs.github.io/solana-web3.js/classes/Transaction.html' },
      { title: 'Keypair', description: 'Generate and manage Ed25519 keypairs for signing transactions.', url: 'https://solana-labs.github.io/solana-web3.js/classes/Keypair.html' },
      { title: 'PublicKey', description: 'Work with Solana public keys, PDAs, and address derivation.', url: 'https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html' },
      { title: 'VersionedTransaction', description: 'Build transactions with address lookup tables for more instructions per tx.', url: 'https://solana-labs.github.io/solana-web3.js/classes/VersionedTransaction.html' },
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
      { title: 'Detecting the Provider', description: 'Check if Phantom is installed and access the Solana provider object.', url: 'https://docs.phantom.app/solana/detecting-the-provider' },
      { title: 'Connecting', description: 'Request wallet connection and handle user approval.', url: 'https://docs.phantom.app/solana/connecting' },
      { title: 'Signing Transactions', description: 'Sign and send transactions, or sign messages for verification.', url: 'https://docs.phantom.app/solana/signing-a-transaction' },
      { title: 'Deeplinks', description: 'Build mobile deeplinks for connecting, signing, and sending transactions.', url: 'https://docs.phantom.app/phantom-deeplinks/deeplinks-ios-and-android' },
      { title: 'Wallet Adapter', description: 'Integrate Phantom via the Solana Wallet Adapter standard.', url: 'https://docs.phantom.app/solana/integrating-phantom' },
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
      { title: 'Liquid Staking', description: 'Stake SOL and receive mSOL — a yield-bearing liquid staking token.', url: 'https://docs.marinade.finance/marinade-protocol/liquid-staking' },
      { title: 'Native Staking', description: 'Delegate SOL to validators without a liquid token, earning direct rewards.', url: 'https://docs.marinade.finance/marinade-protocol/native-staking' },
      { title: 'SDK Integration', description: 'TypeScript SDK for programmatic staking, unstaking, and mSOL operations.', url: 'https://docs.marinade.finance/developers/sdk' },
      { title: 'Directed Stake', description: 'Direct your stake to specific validators supporting decentralization.', url: 'https://docs.marinade.finance/marinade-protocol/directed-stake' },
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
      { title: 'AMM SDK', description: 'Interact with standard constant-product AMM pools programmatically.', url: 'https://docs.raydium.io/raydium/traders/trade-api' },
      { title: 'Concentrated Liquidity (CLMM)', description: 'Provide liquidity in custom price ranges for higher capital efficiency.', url: 'https://docs.raydium.io/raydium/liquidity-providers/concentrated-liquidity' },
      { title: 'AcceleRaytor', description: 'Launchpad for new Solana projects with tiered allocation system.', url: 'https://docs.raydium.io/raydium/acceleRaytor/acceleRaytor' },
      { title: 'Pool Creation', description: 'Create new liquidity pools with configurable fees and parameters.', url: 'https://docs.raydium.io/raydium/liquidity-providers/creating-a-pool' },
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
      { title: 'Multisig SDK', description: 'Create and manage multisig vaults with configurable thresholds.', url: 'https://docs.squads.so/main/development/general' },
      { title: 'Program Manager', description: 'Manage program upgrades through multisig-controlled authority.', url: 'https://docs.squads.so/main/navigating-your-squad/program-manager' },
      { title: 'v4 Protocol', description: 'Latest Squads protocol with improved UX and batched transactions.', url: 'https://docs.squads.so/main/development/v4-overview' },
      { title: 'Treasury Management', description: 'Manage team funds, token allocations, and payment flows.', url: 'https://docs.squads.so/main/navigating-your-squad/squad-vault' },
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
      { title: 'Bundles', description: 'Submit atomic transaction bundles with guaranteed ordering and execution.', url: 'https://jito-labs.gitbook.io/mev/searcher-resources/bundles' },
      { title: 'Tip Program', description: 'Attach tips to transactions for priority inclusion by Jito validators.', url: 'https://jito-labs.gitbook.io/mev/searcher-resources/tip-program' },
      { title: 'Block Engine', description: 'Connect to the Jito block engine for submitting bundles and transactions.', url: 'https://jito-labs.gitbook.io/mev/searcher-resources/block-engine' },
      { title: 'Searcher Guide', description: 'Build MEV strategies with the Jito searcher client SDK.', url: 'https://jito-labs.gitbook.io/mev/searcher-resources/getting-started' },
    ],
  },
];
