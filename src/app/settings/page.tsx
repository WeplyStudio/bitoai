'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Download, Mail, MessageCircle, Languages } from 'lucide-react';

const AI_MODE_KEY = 'bito-ai-mode';
const LANGUAGE_KEY = 'bito-ai-language';
const CHAT_HISTORIES_KEY = 'bito-ai-chat-histories';

export default function SettingsPage() {
  const [aiMode, setAiMode] = useState('default');
  const [language, setLanguage] = useState('id');
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(AI_MODE_KEY) || 'default';
    setAiMode(savedMode);
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'id';
    setLanguage(savedLanguage);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem(AI_MODE_KEY, aiMode);
      window.dispatchEvent(new StorageEvent('storage', { key: AI_MODE_KEY, newValue: aiMode }));
    }
  }, [aiMode, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem(LANGUAGE_KEY, language);
      window.dispatchEvent(new StorageEvent('storage', { key: LANGUAGE_KEY, newValue: language }));
    }
  }, [language, isMounted]);
  
  const handleModeChange = (value: string) => {
    setAiMode(value);
    toast({
      title: 'AI Mode Updated',
      description: `Bito AI will now respond in ${value} mode.`,
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: 'Language Updated',
      description: `Bito AI will now respond in the selected language.`,
    });
  };

  const handleExportChat = () => {
    try {
      const allChatHistories = localStorage.getItem(CHAT_HISTORIES_KEY);
      if (!allChatHistories || allChatHistories === '{}') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No chat history to export.',
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
        title: 'Export Successful',
        description: 'All of your chat histories have been downloaded.',
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

  if (!isMounted) {
      return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Settings &amp; Help</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Customize your Bito AI experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="ai-mode">AI Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose the personality for Bito AI responses.
                  </p>
                </div>
                <Select value={aiMode} onValueChange={handleModeChange}>
                  <SelectTrigger id="ai-mode" className="w-[180px]">
                    <SelectValue placeholder="Select a mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="storyteller">Storyteller</SelectItem>
                    <SelectItem value="sarcastic">Sarcastic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="philosopher">Philosopher</SelectItem>
                  </SelectContent>
                </Select>
            </div>
             <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose the language for AI responses and voice input.
                  </p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language" className="w-[180px]">
                    <SelectValue placeholder="Select a language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">Mandarin</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Download your complete history for all chats as a JSON file.
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportChat}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Chats
                </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Help &amp; Support</CardTitle>
            <CardDescription>Find answers and get in touch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>What is Bito AI?</AccordionTrigger>
                    <AccordionContent>
                    Bito AI is a helpful and friendly AI assistant developed by JDev, designed to help with creative and business tasks. You can ask it questions, get help with writing, brainstorm ideas, and much more.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-2">
                    <AccordionTrigger>How does voice input work?</AccordionTrigger>
                    <AccordionContent>
                    The voice input feature uses your browser's built-in Web Speech API. When you click the microphone icon, your browser will ask for permission to access your microphone. Once granted, whatever you say will be transcribed into text in the language you've selected in the settings.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-7">
                    <AccordionTrigger>Can I change the response language?</AccordionTrigger>
                    <AccordionContent>
                    Yes! In the Settings page, you can choose from several languages (Bahasa Indonesia, English, Mandarin, Japanese). The AI will respond in your selected language, and the voice input will also be configured for that language to improve accuracy.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Can I create my own prompt templates?</AccordionTrigger>
                    <AccordionContent>
                    Yes! Navigate to the "Templates" page from the left sidebar. There, you can switch to the "My Prompts" tab to create, edit, and delete your own custom prompts. They are saved locally in your browser for easy access.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>Is my data private?</AccordionTrigger>
                    <AccordionContent>
                    Yes. Your chat histories, custom prompt templates, and settings are stored locally in your browser's storage. This data is not sent to our servers for storage, except for the current conversation which is sent to the AI model for processing and is not stored long-term.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-5">
                    <AccordionTrigger>Why can't the AI generate images?</AccordionTrigger>
                    <AccordionContent>
                    Image generation is currently disabled. This allows us to focus on providing the best possible text-based conversation and task assistance experience. Bito AI can, however, analyze images that you upload.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-6">
                    <AccordionTrigger>What are the different AI Modes?</AccordionTrigger>
                    <AccordionContent>
                    The AI modes change the personality and tone of the AI's responses. Each mode is fine-tuned with a specific system prompt and temperature setting to achieve a different style.
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><b>Default:</b> A balanced, helpful, and friendly persona suitable for general tasks.</li>
                        <li><b>Creative:</b> An enthusiastic and imaginative persona, great for brainstorming and creative writing. Uses a higher temperature for more unexpected answers.</li>
                        <li><b>Professional:</b> A formal and concise persona, ideal for business or formal writing tasks.</li>
                        <li><b>Storyteller:</b> Weaves compelling and imaginative narratives in response to your prompts.</li>
                        <li><b>Sarcastic:</b> A witty, slightly grumpy assistant that provides correct but sarcastic answers.</li>
                        <li><b>Technical:</b> Delivers highly precise, structured, and factual responses, like technical documentation. Uses a lower temperature for accuracy.</li>
                        <li><b>Philosopher:</b> Responds with deep, thoughtful, and inquisitive reflections on your prompts.</li>
                    </ul>
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
            </div>
            <div>
                <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                    <Button asChild variant="outline" className="justify-center w-full">
                        <a href="mailto:admin@weplystudio.my.id">
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="justify-center w-full">
                        <a href="https://wa.me/6285868055463" target="_blank" rel="noopener noreferrer">
                             <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
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
