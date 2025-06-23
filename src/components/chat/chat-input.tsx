'use client';
import { useState, useRef, type KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Paperclip, Mic, Sparkles } from 'lucide-react';

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
    <form onSubmit={(e) => { e.preventDefault(); handleSendClick(); }} className="w-full">
        <div className="relative flex flex-col gap-2 rounded-lg border bg-background p-2 pr-14 min-h-[100px]">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Summarize the latest..."
            rows={1}
            maxLength={3000}
            className="pr-12 resize-none max-h-48 border-0 focus-visible:ring-0 shadow-none p-0"
            disabled={isLoading}
          />
          <div className="flex items-center justify-between flex-wrap gap-y-2 mt-auto">
            <div className="flex items-center gap-1 flex-wrap">
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Paperclip className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Attach</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Mic className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Voice Message</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Browse Prompts</span>
                </Button>
            </div>
            <span className="text-xs text-muted-foreground">{text.length}/3,000</span>
          </div>
          <Button
              type="submit"
              size="icon"
              className='h-8 w-8 absolute top-3 right-3 bg-accent hover:bg-accent/90'
              disabled={isLoading || !text.trim()}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
    </form>
  );
}
