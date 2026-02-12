import { Layout } from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Wallet, BarChart3, Image, Cpu, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const blueprints = [
  {
    slug: 'wallet',
    icon: Wallet,
    title: 'Build a Solana Wallet',
    description: 'Transaction signing, balance display, token list, and swap integration.',
    complexity: 'Medium',
    steps: 5,
  },
  {
    slug: 'defi-protocol',
    icon: BarChart3,
    title: 'Build a DeFi Protocol',
    description: 'DEX or lending protocol with liquidity pools, oracles, and governance.',
    complexity: 'Advanced',
    steps: 7,
  },
  {
    slug: 'nft-marketplace',
    icon: Image,
    title: 'Build an NFT Marketplace',
    description: 'Minting, listing, bidding, and royalty enforcement for digital assets.',
    complexity: 'Medium',
    steps: 6,
  },
  {
    slug: 'depin-node',
    icon: Cpu,
    title: 'Build a DePIN Node',
    description: 'Physical infrastructure coordination with on-chain rewards and verification.',
    complexity: 'Advanced',
    steps: 6,
  },
  {
    slug: 'dao',
    icon: Users,
    title: 'Build a DAO',
    description: 'Governance system with proposals, voting, treasury management, and delegation.',
    complexity: 'Medium',
    steps: 5,
  },
];

const complexityColor: Record<string, string> = {
  Medium: 'text-primary border-primary/30 bg-primary/10',
  Advanced: 'text-destructive border-destructive/30 bg-destructive/10',
};

export default function LibraryBlueprints() {
  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-8">
          <Link to="/library" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" /> Back to Library
          </Link>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">BLUEPRINTS</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Project Blueprints</h1>
          <p className="mt-2 text-muted-foreground">
            Interactive dependency maps showing exactly what you need to build each type of project — tools, APIs, costs, and alternatives.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((bp, i) => (
            <Link
              key={bp.slug}
              to={`/library/blueprints/${bp.slug}`}
              className="group animate-card-enter rounded-sm border border-border bg-card p-6 transition-all duration-300 card-lift"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <bp.icon className="h-6 w-6 text-primary" />
                </div>
                <span className={cn('rounded-sm border px-2 py-0.5 font-mono text-[10px]', complexityColor[bp.complexity])}>
                  {bp.complexity}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">{bp.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{bp.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{bp.steps} steps</span>
                <span className="font-mono text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">View Blueprint →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-sm border border-border bg-card/50 p-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            Click any blueprint to explore the interactive dependency tree with tools, APIs, costs, and alternatives.
          </p>
        </div>
      </section>
    </Layout>
  );
}
