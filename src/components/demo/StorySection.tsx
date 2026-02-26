import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface StorySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function StorySection({ children, className, id }: StorySectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={cn('border-b border-border py-20 lg:py-28', className)}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </motion.section>
  );
}
