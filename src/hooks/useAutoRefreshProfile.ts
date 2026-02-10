import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const BYTECODE_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Auto-refresh hook that triggers background analytics refresh
 * when profile data is stale (> 30 minutes old).
 * 
 * GitHub and Bytecode have independent staleness checks:
 * - GitHub requires githubUrl and checks github_analyzed_at
 * - Bytecode requires programId and checks bytecode_verified_at
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
    hasTriggeredRef.current = false;
  }, [profileId]);

  useEffect(() => {
    if (!profileId || hasTriggeredRef.current) return;

    // Independent staleness checks
    const githubStale = githubUrl && (!lastAnalyzedAt || 
      (Date.now() - new Date(lastAnalyzedAt).getTime()) > STALE_THRESHOLD_MS);

    const bytecodeStale = programId && (!bytecodeVerifiedAt ||
      (Date.now() - new Date(bytecodeVerifiedAt).getTime()) > BYTECODE_STALE_THRESHOLD_MS);

    // Nothing to refresh
    if (!githubStale && !bytecodeStale) return;

    hasTriggeredRef.current = true;
    setIsRefreshing(true);

    console.log(`[AutoRefresh] Triggering background refresh for profile ${profileId} (github: ${!!githubStale}, bytecode: ${!!bytecodeStale})`);

    const refreshPromises: Promise<void>[] = [];

    // GitHub analysis (only if githubUrl present and stale)
    if (githubStale) {
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
    }

    // Bytecode verification (independent of GitHub - only needs programId)
    if (bytecodeStale) {
      refreshPromises.push(
        supabase.functions
          .invoke('verify-bytecode', {
            body: { program_id: programId, profile_id: profileId, github_url: githubUrl || null },
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
      queryClient.invalidateQueries({ queryKey: ['claimed-profile', profileId] });
      queryClient.invalidateQueries({ queryKey: ['claimed-profile-by-program'] });
      queryClient.invalidateQueries({ queryKey: ['claimed-profile-by-project-id'] });
      setIsRefreshing(false);
    });
  }, [profileId, githubUrl, lastAnalyzedAt, programId, bytecodeVerifiedAt, queryClient]);

  return { isRefreshing };
}
