export type ExperienceLevel = 'explorer' | 'builder' | 'architect';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  topics: string[];
  resources: { label: string; url: string }[];
  prerequisites?: string[];
}

export interface ExperienceTier {
  id: ExperienceLevel;
  label: string;
  tagline: string;
  experience: string;
  description: string;
  icon: string; // lucide icon name
  modules: LearningModule[];
}

export const experienceTiers: ExperienceTier[] = [
  {
    id: 'explorer',
    label: 'Explorer',
    tagline: "I'm new to Solana",
    experience: '0–6 months',
    description: 'Understand the fundamentals — how Solana works, what makes it different, and how to set up your first development environment.',
    icon: 'Compass',
    modules: [
      {
        id: 'what-is-solana',
        title: 'What is Solana?',
        description: 'A non-technical overview of Solana\'s architecture, consensus mechanism, and why it\'s different from Ethereum.',
        estimatedTime: '15 min',
        topics: ['Proof of History', 'Transaction throughput', 'SOL token', 'Validator network'],
        resources: [
          { label: 'Solana Docs: Introduction', url: 'https://solana.com/docs/intro/overview' },
          { label: 'Helius: What is Solana?', url: 'https://www.helius.dev/blog/what-is-solana' },
        ],
      },
      {
        id: 'accounts-model',
        title: 'The Accounts Model',
        description: 'Solana stores everything in accounts. Learn how accounts, programs, and data relate to each other.',
        estimatedTime: '30 min',
        topics: ['Account structure', 'Owner vs Authority', 'Rent & rent-exemption', 'Program accounts'],
        resources: [
          { label: 'Solana Docs: Accounts', url: 'https://solana.com/docs/core/accounts' },
          { label: 'Solana Cookbook: Accounts', url: 'https://solanacookbook.com/core-concepts/accounts.html' },
        ],
      },
      {
        id: 'transactions-101',
        title: 'Transactions 101',
        description: 'How transactions work on Solana — instructions, signers, blockhashes, and confirmation.',
        estimatedTime: '30 min',
        topics: ['Instructions', 'Signers', 'Blockhash lifetime', 'Confirmation levels'],
        resources: [
          { label: 'Solana Docs: Transactions', url: 'https://solana.com/docs/core/transactions' },
        ],
      },
      {
        id: 'setup-environment',
        title: 'Setting Up Your Environment',
        description: 'Install the Solana CLI, Anchor, and connect a wallet for development on devnet.',
        estimatedTime: '45 min',
        topics: ['Solana CLI install', 'Anchor install', 'Devnet airdrop', 'Phantom wallet setup'],
        resources: [
          { label: 'Solana Install Guide', url: 'https://solana.com/docs/intro/installation' },
          { label: 'Anchor Installation', url: 'https://www.anchor-lang.com/docs/installation' },
        ],
      },
      {
        id: 'hello-world',
        title: 'Hello World Program',
        description: 'Write, build, and deploy your first Solana program using Anchor. A counter that increments.',
        estimatedTime: '1 hour',
        topics: ['anchor init', 'Program structure', 'Build & deploy', 'Client interaction'],
        resources: [
          { label: 'Anchor: Getting Started', url: 'https://www.anchor-lang.com/docs/getting-started' },
          { label: 'Solana Playground', url: 'https://beta.solpg.io' },
        ],
      },
    ],
  },
  {
    id: 'builder',
    label: 'Builder',
    tagline: "I've shipped on Solana",
    experience: '6–24 months',
    description: 'Go deeper into Solana\'s programming model. Master advanced patterns, token standards, and cross-program composition.',
    icon: 'Hammer',
    modules: [
      {
        id: 'advanced-anchor',
        title: 'Advanced Anchor Patterns',
        description: 'Constraints, zero-copy deserialization, remaining accounts, and program-level access control patterns.',
        estimatedTime: '2 hours',
        topics: ['Custom constraints', 'Zero-copy', 'Remaining accounts', 'Access control'],
        resources: [
          { label: 'Anchor Book: Advanced', url: 'https://www.anchor-lang.com/docs' },
          { label: 'Coral Cookbook', url: 'https://github.com/coral-xyz/anchor/tree/master/examples' },
        ],
        prerequisites: ['hello-world'],
      },
      {
        id: 'cpi-patterns',
        title: 'Cross-Program Invocation (CPI)',
        description: 'Call other programs from your program — token transfers, minting, and composability patterns.',
        estimatedTime: '1.5 hours',
        topics: ['CPI basics', 'PDA signing', 'Token transfers', 'Composability'],
        resources: [
          { label: 'Solana Docs: CPI', url: 'https://solana.com/docs/core/cpi' },
        ],
        prerequisites: ['advanced-anchor'],
      },
      {
        id: 'token-extensions',
        title: 'Token Extensions (Token-2022)',
        description: 'The next-generation token standard: transfer fees, confidential transfers, permanent delegates, and transfer hooks.',
        estimatedTime: '2 hours',
        topics: ['Transfer fees', 'Confidential transfers', 'Transfer hooks', 'Interest-bearing tokens'],
        resources: [
          { label: 'SPL Token-2022 Docs', url: 'https://spl.solana.com/token-2022' },
          { label: 'Solana Docs: Extensions', url: 'https://solana.com/docs/core/tokens' },
        ],
      },
      {
        id: 'compressed-nfts',
        title: 'Compressed NFTs',
        description: 'Mint millions of NFTs for pennies using state compression and Merkle trees.',
        estimatedTime: '1.5 hours',
        topics: ['State compression', 'Merkle trees', 'Bubblegum', 'DAS API'],
        resources: [
          { label: 'Metaplex: Bubblegum', url: 'https://developers.metaplex.com/bubblegum' },
          { label: 'Helius: DAS API', url: 'https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api' },
        ],
      },
      {
        id: 'versioned-transactions',
        title: 'Versioned Transactions & ALTs',
        description: 'Handle complex transactions with Address Lookup Tables for DeFi integrations.',
        estimatedTime: '1 hour',
        topics: ['v0 transactions', 'Address Lookup Tables', 'Serialization', 'Jupiter integration'],
        resources: [
          { label: 'Solana Docs: Versioned Txs', url: 'https://solana.com/docs/core/transactions/versions' },
        ],
      },
    ],
  },
  {
    id: 'architect',
    label: 'Architect',
    tagline: "I'm designing production systems",
    experience: '2+ years',
    description: 'Production-grade patterns for security, governance, automation, and system design at scale.',
    icon: 'Building2',
    modules: [
      {
        id: 'security-auditing',
        title: 'Program Security Auditing',
        description: 'Common Solana vulnerabilities, how to audit programs, and security best practices for production.',
        estimatedTime: '3 hours',
        topics: ['Signer validation', 'Account confusion', 'Arithmetic overflow', 'Reentrancy', 'Missing owner checks'],
        resources: [
          { label: 'Neodyme: Solana Security', url: 'https://github.com/coral-xyz/sealevel-attacks' },
          { label: 'Sec3 Auto-Auditor', url: 'https://pro.sec3.dev' },
        ],
      },
      {
        id: 'clockwork-automation',
        title: 'On-Chain Automation',
        description: 'Automate recurring transactions with Clockwork — cron jobs for Solana programs.',
        estimatedTime: '1.5 hours',
        topics: ['Thread scheduling', 'Trigger types', 'Fee management', 'Use cases'],
        resources: [
          { label: 'Clockwork Docs', url: 'https://docs.clockwork.xyz' },
        ],
        prerequisites: ['cpi-patterns'],
      },
      {
        id: 'multisig-governance',
        title: 'Multi-sig Governance Patterns',
        description: 'Design governance systems with Squads multisig, program upgrade controls, and treasury management.',
        estimatedTime: '2 hours',
        topics: ['Squads Protocol', 'Upgrade authority management', 'Treasury operations', 'Time-locks'],
        resources: [
          { label: 'Squads Docs', url: 'https://docs.squads.so' },
          { label: 'SPL Governance', url: 'https://github.com/solana-labs/solana-program-library/tree/master/governance' },
        ],
      },
      {
        id: 'custom-oracles',
        title: 'Custom Oracle Integration',
        description: 'Build beyond Pyth — design custom oracle patterns for specialized data feeds and cross-program price consumption.',
        estimatedTime: '2 hours',
        topics: ['Pyth advanced usage', 'Switchboard', 'Custom oracle design', 'Staleness protection'],
        resources: [
          { label: 'Pyth Docs', url: 'https://docs.pyth.network' },
          { label: 'Switchboard Docs', url: 'https://docs.switchboard.xyz' },
        ],
      },
      {
        id: 'zk-compression',
        title: 'ZK Compression',
        description: 'Leverage zero-knowledge proofs for scalable state management and privacy-preserving applications on Solana.',
        estimatedTime: '2.5 hours',
        topics: ['ZK fundamentals', 'Light Protocol', 'Compressed accounts', 'Privacy patterns'],
        resources: [
          { label: 'Light Protocol', url: 'https://www.lightprotocol.com' },
          { label: 'ZK Compression Docs', url: 'https://www.zkcompression.com' },
        ],
      },
    ],
  },
];
