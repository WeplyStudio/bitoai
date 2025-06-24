'use client';

import { useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem(AI_MODE_KEY) || 'default';
    setAiMode(savedMode);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem(AI_MODE_KEY, aiMode);
      // Dispatch a storage event to notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', {
          key: AI_MODE_KEY,
          newValue: aiMode,
      }));
    }
  }, [aiMode, isMounted]);
  
  const handleModeChange = (value: string) => {
    setAiMode(value);
    toast({
      title: 'AI Mode Updated',
      description: `Bito AI will now respond in ${value} mode.`,
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
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ai-mode">AI Mode</Label>
              <Select value={aiMode} onValueChange={handleModeChange}>
                <SelectTrigger id="ai-mode" className="w-[180px]">
                  <SelectValue placeholder="Select a mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose the personality for Bito AI responses.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Export Data</Label>
              <Button variant="outline" onClick={handleExportChat}>
                <Download className="mr-2 h-4 w-4" />
                Export All Chats
              </Button>
              <p className="text-sm text-muted-foreground">
                Download your complete chat history for all chats as a JSON file.
              </p>
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
                    Bito AI is a helpful and friendly AI assistant developed by JDev, designed to help with creative and business tasks.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>How does image generation work?</AccordionTrigger>
                    <AccordionContent>
                    Image generation is currently disabled. Bito AI can analyze images but cannot create them.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger>Is my data private?</AccordionTrigger>
                    <AccordionContent>
                    Your chat history is stored locally in your browser. It is not sent to our servers for storage, except to be processed by the AI model during a conversation.
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
