import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProgramRecord {
  name: string;
  category: string;
  description: string;
  program_id?: string;
  github_url?: string;
  website?: string;
  contributors_approx?: number;
  active_2025?: boolean;
  x_handle?: string;
  location?: string;
  hackathon?: string;
  prize?: string;
  notable?: string;
  Source?: string;
  discovery_source?: string;
}

// ─── Embedded Colosseum Data ─────────────────────────────────────────────────

interface CohortData {
  hackathon?: string;
  startups?: ProgramRecord[];
  projects?: ProgramRecord[];
}

const COLOSSEUM_COHORT_MAP: Record<string, string> = {
  accelerator_cohort_1_renaissance: "Colosseum Accelerator: Renaissance (May 2024)",
  accelerator_cohort_2_radar: "Colosseum Accelerator: Radar (Nov 2024)",
  accelerator_cohort_3_breakout: "Colosseum Accelerator: Breakout (Jul 2025)",
  accelerator_cohort_4_cypherpunk: "Colosseum Accelerator: Cypherpunk (Dec 2025)",
};

function getColosseumSource(cohortKey: string, hackathon?: string, prize?: string): string {
  if (COLOSSEUM_COHORT_MAP[cohortKey]) return COLOSSEUM_COHORT_MAP[cohortKey];
  if (hackathon) {
    return `Colosseum ${hackathon}${prize ? ` - ${prize}` : ""}`;
  }
  return "Colosseum Hackathon";
}

