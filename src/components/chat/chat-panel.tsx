
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/contexts/ProjectProvider';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';

import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import { TemplateDialog } from './template-dialog';
import { Button } from '@/components/ui/button';
import { FilePenLine, UserRound, Code, Sparkles, Plus, Lightbulb, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export interface Message {
  _id: string;
  id: string;
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
}

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
  const [isLoading, setIsLoading] = useState(false); // For sending a message
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [aiMode, setAiMode] = useState('default');

  const { activeProject, createProject, isLoading: isProjectsLoading, refreshProjects } = useProjects();
  const { language, t } = useLanguage();
  const { user, setAuthDialogOpen } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem(AI_MODE_KEY) || 'default';
    setAiMode(savedMode);
    
    const templatePrompt = localStorage.getItem(TEMPLATE_PROMPT_KEY);
    if (templatePrompt) {
        setInputText(templatePrompt);
        localStorage.removeItem(TEMPLATE_PROMPT_KEY);
    }
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
        if (activeProject) {
            setIsFetchingHistory(true);
            try {
                const response = await fetch(`/api/projects/${activeProject.id}/messages`);
                if (!response.ok) {
                    throw new Error('Failed to fetch messages');
                }
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                toast({ variant: 'destructive', title: t('error'), description: 'Could not load chat history.' });
                setMessages([]);
            } finally {
                setIsFetchingHistory(false);
            }
        } else {
            setMessages([]);
            setIsFetchingHistory(false);
        }
    };
    fetchMessages();
  }, [activeProject, toast]);

  const handleSend = async (text: string, file?: File) => {
    if (isLoading || (!text.trim() && !file) || !activeProject) return;
    setIsLoading(true);

    let imageUrl: string | undefined = undefined;
    if (file) {
        try {
            if (file.size > 4 * 1024 * 1024) {
                toast({ variant: 'destructive', title: t('fileTooLarge'), description: t('fileTooLargeDescription') });
                setIsLoading(false);
                return;
            }
            imageUrl = await toDataUri(file);
        } catch (error) {
            toast({ variant: 'destructive', title: t('imageProcessError'), description: t('imageProcessErrorDescription') });
            setIsLoading(false);
            return;
        }
    }

    const tempId = `user-${Date.now()}`;
    const newUserMessage: Message = { 
      _id: tempId,
      id: tempId, 
      role: 'user', 
      content: text,
      imageUrl: imageUrl,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: activeProject.id, message: { content: text, imageUrl } }),
        });

        if (!response.ok) {
            throw new Error('Failed to get a response from the server.');
        }

        const aiMessage = await response.json();
        setMessages(prev => prev.map(m => m.id === tempId ? { ...m, _id: aiMessage._id, id: aiMessage._id } : m)); // Replace temp user message with real one later if needed, for now just add AI message
        setMessages(prev => [...prev, aiMessage]);

        // If project name was 'Untitled Chat', it might have been renamed.
        if (activeProject.name === 'Untitled Chat') {
            refreshProjects();
        }

    } catch (error: any) {
        setMessages(prev => prev.filter(m => m.id !== tempId)); // Remove optimistic message on error
        toast({ variant: 'destructive', title: t('error'), description: error.message || 'Failed to get a response from Bito AI.' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleActionTemporarilyDisabled = () => {
    toast({
        title: "Feature Temporarily Disabled",
        description: "This feature is being reworked to support database storage.",
    });
  };

  const handleCreateProject = () => {
    if (!user) {
        setAuthDialogOpen(true);
    } else {
        createProject();
    }
  };

  const WelcomeScreen = () => {
    const welcomePrompts = [
        { displayKey: 'initialPrompt1', actionKey: 'initialPrompt1Action' },
        { displayKey: 'initialPrompt2', actionKey: 'initialPrompt2Action' },
        { displayKey: 'initialPrompt3', actionKey: 'initialPrompt3Action' },
        { displayKey: 'initialPrompt4', actionKey: 'initialPrompt4Action' },
    ];
    
    const icons = [FilePenLine, Lightbulb, UserRound, Code];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('welcomeToBito')}</h1>
            <p className="text-muted-foreground mb-8 max-w-md">{t('welcomeMessage')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                {welcomePrompts.map((p, i) => {
                    const Icon = icons[i];
                    return (
                        <Button 
                            key={i} 
                            variant="outline" 
                            size="lg" 
                            onClick={() => handleSend(t(p.actionKey as any))} 
                            className="bg-card hover:bg-secondary h-auto p-4 flex items-start justify-between text-left"
                            disabled={isLoading}
                        >
                            <div className="flex items-start gap-3 mr-4">
                                <div className="p-2 rounded-full bg-primary/5 flex-shrink-0">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-medium whitespace-normal break-words">{t(p.displayKey as any)}</span>
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
        {isProjectsLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
            <>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('noActiveChat')}</h1>
                <p className="text-muted-foreground mb-8 max-w-md">{t('noActiveChatMessage')}</p>
                <Button onClick={handleCreateProject} disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createNewChat')}
                </Button>
            </>
        )}
    </div>
  );
  
  const ChatContent = () => {
    if (isFetchingHistory) {
      return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
          <div className="flex items-start space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-3/4" />
              </div>
          </div>
           <div className="flex items-start space-x-4 justify-end">
              <div className="space-y-2 flex-1 pt-1 max-w-[80%] items-end flex flex-col">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-start space-x-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
              </div>
          </div>
        </div>
      );
    }

    if (messages.length === 0 && !isLoading) {
      return <WelcomeScreen />;
    }

    return (
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        onFeedback={handleActionTemporarilyDisabled}
        onRegenerate={handleActionTemporarilyDisabled}
        onStartEdit={handleActionTemporarilyDisabled}
        onCancelEdit={() => {}}
        onSaveEdit={() => {}}
        editingMessageId={null}
        editedContent=""
        onEditedContentChange={() => {}}
      />
    );
  };
  
  return (
    <div className="flex flex-col flex-1 min-h-0">
        <header className="hidden lg:flex items-center p-4 border-b">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold">{activeProject?.name || 'AI Chat'}</h2>
            <Button>{t('upgrade')}</Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
            {!activeProject ? <NoChatsScreen /> : <ChatContent />}
        </div>
        
        <footer className="p-2 md:p-4 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl">
              <ChatInput 
                onSend={handleSend} 
                isLoading={isLoading || !activeProject}
                value={inputText} 
                onChange={setInputText}
                onBrowsePrompts={() => setTemplateDialogOpen(true)}
                language={language}
              />
              <p className="text-xs text-muted-foreground text-center mt-2">{t('bitoAiMayBeInaccurate')}</p>
            </div>
        </footer>
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
