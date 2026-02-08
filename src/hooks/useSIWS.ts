import { useCallback, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface SIWSResult {
  message: string;
  signature: string;
  publicKey: string;
  timestamp: string;
}

export interface UseSIWSReturn {
  signMessage: (programId: string) => Promise<SIWSResult | null>;
  isSigningMessage: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Sign In With Solana (SIWS) Hook
 * 
 * Generates and signs a structured message proving ownership of a wallet
 * for claiming a Solana program in the Resilience Registry.
 */
export function useSIWS(): UseSIWSReturn {
  const { publicKey, signMessage: walletSignMessage, connected } = useWallet();
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signMessage = useCallback(async (programId: string): Promise<SIWSResult | null> => {
    if (!connected || !publicKey || !walletSignMessage) {
      setError('Wallet not connected');
      return null;
    }

    setIsSigningMessage(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      
      // Structured SIWS message format
      const message = [
        'Resilience Registry Claim',
        '',
        `I am the owner of program: ${programId}`,
        '',
        'I authorize this wallet to claim and manage this program profile on the Resilience Registry.',
        '',
        `Wallet: ${publicKey.toBase58()}`,
        `Timestamp: ${timestamp}`,
        '',
        'This signature does not authorize any blockchain transaction.',
      ].join('\n');

      // Encode message to Uint8Array
      const messageBytes = new TextEncoder().encode(message);

      // Request signature from wallet
      const signatureBytes = await walletSignMessage(messageBytes);

      // Convert signature to base64 for storage
      const signature = Buffer.from(signatureBytes).toString('base64');

      return {
        message,
        signature,
        publicKey: publicKey.toBase58(),
        timestamp,
      };
    } catch (err) {
      console.error('SIWS signing error:', err);
      
      // Handle user rejection
      if (err instanceof Error) {
        if (err.message.includes('User rejected') || err.message.includes('rejected')) {
          setError('Signature rejected. Please approve the message to verify ownership.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to sign message');
      }
      
      return null;
    } finally {
      setIsSigningMessage(false);
    }
  }, [connected, publicKey, walletSignMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signMessage,
    isSigningMessage,
    error,
    clearError,
  };
}
