import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2, Vote, Zap, Shield, ArrowLeft, ArrowRight, Trash2, Coins, CheckCircle2 } from 'lucide-react';
import { useCreateBounty } from '@/hooks/useBounties';

type ReleaseMode = 'dao_governed' | 'direct' | 'multisig';

interface Milestone {
  title: string;
  sol: string;
}

interface CreateBountyWizardProps {
  profiles: Array<{ id: string; project_name: string; realms_dao_address: string | null }>;
}

const releaseModes: Array<{ id: ReleaseMode; label: string; icon: typeof Vote; description: string; disabled?: boolean }> = [
  { id: 'dao_governed', label: 'DAO Governed', icon: Vote, description: 'Escrow released via Realms governance vote.' },
  { id: 'direct', label: 'Direct Release', icon: Zap, description: 'Creator releases SOL after approving evidence.' },
  { id: 'multisig', label: 'Multi-sig', icon: Shield, description: 'Squads multi-sig required to release funds.', disabled: true },
];

export function CreateBountyWizard({ profiles }: CreateBountyWizardProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1
  const [releaseMode, setReleaseMode] = useState<ReleaseMode>('dao_governed');

  // Step 2
  const [selectedRealm, setSelectedRealm] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardSol, setRewardSol] = useState('');

  // Step 3
  const [useMilestones, setUseMilestones] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([{ title: '', sol: '' }]);

  const createBounty = useCreateBounty();
  const realmProfiles = profiles.filter(p => p.realms_dao_address);

  useEffect(() => {
    if (realmProfiles.length === 1 && !selectedRealm) {
      setSelectedRealm(realmProfiles[0].realms_dao_address!);
    }
  }, [realmProfiles, selectedRealm]);

  const reward = parseFloat(rewardSol);
  const milestoneSum = milestones.reduce((s, m) => s + (parseFloat(m.sol) || 0), 0);
  const milestonesValid = !useMilestones || (
    milestones.length >= 1 &&
    milestones.every(m => m.title.trim() && parseFloat(m.sol) > 0) &&
    Math.abs(milestoneSum - reward) < 0.001
  );

  const canAdvance = (s: number) => {
    if (s === 1) return true;
    if (s === 2) return !!title.trim() && !!selectedRealm && !isNaN(reward) && reward > 0;
    if (s === 3) return milestonesValid;
    return false;
  };

  const resetForm = () => {
    setStep(1);
    setReleaseMode('dao_governed');
    setSelectedRealm(realmProfiles.length === 1 ? realmProfiles[0].realms_dao_address! : '');
    setTitle('');
    setDescription('');
    setRewardSol('');
    setUseMilestones(false);
    setMilestones([{ title: '', sol: '' }]);
  };

  const handleSubmit = async () => {
    const ms = useMilestones
      ? milestones.map(m => ({ title: m.title.trim(), sol: parseFloat(m.sol) }))
      : [];

    await createBounty.mutateAsync({
      realm_dao_address: selectedRealm,
      title: title.trim(),
      description: description.trim() || undefined,
      reward_sol: reward,
      release_mode: releaseMode,
      milestones: ms,
    });

    resetForm();
    setOpen(false);
  };

  const addMilestone = () => {
    if (milestones.length < 5) setMilestones([...milestones, { title: '', sol: '' }]);
  };

  const removeMilestone = (i: number) => {
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const updateMilestone = (i: number, field: keyof Milestone, val: string) => {
    const copy = [...milestones];
    copy[i] = { ...copy[i], [field]: val };
    setMilestones(copy);
  };

  if (realmProfiles.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="font-display uppercase tracking-wider">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Bounty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">
            Create Bounty
            <span className="ml-2 text-xs font-mono text-muted-foreground normal-case">Step {step}/4</span>
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Release Mode */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How should SOL be released to the builder?</p>
            {releaseModes.map(mode => {
              const Icon = mode.icon;
              const selected = releaseMode === mode.id;
              return (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-colors border-2 ${
                    selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  } ${mode.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !mode.disabled && setReleaseMode(mode.id)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className={`h-5 w-5 shrink-0 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold uppercase tracking-tight">{mode.label}</span>
                        {mode.disabled && <Badge variant="outline" className="text-[9px] font-mono">Coming Soon</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{mode.description}</p>
                    </div>
                    {selected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Step 2: Bounty Details */}
        {step === 2 && (
          <div className="space-y-4">
            {realmProfiles.length > 1 && (
              <div>
                <Label>Realm DAO</Label>
                <Select value={selectedRealm} onValueChange={setSelectedRealm}>
                  <SelectTrigger><SelectValue placeholder="Select DAO" /></SelectTrigger>
                  <SelectContent>
                    {realmProfiles.map(p => (
                      <SelectItem key={p.realms_dao_address!} value={p.realms_dao_address!}>
                        {p.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build token-gated access for DAO members" maxLength={200} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed requirements…" maxLength={2000} rows={3} />
            </div>
            <div>
              <Label>Reward (SOL) *</Label>
              <Input type="number" value={rewardSol} onChange={e => setRewardSol(e.target.value)} placeholder="e.g. 500" min={0.01} step={0.01} />
            </div>
          </div>
        )}

        {/* Step 3: Milestones */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Break reward into milestones?</Label>
              <Switch checked={useMilestones} onCheckedChange={setUseMilestones} />
            </div>

            {useMilestones && (
              <>
                <p className="text-xs text-muted-foreground">
                  Allocations must sum to <span className="font-mono font-semibold text-primary">{reward} SOL</span>.
                  {milestoneSum > 0 && (
                    <span className={`ml-1 font-mono ${Math.abs(milestoneSum - reward) < 0.001 ? 'text-green-500' : 'text-destructive'}`}>
                      (current: {milestoneSum.toFixed(2)})
                    </span>
                  )}
                </p>
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Milestone {i + 1}</Label>
                      <Input value={m.title} onChange={e => updateMilestone(i, 'title', e.target.value)} placeholder="Milestone title" maxLength={100} />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs">SOL</Label>
                      <Input type="number" value={m.sol} onChange={e => updateMilestone(i, 'sol', e.target.value)} placeholder="0" min={0.01} step={0.01} />
                    </div>
                    {milestones.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeMilestone(i)} className="shrink-0 mb-0.5">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
                {milestones.length < 5 && (
                  <Button size="sm" variant="outline" onClick={addMilestone} className="font-display text-xs uppercase">
                    <Plus className="mr-1 h-3 w-3" /> Add Milestone
                  </Button>
                )}
              </>
            )}

            {!useMilestones && (
              <p className="text-xs text-muted-foreground">The full reward will be released as a single payment on completion.</p>
            )}
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="border-border bg-muted/10">
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Release Mode</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {releaseModes.find(m => m.id === releaseMode)?.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-semibold text-right max-w-[60%] truncate">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward</span>
                  <span className="font-mono font-semibold text-primary flex items-center gap-1">
                    <Coins className="h-3 w-3" /> {reward} SOL
                  </span>
                </div>
                {useMilestones && milestones.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">Milestones</span>
                    <ul className="mt-1 space-y-1">
                      {milestones.map((m, i) => (
                        <li key={i} className="flex justify-between text-xs">
                          <span>{m.title}</span>
                          <span className="font-mono text-primary">{parseFloat(m.sol)} SOL</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="font-display text-xs uppercase">
              <ArrowLeft className="mr-1 h-3 w-3" /> Back
            </Button>
          ) : <div />}

          {step < 4 ? (
            <Button size="sm" onClick={() => setStep(step + 1)} disabled={!canAdvance(step)} className="font-display text-xs uppercase tracking-wider">
              Next <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createBounty.isPending} className="font-display uppercase tracking-wider">
              {createBounty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Bounty'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
