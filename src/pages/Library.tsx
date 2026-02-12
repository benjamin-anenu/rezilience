import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LibraryHero, ProtocolCard, CategoryGrid } from '@/components/library';
import { protocols, getRecentlyUpdated, getProtocolsByCategory } from '@/data/protocols';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const learningPaths = [
  { title: 'Your First Solana Program', description: 'Set up Anchor, write a counter program, deploy to devnet.', slugs: ['anchor', 'solana-web3js'] },
  { title: 'Token Swap Integration', description: 'Add token swaps to your dApp with Jupiter aggregator.', slugs: ['jupiter', 'solana-web3js'] },
  { title: 'NFT Minting', description: 'Create an NFT collection with Metaplex and Candy Machine.', slugs: ['metaplex', 'solana-web3js'] },
  { title: 'Oracle Price Feeds', description: 'Integrate real-time price data from Pyth into your protocol.', slugs: ['pyth', 'solana-web3js'] },
];

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const recentlyUpdated = useMemo(() => getRecentlyUpdated(5), []);

  const displayedProtocols = useMemo(() => {
    if (selectedCategory) return getProtocolsByCategory(selectedCategory);
    return protocols;
  }, [selectedCategory]);

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <LibraryHero />

        {/* Learning Paths */}
        <div className="mb-12">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Popular Learning Paths</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learningPaths.map((path) => (
              <Link key={path.title} to={`/library/${path.slugs[0]}`}>
                <Card className="h-full border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{path.title}</h3>
                    <p className="text-xs text-muted-foreground">{path.description}</p>
                    <span className="mt-auto flex items-center gap-1 text-xs text-primary">
                      Start <ArrowRight className="h-3 w-3" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="mb-4 font-display text-xl font-bold text-foreground">Browse by Category</h2>
          <CategoryGrid selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Protocol Grid */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              {selectedCategory ? `${selectedCategory === 'defi' ? 'DeFi' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Protocols` : 'Core Infrastructure'}
            </h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-xs text-primary hover:underline">
                Show all
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedProtocols.map((p) => (
              <ProtocolCard key={p.id} protocol={p} />
            ))}
          </div>
        </div>

        {/* Recently Updated */}
        {!selectedCategory && (
          <div>
            <h2 className="mb-4 font-display text-xl font-bold text-foreground">Recently Updated</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyUpdated.map((p) => (
                <ProtocolCard key={p.id} protocol={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
