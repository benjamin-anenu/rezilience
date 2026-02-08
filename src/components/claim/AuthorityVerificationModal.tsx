import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield, 
  AlertTriangle,
  Wallet,
  KeyRound,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSIWS, type SIWSResult } from '@/hooks/useSIWS';
import { useVerifyProgramAuthority, type AuthorityVerificationResult } from '@/hooks/useVerifyProgramAuthority';

type VerificationStep = 
  | 'connect-wallet'
  | 'verifying-authority'
  | 'authority-mismatch'
  | 'sign-message'
  | 'success'
  | 'error';

interface AuthorityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: string;
  onVerificationComplete: (result: {
    authorityWallet: string;
    signature: string;
    message: string;
    authorityType: string;
  }) => void;
}

export function AuthorityVerificationModal({
  isOpen,
  onClose,
  programId,
  onVerificationComplete,
}: AuthorityVerificationModalProps) {
  const { publicKey, connected, disconnect } = useWallet();
  const { signMessage, isSigningMessage, error: siwsError, clearError: clearSiwsError } = useSIWS();
  const { 
    verifyAuthority, 
    isVerifying, 
    result: authorityResult,
    error: authorityError,
    reset: resetAuthority 
  } = useVerifyProgramAuthority();

  const [currentStep, setCurrentStep] = useState<VerificationStep>('connect-wallet');
  const [verificationData, setVerificationData] = useState<AuthorityVerificationResult | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('connect-wallet');
      setVerificationData(null);
      clearSiwsError();
      resetAuthority();
    }
  }, [isOpen, clearSiwsError, resetAuthority]);

  // Auto-advance when wallet connects
  useEffect(() => {
    if (connected && publicKey && currentStep === 'connect-wallet') {
      handleVerifyAuthority();
    }
  }, [connected, publicKey]);

  const handleVerifyAuthority = async () => {
    if (!publicKey) return;
    
    setCurrentStep('verifying-authority');
    
    const result = await verifyAuthority(programId, publicKey.toBase58());
    setVerificationData(result);
    
    if (result.isAuthority) {
      setCurrentStep('sign-message');
    } else if (result.authorityType === 'immutable') {
      setCurrentStep('error');
    } else {
      setCurrentStep('authority-mismatch');
    }
  };

  const handleSignMessage = async () => {
    const siwsResult = await signMessage(programId);
    
    if (siwsResult) {
      setCurrentStep('success');
      
      // Notify parent with verification data
      onVerificationComplete({
        authorityWallet: siwsResult.publicKey,
        signature: siwsResult.signature,
        message: siwsResult.message,
        authorityType: verificationData?.authorityType || 'direct',
      });
    }
  };

  const handleTryDifferentWallet = () => {
    disconnect();
    setCurrentStep('connect-wallet');
    setVerificationData(null);
    resetAuthority();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl uppercase tracking-tight">
            <Shield className="h-5 w-5 text-primary" />
            Authority Verification
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Prove you own this Solana program to claim your profile
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Connect Wallet */}
          {currentStep === 'connect-wallet' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold uppercase">
                  Connect Authority Wallet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect the wallet that is the upgrade authority for this program
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="font-mono text-xs text-muted-foreground">Program ID:</p>
                <p className="font-mono text-sm text-foreground break-all">{programId}</p>
              </div>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 !font-display !text-sm !uppercase !tracking-wider !rounded-md !h-11" />
              </div>
            </div>
          )}

          {/* Step 2: Verifying Authority */}
          {currentStep === 'verifying-authority' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold uppercase">
                  Verifying On-Chain Authority
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Checking if your wallet is the upgrade authority...
                </p>
              </div>
              <div className="space-y-2 rounded-md bg-muted/50 p-3 text-left">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  <span className="text-muted-foreground">Fetching program account</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-muted-foreground">Reading upgrade authority</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3a: Authority Mismatch */}
          {currentStep === 'authority-mismatch' && verificationData && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold uppercase text-destructive">
                  Authority Mismatch
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your connected wallet is not the upgrade authority
                </p>
              </div>
              <div className="space-y-3 rounded-md bg-muted/50 p-4 text-left">
                <div>
                  <p className="text-xs text-muted-foreground">Your Wallet:</p>
                  <p className="font-mono text-sm text-foreground">
                    {publicKey && truncateAddress(publicKey.toBase58())}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Required Authority:</p>
                  <p className="font-mono text-sm text-primary">
                    {verificationData.actualAuthority && truncateAddress(verificationData.actualAuthority)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-display text-xs uppercase"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTryDifferentWallet}
                  className="flex-1 font-display text-xs uppercase"
                >
                  Try Different Wallet
                </Button>
              </div>
            </div>
          )}

          {/* Step 3b: Sign Message */}
          {currentStep === 'sign-message' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold uppercase">
                  <span className="text-primary">Authority Confirmed!</span>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign a message to prove ownership and complete verification
                </p>
              </div>
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-mono">
                    {publicKey && truncateAddress(publicKey.toBase58())}
                  </span>
                  <span className="text-muted-foreground">= Authority</span>
                </div>
              </div>
              {siwsError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{siwsError}</span>
                </div>
              )}
              <Button
                onClick={handleSignMessage}
                disabled={isSigningMessage}
                className="w-full font-display text-sm uppercase tracking-wider"
                size="lg"
              >
                {isSigningMessage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Awaiting Signature...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Sign & Verify Ownership
                  </>
                )}
              </Button>
              <p className="text-[10px] text-muted-foreground">
                This signature does not authorize any blockchain transaction
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 'success' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-4 ring-primary/30">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight text-primary">
                  VERIFIED TITAN
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your authority has been cryptographically verified
                </p>
              </div>
              <div className="rounded-md border border-primary/50 bg-primary/10 p-4">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-mono text-sm text-primary">
                    {publicKey && truncateAddress(publicKey.toBase58())}
                  </span>
                </div>
              </div>
              <Button
                onClick={onClose}
                className="w-full font-display text-sm uppercase tracking-wider"
                size="lg"
              >
                Continue Registration
              </Button>
            </div>
          )}

          {/* Error State (Immutable) */}
          {currentStep === 'error' && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold uppercase text-amber-500">
                  Program Is Immutable
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This program has no upgrade authority (frozen). It cannot be verified through wallet ownership.
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-3 text-left">
                <p className="text-xs text-muted-foreground mb-2">
                  For immutable programs, please contact support with proof of ownership:
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>Deployment transaction signature</li>
                  <li>Original source code repository</li>
                  <li>Previous authority wallet proof</li>
                </ul>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full font-display text-xs uppercase"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
