import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BlacklistCheckResult {
  isBlacklisted: boolean;
  attemptCount: number;
  isPermanentBan: boolean;
  message?: string;
}

interface RecordAttemptResult {
  success: boolean;
  attemptCount: number;
  isPermanentBan: boolean;
  message?: string;
}

export function useClaimBlacklist() {
  const [isChecking, setIsChecking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBlacklist = async (
    profileId: string,
    walletAddress: string
  ): Promise<BlacklistCheckResult> => {
    setIsChecking(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-claim-blacklist', {
        body: { profile_id: profileId, wallet_address: walletAddress },
      });

      if (fnError) throw fnError;

      return data as BlacklistCheckResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check blacklist';
      setError(message);
      return {
        isBlacklisted: false,
        attemptCount: 0,
        isPermanentBan: false,
        message,
      };
    } finally {
      setIsChecking(false);
    }
  };

  const recordFailedAttempt = async (
    profileId: string,
    walletAddress: string
  ): Promise<RecordAttemptResult> => {
    setIsRecording(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('record-claim-attempt', {
        body: { profile_id: profileId, wallet_address: walletAddress },
      });

      if (fnError) throw fnError;

      return data as RecordAttemptResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to record attempt';
      setError(message);
      return {
        success: false,
        attemptCount: 0,
        isPermanentBan: false,
        message,
      };
    } finally {
      setIsRecording(false);
    }
  };

  return {
    checkBlacklist,
    recordFailedAttempt,
    isChecking,
    isRecording,
    error,
  };
}
