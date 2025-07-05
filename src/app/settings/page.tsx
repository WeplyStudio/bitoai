
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Download, Mail, MessageCircle, Trash2, Palette, Lock, CheckCircle2, Gem } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UsernameForm } from '@/components/settings/username-form';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
import { AchievementsDisplay } from '@/components/settings/achievements-display';
import { Footer } from '@/components/layout/footer';
import { useUiTheme } from '@/contexts/UiThemeProvider';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const AI_MODE_KEY = 'bito-ai-mode';
const THEME_UNLOCK_COST = 150; // In Coins

const availableThemes = [
  { id: 'minimalist', nameKey: 'themeMinimalist', isFree: true },
  { id: 'kawaii', nameKey: 'themeKawaii', isFree: false },
  { id: 'hacker', nameKey: 'themeHacker', isFree: false },
  { id: 'retro', nameKey: 'themeRetro', isFree: false },
  { id: 'cyberpunk', nameKey: 'themeCyberpunk', isFree: false },
  { id: 'anime', nameKey: 'themeAnime', isFree: false },
  { id: 'cartoon', nameKey: 'themeCartoon', isFree: false },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const { user, deleteAccount, updateUserInContext } = useAuth();
  const { theme: activeTheme, setTheme: setActiveTheme } = useUiTheme();

  const [aiMode, setAiMode] = useState('default');
  const [isMounted, setIsMounted] = useState(false);
  const [themeToUnlock, setThemeToUnlock] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem(AI_MODE_KEY) || 'default';
    setAiMode(savedMode);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(AI_MODE_KEY, aiMode);
    }
  }, [aiMode, isMounted]);
  
  const handleUnlockTheme = async () => {
    if (!themeToUnlock || !user) return;

    try {
        const response = await fetch('/api/user/unlock-theme', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ themeName: themeToUnlock })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to unlock theme.');
        }
        updateUserInContext({ 
            unlockedThemes: data.unlockedThemes, 
            coins: data.newBalance 
        });
        toast({
            title: t('themeUnlocked'),
            description: t('themeUnlockedDescription', { theme: t(availableThemes.find(th => th.id === themeToUnlock)?.nameKey as any) })
        });
    } catch(error: any) {
        toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
        setThemeToUnlock(null);
    }
  };

  if (!isMounted) return null;

  return (
    <>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">{t('settingsTitle')}</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('appSettings')}</CardTitle>
              <CardDescription>{t('appSettingsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2"><Palette className="h-4 w-4" />{t('theme')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('themeDescription')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {availableThemes.map(theme => {
                        const isUnlocked = user?.unlockedThemes.includes(theme.id);
                        const isActive = activeTheme === theme.id;
                        return (
                            <Card key={theme.id} className={cn("flex flex-col justify-between", isActive && "border-2 border-primary")}>
                                <CardHeader className="p-4">
                                    <CardTitle className="text-base">{t(theme.nameKey as any)}</CardTitle>
                                </CardHeader>
                                <CardFooter className="p-4">
                                    {isUnlocked ? (
                                        <Button className="w-full" variant={isActive ? "default" : "secondary"} onClick={() => setActiveTheme(theme.id as any)} disabled={isActive}>
                                            {isActive ? <><CheckCircle2 className="mr-2 h-4 w-4" />{t('activeTheme')}</> : t('setTheme')}
                                        </Button>
                                    ) : (
                                        <Button className="w-full" variant="outline" onClick={() => setThemeToUnlock(theme.id)} disabled={(user?.coins ?? 0) < THEME_UNLOCK_COST}>
                                            <div className='flex items-center'>
                                                <Lock className="mr-2 h-4 w-4" /> {t('unlockTheme', { cost: THEME_UNLOCK_COST })} <Gem className="ml-1 h-3 w-3"/>
                                            </div>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                  </div>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="language">{t('language')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('languageDescription')}
                    </p>
                  </div>
                  <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
                    <SelectTrigger id="language" className="w-[180px]">
                      <SelectValue placeholder={t('selectLanguagePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">{t('lang_id')}</SelectItem>
                      <SelectItem value="en">{t('lang_en')}</SelectItem>
                      <SelectItem value="zh">{t('lang_zh')}</SelectItem>
                      <SelectItem value="ja">{t('lang_ja')}</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </CardContent>
          </Card>
          
          {user && (
            <div className="space-y-8">
              <Card>
                  <CardHeader>
                      <CardTitle>{t('accountManagement')}</CardTitle>
                      <CardDescription>{t('accountManagementDescription')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <UsernameForm />
                      <ChangePasswordForm />
                  </CardContent>
              </Card>

              <AchievementsDisplay />

              <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">{t('deleteAccount')}</CardTitle>
                    <CardDescription>{t('deleteAccountDescription')}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                    <AlertDialog onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation('')}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> {t('deleteAccount')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('deleteAccountConfirmationTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('deleteAccountConfirmationMessage')}
                                    <br/><br/>
                                    <span dangerouslySetInnerHTML={{ __html: t('deleteAccountConfirmationExtra') }} />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                             <div className="py-2">
                                <Input
                                    id="delete-confirm"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    placeholder={t('deleteAccountInputPlaceholder')}
                                    autoComplete="off"
                                />
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>{t('cancel')}</AlertDialogCancel>
                                <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={deleteAccount}
                                    disabled={deleteConfirmation !== 'delete my account'}
                                >
                                    {t('delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
              </Card>
            </div>
          )}

        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('helpAndSupport')}</CardTitle>
            <CardDescription>{t('helpAndSupportDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">{t('faq')}</h3>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>{t('faqBitoTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqBitoContent')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-api">
                    <AccordionTrigger>{t('faqApiUsageTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqApiUsageContent')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-8">
                    <AccordionTrigger>{t('faqAchievementsTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqAchievementsContent')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-9">
                    <AccordionTrigger>{t('faqCreditsTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqCreditsContent')}</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                    <AccordionTrigger>{t('faqVoiceTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqVoiceContent')}</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-7">
                    <AccordionTrigger>{t('faqLanguageTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqLanguageContent')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>{t('faqTemplatesTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqTemplatesContent')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>{t('faqPrivacyTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqPrivacyContent')}</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                    <AccordionTrigger>{t('faqImageTitle')}</AccordionTrigger>
                    <AccordionContent>{t('faqImageContent')}</AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-6">
                    <AccordionTrigger>{t('faqAiModesTitle')}</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-2">{t('faqAiModesContent')}</p>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-2">{t('contactSupport')}</h3>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button asChild variant="outline" className="justify-center w-full">
                        <a href="mailto:admin@weplystudio.my.id">
                            <Mail className="mr-2 h-4 w-4" /> {t('email')}
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="justify-center w-full">
                        <a href="https://wa.me/6285868055463" target="_blank" rel="noopener noreferrer">
                             <MessageCircle className="mr-2 h-4 w-4" /> {t('whatsapp')}
                        </a>
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    
    <AlertDialog open={!!themeToUnlock} onOpenChange={(isOpen) => !isOpen && setThemeToUnlock(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{t('unlockThemeConfirmationTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                    {t('unlockThemeConfirmationDescription', { 
                        cost: THEME_UNLOCK_COST, 
                        theme: t(availableThemes.find(th => th.id === themeToUnlock)?.nameKey as any || '') 
                    })}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setThemeToUnlock(null)}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleUnlockTheme}>
                    {t('unlock')}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

    