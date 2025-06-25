
'use client';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, RefreshCw, Pencil, Clipboard, Check } from 'lucide-react';
import { BitoIcon, UserIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Message } from './chat-panel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ImagePreviewDialog } from './image-preview-dialog';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Skeleton } from '../ui/skeleton';

interface ChatMessageProps {
  message: Message;
  onFeedback: (messageId: string) => void;
  onRegenerate: (messageId: string) => void;
  onStartEdit: (messageId: string, content: string) => void;
  isRegenerating?: boolean;
}

const ChatMessageModel = ({ message, onFeedback, onRegenerate, isRegenerating }: Pick<ChatMessageProps, 'message' | 'onFeedback' | 'onRegenerate' | 'isRegenerating'>) => {
  const { t } = useLanguage();
  
  const CodeBlock = ({ node, ...props }: any) => {
    const [hasCopied, setHasCopied] = useState(false);
    const codeString = node?.children[0]?.children[0]?.value;

    const onCopy = () => {
      if (codeString) {
        navigator.clipboard.writeText(codeString).then(() => {
          setHasCopied(true);
          setTimeout(() => {
            setHasCopied(false);
          }, 2000);
        });
      }
    };

    return (
      <div className="relative group">
        <pre {...props} />
        <Button
          size="icon"
          variant="ghost"
          onClick={onCopy}
          className="absolute top-2 right-2 h-7 w-7 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={t('copyCode')}
        >
          {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
        </Button>
      </div>
    );
  };

  return (
    <div className="group flex items-start gap-3 justify-start">
      <Avatar className="h-8 w-8 border flex-shrink-0">
        <AvatarFallback className='bg-primary text-primary-foreground'>
          <BitoIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-2 w-full max-w-[85%] sm:max-w-[80%] lg:max-w-[85%]">
        <div className="min-w-0 w-full flex-shrink rounded-lg bg-secondary px-4 py-3">
          {isRegenerating ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            message.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: CodeBlock,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )
          )}
        </div>
        <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-start", isRegenerating && "hidden")}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onFeedback(message.id)}>
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onRegenerate(message.id)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};


const ChatMessageUser = ({ 
  message, 
  onStartEdit,
}: Pick<ChatMessageProps, 'message' | 'onStartEdit'>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="group flex items-start gap-3 justify-end">
      <div className="flex flex-col items-end gap-1 w-full max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] order-1">
        <div className="min-w-0 w-fit flex-shrink rounded-lg bg-secondary px-4 py-3 max-w-full">
            {message.content && (
              <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            {message.imageUrl && (
              <>
                <div 
                  className={cn("mt-2 rounded-lg overflow-hidden border cursor-pointer", !message.content && "mt-0")}
                  onClick={() => setIsModalOpen(true)}
                >
                  <img 
                    src={message.imageUrl} 
                    alt="User upload" 
                    className="max-w-sm w-full h-auto" 
                  />
                </div>
                {isModalOpen && <ImagePreviewDialog isOpen={isModalOpen} onOpenChange={setIsModalOpen} imageUrl={message.imageUrl} />}
              </>
            )}
          </div>
        <div className="flex items-center self-end opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onStartEdit(message.id, message.content)}>
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Avatar className="h-8 w-8 border flex-shrink-0 order-2">
        <AvatarFallback>
          <UserIcon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
};


export function ChatMessage(props: ChatMessageProps) {
  const { message } = props;

  if (message.role === 'model') {
    return <ChatMessageModel {...props} />;
  }

  if (message.role === 'user') {
    return <ChatMessageUser {...props} />;
  }

  return null;
}
