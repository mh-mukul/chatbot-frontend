"use client"

import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

import type { Message } from './types';

interface ChatThreadProps {
  messages: Message[];
  onSendMessage: (input: string, originalMsgId?: number) => Promise<void>;
  isSendingMessage?: boolean;
}

export function ChatThread({ messages, onSendMessage, isSendingMessage }: ChatThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef} viewportRef={viewportRef}>
        <div className="p-4 md:p-6 space-y-6 w-full md:max-w-[80%] md:mx-auto">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} onSendMessage={onSendMessage} />
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/80 backdrop-blur-sm">
        <div className="w-full md:max-w-[80%] md:mx-auto">
          <ChatInput onSendMessage={onSendMessage} isSendingMessage={isSendingMessage || false} />
        </div>
      </div>
    </div>
  );
}
