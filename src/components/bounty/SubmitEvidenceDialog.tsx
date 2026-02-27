import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';
import { useSubmitEvidence, type Bounty } from '@/hooks/useBounties';

interface SubmitEvidenceDialogProps {
  bounty: Bounty | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmitEvidenceDialog({ bounty, open, onOpenChange }: SubmitEvidenceDialogProps) {
  const [summary, setSummary] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const submitEvidence = useSubmitEvidence();

  const addLink = () => setLinks(prev => [...prev, '']);
  const removeLink = (idx: number) => setLinks(prev => prev.filter((_, i) => i !== idx));
  const updateLink = (idx: number, val: string) => setLinks(prev => prev.map((l, i) => i === idx ? val : l));

  const handleSubmit = async () => {
    if (!bounty || !summary.trim()) return;
    const validLinks = links.filter(l => l.trim());
    await submitEvidence.mutateAsync({
      bounty_id: bounty.id,
      evidence_summary: summary.trim(),
      evidence_links: validLinks.length > 0 ? validLinks : undefined,
    });
    setSummary('');
    setLinks(['']);
    onOpenChange(false);
  };

  if (!bounty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-tight">Submit Evidence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Bounty: <span className="font-semibold text-foreground">{bounty.title}</span>
          </p>

          <div>
            <Label>Summary of Work Done *</Label>
            <Textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Describe what you built and how it meets the requirements..."
              maxLength={2000}
              rows={4}
            />
          </div>

          <div>
            <Label>Links (PRs, demos, repos)</Label>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={e => updateLink(idx, e.target.value)}
                    placeholder="https://github.com/..."
                    maxLength={500}
                  />
                  {links.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeLink(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {links.length < 10 && (
                <Button variant="ghost" size="sm" onClick={addLink} className="text-xs">
                  <Plus className="mr-1 h-3 w-3" /> Add Link
                </Button>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!summary.trim() || submitEvidence.isPending}
            className="w-full font-display uppercase tracking-wider"
          >
            {submitEvidence.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Evidence'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
