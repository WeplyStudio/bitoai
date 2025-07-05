
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const GACHA_COST = 10;

export default function GachaPage() {
    const { user, isLoading: isAuthLoading, updateUserInContext } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();

    const [isGachaing, setIsGachaing] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastPrize, setLastPrize] = useState<number | null>(null);
    const [isResultOpen, setIsResultOpen] = useState(false);

    const handleGachaPull = async () => {
        if (!user || user.credits < GACHA_COST || isGachaing) {
            if (!isGachaing) {
                toast({
                    variant: 'destructive',
                    title: t('error'),
                    description: t('notEnoughCredits')
                });
            }
            return;
        }

        setIsGachaing(true);
        try {
            const response = await fetch('/api/user/gacha', {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('gachaError'));
            }

            setIsSpinning(true);
            setLastPrize(data.prize);
            
            setTimeout(() => {
                updateUserInContext({ credits: data.newBalance });
                setIsSpinning(false);
                setIsResultOpen(true);
                setIsGachaing(false);
            }, 2500); // 2.5 seconds spin animation

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message
            });
            setIsGachaing(false);
        }
    };

    return (
        <>
            <div className="p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8 text-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('gachaTitle')}</h1>
                        <p className="mt-4 text-lg text-muted-foreground">{t('gachaDescription')}</p>
                    </div>

                    <Card className={cn("shadow-lg transition-all", isSpinning && 'animate-gacha-flash ring-4 ring-primary/50')}>
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                                <Gift className={cn("h-12 w-12 text-primary transition-transform", isSpinning && 'animate-gacha-spin')} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-xl font-semibold text-muted-foreground">
                                <CreditCard className="h-6 w-6" />
                                <span>{t('creditsRemaining')}: {user?.credits ?? 0}</span>
                            </div>
                            <Button
                                size="lg"
                                className="w-full text-lg py-6"
                                onClick={handleGachaPull}
                                disabled={isAuthLoading || isGachaing}
                            >
                                {isGachaing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {isSpinning ? t('spinning') : t('pulling')}
                                    </>
                                ) : (
                                    t('pullGacha', { cost: GACHA_COST })
                                )}
                            </Button>
                        </CardContent>
                        <CardDescription className="pb-4 text-xs">
                            {t('gachaDisclaimer')}
                        </CardDescription>
                    </Card>
                </div>
            </div>

            <AlertDialog open={isResultOpen} onOpenChange={setIsResultOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader className="items-center">
                        <AlertDialogTitle className="text-2xl">{t('congratulations')}!</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            {t('gachaPrize', { amount: lastPrize || 0 })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-center text-6xl font-bold text-amber-500 py-4">
                        {lastPrize}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsResultOpen(false)}>{t('close')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
