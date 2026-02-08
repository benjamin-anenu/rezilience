import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface BytecodeVerificationResult {
  programId: string;
  verified: boolean;
  bytecodeHash: string | null;
  matchStatus: 'original' | 'fork' | 'unknown' | 'not-deployed';
  message: string;
  verifiedAt: string;
}

export function useBytecodeVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BytecodeVerificationResult | null>(null);
  const queryClient = useQueryClient();

  const verifyBytecode = async (
    programId: string,
    profileId?: string,
    githubUrl?: string
  ): Promise<BytecodeVerificationResult | null> => {
    setIsVerifying(true);
    setError(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('verify-bytecode', {
        body: { 
          program_id: programId, 
          profile_id: profileId,
          github_url: githubUrl 
        },
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to verify bytecode');
      }

      if (!data.success) {
        if (data.cached) {
          // Already verified recently, not an error
          return null;
        }
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data.data);

      // Invalidate profile queries to refresh UI with new data
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: ['claimed-profile', profileId] });
        queryClient.invalidateQueries({ queryKey: ['claimed-profile-by-program'] });
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  const reset = () => {
    setIsVerifying(false);
    setError(null);
    setResult(null);
  };

  return {
    verifyBytecode,
    isVerifying,
    error,
    result,
    reset,
  };
}

/**
 * Get display info for bytecode match status
 */
export function getBytecodeStatusInfo(status: string | undefined | null) {
  switch (status) {
    case 'original':
      return {
        label: 'Verified Original',
        description: 'On-chain bytecode matches verified source code',
        value: 100,
        isPositive: true,
        isWarning: false,
        isNA: false,
      };
    case 'fork':
      return {
        label: 'Known Fork',
        description: 'Bytecode matches a different verified repository',
        value: 30,
        isPositive: false,
        isWarning: true,
        isNA: false,
      };
    case 'not-deployed':
      return {
        label: 'Not On-Chain',
        description: 'Program not found on Solana mainnet',
        value: 0,
        isPositive: false,
        isWarning: false,
        isNA: true,
      };
    case 'unknown':
    default:
      return {
        label: 'Unverified',
        description: 'Program exists but not in verified builds registry',
        value: 50,
        isPositive: false,
        isWarning: false,
        isNA: false,
      };
  }
}
