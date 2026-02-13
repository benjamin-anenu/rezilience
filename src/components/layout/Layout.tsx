import { ReactNode, createContext, useContext } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { useAnalyticsTracker } from '@/hooks/useAnalyticsTracker';

type TrackEventFn = (type: string, target: string, metadata?: Record<string, string | number | boolean | null>) => void;

const AnalyticsContext = createContext<TrackEventFn>(() => {});

export const useTrackEvent = () => useContext(AnalyticsContext);

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  const { trackEvent } = useAnalyticsTracker();

  return (
    <AnalyticsContext.Provider value={trackEvent}>
      <div className="flex min-h-screen flex-col">
        <Navigation />
        <main className="flex-1 pt-16">{children}</main>
        {showFooter && <Footer />}
      </div>
    </AnalyticsContext.Provider>
  );
}