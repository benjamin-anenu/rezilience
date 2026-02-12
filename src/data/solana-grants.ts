export type ProviderId = 'solana' | 'superteam' | 'colosseum' | 'jupiter' | 'marinade';

export interface SolanaGrant {
  name: string;
  provider: string;
  providerId: ProviderId;
  fundingRange: string;
  status: 'Open' | 'Rolling' | 'Seasonal';
  focusAreas: string[];
  eligibility: string;
  description: string;
  applyUrl: string;
  learnMoreUrl: string;
  criteriaHighlights: string[];
}

export const lastUpdated = '2025-02-10';

export const solanaGrants: SolanaGrant[] = [
  {
    name: 'Solana Foundation Grants',
    provider: 'Solana Foundation',
    providerId: 'solana',
    fundingRange: '$5K – $250K+',
    status: 'Rolling',
    focusAreas: ['Infrastructure', 'Developer Tooling', 'Public Goods', 'DeFi', 'Education'],
    eligibility: 'Open to teams and individuals building on Solana. Open-source projects strongly preferred.',
    description:
      'The Solana Foundation funds projects that advance the Solana network and ecosystem. Grants cover infrastructure, tooling, research, education, and community initiatives. Over 500 projects funded across 6 continents.',
    applyUrl: 'https://solana.org/grants-funding',
    learnMoreUrl: 'https://solana.org/grants-funding',
    criteriaHighlights: [
      'Open-source code (strongly preferred)',
      'Clear problem statement with defined target users',
      'Technical feasibility and realistic milestones',
      'Team credibility and relevant track record',
      'Alignment with Solana ecosystem needs',
      'Milestone-based delivery plan',
    ],
  },
  {
    name: 'Solana Foundation RFPs',
    provider: 'Solana Foundation',
    providerId: 'solana',
    fundingRange: 'Varies by RFP',
    status: 'Rolling',
    focusAreas: ['Infrastructure', 'Security', 'Core Protocol', 'Tooling'],
    eligibility: 'Teams with deep technical expertise in the specific RFP domain.',
    description:
      'Specific bounties and requests for proposals published by the Solana Foundation for targeted ecosystem needs. RFPs address critical gaps in infrastructure, security tooling, and protocol improvements.',
    applyUrl: 'https://solana.org/grants-funding',
    learnMoreUrl: 'https://solana.org/grants-funding',
    criteriaHighlights: [
      'Direct response to a published RFP specification',
      'Demonstrated expertise in the RFP domain',
      'Detailed implementation timeline',
      'Prior contributions to Solana or comparable ecosystems',
    ],
  },
  {
    name: 'Superteam Instagrants',
    provider: 'Superteam',
    providerId: 'superteam',
    fundingRange: '$500 – $5K',
    status: 'Rolling',
    focusAreas: ['Community', 'Content', 'Developer Tooling', 'Education', 'Regional Growth'],
    eligibility: 'Open to individuals and small teams globally. Regional Superteam chapters may have local focus areas.',
    description:
      'Fast micro-grants from Superteam\'s global network of regional chapters. Ideal for content creators, community builders, and developers working on smaller-scope ecosystem contributions.',
    applyUrl: 'https://superteam.fun/',
    learnMoreUrl: 'https://superteam.fun/',
    criteriaHighlights: [
      'Clear, achievable deliverable within a short timeframe',
      'Ecosystem value (content, tooling, or community)',
      'Active engagement with a regional Superteam chapter',
      'Existing portfolio or track record of contributions',
    ],
  },
  {
    name: 'Colosseum Hackathons & Accelerator',
    provider: 'Colosseum',
    providerId: 'colosseum',
    fundingRange: 'Up to $250K (accelerator pre-seed)',
    status: 'Seasonal',
    focusAreas: ['DeFi', 'Infrastructure', 'Consumer', 'DePIN', 'AI', 'Gaming'],
    eligibility: 'Open to all builders. Hackathon winners are considered for the accelerator program.',
    description:
      'Colosseum runs major online hackathons (Radar, Breakpoint) that funnel winning teams into a pre-seed accelerator. Accepted teams receive $250K in funding, mentorship, and access to an elite founder network.',
    applyUrl: 'https://www.colosseum.org/',
    learnMoreUrl: 'https://blog.colosseum.org/announcing-colosseum-eternal-and-solanas-2025-hackathon-schedule/',
    criteriaHighlights: [
      'Working prototype submitted during hackathon',
      'Novel approach to a real problem',
      'Strong founding team composition',
      'Viable go-to-market strategy',
      'Willingness to participate in accelerator program',
    ],
  },
  {
    name: 'Marinade Ecosystem Grants',
    provider: 'Marinade Finance',
    providerId: 'marinade',
    fundingRange: '$5K – $50K',
    status: 'Rolling',
    focusAreas: ['Liquid Staking', 'DeFi', 'Validator Tooling', 'Governance'],
    eligibility: 'Projects that integrate with or build on top of Marinade\'s liquid staking infrastructure.',
    description:
      'Marinade funds projects that expand the utility of mSOL and liquid staking across the Solana ecosystem. Focus areas include DeFi integrations, validator tooling, and governance improvements.',
    applyUrl: 'https://marinade.finance/',
    learnMoreUrl: 'https://marinade.finance/',
    criteriaHighlights: [
      'Direct integration with Marinade / mSOL',
      'Measurable impact on liquid staking adoption',
      'Open-source commitment',
      'Clear integration timeline and milestones',
    ],
  },
  {
    name: 'Jupiter Ecosystem Grants',
    provider: 'Jupiter',
    providerId: 'jupiter',
    fundingRange: '$5K – $100K',
    status: 'Rolling',
    focusAreas: ['DeFi', 'Aggregation', 'Developer Tooling', 'Trading Infrastructure'],
    eligibility: 'Teams building tools, integrations, or products that enhance the Jupiter ecosystem.',
    description:
      'Jupiter supports projects that extend its aggregation and trading infrastructure. Grants target developer tooling, new integrations, analytics, and community-driven initiatives within the Jupiter ecosystem.',
    applyUrl: 'https://www.jup.ag/',
    learnMoreUrl: 'https://www.jup.ag/',
    criteriaHighlights: [
      'Integration with Jupiter\'s APIs or smart contracts',
      'Enhancement of trading / swap user experience',
      'Community benefit and open-source approach',
      'Technical depth and team capability',
    ],
  },
  {
    name: 'Solana Microgrants (via Merge Club)',
    provider: 'Merge Club / Solana',
    providerId: 'solana',
    fundingRange: '$2K – $10K',
    status: 'Rolling',
    focusAreas: ['Public Goods', 'Developer Tooling', 'Education', 'Community'],
    eligibility: 'Open to companies and individuals building on Solana.',
    description:
      'Smaller, faster grants for focused contributions to the Solana ecosystem. Distributed through Merge Club\'s platform with a streamlined application process.',
    applyUrl: 'https://merge.club/program/solana',
    learnMoreUrl: 'https://merge.club/program/solana',
    criteriaHighlights: [
      'Focused, well-scoped deliverable',
      'Clear ecosystem benefit',
      'Realistic timeline (typically weeks, not months)',
      'Prior work or portfolio demonstrating capability',
    ],
  },
];

