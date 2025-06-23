'use client';
import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Skeleton } from '@/components/ui/skeleton';
import { ScriptIcon } from '@/components/icons';
import type { Message } from './chat-panel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onFeedback: (messageId: string) => void;
}

export function ChatMessages({ messages, isLoading, onFeedback }: ChatMessagesProps) {
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
      <div className="space-y-6 p-4 md:p-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onFeedback={onFeedback} />
        ))}
        {isLoading && (
            <div className="flex items-start space-x-4">
                <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        <ScriptIcon className="h-5 w-5" />
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
