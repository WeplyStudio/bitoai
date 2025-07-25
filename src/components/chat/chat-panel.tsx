
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
  expEarned?: number;
  coinsEarned?: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [regeneratingMessageId, setRegeneratingMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [aiMode, setAiMode] = useState('default');

  const { activeProject, createProject, isLoading: isProjectsLoading, refreshProjects } = useProjects();
  const { language, t } = useLanguage();
  const { user, setAuthDialogOpen, updateUserInContext } = useAuth();

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
        if (activeProject) { // This only exists for logged-in users.
            setIsFetchingHistory(true);
            try {
                const response = await fetch(`/api/projects/${activeProject.id}/messages`);
                if (!response.ok) throw new Error('Failed to fetch messages');
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

    if (isProjectsLoading && user) {
        setIsFetchingHistory(true);
    } else {
        fetchMessages();
    }
  }, [activeProject, isProjectsLoading, user, toast, t]);

  const handleSend = async (text: string, file?: File) => {
    if (isLoading || regeneratingMessageId || editingMessageId || (!text.trim() && !file)) return;
    
    if (!user) {
        if (file) {
            toast({ variant: 'destructive', title: t('loginRequired'), description: t('loginToUpload') });
            return;
        }
        await handleGuestSend(text);
        return;
    }
    
    if (!activeProject) return;
    
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

    const tempUserMessageId = `user-${Date.now()}`;
    const newUserMessage: Message = { 
      _id: tempUserMessageId,
      id: tempUserMessageId, 
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
            body: JSON.stringify({ 
                projectId: activeProject.id, 
                message: { content: text, imageUrl },
                mode: aiMode 
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get a response from the server.');
        }

        const finalUserMessage = { ...data.userMessage, id: data.userMessage._id.toString() };
        const finalAiMessage = { ...data.aiMessage, id: data.aiMessage._id.toString() };

        setMessages(prev => {
            const newMessages = prev.filter(m => m.id !== tempUserMessageId);
            return [...newMessages, finalUserMessage, finalAiMessage];
        });
        
        if (data.updatedProjectName) {
            refreshProjects();
        }
        if (data.updatedUser) {
            updateUserInContext(data.updatedUser);
        }
        if(data.leveledUp){
            toast({ title: "Level Up!", description: `You have reached level ${data.updatedUser.level}!` });
        }

    } catch (error: any) {
        setMessages(prev => prev.filter(m => m.id !== tempUserMessageId));
        toast({ variant: 'destructive', title: t('error'), description: error.message || 'Failed to get a response from Bito AI.' });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGuestSend = async (text: string) => {
    setIsLoading(true);
    const tempId = `user-${Date.now()}`;
    const newUserMessage: Message = { _id: tempId, id: tempId, role: 'user', content: text };

    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInputText('');

    try {
        const historyForApi = currentMessages.map(m => ({ role: m.role, content: m.content }));

        const response = await fetch('/api/chat/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: historyForApi, mode: aiMode }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get a response.');
        }

        const data = await response.json();
        const aiMessage: Message = { ...data.aiMessage, _id: data.aiMessage.id };
        setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRegenerate = useCallback(async (messageId: string) => {
    if (!user || !activeProject || regeneratingMessageId || isLoading) return;

    setRegeneratingMessageId(messageId);
    try {
      const response = await fetch('/api/chat/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProject.id, messageId, mode: aiMode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate response.');
      }

      const data = await response.json();
      const updatedMessage = data.message;
      if (data.userCredits !== undefined) {
          updateUserInContext({ credits: data.userCredits });
      }

      setMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, content: updatedMessage.content } : msg));
      
      toast({
        title: "Respons diperbarui",
        description: "Bito AI telah menghasilkan respons baru.",
      });

    } catch (error: any) {
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    } finally {
      setRegeneratingMessageId(null);
    }
  }, [user, activeProject, regeneratingMessageId, isLoading, toast, updateUserInContext, t, aiMode]);


  const handleStartEdit = (messageId: string, content: string) => {
    if (!user) return;
    setEditingMessageId(messageId);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    if (!user || !newContent.trim() || editingMessageId !== messageId) return;

    const originalMessages = [...messages];
    const messageIndex = originalMessages.findIndex(m => m.id === messageId);
    
    const optimisticUpdate = messages.map(m =>
      m.id === messageId ? { ...m, content: newContent } : m
    );
    setMessages(optimisticUpdate);
    setEditingMessageId(null);

    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save message.');
      }
      
      const data = await response.json();
      setMessages(prev => prev.map(m => m.id === messageId ? { ...data.message, id: data.message._id.toString() } : m));
      
      if (messageIndex !== -1 && messageIndex + 1 < originalMessages.length) {
          const nextMessage = originalMessages[messageIndex + 1];
          if (nextMessage && nextMessage.role === 'model') {
              await handleRegenerate(nextMessage.id);
          }
      }

    } catch (error: any) {
      setMessages(originalMessages);
      toast({ variant: 'destructive', title: t('error'), description: error.message });
    }
  };

  const handleActionTemporarilyDisabled = () => {
    toast({
        title: "Feature Temporarily Disabled",
        description: "This feature is being reworked.",
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
  
  return (
    <div className="flex flex-col flex-1 min-h-0">
        <header className="hidden lg:flex items-center p-4 border-b">
          <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold">{user ? (activeProject?.name || 'AI Chat') : t('aiChat')}</h2>
            <Button onClick={() => user ? {} : setAuthDialogOpen(true)}>{user ? t('upgrade') : t('loginRegister')}</Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
            { (isProjectsLoading && user) ? (
              <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
                <div className="flex items-start space-x-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 flex-1 pt-1"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-3/4" /></div></div>
                <div className="flex items-start space-x-4 justify-end"><div className="space-y-2 flex-1 pt-1 max-w-[80%] items-end flex flex-col"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-1/2" /></div><Skeleton className="h-8 w-8 rounded-full" /></div>
                <div className="flex items-start space-x-4"><Skeleton className="h-8 w-8 rounded-full" /><div className="space-y-2 flex-1 pt-1"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div>
              </div>
            ) : user && !activeProject ? (
                <NoChatsScreen />
            ) : isFetchingHistory ? (
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
            ) : messages.length === 0 && !isLoading ? (
              <WelcomeScreen />
            ) : (
              <ChatMessages
                user={user}
                messages={messages}
                isLoading={isLoading}
                onFeedback={handleActionTemporarilyDisabled}
                onRegenerate={handleRegenerate}
                onStartEdit={handleStartEdit}
                regeneratingMessageId={regeneratingMessageId}
                editingMessageId={editingMessageId}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
              />
            )}
        </div>
        
        <footer className="p-2 md:p-4 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl">
              <ChatInput 
                onSend={handleSend} 
                isLoading={isLoading || (user && !activeProject) || !!regeneratingMessageId || !!editingMessageId}
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