export const criteriaGuidance = [
  {
    title: 'Open Source Commitment',
    content:
      'Most Solana grant providers strongly prefer or require open-source code. This demonstrates transparency, enables community review, and ensures the broader ecosystem benefits from funded work. Use permissive licenses (MIT, Apache 2.0) when possible.',
  },
  {
    title: 'Clear Problem Statement & Target Users',
    content:
      'Define exactly what problem you\'re solving and for whom. Grant reviewers look for specific, measurable impact — not vague promises. Quantify the problem where possible: "X thousand developers lack Y tooling" is stronger than "developers need better tools."',
  },
  {
    title: 'Team Credibility & Track Record',
    content:
      'Demonstrable experience matters. Link to previous projects, GitHub profiles, and relevant contributions. Teams with prior Solana experience or open-source track records have a significant advantage. If you\'re new, start with smaller grants or hackathons.',
  },
  {
    title: 'Technical Feasibility',
    content:
      'Provide a realistic architecture plan and tech stack. Show you understand the constraints of building on Solana (transaction size limits, compute units, RPC considerations). A working prototype or proof of concept dramatically increases your chances.',
  },
  {
    title: 'Ecosystem Alignment',
    content:
      'Your project should fill a clear gap in the Solana ecosystem. Research what already exists — reviewers will. Explain how your project complements (not duplicates) existing tools. Reference the Solana Foundation\'s published priorities when applicable.',
  },
  {
    title: 'Milestone-Based Delivery',
    content:
      'Break your project into concrete, measurable milestones with realistic timelines. Grant providers release funding against milestone completion. Typical structures: 3-5 milestones over 3-6 months. Each milestone should have verifiable deliverables.',
  },
];