const COLOSSEUM_DATA: Record<string, CohortData> = {
  accelerator_cohort_1_renaissance: {
    startups: [
      { name: "Ore", category: "Mining/PoW", description: "A cryptocurrency everyone can mine using a novel proof-of-work algorithm on Solana.", program_id: "oreV2ZymfTBGPp1S7ey9CpTBpMnZMfo78eSEX6UCwvf", github_url: "https://github.com/regolith-labs/ore", website: "https://ore.supply", contributors_approx: 15, x_handle: "@OreSupply", location: "USA" },
      { name: "Urani", category: "DeFi/DEX", description: "Intent-based swap aggregator bringing protection against toxic MEV at the application layer.", program_id: "TBD", github_url: "https://github.com/urani-labs", website: "https://urani.trade", contributors_approx: 5, x_handle: "@uaboricux", location: "USA" },
      { name: "DBunker", category: "DePIN/DeFi", description: "An open network for DePIN financial derivatives and supply-side aggregation.", program_id: "TBD", github_url: "private", website: "https://dbunker.io", contributors_approx: 4, x_handle: "@dbaboricux", location: "USA" },
      { name: "DeCharge", category: "DePIN/Energy", description: "An EV charging network integrated with Solana, offering globally compatible hardware for affordable access.", program_id: "TBD", github_url: "private", website: "https://decharge.network", contributors_approx: 6, x_handle: "@DeChargeNetwork", location: "India" },
      { name: "Torque", category: "Infrastructure/Growth", description: "A protocol for builders and dApps to deploy user acquisition strategies natively onchain.", program_id: "TBD", github_url: "https://github.com/torque-labs", website: "https://torque.so", contributors_approx: 5, x_handle: "@TorqueFi", location: "USA" },
      { name: "BlockMesh", category: "DePIN/Network", description: "A Solana-based DePIN project for decentralized network infrastructure.", program_id: "TBD", github_url: "https://github.com/block-mesh", website: "https://blockmesh.xyz", contributors_approx: 4, x_handle: "@blocaboricux", location: "Israel" },
    ],
  },
  accelerator_cohort_2_radar: {
    startups: [
      { name: "GreenKWh", category: "DePIN/Energy", description: "An off-grid DePIN network for promoting decentralized renewable energy while load balancing the grid during peak usage.", program_id: "TBD", github_url: "private", website: "https://greenkwh.io", contributors_approx: 5, x_handle: "@GreenKWh", location: "India" },
      { name: "AlphaFC", category: "Consumer/Sports", description: "Gives football fans real stake in their favorite clubs through tokens for participating in key decisions like scouting, trades, and team management.", program_id: "TBD", github_url: "private", website: "https://alphafc.xyz", contributors_approx: 4, x_handle: "@alphafcxyz", location: "USA" },
      { name: "Darklake", category: "DeFi/Privacy", description: "Bringing Wall Street efficiency to DeFi with lightning-fast, private, and MEV-resistant trades leveraging privacy-preserving execution powered by ZKPs.", program_id: "TBD", github_url: "private", website: "https://darklake.fi", contributors_approx: 4, x_handle: "@darklakefi", location: "Poland" },
      { name: "Supersize", category: "Gaming/Onchain", description: "An io-style game enabling players to experience real-time, fully on-chain, high stakes multiplayer gaming.", program_id: "TBD", github_url: "https://github.com/supersize-gg", website: "https://supersize.gg", contributors_approx: 4, x_handle: "@supersizegg", location: "USA" },
      { name: "Tokamai", category: "Infrastructure/Monitoring", description: "Catches development errors before your users do through real-time monitoring and alerting for Solana programs.", program_id: "TBD", github_url: "private", website: "https://tokamai.dev", contributors_approx: 3, x_handle: "@gotokamai", location: "France" },
      { name: "Txtx", category: "Infrastructure/DevTools", description: "Takes away the stress and complexity of onchain infrastructure management with secure, robust, and reproducible blocks of code called Runbooks.", program_id: "TBD", github_url: "https://github.com/txtx", website: "https://txtx.run", contributors_approx: 4, x_handle: "@txtxrun", location: "USA" },
      { name: "The Arena", category: "Gaming/SocialFi", description: "A fast-paced PVP trading game that leverages decentralized exchanges and novel socialfi mechanics.", program_id: "TBD", github_url: "private", website: "https://thearena.fun", contributors_approx: 3, x_handle: "@thearenadotfun", location: "Germany" },
      { name: "Reflect Protocol", category: "DeFi/Stablecoin", description: "A DeFi protocol that powers a novel hedge-backed, delta-neutral stablecoin on Solana.", program_id: "TBD", github_url: "private", website: "https://reflect.cx", contributors_approx: 5, x_handle: "@reflectcx", location: "United Kingdom" },
      { name: "Hylo", category: "DeFi/Stablecoin", description: "A yield-bearing DeFi protocol that enables an autonomous, dual-token stablecoin system backed by Solana LSTs.", program_id: "TBD", github_url: "private", website: "https://hylo.so", contributors_approx: 4, x_handle: "@hylo_so", location: "USA" },
      { name: "Trenches.top", category: "Consumer/SocialFi", description: "A platform to tokenize the reputation of alpha callers on Solana, unlocking new forms of competition and social speculation.", program_id: "TBD", github_url: "private", website: "https://trenches.top", contributors_approx: 3, x_handle: "@trenchestop", location: "France" },
      { name: "AdX", category: "Infrastructure/Advertising", description: "A next generation decentralized ad exchange and network, built to enable realtime encrypted blind auction bidding to serve targeted digital ads.", program_id: "TBD", github_url: "private", website: "https://adx.so", contributors_approx: 4, x_handle: "@adxso_", location: "Ireland" },
      { name: "Watt Protocol", category: "DeFi/Yield", description: "A volatility farming protocol that uses natural market arbitrage to generate real yield for users and foster liquidity.", program_id: "TBD", github_url: "private", website: "https://watt.finance", contributors_approx: 3, x_handle: "@wattprotocol", location: "Germany" },
      { name: "Pregame", category: "Consumer/Sports Betting", description: "A p2p sports wagering app that lets users bet against anyone online in a trustless manner.", program_id: "TBD", github_url: "private", website: "https://pregame.gg", contributors_approx: 4, x_handle: "@pregame_hq", location: "USA" },
    ],
  },
  accelerator_cohort_3_breakout: {
    startups: [
      { name: "TapeDrive", category: "Infrastructure/Storage", description: "Decentralized object storage native to Solana. 1,400x cheaper than on-chain accounts.", program_id: "TBD", github_url: "https://github.com/spool-labs/tape", website: "https://tapedrive.io", contributors_approx: 5, x_handle: "@tapedrive_io", location: "Canada" },
      { name: "CargoBill", category: "Stablecoins/Payments", description: "A stablecoin payments platform for enabling fast, low-cost payments for supply chain operations.", program_id: "TBD", github_url: "private", website: "https://cargobill.ai", contributors_approx: 4, x_handle: "@cargobilldotai", location: "USA" },
      { name: "Crypto Fantasy League (CFL)", category: "Consumer/Gaming", description: "Fantasy sports for crypto tokens where you draft token squads and compete in PvP based on real market movements.", program_id: "TBD", github_url: "private", website: "https://cfl.fun", contributors_approx: 4, x_handle: "@cfldotfun", location: "Indonesia" },
      { name: "Decal", category: "Stablecoins/Payments", description: "A platform that enables merchants to accept crypto payments and brands to create token-based digital loyalty programs.", program_id: "TBD", github_url: "private", website: "https://usedecal.com", contributors_approx: 4, x_handle: "@useDecal", location: "USA" },
      { name: "LocalPay", category: "Stablecoins/Payments", description: "Enables millions of existing stablecoin holders and digital nomads to use their assets for day-to-day payments in emerging markets.", program_id: "TBD", github_url: "private", website: "https://localpay.asia", contributors_approx: 4, x_handle: "@LocalPayAsia", location: "Vietnam" },
      { name: "MetEngine", category: "DeFi/Liquidity", description: "A comprehensive platform to simplify and automate liquidity provision in DeFi.", program_id: "TBD", github_url: "private", website: "https://metengine.xyz", contributors_approx: 4, x_handle: "@met_engine", location: "India" },
      { name: "Slant", category: "AI/Analytics", description: "An AI data scientist for Solana, building research-grade analytics tools to support developers, investors, and researchers.", program_id: "TBD", github_url: "private", website: "https://slant.ai", contributors_approx: 3, x_handle: "@slant_ai", location: "USA" },
      { name: "Tempo", category: "DeFi/Trading", description: "An automated trading bot management platform engineered for Solana, offering ultra-fast execution and zero-slot transaction landing.", program_id: "TBD", github_url: "private", website: "https://tempo.trade", contributors_approx: 3, x_handle: "@Tempo_Trade", location: "Poland" },
      { name: "Trepa", category: "Consumer/Prediction Markets", description: "An app that provides advanced prediction market users the ability to bet more precisely on market outcomes.", program_id: "TBD", github_url: "private", website: "https://trepa.io", contributors_approx: 4, x_handle: "@trepa_io", location: "South Korea" },
      { name: "TypeX", category: "Consumer/Mobile", description: "Turns your keyboard into a powerful onchain gateway with a built-in non-custodial wallet, plus gaming and DeFi integrations.", program_id: "TBD", github_url: "private", website: "https://typexkeyboard.com", contributors_approx: 4, x_handle: "@TypeXKeyboard", location: "Hong Kong" },
    ],
  },
  accelerator_cohort_4_cypherpunk: {
    startups: [
      { name: "MCPay", category: "AI/Payments", description: "Open payment infrastructure providing Model Context Protocol tools, data sources, and specialized agent capabilities using x402.", program_id: "TBD", github_url: "private", website: "https://mcpay.tech", contributors_approx: 3, x_handle: "@mcpaytech", location: "Portugal" },
      { name: "Synthesis", category: "Consumer/Prediction Markets", description: "A high-performance prediction market aggregation trading platform.", program_id: "TBD", github_url: "private", website: "https://synthesis.trade", contributors_approx: 3, x_handle: "@SynthesisTrade", location: "USA" },
      { name: "Unruggable", category: "Infrastructure/Hardware", description: "A next generation hardware wallet and companion app built exclusively for Solana.", program_id: "TBD", github_url: "private", website: "https://unruggable.io", contributors_approx: 5, x_handle: "@unruggable_io", location: "United Kingdom" },
      { name: "Rekt", category: "Consumer/Trading", description: "A mobile app that gives everyday users access to better buying power through simple, gamified crypto trading.", program_id: "TBD", github_url: "private", website: "https://getrekt.app", contributors_approx: 4, x_handle: "@GetRektApp", location: "USA" },
      { name: "Cloak", category: "Infrastructure/Privacy", description: "Building a privacy layer for the crypto ecosystem using a ZKP system that runs at the speed of Solana.", program_id: "TBD", github_url: "private", website: "https://cloak.xyz", contributors_approx: 4, x_handle: "@cloak_xyz", location: "Brazil" },
      { name: "Credible", category: "Stablecoins/Remittance", description: "A stablecoin-powered remittance platform built for banks, fintechs, and businesses sending money in/out of India.", program_id: "TBD", github_url: "private", website: "https://credible.finance", contributors_approx: 4, x_handle: "@crediblefin", location: "India" },
      { name: "Yumi Finance", category: "DeFi/BNPL", description: "A fully onchain 'buy now, pay later' solution that handles underwriting, financing, loan origination and servicing of bad debt.", program_id: "TBD", github_url: "private", website: "https://yumi.finance", contributors_approx: 4, x_handle: "@YumiFinance", location: "South Korea" },
      { name: "Superfan", category: "Consumer/Music", description: "A meta-record label enabling rising and established artists to have a much more direct financial relationship with their fans globally.", program_id: "TBD", github_url: "private", website: "https://superfan.one", contributors_approx: 4, x_handle: "@superfan_one", location: "USA" },
      { name: "Kormos", category: "DeFi/Yield", description: "A new DeFi platform that brings higher yields without leverage to Solana utilizing a fractional reserves primitive.", program_id: "TBD", github_url: "private", website: "https://kormos.finance", contributors_approx: 3, x_handle: "@Kormos_Finance", location: "Portugal" },
      { name: "Capitola", category: "Consumer/Prediction Markets", description: "A prediction markets meta-aggregator that enables users to trade all events at the best price.", program_id: "TBD", github_url: "private", website: "https://capitola.xyz", contributors_approx: 4, x_handle: "@capitola_xyz", location: "USA" },
      { name: "Archer", category: "DeFi/DEX", description: "A new batch auction exchange primitive utilizing dual flow batch auctions for the most competitive prices for traders.", program_id: "TBD", github_url: "private", website: "https://archer.exchange", contributors_approx: 3, x_handle: "@ArcherExchange_", location: "India" },
    ],
  },
  hackathon_winners_not_in_accelerator: {
    projects: [
      { name: "Vanish", category: "DeFi/Privacy", description: "An on-chain privacy solution for Solana using zero-knowledge proofs.", program_id: "TBD", github_url: "private", website: "https://vanish.so", contributors_approx: 3, hackathon: "Breakout 2025", prize: "1st Place DeFi Track ($25K)" },
      { name: "FluxRPC", category: "Infrastructure/RPC", description: "The first RPC on Solana that fully separates from the validator layer. Pay-per-bandwidth pricing.", program_id: "N/A", github_url: "private", website: "https://fluxrpc.com", contributors_approx: 4, x_handle: "@FluxRPC", hackathon: "Breakout 2025", prize: "1st Place Infrastructure Track ($25K)" },
      { name: "Latinum", category: "AI/Payments", description: "A payment middleware that enables MCP builders to get paid for AI agent services.", program_id: "TBD", github_url: "private", website: "https://latinum.ai", contributors_approx: 3, hackathon: "Breakout 2025", prize: "1st Place AI Track ($25K)" },
      { name: "Decen Space", category: "DePIN/Space", description: "A platform that makes satellite communication cheaper and easier using decentralized infrastructure.", program_id: "TBD", github_url: "private", website: "https://decenspace.io", contributors_approx: 4, hackathon: "Breakout 2025", prize: "1st Place DePIN Track ($25K)" },
      { name: "LootGo", category: "Consumer/Mobile", description: "A mobile-first project integrating with Solana Mobile for the Seeker dApp store.", program_id: "TBD", github_url: "private", website: "https://lootgo.app", contributors_approx: 4, hackathon: "Breakout 2025", prize: "Solana Mobile Award ($25K)" },
      { name: "IDL Space", category: "Infrastructure/DevTools", description: "An open-source tool that benefits developers across the Solana ecosystem for working with program IDLs.", program_id: "N/A", github_url: "https://github.com/nicholasgasior/idlspace", website: "https://idl.space", contributors_approx: 2, hackathon: "Breakout 2025", prize: "Public Good Award ($10K)" },
      { name: "OpenSOL", category: "Infrastructure/Open Source", description: "University-led open source project for Solana development.", program_id: "N/A", github_url: "https://github.com/opensol-project", website: "https://opensol.dev", contributors_approx: 5, hackathon: "Breakout 2025", prize: "University Award ($10K)" },
      { name: "Vertigo", category: "Infrastructure/DEX", description: "A sniper-proof DEX for token launches on Solana, preventing front-running and bot exploitation.", program_id: "TBD", github_url: "private", website: "https://vertigo.trade", contributors_approx: 3, hackathon: "Breakout 2025", prize: "2nd Place Infrastructure Track" },
      { name: "Encifher", category: "DeFi/Privacy", description: "A platform that adds encrypted privacy to DeFi operations on Solana.", program_id: "TBD", github_url: "private", website: "https://encifher.io", contributors_approx: 4, hackathon: "Breakout 2025", prize: "3rd Place DeFi Track" },
      { name: "Melee Markets", category: "Consumer/Prediction Markets", description: "A viral market platform blending speculation with prediction markets.", program_id: "TBD", github_url: "private", website: "https://melee.markets", contributors_approx: 3, hackathon: "Breakout 2025", prize: "2nd Place Consumer Track" },
      { name: "Glympse", category: "Consumer/Fantasy Sports", description: "A fantasy sports app for Web2 attention, gamifying social media engagement.", program_id: "TBD", github_url: "private", website: "https://glympse.fun", contributors_approx: 3, hackathon: "Breakout 2025", prize: "4th Place Consumer Track" },
      { name: "Deks", category: "Consumer/Onboarding", description: "A platform that simplifies crypto onboarding through digital and physical gift cards.", program_id: "TBD", github_url: "private", website: "https://deks.app", contributors_approx: 3, hackathon: "Breakout 2025", prize: "5th Place Consumer Track" },
      { name: "Clipstake", category: "Consumer/Creator Economy", description: "A launchpad for content creators to raise funds by tokenizing future ad revenue.", program_id: "TBD", github_url: "private", website: "https://clipstake.io", contributors_approx: 3, hackathon: "Breakout 2025", prize: "University Award - Consumer Track" },
      { name: "Aquanode", category: "Infrastructure/Cloud", description: "A cloud compute platform aggregating decentralized providers and featuring orchestration services.", program_id: "TBD", github_url: "private", website: "https://aquanode.io", contributors_approx: 3, hackathon: "Breakout 2025", prize: "University Award - Infrastructure Track" },
      { name: "Project Plutus", category: "AI/Agents", description: "An app to deploy any AI agent on Solana with full on-chain integration.", program_id: "TBD", github_url: "private", website: "https://projectplutus.ai", contributors_approx: 3, hackathon: "Breakout 2025", prize: "2nd Place AI Track" },
      { name: "Agent Arc", category: "AI/Trading", description: "A non-custodial AI trading terminal for automated crypto trading strategies.", program_id: "TBD", github_url: "private", website: "https://agentarc.ai", contributors_approx: 3, hackathon: "Breakout 2025", prize: "3rd Place AI Track" },
      { name: "Crush", category: "DePIN/Consumer", description: "An app that turns everyday receipts into liquid micro-assets using DePIN infrastructure.", program_id: "TBD", github_url: "private", website: "https://crush.app", contributors_approx: 3, hackathon: "Breakout 2025", prize: "2nd Place DePIN Track" },
      { name: "Seer", category: "Infrastructure/DevTools", description: "A transaction debugging developer platform for Solana programs.", program_id: "N/A", github_url: "private", website: "https://seer.dev", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "1st Place Infrastructure Track ($25K)" },
      { name: "Autonom", category: "RWA/Oracle", description: "A specialized oracle for Real World Assets (RWAs) on Solana.", program_id: "TBD", github_url: "private", website: "https://autonom.xyz", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "1st Place RWA Track ($25K)" },
      { name: "attn.markets", category: "DeFi/Revenue", description: "A protocol for tokenizing revenues to bank onchain businesses.", program_id: "TBD", github_url: "private", website: "https://attn.markets", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "1st Place Undefined Track ($25K)" },
      { name: "Bore.fi", category: "RWA/Private Equity", description: "Tokenized SME private equity protocol bringing small business investment on-chain.", program_id: "TBD", github_url: "private", website: "https://bore.fi", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "2nd Place RWA Track" },
      { name: "Pencil Finance", category: "RWA/Lending", description: "A protocol bringing student loans on-chain for transparent and accessible education financing.", program_id: "TBD", github_url: "private", website: "https://pencil.finance", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "4th Place RWA Track" },
      { name: "Watchtower", category: "RWA/Space", description: "Onchain asset-backed financing for space infrastructure projects.", program_id: "TBD", github_url: "private", website: "https://watchtower.space", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "5th Place RWA Track" },
      { name: "Mercantill", category: "AI/Banking", description: "Enterprise banking infrastructure for AI agents, enabling autonomous financial operations.", program_id: "TBD", github_url: "private", website: "https://mercantill.com", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "4th Place Stablecoins Track" },
      { name: "Sp3nd", category: "Stablecoins/Commerce", description: "Platform enabling stablecoin payments for Amazon products, bridging crypto with mainstream e-commerce.", program_id: "TBD", github_url: "private", website: "https://sp3nd.com", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "5th Place Stablecoins Track" },
      { name: "Fora", category: "Consumer/Social Trading", description: "A group chat based trading platform and prediction market protocol.", program_id: "TBD", github_url: "private", website: "https://fora.app", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "3rd Place Consumer Track" },
      { name: "Corbits", category: "Infrastructure/Payments", description: "An open-source x402 endpoint dashboard for merchants to accept crypto payments.", program_id: "N/A", github_url: "https://github.com/corbits-tech", website: "https://corbits.dev", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "2nd Place Infrastructure Track" },
      { name: "Ionic", category: "Infrastructure/Data", description: "A data aggregation layer for Solana, indexing and serving on-chain data efficiently.", program_id: "N/A", github_url: "private", website: "https://ionic.network", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "3rd Place Infrastructure Track" },
      { name: "Pine Analytics", category: "Infrastructure/Analytics", description: "Data analytics infrastructure and querying platform for Solana on-chain data.", program_id: "N/A", github_url: "private", website: "https://pineanalytics.xyz", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "4th Place Infrastructure Track" },
      { name: "Echo", category: "DeSci/Funding", description: "A network for scientists to get matched with funders to better understand scientific research claims.", program_id: "TBD", github_url: "private", website: "https://echo.science", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "2nd Place Undefined Track" },
      { name: "Solana ATM", category: "Infrastructure/Physical", description: "A physical machine with a p2p cash/stablecoin liquidity pool for offline crypto access.", program_id: "TBD", github_url: "private", website: "https://solanaatm.com", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "4th Place Undefined Track" },
      { name: "Humanship ID", category: "Infrastructure/Identity", description: "A privacy-first human identity layer on Solana for sybil resistance and proof of personhood.", program_id: "TBD", github_url: "private", website: "https://humanship.id", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "5th Place Undefined Track" },
      { name: "Samui Wallet", category: "Infrastructure/Wallet", description: "An open-source wallet project benefiting developers across the Solana ecosystem.", program_id: "N/A", github_url: "https://github.com/nicholasgasior/samui-wallet", website: "https://samui.wallet", contributors_approx: 2, hackathon: "Cypherpunk 2025", prize: "Public Good Award ($10K)" },
      { name: "Pythia", category: "AI/Research", description: "AI-powered research and analysis tool, winner of the University Award.", program_id: "TBD", github_url: "private", website: "https://pythia.dev", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "University Award ($10K)" },
      { name: "Hobba", category: "DeFi/Payments", description: "A payments platform leveraging self-repaying loans for seamless transactions.", program_id: "TBD", github_url: "private", website: "https://hobba.finance", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "5th Place DeFi Track" },
      { name: "Legasi", category: "RWA/Credit", description: "A compliant credit layer using Lombard loans for on-chain lending against real assets.", program_id: "TBD", github_url: "private", website: "https://legasi.finance", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "3rd Place RWA Track" },
      { name: "Nomu", category: "Consumer/Marketplace", description: "A marketplace where you can buy products and get rewarded for being early.", program_id: "TBD", github_url: "private", website: "https://nomu.xyz", contributors_approx: 3, hackathon: "Cypherpunk 2025", prize: "5th Place Consumer Track" },
      { name: "Scrim", category: "Gaming/Esports", description: "A skill-based wagering platform for competitive gamers.", program_id: "TBD", github_url: "private", website: "https://scrim.gg", contributors_approx: 3, hackathon: "Breakout 2025", prize: "3rd Place Gaming Track" },
      { name: "Block Stranding", category: "Gaming/OMRPG", description: "The world's first survival OMRPG (Onchain Multiplayer RPG) on Solana.", program_id: "TBD", github_url: "private", website: "https://blockstranding.com", contributors_approx: 4, hackathon: "Breakout 2025", prize: "4th Place Gaming Track" },
      { name: "Lazor Kit", category: "Infrastructure/Auth", description: "Passkey-based authentication toolkit for Solana dApps. Mentioned in Colosseum Codex.", program_id: "TBD", github_url: "https://github.com/peteruche21/lazorkit", website: "https://lazorkit.dev", contributors_approx: 3, hackathon: "Breakout 2025", prize: "Honorable Mention - Infrastructure" },
      { name: "CONYR", category: "AI/Intelligence", description: "A real-time intelligence engine for Solana with AI-powered insights and analytics.", program_id: "N/A", github_url: "private", website: "https://conyr.io", contributors_approx: 3, hackathon: "Breakout 2025", prize: "5th Place Infrastructure Track" },
      { name: "Home Harvest", category: "DePIN/ReFi", description: "The world's largest ReFi community of connected growers using DePIN for sustainable agriculture.", program_id: "TBD", github_url: "private", website: "https://homeharvest.io", contributors_approx: 3, hackathon: "Breakout 2025", prize: "3rd Place DePIN Track" },
      { name: "NovenGrid", category: "DePIN/Energy", description: "DePIN for renewable power generation and storage nodes, creating a decentralized energy grid.", program_id: "TBD", github_url: "private", website: "https://novengrid.io", contributors_approx: 3, hackathon: "Breakout 2025", prize: "5th Place DePIN Track" },
    ],
  },
};

