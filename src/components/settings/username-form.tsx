
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function UsernameForm() {
  const { user, isLoading: isAuthLoading, updateUserInContext } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim() === user?.username) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/update-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('usernameUpdateError'));
      }
      updateUserInContext({ username: data.user.username });
      toast({ title: t('usernameUpdateSuccess') });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isAuthLoading) {
      return (
          <div className="rounded-lg border p-4 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-20" />
              </div>
          </div>
      )
  }

  return (
    <form onSubmit={handleSave}>
      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <div className="space-y-1">
          <Label htmlFor="username">{t('username')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('usernameManagementDescription')}
          </p>
        </div>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={20}
          disabled={isSaving}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || !username.trim() || username.trim() === user?.username}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t('save')}
          </Button>
        </div>
      </div>
    </form>
  );
}
