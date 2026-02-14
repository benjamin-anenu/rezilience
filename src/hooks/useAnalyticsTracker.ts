import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID per browser session (no PII)
function getSessionId(): string {
  let id = sessionStorage.getItem('rez_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('rez_session_id', id);
  }
  return id;
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

interface AnalyticsEvent {
  event_type: string;
  event_target: string;
  event_metadata?: Record<string, string | number | boolean | null>;
  session_id: string;
  device_type: string;
}

const BATCH_INTERVAL = 10_000; // 10 seconds
const MAX_BATCH_SIZE = 50;

export function useAnalyticsTracker() {
  const location = useLocation();
  const bufferRef = useRef<AnalyticsEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const sessionId = useRef(getSessionId());

  const flush = useCallback(async () => {
    if (bufferRef.current.length === 0) return;
    const batch = bufferRef.current.splice(0, MAX_BATCH_SIZE);
    try {
      await supabase.functions.invoke('track-analytics', {
        body: { events: batch },
      });
    } catch {
      // Silent fail — analytics should never break the app
    }
  }, []);

  const trackEvent = useCallback(
    (type: string, target: string, metadata?: Record<string, string | number | boolean | null>) => {
      bufferRef.current.push({
        event_type: type,
        event_target: target,
        event_metadata: metadata || {},
        session_id: sessionId.current,
        device_type: getDeviceType(),
      });
      // Flush immediately if buffer is full
      if (bufferRef.current.length >= MAX_BATCH_SIZE) {
        flush();
      }
    },
    [flush]
  );

  // Auto-track page views on route change
  useEffect(() => {
    trackEvent('page_view', location.pathname + location.search);
  }, [location.pathname, location.search, trackEvent]);

  // Set up periodic flush + flush on unload
  useEffect(() => {
    timerRef.current = setInterval(flush, BATCH_INTERVAL);

    const handleUnload = () => {
      if (bufferRef.current.length > 0) {
        flush();
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      clearInterval(timerRef.current);
      window.removeEventListener('beforeunload', handleUnload);
      flush(); // Flush remaining on unmount
    };
  }, [flush]);

  return { trackEvent };
}
