
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

const MODE_CREATION_COST = 150;

interface CreateAIModeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAIModeDialog({ isOpen, onOpenChange }: CreateAIModeDialogProps) {
  const { user, updateUserInContext } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) {
      toast({ variant: 'destructive', title: t('error'), description: 'Name and prompt cannot be empty.' });
      return;
    }
    if ((user?.credits ?? 0) < MODE_CREATION_COST) {
      toast({ variant: 'destructive', title: t('error'), description: `Insufficient credits. You need ${MODE_CREATION_COST}.` });
      return;
    }
    setConfirmOpen(true);
  };
  
  const handleCreateMode = async () => {
    setConfirmOpen(false);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/create-ai-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('errorCreatingMode'));
      }
      
      updateUserInContext(data.user);
      toast({ title: t('customModeCreated'), description: t('customModeCreatedDescription', { name }) });
      onOpenChange(false);
      setName('');
      setPrompt('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
          if (!isSubmitting) {
              onOpenChange(open);
              if (!open) {
                  setName('');
                  setPrompt('');
              }
          }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createCustomMode')}</DialogTitle>
            <DialogDescription>{t('createCustomModeDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOpenConfirm} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mode-name">{t('promptTitleLabel')}</Label>
              <Input
                id="mode-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cheerful Assistant"
                maxLength={30}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode-prompt">{t('promptLabel')}</Label>
              <Textarea
                id="mode-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="You are a cheerful assistant who always responds with positivity and emojis."
                rows={6}
                maxLength={1500}
                required
                disabled={isSubmitting}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isSubmitting}>{t('cancel')}</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('createCustomMode')} ({MODE_CREATION_COST} {t('creditsRemaining')})
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>{t('confirmModeCreation')}</AlertDialogTitle>
                  <AlertDialogDescription>
                      {t('confirmModeCreationDescription', { name })}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCreateMode}>{t('saveAndSubmit')}</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
