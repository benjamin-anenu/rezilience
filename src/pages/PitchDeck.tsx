import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  TitleSlide,
  VisionSlide,
  ProblemSlide,
  SolutionSlide,
  HowItWorksSlide,
  TractionSlide,
  PossibilitiesSlide,
  CompetitionSlide,
  RoadmapSlide,
  FounderSlide,
  AskSlide,
} from '@/components/pitch/slides';

const SLIDES = [
  TitleSlide,
  VisionSlide,
  ProblemSlide,
  SolutionSlide,
  HowItWorksSlide,
  TractionSlide,
  PossibilitiesSlide,
  CompetitionSlide,
  RoadmapSlide,
  FounderSlide,
  AskSlide,
];

export default function PitchDeck() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);

  const go = useCallback(
    (d: number) => {
      setCurrent((prev) => {
        const next = prev + d;
        if (next < 0 || next >= SLIDES.length) return prev;
        setDirection(d);
        return next;
      });
    },
    [],
  );

  /* keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'Escape') window.history.back();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  /* auto-hide cursor */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = () => {
      setCursorHidden(false);
      clearTimeout(timer);
      timer = setTimeout(() => setCursorHidden(true), 3000);
    };
    window.addEventListener('mousemove', show);
    timer = setTimeout(() => setCursorHidden(true), 3000);
    return () => {
      window.removeEventListener('mousemove', show);
      clearTimeout(timer);
    };
  }, []);

  const SlideComponent = SLIDES[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className={`relative h-screen w-screen overflow-hidden bg-background select-none ${cursorHidden ? 'cursor-none' : ''}`}
    >
      {/* slides */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <SlideComponent />
        </motion.div>
      </AnimatePresence>

      {/* nav arrows */}
      <button
        onClick={() => go(-1)}
        className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-sm p-2 text-muted-foreground/40 hover:text-foreground transition-colors ${current === 0 ? 'invisible' : ''}`}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>
      <button
        onClick={() => go(1)}
        className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-sm p-2 text-muted-foreground/40 hover:text-foreground transition-colors ${current === SLIDES.length - 1 ? 'invisible' : ''}`}
        aria-label="Next slide"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* progress bar + dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-muted-foreground/40">
          {current + 1} / {SLIDES.length}
        </span>
      </div>

      {/* top-right progress */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-border">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${((current + 1) / SLIDES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
