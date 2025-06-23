'use client';
import { User, ThumbsUp } from 'lucide-react';
import { BitoIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Message } from './chat-panel';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string) => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isModel = message.role === 'model';

  return (
    <div className={cn('flex items-start space-x-4', !isModel && 'flex-row-reverse space-x-reverse')}>
      <Avatar className="h-8 w-8 border">
        <AvatarFallback className={cn(isModel ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
          {isModel ? <BitoIcon className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-3",
        isModel ? 'bg-secondary' : 'bg-primary text-primary-foreground'
      )}>
        <div className="prose prose-sm max-w-none text-current whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
        {isModel && (
          <div className="flex items-center pt-2 -ml-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => onFeedback(message.id)}>
              <ThumbsUp className="h-4 w-4 mr-2" />
              Improve this response
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
