"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Conversation, Message } from './types';
import { suggestFollowUpQuestions } from '@/ai/flows/suggest-follow-up-questions';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ChatSidebar } from './chat-sidebar';
import { ChatThread } from './chat-thread';

const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Getting started',
    messages: [
      { id: 'msg-1', role: 'user', content: 'What can you do?' },
      { id: 'msg-2', role: 'assistant', content: 'I can help you with a variety of tasks! I am powered by Genkit and can leverage different AI models and tools. For this demo, I can summarize our conversation and suggest follow-up questions.' },
    ],
  },
];

export function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (isLoggedIn === 'true') {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
    }
  }, [isClient, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setConversations(initialConversations);
      if (initialConversations.length > 0) {
        setActiveConversationId(initialConversations[0].id);
      }
    }
  }, [isAuthenticated]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleCreateNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (input: string) => {
    let currentConversationId = activeConversationId;
    let newConversations = [...conversations];

    if (!currentConversationId) {
      const newConversation: Conversation = {
        id: `conv-${crypto.randomUUID()}`,
        title: 'New Chat',
        messages: [],
      };
      newConversations.unshift(newConversation);
      currentConversationId = newConversation.id;
      setActiveConversationId(currentConversationId);
      setConversations(newConversations);
    }
    
    const userMessage: Message = { id: `msg-${crypto.randomUUID()}`, role: 'user', content: input };
    const assistantMessage: Message = { id: `msg-${crypto.randomUUID()}`, role: 'assistant', content: '', isGenerating: true };

    const updatedConversations = newConversations.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: [...conv.messages, userMessage, assistantMessage] };
      }
      return conv;
    });
    setConversations(updatedConversations);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const aiResponseContent = `This is a simulated response to: "${input}". The real AI power comes from integrating flows like summarization and question suggestion.`;

      const conversationHistory = updatedConversations
        .find(c => c.id === currentConversationId)?.messages
        .map(m => `${m.role}: ${m.content}`).join('\n') || '';

      const suggestions = await suggestFollowUpQuestions({
        conversationHistory,
        currentResponse: aiResponseContent
      });

      const finalConversationsWithResponse = updatedConversations.map(conv => {
        if (conv.id === currentConversationId) {
          const updatedMessages = conv.messages.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, content: aiResponseContent, isGenerating: false, suggestedQuestions: suggestions.followUpQuestions }
              : msg
          );
          return { ...conv, messages: updatedMessages };
        }
        return conv;
      });
      setConversations(finalConversationsWithResponse);

      const convForTitle = finalConversationsWithResponse.find(c => c.id === currentConversationId);
      if (convForTitle && convForTitle.messages.length === 2) {
        const fullHistory = convForTitle.messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const summary = await summarizeConversation({ conversationHistory: fullHistory });

        const titleUpdatedConversations = finalConversationsWithResponse.map(conv => {
            if (conv.id === currentConversationId) {
                return { ...conv, title: summary.summary };
            }
            return conv;
        });
        setConversations(titleUpdatedConversations);
      }
    } catch (error) {
      console.error("AI flow error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error communicating with the AI.",
      });
      const errorStateConversations = updatedConversations.map(conv => {
        if (conv.id === currentConversationId) {
            return { ...conv, messages: conv.messages.filter(m => m.id !== assistantMessage.id) };
        }
        return conv;
      });
      setConversations(errorStateConversations);
    }
  };

  if (!isClient || !isAuthenticated) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
        />
      </Sidebar>
      <SidebarInset>
        <ChatThread
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
