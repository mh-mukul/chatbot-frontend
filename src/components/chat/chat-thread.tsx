"use client"
import type { Conversation } from './types';
import { EmptyChat } from './empty-chat';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';

interface ChatThreadProps {
  conversation?: Conversation;
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage?: boolean; // Optional prop to indicate if a message is being sent
}

export function ChatThread({ conversation, onSendMessage }: ChatThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isFirstMessageSending, setIsFirstMessageSending] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.parentElement?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  const handleSendMessage = async (input: string) => {
    setIsFirstMessageSending(true);
    await onSendMessage(input);
    setIsFirstMessageSending(false);
  };

  if (!conversation) {
    return <EmptyChat onSendMessage={handleSendMessage} isSendingMessage={isFirstMessageSending} />;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6 space-y-6" ref={scrollAreaRef}>
          {conversation.messages.map((message) => (
            <ChatMessage key={message.id} message={message} onSendMessage={onSendMessage} />
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background/80 backdrop-blur-sm">
        <ChatInput onSendMessage={onSendMessage} isSendingMessage={isFirstMessageSending} />
      </div>
    </div>
  );
}
