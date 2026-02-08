import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AuthorityType = 'direct' | 'multisig' | 'immutable' | 'none';

export interface AuthorityVerificationResult {
  isAuthority: boolean;
  authorityType: AuthorityType;
  actualAuthority: string | null;
  error?: string;
}

export interface UseVerifyProgramAuthorityReturn {
  verifyAuthority: (programId: string, walletAddress: string) => Promise<AuthorityVerificationResult>;
  isVerifying: boolean;
  result: AuthorityVerificationResult | null;
  error: string | null;
  reset: () => void;
}

/**
 * Hook to verify if a wallet is the upgrade authority of a Solana program
 */
export function useVerifyProgramAuthority(): UseVerifyProgramAuthorityReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<AuthorityVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyAuthority = useCallback(async (
    programId: string, 
    walletAddress: string
  ): Promise<AuthorityVerificationResult> => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'verify-program-authority',
        {
          body: { program_id: programId, wallet_address: walletAddress },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || 'Failed to verify authority');
      }

      const verificationResult: AuthorityVerificationResult = {
        isAuthority: data.isAuthority ?? false,
        authorityType: data.authorityType ?? 'none',
        actualAuthority: data.actualAuthority ?? null,
        error: data.error,
      };

      setResult(verificationResult);

      if (verificationResult.error) {
        setError(verificationResult.error);
      }

      return verificationResult;
    } catch (err) {
      console.error('Authority verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      
      const failedResult: AuthorityVerificationResult = {
        isAuthority: false,
        authorityType: 'none',
        actualAuthority: null,
        error: errorMessage,
      };
      setResult(failedResult);
      return failedResult;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsVerifying(false);
    setResult(null);
    setError(null);
  }, []);

  return {
    verifyAuthority,
    isVerifying,
    result,
    error,
    reset,
  };
}
