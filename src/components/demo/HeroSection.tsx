import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center border-b border-border px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Badge variant="outline" className="mb-6 font-mono text-xs uppercase tracking-widest animate-pulse">
          Solana Graveyard Hackathon
        </Badge>
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-foreground mb-4">
          Rezilience × Realms
        </h1>
        <p className="text-2xl md:text-3xl font-display uppercase tracking-wide text-primary mb-3">
          DAO Accountability Layer
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          DAOs fund projects. Rezilience tracks if they deliver.
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-8"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </motion.div>
    </section>
  );
}
