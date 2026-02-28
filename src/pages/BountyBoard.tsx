import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Coins, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useBounties, useUserProfiles, useResolveBounty, type Bounty } from '@/hooks/useBounties';
import { useFundEscrow, useCancelEscrow } from '@/hooks/useEscrowProgram';
import { BountyCard, BountyFilters, CreateBountyWizard, ClaimBountyDialog, SubmitEvidenceDialog, LinkProposalDialog, MarkPaidDialog } from '@/components/bounty';

export default function BountyBoard() {
  const { user, isAuthenticated } = useAuth();
  const { data: bounties = [], isLoading } = useBounties();
  const { data: userProfiles = [] } = useUserProfiles();
  const resolveBounty = useResolveBounty();
  const fundEscrow = useFundEscrow();
  const cancelEscrow = useCancelEscrow();

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [claimTarget, setClaimTarget] = useState<Bounty | null>(null);
  const [evidenceTarget, setEvidenceTarget] = useState<Bounty | null>(null);
  const [proposalTarget, setProposalTarget] = useState<Bounty | null>(null);
  const [paidTarget, setPaidTarget] = useState<Bounty | null>(null);

  // Waitlist state
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const realmProfiles = userProfiles.filter(p => p.realms_dao_address);

  const filtered = useMemo(() => {
    return bounties.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [bounties, statusFilter, search]);

  const totalSol = bounties.reduce((sum, b) => sum + Number(b.reward_sol), 0);
  const openCount = bounties.filter(b => b.status === 'open').length;

  const handleJoinWaitlist = async () => {
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('join-bounty-waitlist', {
        body: { email },
      });
      if (error) throw error;
      setIsJoined(true);
      toast.success("You're on the list!");
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFundEscrow = (bounty: Bounty) => {
    if (!bounty.claimer_wallet) {
      toast.error('No claimer wallet set on this bounty');
      return;
    }
    fundEscrow.mutate({
      bounty_id: bounty.id,
      claimer_wallet: bounty.claimer_wallet,
      realm_dao_address: bounty.realm_dao_address,
      reward_sol: bounty.reward_sol,
    });
  };

  const handleCancelEscrow = (bounty: Bounty) => {
    cancelEscrow.mutate({ bounty_id: bounty.id });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12">
          {/* Back link */}
          <Link
            to="/accountability"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to DAO Tracker
          </Link>

          {/* Hero */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge variant="outline" className="mb-3 border-primary/30 font-mono text-xs uppercase">
                  Bounty Board
                </Badge>
                <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
                  Open Bounties
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Claim work, submit evidence, earn SOL — governed by your DAO.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-primary">{totalSol.toLocaleString()}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Total SOL</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-foreground">{openCount}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Open</p>
                </div>
              </div>
            </div>

            {isAuthenticated && realmProfiles.length > 0 && (
              <div className="mt-4">
                <CreateBountyWizard profiles={realmProfiles} />
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6">
            <BountyFilters
              activeStatus={statusFilter}
              onStatusChange={setStatusFilter}
              search={search}
              onSearchChange={setSearch}
            />
          </div>

          {/* Bounty grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed border-border bg-muted/10">
              <CardContent className="p-12 text-center">
                <Coins className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
                <p className="font-mono text-xs uppercase text-muted-foreground">
                  {bounties.length === 0 ? 'No bounties yet. Create the first one!' : 'No bounties match your filters.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(bounty => (
                <BountyCard
                  key={bounty.id}
                  bounty={bounty}
                  isCreator={bounty.creator_x_user_id === user?.id}
                  isClaimer={bounty.claimer_x_user_id === user?.id}
                  onClaim={() => setClaimTarget(bounty)}
                  onSubmitEvidence={() => setEvidenceTarget(bounty)}
                  onApprove={() => resolveBounty.mutate({ bounty_id: bounty.id, action: 'approve' })}
                  onReject={() => resolveBounty.mutate({ bounty_id: bounty.id, action: 'reject' })}
                  onFundEscrow={() => handleFundEscrow(bounty)}
                  onCreateProposal={() => setProposalTarget(bounty)}
                  onMarkPaid={() => setPaidTarget(bounty)}
                  onCancelEscrow={() => handleCancelEscrow(bounty)}
                  isPendingEscrow={fundEscrow.isPending || cancelEscrow.isPending}
                />
              ))}
            </div>
          )}

          {/* On-chain escrow info */}
          <Card className="mt-12 border-primary/20 bg-primary/5">
            <CardContent className="p-8 text-center">
              <Badge variant="outline" className="mb-3 border-primary/30 font-mono text-[10px] uppercase">
                Realms-Governed Escrow · Live on Devnet
              </Badge>
              <h2 className="mb-2 font-display text-xl font-semibold uppercase tracking-tight text-foreground">
                DAO-Governed SOL Release
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Escrowed rewards are released via Realms governance votes. Fund an escrow, create a proposal,
                and let your DAO decide when SOL is released to the builder.
              </p>
              {isJoined ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-display text-sm font-semibold uppercase">You're on the list!</span>
                </div>
              ) : (
                <div className="mx-auto flex max-w-md gap-2">
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleJoinWaitlist()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleJoinWaitlist}
                    disabled={!email || isSubmitting}
                    className="font-display uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="mr-1.5 h-4 w-4" />
                        Notify Me
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ClaimBountyDialog
        bounty={claimTarget}
        open={!!claimTarget}
        onOpenChange={open => !open && setClaimTarget(null)}
      />
      <SubmitEvidenceDialog
        bounty={evidenceTarget}
        open={!!evidenceTarget}
        onOpenChange={open => !open && setEvidenceTarget(null)}
      />
      <LinkProposalDialog
        bounty={proposalTarget}
        open={!!proposalTarget}
        onOpenChange={open => !open && setProposalTarget(null)}
      />
      <MarkPaidDialog
        bounty={paidTarget}
        open={!!paidTarget}
        onOpenChange={open => !open && setPaidTarget(null)}
      />
    </Layout>
  );
}
