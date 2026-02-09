import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DeleteProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  protocolName: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteProfileDialog({
  open,
  onOpenChange,
  protocolName,
  onConfirm,
  isDeleting,
}: DeleteProfileDialogProps) {
  const [confirmText, setConfirmText] = useState('');

  const isConfirmed =
    confirmText.toLowerCase().trim() === protocolName.toLowerCase().trim();

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText('');
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 font-display uppercase tracking-tight text-destructive">
            <AlertTriangle className="h-5 w-5" />
            DELETE PROJECT
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4 pt-2">
            <p>You are about to permanently delete:</p>
            <p className="rounded-sm border border-border bg-muted px-4 py-3 font-display text-lg font-semibold text-foreground">
              "{protocolName}"
            </p>
            <p className="text-destructive/80">
              This action cannot be undone. All data including verification
              status will be permanently removed.
            </p>
            <div className="space-y-2 pt-2">
              <label
                htmlFor="confirm-name"
                className="text-sm text-muted-foreground"
              >
                Type <span className="font-semibold text-foreground">"{protocolName}"</span> to confirm:
              </label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type project name here..."
                className="font-mono"
                autoComplete="off"
                disabled={isDeleting}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isDeleting}
            className="font-display uppercase tracking-wider"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Project'
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
