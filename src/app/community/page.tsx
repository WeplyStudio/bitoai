'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SendHorizonal, LogIn } from 'lucide-react';
import { UserIcon } from '@/components/icons';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAuth } from '@/contexts/AuthProvider';

interface Message {
  _id: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function CommunityPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { user, setAuthDialogOpen, updateUserInContext } = useAuth();

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/community/messages');
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorLoadCommunityMessages'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/community/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      const savedMessage = data.message;
      const newAchievements = data.newAchievements;

      setMessages(prev => [...prev, savedMessage]);
      setNewMessage('');

      if (newAchievements && user) {
        const hasNewAchievement = newAchievements.length > user.achievements.length;
        updateUserInContext({ achievements: newAchievements });
        if(hasNewAchievement) {
            toast({ title: t('achievementsTitle'), description: "You've earned the Community Member badge!" });
        }
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message || t('errorSendCommunityMessage'),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <header className="flex items-center p-4 border-b bg-card">
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold">{t('communityChatTitle')}</h2>
          <span className="text-sm text-muted-foreground">{user ? t('communityChatDescriptionUser', { username: user.username }) : t('communityChatDescription')}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
          <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
            {isLoading && messages.length === 0 ? (
              <p className="text-center text-muted-foreground">{t('communityLoading')}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="group flex items-start space-x-4">
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                       <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-secondary">
                    <div className="flex items-baseline gap-2">
                       <p className="font-semibold text-sm">{msg.author}</p>
                       <time className="text-xs text-muted-foreground">
                         {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                       </time>
                    </div>
                    <p className="text-sm text-foreground break-words">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
             {messages.length === 0 && !isLoading && (
              <p className="text-center text-muted-foreground">{t('communityNoMessages')}</p>
             )}
          </div>
        </ScrollArea>
      </div>

      <footer className="p-2 md:p-4 bg-card border-t">
        <div className="mx-auto max-w-4xl">
          {user ? (
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('communityTypeMessage')}
                  rows={2}
                  maxLength={1000}
                  className="pr-20 resize-none"
                  disabled={isSending}
                  required
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{newMessage.length} / 1000</span>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-8 w-8 bg-accent hover:bg-accent/90"
                    disabled={isSending || !newMessage.trim()}
                  >
                    <SendHorizonal className="h-4 w-4" />
                    <span className="sr-only">{t('send')}</span>
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg">
                <p className="text-center text-muted-foreground">{t('communityLoginPrompt')}</p>
                <Button onClick={() => setAuthDialogOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t('loginRegister')}
                </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
