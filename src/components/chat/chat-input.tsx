'use client';
import { useState, useRef, type KeyboardEvent, useEffect, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Paperclip, Mic, Sparkles, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, file?: File) => void;
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  onBrowsePrompts: () => void;
}

export function ChatInput({ onSend, isLoading, value, onChange, onBrowsePrompts }: ChatInputProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendClick = () => {
    if (value.trim() || file) {
      onSend(value, file ?? undefined);
      onChange('');
      setFile(null);
      setFilePreview(null);
    }
  };

  useEffect(() => {
    if (!value && !filePreview && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  }, [value, filePreview])

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSendClick(); }} className="w-full">
        <div className="relative flex flex-col gap-2 rounded-lg border bg-background p-2 pr-14 min-h-[100px]">
          {filePreview && (
            <div className="relative w-24 h-24 mb-2">
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/70 text-white hover:text-white"
                    onClick={handleRemoveFile}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Describe the image or ask a question..."
            rows={1}
            maxLength={3000}
            className="pr-12 resize-none max-h-48 border-0 focus-visible:ring-0 shadow-none p-0"
            disabled={isLoading}
          />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          <div className="flex items-center justify-between flex-wrap gap-y-2 mt-auto">
            <div className="flex items-center gap-1 flex-wrap">
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={handleAttachClick}>
                    <Paperclip className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Attach</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <Mic className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Voice Message</span>
                </Button>
                <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onBrowsePrompts}>
                    <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline ml-1">Browse Prompts</span>
                </Button>
            </div>
            <span className="text-xs text-muted-foreground">{value.length}/3,000</span>
          </div>
          <Button
              type="submit"
              size="icon"
              className='h-8 w-8 absolute top-3 right-3 bg-accent hover:bg-accent/90'
              disabled={isLoading || (!value.trim() && !file)}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
    </form>
  );
}
