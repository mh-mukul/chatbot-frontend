"use client";

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, ArrowUp, Plus, Mic, Wrench } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage: boolean; // New prop to indicate if a message is being sent
}

export function ChatInput({ onSendMessage, isSendingMessage }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxRows = 8;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const currentRows = Math.ceil(scrollHeight / lineHeight);

      if (currentRows > maxRows) {
        textareaRef.current.style.overflowY = 'auto';
        textareaRef.current.style.height = `${maxRows * lineHeight}px`;
      } else {
        textareaRef.current.style.overflowY = 'hidden';
        textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSendingMessage) return; // Use isSendingMessage from props

    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 w-full">
      {/* Left side buttons */}
      <div className="absolute bottom-[5px] left-[10px] flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full"
        >
          <Plus size={16} />
          <span className="sr-only">Add attachment</span>
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full"
        >
          <Wrench size={16} />
          <span className="sr-only">Tools</span>
        </Button>
      </div>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        ref={textareaRef}
        className="pl-5 resize-none w-full rounded-xl"
        disabled={isSendingMessage}
      />

      {/* Right side buttons */}
      <div className="absolute bottom-[5px] right-[5px] flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full"
        >
          <Mic size={16} />
          <span className="sr-only">Voice input</span>
        </Button>
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          disabled={isSendingMessage || !input.trim()}
        >
          <ArrowUp size={16} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
}
