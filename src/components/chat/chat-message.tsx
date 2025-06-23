'use client';
import { User } from 'lucide-react';
import { ScriptIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Message } from './chat-panel';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string) => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isModel = message.role === 'model';

  return (
    <div className={cn('flex items-start space-x-4')}>
      <Avatar className="h-8 w-8 border">
        {isModel ? (
          <AvatarFallback className='bg-primary text-primary-foreground'>
            <ScriptIcon className="h-5 w-5" />
          </AvatarFallback>
        ) : (
          <>
            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="woman portrait" />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-3",
        isModel ? 'bg-secondary' : 'bg-secondary'
      )}>
        <div className="prose prose-sm max-w-none text-current whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
      </div>
    </div>
  );
}
