"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage: boolean; // New prop to indicate if a message is being sent
}

export function ChatInput({ onSendMessage, isSendingMessage }: ChatInputProps) {
  const [input, setInput] = useState('');
  // Remove local isLoading state, use isSendingMessage from props

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
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Smart Buddy anything..."
        className="min-h-[40px] pr-12 resize-none"
        rows={1}
        disabled={isSendingMessage} // Use isSendingMessage from props
      />
      <Button
        type="submit"
        size="icon"
        className="absolute bottom-[5px] right-[5px] h-8 w-8 shrink-0"
        disabled={isSendingMessage || !input.trim()} // Use isSendingMessage from props
      >
        <Send size={16} />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
