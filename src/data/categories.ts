import { TrendingUp, Server, Image, Wrench, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  protocolCount: number;
}

export const categories: Category[] = [
  {
    id: 'defi',
    name: 'DeFi',
    description: 'Decentralized exchange, lending, and liquidity protocols.',
    icon: TrendingUp,
    protocolCount: 6,
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Core libraries, RPC providers, and developer primitives.',
    icon: Server,
    protocolCount: 6,
  },
  {
    id: 'nfts',
    name: 'NFTs',
    description: 'Minting, metadata, and digital asset standards.',
    icon: Image,
    protocolCount: 2,
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    description: 'Frameworks, testing, and build tooling for Solana programs.',
    icon: Wrench,
    protocolCount: 4,
  },
  {
    id: 'wallets',
    name: 'Wallets',
    description: 'Wallet adapters, signing, and key management.',
    icon: Wallet,
    protocolCount: 2,
  },
];
