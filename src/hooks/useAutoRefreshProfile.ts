import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Auto-refresh hook that triggers background analytics refresh
 * when profile data is stale (> 30 minutes old).
 * 
 * This eliminates the need for manual refresh buttons - data stays
 * fresh automatically whenever a profile is viewed.
 */
export function useAutoRefreshProfile(
  profileId: string | undefined,
  githubUrl: string | undefined,
  lastAnalyzedAt: string | undefined,
  programId?: string | undefined,
  bytecodeVerifiedAt?: string | undefined
) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Reset trigger flag when profile changes
    hasTriggeredRef.current = false;
  }, [profileId]);

  useEffect(() => {
    // Skip if missing required data or already triggered for this profile
    if (!profileId || !githubUrl || hasTriggeredRef.current) return;

    // Check if data is stale
    const isStale = !lastAnalyzedAt || 
      (Date.now() - new Date(lastAnalyzedAt).getTime()) > STALE_THRESHOLD_MS;

    if (!isStale) return;

    // Mark as triggered to prevent duplicate calls
    hasTriggeredRef.current = true;
    setIsRefreshing(true);

    console.log(`[AutoRefresh] Triggering background refresh for profile ${profileId}`);

    // Non-blocking background refresh (GitHub + Bytecode in parallel)
    const refreshPromises: Promise<void>[] = [];

    // GitHub analysis
    refreshPromises.push(
      supabase.functions
        .invoke('analyze-github-repo', {
          body: { github_url: githubUrl, profile_id: profileId },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('[AutoRefresh] GitHub failed:', error);
            return;
          }
          if (data?.success) {
            console.log(`[AutoRefresh] GitHub complete. Score: ${data.data?.resilienceScore}`);
          }
        })
    );

    // Bytecode verification (if program_id available and not recently verified)
    const bytecodeStale = !bytecodeVerifiedAt ||
      (Date.now() - new Date(bytecodeVerifiedAt).getTime()) > 24 * 60 * 60 * 1000; // 24h
    
    if (programId && bytecodeStale) {
      refreshPromises.push(
        supabase.functions
          .invoke('verify-bytecode', {
            body: { program_id: programId, profile_id: profileId, github_url: githubUrl },
          })
          .then(({ data, error }) => {
            if (error) {
              console.error('[AutoRefresh] Bytecode failed:', error);
              return;
            }
            if (data?.success && !data?.cached) {
              console.log(`[AutoRefresh] Bytecode verified: ${data.data?.matchStatus}`);
            }
          })
      );
    }

    Promise.allSettled(refreshPromises).then(() => {
      // Invalidate queries to refresh UI with new data
      queryClient.invalidateQueries({ queryKey: ['claimed-profile', profileId] });
      queryClient.invalidateQueries({ queryKey: ['claimed-profile-by-program'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-profile-by-project-id'] });
      setIsRefreshing(false);
    });
  }, [profileId, githubUrl, lastAnalyzedAt, programId, bytecodeVerifiedAt, queryClient]);

  return { isRefreshing };
}
