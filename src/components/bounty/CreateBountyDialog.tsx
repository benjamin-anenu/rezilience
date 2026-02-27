import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateBounty } from '@/hooks/useBounties';

interface CreateBountyDialogProps {
  profiles: Array<{ id: string; project_name: string; realms_dao_address: string | null }>;
}

export function CreateBountyDialog({ profiles }: CreateBountyDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardSol, setRewardSol] = useState('');
  const [selectedRealm, setSelectedRealm] = useState('');
  const createBounty = useCreateBounty();

  const realmProfiles = profiles.filter(p => p.realms_dao_address);

  useEffect(() => {
    if (realmProfiles.length === 1 && !selectedRealm) {
      setSelectedRealm(realmProfiles[0].realms_dao_address!);
    }
  }, [realmProfiles, selectedRealm]);
  const handleSubmit = async () => {
    const reward = parseFloat(rewardSol);
    if (!title.trim() || !selectedRealm || isNaN(reward) || reward <= 0) return;

    await createBounty.mutateAsync({
      realm_dao_address: selectedRealm,
      title: title.trim(),
      description: description.trim() || undefined,
      reward_sol: reward,
    });

    setTitle('');
    setDescription('');
    setRewardSol('');
    setSelectedRealm('');
    setOpen(false);
  };

  if (realmProfiles.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-display uppercase tracking-wider">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Bounty
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">Create Bounty</DialogTitle>
        </DialogHeader>
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
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Build token-gated access for DAO members"
              maxLength={200}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detailed requirements for the bounty..."
              maxLength={2000}
              rows={4}
            />
          </div>

          <div>
            <Label>Reward (SOL) *</Label>
            <Input
              type="number"
              value={rewardSol}
              onChange={e => setRewardSol(e.target.value)}
              placeholder="e.g. 500"
              min={0.01}
              step={0.01}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !selectedRealm || !rewardSol || createBounty.isPending}
            className="w-full font-display uppercase tracking-wider"
          >
            {createBounty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Bounty'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
