"use client";

import { useState, useEffect, useCallback } from 'react';
import { incorporateFeedback } from '@/ai/flows/feedback-incorporation';
import { renameProject } from '@/ai/flows/rename-project-flow';
import { chat } from '@/ai/flows/chat';
import type { ChatMessage } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/contexts/ProjectProvider';
import { useLanguage } from '@/contexts/LanguageProvider';

import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { ChatFeedbackDialog } from './chat-feedback-dialog';
import { TemplateDialog } from './template-dialog';
import { Button } from '@/components/ui/button';
import { FilePenLine, UserRound, Code, Sparkles, Plus, Lightbulb } from 'lucide-react';

export interface Message extends ChatMessage {
  id: string;
}

const suggestionIcons: { [key: string]: React.ElementType } = {
    "Write copy": FilePenLine,
    "brainstorm ideas": Lightbulb,
    "Create avatar": UserRound,
    "Write code": Code,
}

const CHAT_HISTORIES_KEY = 'bito-ai-chat-histories';
const AI_MODE_KEY = 'bito-ai-mode';
const TEMPLATE_PROMPT_KEY = 'bito-ai-template-prompt';


const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialPrompts, setInitialPrompts] = useState<string[]>([
    'Write copy for a new marketing campaign',
    'Help me brainstorm ideas for a new business',
    'Create an avatar for a fantasy character',
    'Write code for a simple to-do list app in React',
  ]);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<Message | null>(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [aiMode, setAiMode] = useState('default');
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const { activeProject, createProject, updateProjectName } = useProjects();
  const { language, t } = useLanguage();

  useEffect(() => {
    const templatePrompt = localStorage.getItem(TEMPLATE_PROMPT_KEY);
    if (templatePrompt) {
        setInputText(templatePrompt);
        localStorage.removeItem(TEMPLATE_PROMPT_KEY);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(AI_MODE_KEY) || 'default';
      setAiMode(savedMode);

      if (activeProject) {
        const allHistoriesRaw = localStorage.getItem(CHAT_HISTORIES_KEY) || '{}';
        const allHistories = JSON.parse(allHistoriesRaw);
        const projectHistory = (allHistories[activeProject.id] || []).filter(Boolean);
        setMessages(projectHistory);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load chat history or settings.",
      });
    }
    setIsMounted(true);
  }, [activeProject, toast]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AI_MODE_KEY && event.newValue) {
        setAiMode(event.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isMounted && activeProject && !editingMessageId) {
      try {
        const allHistories = JSON.parse(localStorage.getItem(CHAT_HISTORIES_KEY) || '{}');
        allHistories[activeProject.id] = messages;
        localStorage.setItem(CHAT_HISTORIES_KEY, JSON.stringify(allHistories));
      } catch (error) {
        console.error("Failed to save messages to localStorage", error);
      }
    }
  }, [messages, activeProject, isMounted, editingMessageId]);

  useEffect(() => {
    const autoRenameProject = async () => {
      if (
        !activeProject ||
        isLoading ||
        isRenaming ||
        messages.length !== 2 ||
        activeProject.name !== 'Untitled Chat'
      ) {
        return;
      }
  
      setIsRenaming(true);
      try {
        const chatHistory = messages
          .map(m => `${m.role}: ${m.content || ''}`)
          .join('\n');
  
        const result = await renameProject({ chatHistory });
  
        if (result && result.projectName) {
          updateProjectName(activeProject.id, result.projectName);
          toast({
            title: 'Chat Renamed',
            description: `This chat was automatically named "${result.projectName}".`,
          });
        }
      } catch (error) {
        console.error("Failed to automatically rename chat:", error);
      } finally {
        setIsRenaming(false);
      }
    };
  
    autoRenameProject();
  }, [messages, activeProject, isLoading, isRenaming, updateProjectName, toast]);

  const callChatApi = useCallback(async (history: Message[]) => {
    setIsLoading(true);

    try {
      const cleanHistory = history.filter(Boolean);
      const historyForApi = cleanHistory.map(({ role, content, imageUrl }) => ({ role, content: content || '', imageUrl }));

      const response = await chat({
        messages: historyForApi,
        mode: aiMode,
        language: language,
      });

      if (!response || !response.content) {
        throw new Error('AI did not return a response.');
      }

      const aiMessage: Message = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: response.content,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error during chat:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get a response from Bito AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [aiMode, language, toast]);

  const handleSend = async (text: string, file?: File) => {
    if (isLoading || (!text.trim() && !file) || !activeProject) return;

    let imageUrl: string | undefined = undefined;
    if (file) {
        try {
            if (file.size > 4 * 1024 * 1024) {
                toast({
                    variant: 'destructive',
                    title: 'File too large',
                    description: 'Please upload an image smaller than 4MB.',
                });
                return;
            }
            imageUrl = await toDataUri(file);
        } catch (error) {
            console.error('Error converting file to data URI:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to process the image file. Please try another file.',
            });
            return;
        }
    }

    const newUserMessage: Message = { 
      id: `user-${Date.now()}`, 
      role: 'user', 
      content: text,
      imageUrl: imageUrl,
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputText('');
    await callChatApi(updatedMessages);
  };

  const handleFeedback = (messageId: string) => {
    const messageToReview = messages.find(m => m.id === messageId);
    if (messageToReview) {
      setFeedbackMessage(messageToReview);
    }
  };

  const handleRegenerate = useCallback(async (messageId: string) => {
    if (isLoading) return;
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'model') return;

    const historyForRegen = messages.slice(0, messageIndex);
    setMessages(historyForRegen);
    await callChatApi(historyForRegen);
  }, [messages, isLoading, callChatApi]);

  const handleStartEdit = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent('');
  };

  const handleSaveEdit = useCallback(async (messageId: string, newContent: string) => {
    if (isLoading) return;
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const historyUpToEdit = messages.slice(0, messageIndex);
    const updatedUserMessage = { ...messages[messageIndex], content: newContent };
    
    handleCancelEdit();

    const newHistory = [...historyUpToEdit, updatedUserMessage];
    setMessages(newHistory);
    await callChatApi(newHistory);
  }, [messages, isLoading, callChatApi]);

  const handleFeedbackSubmit = async (feedbackText: string) => {
    if (!feedbackMessage) return;

    const messageIndex = messages.findIndex(m => m.id === feedbackMessage.id);
    if (messageIndex < 1) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot provide feedback on this message.' });
      return;
    }

    const originalUserMessage = messages[messageIndex - 1];
    if (originalUserMessage.role !== 'user') {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot find original prompt for feedback.' });
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const result = await incorporateFeedback({
        originalPrompt: originalUserMessage.content,
        aiResponse: feedbackMessage.content,
        feedback: feedbackText,
      });

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content: result.improvedResponse };
      setMessages(updatedMessages);

      toast({ title: 'Feedback received', description: 'The response has been updated.' });
    } catch (error) {
      console.error('Error incorporating feedback:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to incorporate feedback.' });
    } finally {
      setIsSubmittingFeedback(false);
      setFeedbackMessage(null);
    }
  };

    const WelcomeScreen = () => {
        const prompts = initialPrompts.slice(0, 4);
        const getIcon = (prompt: string) => {
            const lowerCasePrompt = prompt.toLowerCase();
            const key = Object.keys(suggestionIcons).find(k => lowerCasePrompt.includes(k.toLowerCase()));
            return key ? suggestionIcons[key as keyof typeof suggestionIcons] : Sparkles;
        }
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('welcomeToBito')}</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{t('welcomeMessage')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                    {prompts.map((prompt, i) => {
                        const Icon = getIcon(prompt);
                        return (
                            <Button key={i} variant="outline" size="lg" onClick={() => handleSend(prompt)} className="bg-card hover:bg-secondary h-auto p-4 flex items-start justify-between text-left">
                                <div className="flex items-start gap-3 mr-4">
                                    <div className="p-2 rounded-full bg-primary/5 flex-shrink-0">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="font-medium whitespace-normal break-words">{prompt}</span>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1"/>
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    }
  
    const NoChatsScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('noActiveChat')}</h1>
            <p className="text-muted-foreground mb-8 max-w-md">{t('noActiveChatMessage')}</p>
            <Button onClick={createProject}>
                <Plus className="mr-2 h-4 w-4" />
                {t('createNewChat')}
            </Button>
        </div>
    );
  
  return (
    <div className="flex flex-col flex-1 min-h-0">
        <header className="hidden lg:flex items-center p-4 border-b">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold">{activeProject?.name || 'AI Chat'}</h2>
            <Button>{t('upgrade')}</Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
            {!activeProject ? <NoChatsScreen /> : 
            messages.length === 0 && !isLoading ? <WelcomeScreen/> : 
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading} 
              onFeedback={handleFeedback}
              onRegenerate={handleRegenerate}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              editingMessageId={editingMessageId}
              editedContent={editedContent}
              onEditedContentChange={setEditedContent}
            />
          }
        </div>
        
        <footer className="p-2 md:p-4 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl">
              <ChatInput 
                onSend={handleSend} 
                isLoading={isLoading || !activeProject || !!editingMessageId}
                value={inputText} 
                onChange={setInputText}
                onBrowsePrompts={() => setTemplateDialogOpen(true)}
                language={language}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">{t('bitoAiMayBeInaccurate')}</p>
            </div>
        </footer>
        <ChatFeedbackDialog
          isOpen={!!feedbackMessage}
          onOpenChange={(open) => !open && setFeedbackMessage(null)}
          onSubmit={handleFeedbackSubmit}
          isSubmitting={isSubmittingFeedback}
        />
        <TemplateDialog
          isOpen={isTemplateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          onSelectTemplate={(prompt) => {
            setInputText(prompt);
            setTemplateDialogOpen(false);
          }}
        />
    </div>
  );
}
