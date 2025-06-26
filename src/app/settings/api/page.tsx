
'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Copy, Check, RefreshCw, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ApiSettingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [apiKey, setApiKey] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateKey = async () => {
    setIsGenerating(true);
    setApiKey(null);
    try {
      const response = await fetch('/api/user/api-key', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate API key.');
      }
      setApiKey(data.apiKey);
      toast({ title: t('apiKeyGeneratedSuccessTitle'), description: t('apiKeyGeneratedSuccessDesc') });
    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  if (isAuthLoading) {
    return (
        <div className="p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-64 mb-6" />
                <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-48 w-full" /></CardContent>
                </Card>
            </div>
        </div>
    )
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('loginRequired')}</h1>
            <p className="text-muted-foreground max-w-md">{t('apiLoginRequiredDesc')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{t('apiKey')}</h2>
              <p className="text-muted-foreground">{t('apiKeyDescription')}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('yourApiKey')}</CardTitle>
              <CardDescription>
                {t('yourApiKeyDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKey ? (
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                    <code className="font-mono text-sm break-all flex-1">{apiKey}</code>
                    <Button variant="ghost" size="icon" onClick={handleCopy} disabled={hasCopied}>
                        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-md">
                    <p className="text-muted-foreground">{t('generateKeyPrompt')}</p>
                </div>
              )}
               <Alert variant="destructive">
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>{t('apiKeyWarningTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('apiKeyWarningDesc')}
                  </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="outline" disabled={isGenerating}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t('regenerate')}
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t('apiKeyRegenerateConfirm')}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={handleGenerateKey}>
                                {t('regenerate')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleGenerateKey} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    {t('generateApiKey')}
                </Button>
            </CardFooter>
          </Card>

          <Card>
              <CardHeader>
                  <CardTitle>{t('apiUsageTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4 text-sm text-foreground">
                    <p>{t('apiUsageDesc1')}</p>
                    <div className="p-4 rounded-md bg-muted font-mono text-xs overflow-x-auto">
                        <span className="text-pink-500">POST</span> https://<span className="text-green-400">[your-app-domain]</span>/api/v1/chat
                    </div>
                    <p>{t('apiUsageDesc2')}</p>
                     <div className="p-4 rounded-md bg-muted font-mono text-xs overflow-x-auto">
                        Authorization: Bearer <span className="text-green-400">[YOUR_API_KEY]</span>
                        <br/>
                        Content-Type: application/json
                    </div>
                     <p>{t('apiUsageDesc3')}</p>
                     <div className="p-4 rounded-md bg-muted font-mono text-xs overflow-x-auto">
                        <pre>{`{\n  "message": "Hello, world!",\n  "mode": "default" // Optional\n}`}</pre>
                    </div>
                  </div>
              </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}

