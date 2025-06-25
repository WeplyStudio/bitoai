
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';

export function ChangePasswordForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || newPassword.length < 6) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('changePasswordError'));
      }
      toast({ title: t('changePasswordSuccess') });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
      return null;
  }

  return (
    <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3 rounded-lg border p-4">
            <div className="space-y-1">
                <Label>{t('changePasswordTitle')}</Label>
                <p className="text-sm text-muted-foreground">
                    {t('changePasswordDescription')}
                </p>
            </div>
             <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isSaving}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">{t('newPassword')}</Label>
                <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    disabled={isSaving}
                    required
                />
                    <p className="text-xs text-muted-foreground">{t('passwordMinLength')}</p>
            </div>
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || !currentPassword || newPassword.length < 6}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    {t('savePassword')}
                </Button>
            </div>
        </div>
    </form>
  );
}
