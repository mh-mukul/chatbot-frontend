"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchSharedChat } from '@/api/chat';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/components/chat/chat-message';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SharedChatPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : '';

  useEffect(() => {
    if (sessionId) {
      const loadChat = async () => {
        setIsLoading(true);
        const response = await fetchSharedChat(sessionId);
        if (response.status === 200 && response.data) {
          // Create separate messages for human and AI responses
          const formattedMessages: Message[] = [];
          response.data.forEach((chatItem) => {
            // Add human message
            formattedMessages.push({
              id: `${chatItem.id}-human`,
              role: 'user',
              content: chatItem.human_message,
              createdAt: new Date(chatItem.date_time).getTime() - 1000, // 1 second before AI message
            });

            // Add AI message
            formattedMessages.push({
              id: `${chatItem.id}-ai`,
              role: 'assistant',
              content: chatItem.ai_message,
              createdAt: new Date(chatItem.date_time).getTime(),
              duration: chatItem.duration,
            });
          });
          setMessages(formattedMessages);
        } else {
          toast({
            title: 'Error',
            description: response.message || 'Failed to load shared chat.',
            variant: 'destructive',
          });
          router.push('/');
        }
        setIsLoading(false);
      };
      loadChat();
    }
  }, [sessionId, router, toast]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Shared Chat</h1>
        <Button onClick={() => router.push('/chat')} variant="outline">
          Back to Chats
        </Button>
      </div>
      <div className="flex-1 p-4 md:p-6 space-y-6 w-full md:max-w-[80%] md:mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} onSendMessage={() => Promise.resolve()} isPublic={true} />
        ))}
      </div>
      <div className="p-4 border-t items-center flex justify-center">
        <Button onClick={() => router.push('/chat')} className="w-[60%]">
          Continue to Chats
        </Button>
      </div>
    </div>
  );
}