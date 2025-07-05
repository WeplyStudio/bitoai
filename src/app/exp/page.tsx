
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem, Gift, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const GACHA_COST = 50;

export default function ExpPage() {
    const { user, isLoading: isAuthLoading, updateUserInContext } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();

    const [isGachaing, setIsGachaing] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastPrize, setLastPrize] = useState<{type: string, value: number} | null>(null);
    const [isResultOpen, setIsResultOpen] = useState(false);

    const handleGachaPull = async () => {
        if (!user || user.coins < GACHA_COST || isGachaing) {
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
                updateUserInContext(data.updatedUser);
                setIsSpinning(false);
                setIsResultOpen(true);
                setIsGachaing(false);

                if (data.leveledUp) {
                    toast({ title: "Level Up!", description: `You have reached level ${data.updatedUser.level}!` });
                }
            }, 2500);

        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: t('error'),
                description: error.message
            });
            setIsGachaing(false);
        }
    };
    
    if (isAuthLoading) {
        return (
             <div className="p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                    <Card><CardContent className="p-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('loginRequired')}</h1>
                <p className="text-muted-foreground mb-8 max-w-md">Please log in to view your progress and use the Gacha.</p>
            </div>
        )
    }

    const expPercentage = user.nextLevelExp > 0 ? (user.exp / user.nextLevelExp) * 100 : 0;

    return (
        <>
            <div className="p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center">{t('expTitle')}</h1>
                        <p className="mt-4 text-lg text-muted-foreground text-center">{t('expDescription')}</p>
                    </div>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Level {user.level}</CardTitle>
                            <CardDescription>{user.exp} / {user.nextLevelExp} EXP</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={expPercentage} className="h-4" />
                            <div className="mt-4 flex items-center justify-center gap-2 text-xl font-semibold text-amber-500">
                                <Gem className="h-6 w-6" />
                                <span>{user.coins} Coins</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn("shadow-lg transition-all", isSpinning && 'animate-gacha-flash ring-4 ring-primary/50')}>
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 p-4 rounded-full">
                                <Gift className={cn("h-12 w-12 text-primary transition-transform", isSpinning && 'animate-gacha-spin')} />
                            </div>
                             <CardTitle className="text-center pt-2">{t('gachaTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-center">
                            <p className="text-muted-foreground">{t('gachaExpDescription')}</p>
                            <Button
                                size="lg"
                                className="w-full max-w-xs mx-auto text-lg py-6"
                                onClick={handleGachaPull}
                                disabled={isAuthLoading || isGachaing}
                            >
                                {isGachaing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {isSpinning ? t('spinning') : t('pulling')}
                                    </>
                                ) : (
                                    <>
                                        {t('pullGacha', { cost: GACHA_COST })} <Gem className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                        <CardDescription className="pb-4 text-xs text-center">
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
                            {lastPrize?.type === 'exp' && `You won ${lastPrize.value} EXP!`}
                            {lastPrize?.type === 'coins' && `You won ${lastPrize.value} Coins!`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="text-center text-6xl font-bold text-amber-500 py-4 flex items-center justify-center gap-2">
                        <span>{lastPrize?.value}</span>
                        {lastPrize?.type === 'exp' ? <Star className="h-12 w-12" /> : <Gem className="h-12 w-12" />}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsResultOpen(false)}>{t('close')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
