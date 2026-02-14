import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export type BytecodeConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'SUSPICIOUS' | 'NOT_DEPLOYED';

export interface BytecodeVerificationResult {
  programId: string;
  verified: boolean;
  bytecodeHash: string | null;
  onChainHash: string | null;
  matchStatus: 'original' | 'fork' | 'unknown' | 'not-deployed';
  confidence: BytecodeConfidence;
  deploySlot: number | null;
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
          return null;
        }
        throw new Error(data.error || 'Verification failed');
      }

      setResult(data.data);

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
 * Get display info for bytecode match status, incorporating confidence tiers.
 */
export function getBytecodeStatusInfo(
  status: string | undefined | null,
  confidence?: string | null,
  hasProgramId?: boolean
) {
  // Off-chain projects with no program ID
  if (hasProgramId === false && (!status || status === 'unknown')) {
    return {
      label: 'N/A — Off-chain',
      description: 'No on-chain program registered. This project is off-chain.',
      value: 0,
      isPositive: false,
      isWarning: false,
      isNA: true,
      isUnverified: false,
      isOffChain: true,
      confidence: 'NOT_DEPLOYED' as BytecodeConfidence,
    };
  }
  const tier = confidence as BytecodeConfidence | undefined;

  switch (status) {
    case 'original':
      return {
        label: tier === 'HIGH' ? 'Verified Original (High Confidence)' 
             : tier === 'MEDIUM' ? 'Verified Original (Medium Confidence)'
             : 'Verified Original',
        description: tier === 'HIGH' 
          ? 'On-chain bytecode independently cross-verified against OtterSec registry'
          : tier === 'MEDIUM'
          ? 'Verified by OtterSec, independent hash check unavailable'
          : 'On-chain bytecode matches verified source code',
        value: tier === 'HIGH' ? 100 : tier === 'MEDIUM' ? 85 : 100,
        isPositive: true,
        isWarning: false,
        isNA: false,
        confidence: tier || 'MEDIUM',
      };
    case 'fork':
      return {
        label: 'Known Fork',
        description: 'Bytecode matches a different verified repository',
        value: 30,
        isPositive: false,
        isWarning: true,
        isNA: false,
        confidence: tier || 'LOW',
      };
    case 'not-deployed':
      return {
        label: 'Not On-Chain',
        description: 'Program not found on Solana mainnet',
        value: 0,
        isPositive: false,
        isWarning: false,
        isNA: true,
        confidence: 'NOT_DEPLOYED' as BytecodeConfidence,
      };
    case 'unknown':
    default: {
      const isSuspicious = tier === 'SUSPICIOUS';
      return {
        label: isSuspicious ? '⚠ Suspicious' : 'Unverified',
        description: isSuspicious
          ? 'Hash mismatch detected between independent verification and registry'
          : 'Program deployed but not yet in verified builds registry',
        value: isSuspicious ? 10 : 50,
        isPositive: false,
        isWarning: isSuspicious,
        isNA: false,
        isUnverified: !isSuspicious,
        confidence: tier || 'LOW',
      };
    }
  }
}
