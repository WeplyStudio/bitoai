"use client";

import { useState, useEffect } from 'react';
import { generateInitialPrompt } from '@/ai/flows/generate-initial-prompt';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';

import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { Button } from '@/components/ui/button';
import { ScriptIcon } from '@/components/icons';
import { FilePenLine, ImageIcon, UserRound, Code, Sparkles, Plus } from 'lucide-react';

export interface Message extends ChatMessage {
  id: string;
}

const suggestionIcons = {
    "Write copy": FilePenLine,
    "Image generation": ImageIcon,
    "Create avatar": UserRound,
    "Write code": Code,
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPrompts, setInitialPrompts] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialPrompts = async () => {
      try {
        const { prompts } = await generateInitialPrompt();
        setInitialPrompts(prompts);
      } catch (error) {
        console.error('Failed to fetch initial prompts:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load initial prompts.' });
      }
    };
    fetchInitialPrompts();
  }, [toast]);
  
  const handleSend = async (text: string) => {
    if (isLoading || !text.trim()) return;

    const newUserMessage: Message = { id: String(Date.now()), role: 'user', content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const historyForApi = updatedMessages.map(({ role, content }) => ({ role, content }));
      const response = await chat({ messages: historyForApi });
      
      const newAiMessage: Message = { id: String(Date.now() + 1), role: response.role as 'model', content: response.content };
      setMessages(prev => [...prev, newAiMessage]);
    } catch (error)      {
        console.error('Error during chat:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to get a response from Script AI. Please try again.',
        });
        setMessages(prev => prev.filter(m => m.id !== newUserMessage.id));
    } finally {
        setIsLoading(false);
    }
    };

    const WelcomeScreen = () => {
        const prompts = initialPrompts.slice(0, 4);
        const getIcon = (prompt: string) => {
            const key = Object.keys(suggestionIcons).find(k => prompt.toLowerCase().includes(k.toLowerCase().split(' ')[0]));
            return key ? suggestionIcons[key] : Sparkles;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Script</h1>
                <p className="text-muted-foreground mb-8 max-w-md">Get started by Script a task and Chat can do the rest. Not sure where to start?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    {prompts.map((prompt, i) => {
                        const Icon = getIcon(prompt);
                        return (
                            <Button key={i} variant="outline" size="lg" onClick={() => handleSend(prompt)} className="bg-card hover:bg-secondary h-auto p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 rounded-full bg-primary/5">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-medium">{prompt}</span>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground"/>
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }
  
  return (
    <div className="flex flex-col h-full">
        <header className="hidden lg:flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <Button>+ Upgrade</Button>
        </header>

        <div className="flex-1 overflow-hidden">
            {messages.length === 0 && !isLoading ? <WelcomeScreen/> : <ChatMessages messages={messages} isLoading={isLoading} onFeedback={() => {}} />}
        </div>
        
        <footer className="p-2 md:p-4 bg-background/80 backdrop-blur-sm">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
            <p className="text-xs text-muted-foreground text-center mt-2">Script may generate inaccurate information about people, places, or facts. Model: Script AI v1.3</p>
        </footer>
    </div>
  );
}
