'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';

interface ChatFeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string) => void;
  isSubmitting: boolean;
}

export function ChatFeedbackDialog({ isOpen, onOpenChange, onSubmit, isSubmitting }: ChatFeedbackDialogProps) {
  const [feedback, setFeedback] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      setFeedback('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('feedbackTitle')}</DialogTitle>
          <DialogDescription>
            {t('feedbackDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="feedback"
            placeholder={t('feedbackPlaceholder')}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>{t('cancel')}</Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting || !feedback.trim()}>
            {isSubmitting ? t('submitting') : t('submitFeedback')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
