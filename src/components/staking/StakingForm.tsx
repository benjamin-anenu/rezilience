import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Check, Search, Coins, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useProject } from '@/hooks/useProjects';

interface StakingFormProps {
  onFormChange: (data: {
    programId: string;
    programName: string;
    amount: number;
    lockupMonths: number;
    isValid: boolean;
  }) => void;
}

export function StakingForm({ onFormChange }: StakingFormProps) {
  const [searchParams] = useSearchParams();
  const initialProgramId = searchParams.get('program') || '';
  
  const { connected } = useWallet();
  const [step, setStep] = useState(1);
  const [programId, setProgramId] = useState(initialProgramId);
  const [verifiedProgram, setVerifiedProgram] = useState<{ name: string; score: number } | null>(null);
  const [amount, setAmount] = useState(100);
  const [lockupMonths, setLockupMonths] = useState(12);
  const [isVerifying, setIsVerifying] = useState(false);

  // Use the project hook for verification
  const { data: projectData, refetch } = useProject(programId);

  // Mock wallet balance
  const walletBalance = 1250.45;

  const verifyProgram = async () => {
    if (!programId.trim()) return;
    
    setIsVerifying(true);
    
    // Trigger refetch with current programId
    const result = await refetch();
    
    if (result.data) {
      setVerifiedProgram({ 
        name: result.data.program_name, 
        score: Math.round(result.data.resilience_score) 
      });
      setStep(2);
      onFormChange({
        programId: result.data.program_id,
        programName: result.data.program_name,
        amount,
        lockupMonths,
        isValid: true,
      });
    }
    
    setIsVerifying(false);
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    if (verifiedProgram) {
      onFormChange({
        programId,
        programName: verifiedProgram.name,
        amount: value,
        lockupMonths,
        isValid: true,
      });
    }
  };

  const handleLockupChange = (value: number[]) => {
    setLockupMonths(value[0]);
    if (verifiedProgram) {
      onFormChange({
        programId,
        programName: verifiedProgram.name,
        amount,
        lockupMonths: value[0],
        isValid: true,
      });
    }
  };

  const handleMaxAmount = () => {
    handleAmountChange(Math.floor(walletBalance));
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Program */}
      <Card className={cn('border-border bg-card', step >= 1 && 'border-primary/30')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display text-lg uppercase tracking-tight">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold',
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span>SELECT PROGRAM</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Program ID</Label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter or paste Solana program ID..."
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="pl-10 font-mono text-sm"
                    disabled={step > 1}
                  />
                </div>
                {step === 1 && (
                  <Button onClick={verifyProgram} disabled={!programId || isVerifying}>
                    {isVerifying ? 'VERIFYING...' : 'VERIFY'}
                  </Button>
                )}
              </div>
            </div>

            {verifiedProgram && (
              <div className="flex items-center gap-3 rounded-sm border border-primary/30 bg-primary/5 p-3">
                <Check className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{verifiedProgram.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Current Score: <span className="text-primary">{verifiedProgram.score}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Define Stake Amount */}
      <Card className={cn('border-border bg-card', step >= 2 ? 'border-primary/30' : 'opacity-50')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display text-lg uppercase tracking-tight">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold',
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span>DEFINE STAKE AMOUNT</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-xs uppercase text-muted-foreground">Amount (SOL)</Label>
                {connected && (
                  <span className="text-xs text-muted-foreground">
                    Balance: <span className="font-mono text-foreground">{walletBalance.toFixed(2)}</span> SOL
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="pl-10 font-mono"
                    disabled={step < 2}
                    min={1}
                    max={walletBalance}
                  />
                </div>
                <Button variant="outline" onClick={handleMaxAmount} disabled={step < 2}>
                  MAX
                </Button>
              </div>
            </div>

            {step >= 2 && amount > 0 && (
              <Button
                className="w-full"
                onClick={() => setStep(3)}
                disabled={amount <= 0 || amount > walletBalance}
              >
                CONTINUE
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Set Lockup Period */}
      <Card className={cn('border-border bg-card', step >= 3 ? 'border-primary/30' : 'opacity-50')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-display text-lg uppercase tracking-tight">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-sm text-sm font-bold',
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              3
            </div>
            <span>SET LOCKUP PERIOD</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Label className="text-xs uppercase text-muted-foreground">Duration</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg font-bold text-foreground">{lockupMonths}</span>
                  <span className="text-muted-foreground">months</span>
                </div>
              </div>
              <Slider
                value={[lockupMonths]}
                onValueChange={handleLockupChange}
                min={6}
                max={24}
                step={1}
                disabled={step < 3}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6 months</span>
                <span>12 months</span>
                <span>18 months</span>
                <span>24 months</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Longer lockup periods result in higher score impact and better APY rewards.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
