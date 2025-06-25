
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Download, Mail, MessageCircle } from 'lucide-react';

const AI_MODE_KEY = 'bito-ai-mode';
const CHAT_HISTORIES_KEY = 'bito-ai-chat-histories';

export default function SettingsPage() {
  const [aiMode, setAiMode] = useState('default');
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const [isMounted, setIsMounted] = useState(false);
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

  const handleModeChange = (value: string) => {
    setAiMode(value);
    toast({
      title: t('aiModeUpdated'),
      description: t('aiModeUpdatedTo', { mode: value }),
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as any);
    toast({
      title: t('languageUpdated'),
      description: t('languageUpdatedMessage'),
    });
  };

  const handleExportChat = () => {
    try {
      const allChatHistories = localStorage.getItem(CHAT_HISTORIES_KEY);
      if (!allChatHistories || allChatHistories === '{}') {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: t('errorNoChatHistoryToExport'),
        });
        return;
      }

      const blob = new Blob([allChatHistories], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bito-ai-all-chats.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: t('exportSuccessful'),
        description: t('exportSuccessfulMessage'),
      });

    } catch (error) {
      console.error('Failed to export chat history:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not export your chat history.',
      });
    }
  };


  return (
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
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="ai-mode">{t('aiMode')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('aiModeDescription')}
                    </p>
                  </div>
                  <Select value={aiMode} onValueChange={handleModeChange}>
                    <SelectTrigger id="ai-mode" className="w-[180px]">
                      <SelectValue placeholder={t('selectAiModePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{t('faqAiModeDefaultTitle')}</SelectItem>
                      <SelectItem value="creative">{t('faqAiModeCreativeTitle')}</SelectItem>
                      <SelectItem value="professional">{t('faqAiModeProfessionalTitle')}</SelectItem>
                      <SelectItem value="storyteller">{t('faqAiModeStorytellerTitle')}</SelectItem>
                      <SelectItem value="sarcastic">{t('faqAiModeSarcasticTitle')}</SelectItem>
                      <SelectItem value="technical">{t('faqAiModeTechnicalTitle')}</SelectItem>
                      <SelectItem value="philosopher">{t('faqAiModePhilosopherTitle')}</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="language">{t('language')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('languageDescription')}
                    </p>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
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
              <div className="flex flex-col items-start gap-3 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>{t('exportData')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('exportDataDescription')}
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportChat}>
                  <Download className="mr-2 h-4 w-4" />
                  {t('exportAllChats')}
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    <AccordionContent>
                    {t('faqBitoContent')}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                    <AccordionTrigger>{t('faqVoiceTitle')}</AccordionTrigger>
                    <AccordionContent>
                    {t('faqVoiceContent')}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-7">
                    <AccordionTrigger>{t('faqLanguageTitle')}</AccordionTrigger>
                    <AccordionContent>
                    {t('faqLanguageContent')}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>{t('faqTemplatesTitle')}</AccordionTrigger>
                    <AccordionContent>
                    {t('faqTemplatesContent')}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>{t('faqPrivacyTitle')}</AccordionTrigger>
                    <AccordionContent>
                    {t('faqPrivacyContent')}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                    <AccordionTrigger>{t('faqImageTitle')}</AccordionTrigger>
                    <AccordionContent>
                    {t('faqImageContent')}
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-6">
                    <AccordionTrigger>{t('faqAiModesTitle')}</AccordionTrigger>
                    <AccordionContent>
                    <p className="mb-2">{t('faqAiModesContent')}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><b>{t('faqAiModeDefaultTitle')}:</b> {t('faqAiModeDefaultContent')}</li>
                        <li><b>{t('faqAiModeCreativeTitle')}:</b> {t('faqAiModeCreativeContent')}</li>
                        <li><b>{t('faqAiModeProfessionalTitle')}:</b> {t('faqAiModeProfessionalContent')}</li>
                        <li><b>{t('faqAiModeStorytellerTitle')}:</b> {t('faqAiModeStorytellerContent')}</li>
                        <li><b>{t('faqAiModeSarcasticTitle')}:</b> {t('faqAiModeSarcasticContent')}</li>
                        <li><b>{t('faqAiModeTechnicalTitle')}:</b> {t('faqAiModeTechnicalContent')}</li>
                        <li><b>{t('faqAiModePhilosopherTitle')}:</b> {t('faqAiModePhilosopherContent')}</li>
                    </ul>
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
  );
}
