
'use client';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Skeleton } from '@/components/ui/skeleton';
import { BitoIcon } from '@/components/icons';
import type { Message } from './chat-panel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: string;
  email: string;
  username: string;
  credits: number;
  role: 'user' | 'admin';
}

interface ChatMessagesProps {
  user: User | null;
  messages: Message[];
  isLoading: boolean;
  onFeedback: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  onStartEdit: (messageId: string, content: string) => void;
  regeneratingMessageId: string | null;
  editingMessageId: string | null;
  onCancelEdit: () => void;
  onSaveEdit: (messageId: string, newContent: string) => void;
}

export function ChatMessages({ 
    user,
    messages, 
    isLoading, 
    onFeedback,
    onRegenerate,
    onStartEdit,
    regeneratingMessageId,
    editingMessageId,
    onCancelEdit,
    onSaveEdit
}: ChatMessagesProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current && !editingMessageId) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading, regeneratingMessageId, editingMessageId]);

  return (
    <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
      <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            user={user}
            message={message} 
            onFeedback={onFeedback}
            onRegenerate={onRegenerate}
            onStartEdit={onStartEdit}
            isRegenerating={regeneratingMessageId === message.id}
            editingMessageId={editingMessageId}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
          />
        ))}
        {isLoading && (
            <div className="flex items-start space-x-4">
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <BitoIcon className="h-5 w-5" />
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1 pt-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        )}
      </div>
    </ScrollArea>
  );
}
