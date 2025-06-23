"use client";

import { useState, useEffect } from 'react';
import { generateInitialPrompt } from '@/ai/flows/generate-initial-prompt';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage } from '@/ai/schemas';
import { incorporateFeedback } from '@/ai/flows/feedback-incorporation';
import { useToast } from '@/hooks/use-toast';

import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ChatFeedbackDialog } from './chat-feedback-dialog';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BitoIcon } from '@/components/icons';

export interface Message extends ChatMessage {
  id: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPrompts, setInitialPrompts] = useState<string[]>([]);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackMessageId, setFeedbackMessageId] = useState<string | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
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
    } catch (error) {
      console.error('Error during chat:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from Bito AI. Please try again.',
      });
      setMessages(prev => prev.filter(m => m.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFeedbackDialog = (messageId: string) => {
    setFeedbackMessageId(messageId);
    setIsFeedbackDialogOpen(true);
  };

  const handleSubmitFeedback = async (feedback: string) => {
    if (!feedbackMessageId) return;
    
    const messageIndex = messages.findIndex(m => m.id === feedbackMessageId);
    if (messageIndex < 1) return;

    const aiResponse = messages[messageIndex].content;
    const originalPrompt = messages[messageIndex - 1].content;

    setIsSubmittingFeedback(true);
    try {
        const { improvedResponse } = await incorporateFeedback({ originalPrompt, aiResponse, feedback });
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[messageIndex].content = improvedResponse;
            return newMessages;
        });
        toast({ title: 'Success', description: 'Feedback incorporated and response updated.' });
    } catch (error) {
        console.error('Error incorporating feedback:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not incorporate feedback.' });
    } finally {
        setIsSubmittingFeedback(false);
        setIsFeedbackDialogOpen(false);
        setFeedbackMessageId(null);
    }
  };

  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="p-3 rounded-full bg-secondary mb-4">
            <BitoIcon className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {initialPrompts.slice(0, 3).map((prompt, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => handleSend(prompt)} className="bg-card hover:bg-secondary">
                    {prompt}
                </Button>
            ))}
        </div>
    </div>
  );
  
  return (
    <>
      <Card className="w-full max-w-3xl h-[calc(100vh-4rem)] flex flex-col shadow-xl rounded-xl border-border bg-card">
        <CardHeader className="flex-row items-center justify-between p-4 border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BitoIcon className="w-6 h-6 text-primary" />
            Bito AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
            {messages.length === 0 && !isLoading ? <WelcomeScreen/> : <ChatMessages messages={messages} isLoading={isLoading} onFeedback={handleOpenFeedbackDialog} />}
        </CardContent>
        <CardFooter className="p-4 border-t bg-card/80 backdrop-blur-sm">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </CardFooter>
      </Card>
      <ChatFeedbackDialog 
        isOpen={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </>
  );
}
