const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const protocols = [
  { objectID: 'jupiter', name: 'Jupiter', category: 'defi', tier: 1, description: 'The leading DEX aggregator on Solana.', keywords: ['swap', 'dex', 'aggregator', 'trade', 'exchange', 'amm', 'liquidity', 'token'], useCase: 'Token swaps with best execution across all Solana DEXs', difficulty: 'Easy' },
  { objectID: 'anchor', name: 'Anchor', category: 'developer-tools', tier: 1, description: 'The standard framework for building Solana programs.', keywords: ['framework', 'program', 'smart contract', 'rust', 'idl', 'testing', 'build'], useCase: 'Building and testing Solana programs with less boilerplate', difficulty: 'Medium' },
  { objectID: 'metaplex', name: 'Metaplex', category: 'nfts', tier: 1, description: 'The NFT standard on Solana.', keywords: ['nft', 'mint', 'metadata', 'candy machine', 'digital asset', 'collection', 'art'], useCase: 'Creating, minting, and managing NFTs and digital assets on Solana', difficulty: 'Medium' },
  { objectID: 'helius', name: 'Helius', category: 'infrastructure', tier: 1, description: 'Premium RPC and API infrastructure for Solana.', keywords: ['rpc', 'api', 'webhook', 'infrastructure', 'das', 'transaction', 'node'], useCase: 'Reliable RPC, enhanced transaction APIs, and webhooks for Solana apps', difficulty: 'Easy' },
  { objectID: 'pyth', name: 'Pyth Network', category: 'infrastructure', tier: 1, description: 'High-frequency oracle network delivering real-time price feeds.', keywords: ['oracle', 'price', 'feed', 'defi', 'data', 'real-time', 'pyth'], useCase: 'Real-time price feeds for DeFi protocols', difficulty: 'Medium' },
  { objectID: 'phantom', name: 'Phantom', category: 'wallets', tier: 1, description: 'The most popular Solana wallet.', keywords: ['wallet', 'connect', 'sign', 'phantom', 'adapter', 'browser', 'extension'], useCase: 'Connecting users\' wallets to your Solana dApp', difficulty: 'Easy' },
  { objectID: 'solana-web3js', name: 'Solana Web3.js', category: 'infrastructure', tier: 1, description: 'The official JavaScript SDK for interacting with the Solana blockchain.', keywords: ['sdk', 'web3', 'connection', 'transaction', 'account', 'rpc', 'solana', 'core'], useCase: 'Core SDK for all Solana blockchain interactions', difficulty: 'Easy' },
  { objectID: 'spl-token', name: 'SPL Token', category: 'infrastructure', tier: 1, description: 'The Solana Program Library token standard.', keywords: ['token', 'spl', 'mint', 'transfer', 'fungible', 'create', 'balance'], useCase: 'Creating and managing fungible tokens on Solana', difficulty: 'Medium' },
  { objectID: 'raydium', name: 'Raydium', category: 'defi', tier: 1, description: 'Leading AMM and liquidity protocol on Solana.', keywords: ['amm', 'liquidity', 'pool', 'defi', 'farm', 'swap', 'clmm', 'lp'], useCase: 'Providing and managing liquidity pools', difficulty: 'Advanced' },
  { objectID: 'marinade', name: 'Marinade Finance', category: 'defi', tier: 1, description: 'The leading liquid staking protocol on Solana.', keywords: ['staking', 'liquid', 'msol', 'yield', 'defi', 'stake', 'delegate', 'validator'], useCase: 'Liquid staking SOL to earn yield via mSOL', difficulty: 'Medium' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ALGOLIA_ADMIN_KEY = Deno.env.get('ALGOLIA_ADMIN_KEY');
    const ALGOLIA_APP_ID = Deno.env.get('ALGOLIA_APP_ID');

    if (!ALGOLIA_ADMIN_KEY || !ALGOLIA_APP_ID) {
      return new Response(
        JSON.stringify({ error: 'Missing ALGOLIA_ADMIN_KEY or ALGOLIA_APP_ID secrets.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear and replace index using Algolia REST API
    const indexUrl = `https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/protocols/batch`;

    const requests = protocols.map((p) => ({
      action: 'updateObject',
      body: {
        ...p,
        _tags: [p.category, `tier${p.tier}`, ...p.keywords],
      },
    }));

    const batchResponse = await fetch(indexUrl, {
      method: 'POST',
      headers: {
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    const batchResult = await batchResponse.json();

    // Configure index settings
    const settingsUrl = `https://${ALGOLIA_APP_ID}.algolia.net/1/indexes/protocols/settings`;
    await fetch(settingsUrl, {
      method: 'PUT',
      headers: {
        'X-Algolia-Application-Id': ALGOLIA_APP_ID,
        'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchableAttributes: ['name', 'description', 'keywords', 'useCase'],
        attributesForFaceting: ['category', 'tier', 'difficulty'],
        customRanking: ['desc(tier)', 'asc(name)'],
      }),
    });

    return new Response(
      JSON.stringify({ success: true, indexed: protocols.length, result: batchResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
