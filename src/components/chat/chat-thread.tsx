"use client"
import type { Conversation } from './types';
import { EmptyChat } from './empty-chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface ChatThreadProps {
  conversation?: Conversation;
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage?: boolean; // Optional prop to indicate if a message is being sent
}

export function ChatThread({ conversation, onSendMessage, isSendingMessage }: ChatThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation?.messages]);

  const handleSendMessage = async (input: string) => {
    await onSendMessage(input);
  };

  if (!conversation) {
    return <EmptyChat onSendMessage={handleSendMessage} />;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1" ref={scrollAreaRef} viewportRef={viewportRef}>
        <div className="p-4 md:p-6 space-y-6">
          {conversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} onSendMessage={onSendMessage} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <ChatInput onSendMessage={onSendMessage} isSendingMessage={isSendingMessage || false} />
      </div>
    </div>
  );
}