// ─── Shared Transform ────────────────────────────────────────────────────────

function transformProgram(
  program: ProgramRecord,
  defaultDiscoverySource: string,
  cohortKey?: string,
): Record<string, unknown> {
  const programId =
    program.program_id &&
    !program.program_id.includes("TBD") &&
    program.program_id !== "N/A" &&
    program.program_id !== ""
      ? program.program_id
      : null;

  const githubOrgUrl =
    program.github_url &&
    program.github_url !== "private" &&
    program.github_url !== ""
      ? program.github_url
      : null;

  const xUsername = program.x_handle
    ? program.x_handle.replace(/^@/, "")
    : null;

  // Determine discovery source: per-program overrides > cohort map > top-level default
  let discoverySource = defaultDiscoverySource;
  if (cohortKey && COLOSSEUM_COHORT_MAP[cohortKey]) {
    discoverySource = getColosseumSource(cohortKey, program.hackathon, program.prize);
  } else if (program.hackathon) {
    discoverySource = getColosseumSource("", program.hackathon, program.prize);
  } else if (program.discovery_source) {
    discoverySource = program.discovery_source;
  } else if (program.Source) {
    discoverySource = program.Source;
  }

  return {
    project_name: program.name,
    category: program.category,
    description: program.description,
    program_id: programId,
    github_org_url: githubOrgUrl,
    website_url: program.website || null,
    x_username: xUsername,
    country: program.location || null,
    github_contributors: program.contributors_approx || 0,
    discovery_source: discoverySource,
    claim_status: "unclaimed",
    verified: false,
    liveness_status: "STALE",
    resilience_score: 0,
    integrated_score: 0,
    discovered_at: new Date().toISOString(),
  };
}

