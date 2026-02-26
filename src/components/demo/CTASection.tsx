import { StorySection } from './StorySection';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <StorySection className="border-b-0 text-center">
      <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
        This Is What Accountability Looks Like
      </h2>
      <p className="text-muted-foreground max-w-lg mx-auto mb-8">
        Rezilience doesn't just track if a project is alive — it tracks if governance-funded projects actually deliver on their promises.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild className="font-display uppercase tracking-wider">
          <a href="/explorer">Explore Registry</a>
        </Button>
        <Button asChild variant="outline" className="font-display uppercase tracking-wider">
          <a href="/readme">Read the Methodology</a>
        </Button>
        <Button asChild variant="outline" className="font-display uppercase tracking-wider">
          <a href="/claim">Claim Your Project</a>
        </Button>
      </div>
    </StorySection>
  );
}
