'use client';
import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendClick = () => {
    if (text.trim()) {
      onSend(text);
      setText('');
    }
  };

  useEffect(() => {
    if (!text && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  }, [text])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendClick();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSendClick(); }} className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Message Bito AI..."
        rows={1}
        className="pr-12 resize-none max-h-48 py-3 leading-6"
        disabled={isLoading}
      />
      <div className="absolute bottom-2.5 right-3">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="submit"
                        size="icon"
                        className='h-8 w-8'
                        disabled={isLoading || !text.trim()}
                    >
                    <SendHorizonal className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Send message</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>
    </form>
  );
}
