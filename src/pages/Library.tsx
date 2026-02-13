import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ExperienceSelector } from '@/components/library/ExperienceSelector';
import { RoomCard } from '@/components/library/RoomCard';
import { LibrarySearchBar } from '@/components/library/LibrarySearchBar';
import { GraduationCap, BookA, Map, Search, FileText } from 'lucide-react';
import { dictionary } from '@/data/dictionary';
import { protocols } from '@/data/protocols';
import type { ExperienceLevel } from '@/data/learning-paths';

const rooms = [
  {
    to: '/library/learn',
    icon: GraduationCap,
    title: 'Guided Learning',
    description: 'Curriculum-style modules adapted to your experience level. From first program to production architecture.',
    count: '15 modules',
  },
  {
    to: '/library/dictionary',
    icon: BookA,
    title: 'Solana Dictionary',
    description: 'Every term, concept, and abbreviation in the Solana ecosystem — explained with examples.',
    count: `${dictionary.length} terms`,
  },
  {
    to: '/library/blueprints',
    icon: Map,
    title: 'Project Blueprints',
    description: 'Interactive dependency maps for building wallets, DEXs, NFT marketplaces, and more.',
    count: '5 blueprints',
  },
  {
    to: '/library/protocols',
    icon: Search,
    title: 'Protocol Search',
    description: 'Find the right protocol, understand when to use it, and integrate in minutes.',
    count: `${protocols.length} protocols`,
  },
  {
    to: '/library/docs',
    icon: FileText,
    title: 'Ecosystem Docs',
    description: 'Official documentation for the most-used Solana services — APIs, SDKs, and integration guides.',
    count: '29 services',
  },
];

export default function Library() {
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('rez-experience-level');
    if (saved) setSelectedLevel(saved as ExperienceLevel);
  }, []);

  const handleSelectLevel = (level: ExperienceLevel) => {
    setSelectedLevel(level);
    localStorage.setItem('rez-experience-level', level);
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-16 lg:px-8">
        {/* Hero */}
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">KNOWLEDGE CENTRE</p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            THE REZILIENCE LIBRARY
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            The knowledge centre for Solana builders. Whether you wrote your first program yesterday or you've shipped three protocols — start here.
          </p>
        </div>

        {/* Search */}
        <div className="mb-16 max-w-2xl">
          <LibrarySearchBar size="large" />
        </div>

        {/* Experience Selector */}
        <div className="mb-16">
          <h2 className="mb-2 font-display text-xl font-bold text-foreground">Where are you on your Solana journey?</h2>
          <p className="mb-6 text-sm text-muted-foreground">Choose your level to unlock tailored learning content.</p>
          <ExperienceSelector selected={selectedLevel} onSelect={handleSelectLevel} />
        </div>

        {/* Four Rooms */}
        <div className="mb-12">
          <h2 className="mb-6 font-display text-xl font-bold text-foreground">Explore the Library</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room, i) => (
              <RoomCard key={room.to} {...room} index={i} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
