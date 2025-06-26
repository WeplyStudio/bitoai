
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bot, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


interface CustomAIModeListProps {
  onOpenCreateDialog: () => void;
}

export function CustomAIModeList({ onOpenCreateDialog }: CustomAIModeListProps) {
  const { user, updateUserInContext } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleDelete = async (modeId: string, modeName: string) => {
    try {
        const response = await fetch('/api/user/delete-ai-mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modeId }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete mode.');
        }

        updateUserInContext({ customAiModes: data.customAiModes });
        toast({ title: t('customModeDeleted'), description: t('customModeDeletedDescription', { name: modeName }) });

    } catch (error: any) {
        toast({ variant: 'destructive', title: t('error'), description: error.message });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('customModeList')}</CardTitle>
          <CardDescription>{t('customModeListDescription')}</CardDescription>
        </div>
        <Button onClick={onOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createNewPrompt')}
        </Button>
      </CardHeader>
      <CardContent>
        {user?.customAiModes && user.customAiModes.length > 0 ? (
          <div className="space-y-4">
            {user.customAiModes.map((mode) => (
              <div key={mode.id} className="flex items-start justify-between rounded-lg border p-4">
                <div className="flex items-start gap-4">
                  <Bot className="h-6 w-6 text-muted-foreground mt-1" />
                  <div className="space-y-1">
                    <p className="font-semibold">{mode.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{mode.prompt}</p>
                  </div>
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('deleteCustomMode')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('deleteCustomModeConfirmation', { name: mode.name })}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => handleDelete(mode.id, mode.name)}
                            >
                                {t('delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('noCustomModes')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