// ─── Collect embedded Colosseum programs ─────────────────────────────────────

function getColosseumPrograms(): Record<string, unknown>[] {
  const profiles: Record<string, unknown>[] = [];

  const acceleratorKeys = [
    "accelerator_cohort_1_renaissance",
    "accelerator_cohort_2_radar",
    "accelerator_cohort_3_breakout",
    "accelerator_cohort_4_cypherpunk",
  ];

  for (const key of acceleratorKeys) {
    const cohort = COLOSSEUM_DATA[key];
    if (cohort?.startups) {
      for (const s of cohort.startups) {
        profiles.push(transformProgram(s, "Colosseum Hackathon", key));
      }
    }
  }

  const hw = COLOSSEUM_DATA.hackathon_winners_not_in_accelerator;
  if (hw?.projects) {
    for (const s of hw.projects) {
      profiles.push(transformProgram(s, "Colosseum Hackathon", "hackathon_winners_not_in_accelerator"));
    }
  }

  return profiles;
}

// ─── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const triggerRefresh: boolean = body.trigger_refresh !== false;
    let profiles: Record<string, unknown>[];

    if (body.source === "colosseum") {
      // ── Embedded mode: use hardcoded Colosseum data
      profiles = getColosseumPrograms();
      console.log(`[seed-registry] Embedded Colosseum mode: ${profiles.length} programs`);
    } else if (body.programs && Array.isArray(body.programs)) {
      // ── Payload mode: accept any array of programs
      const defaultSource = body.discovery_source || "Manual Seed";
      profiles = body.programs.map((p: ProgramRecord) =>
        transformProgram(p, defaultSource)
      );
      console.log(`[seed-registry] Payload mode: ${profiles.length} programs (source: ${defaultSource})`);
    } else {
      return new Response(
        JSON.stringify({
          error: 'Provide either { "source": "colosseum" } or { "programs": [...] }',
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Batch upsert on project_name
    const { data, error } = await supabase
      .from("claimed_profiles")
      .upsert(profiles, { onConflict: "project_name", ignoreDuplicates: false })
      .select("id, project_name");

    if (error) {
      console.error("[seed-registry] Upsert error:", error);
      throw error;
    }

    const seededCount = data?.length || 0;
    console.log(`[seed-registry] ✓ Seeded ${seededCount} profiles`);

    // Fire-and-forget refresh pipeline
    if (triggerRefresh) {
      const refreshUrl = `${supabaseUrl}/functions/v1/refresh-all-profiles`;
      console.log("[seed-registry] 🔄 Triggering refresh-all-profiles...");
      fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          dimensions: ["github", "dependencies", "governance", "tvl"],
          batch_size: 5,
          offset: 0,
          auto_chain: true,
        }),
      }).catch((err) => console.error("[seed-registry] Refresh trigger failed:", err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${seededCount} programs into the registry`,
        seeded: seededCount,
        trigger_refresh: triggerRefresh,
        programs: profiles.map((p) => p.project_name),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[seed-registry] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
