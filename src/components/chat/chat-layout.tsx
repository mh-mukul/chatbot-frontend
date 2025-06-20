"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, LogOut } from 'lucide-react';
import type { Conversation, Message, Chat, Pagination, ChatHistoryResponse } from './types';
import { suggestFollowUpQuestions } from '@/ai/flows/suggest-follow-up-questions';
import { summarizeConversation } from '@/ai/flows/summarize-conversation';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
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
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]); // New state for active chat messages
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false); // New state for loading chat messages

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const storedEmployeeId = localStorage.getItem('employeeId'); // Assuming employeeId is stored here
      if (isLoggedIn === 'true' && storedEmployeeId) {
        setIsAuthenticated(true);
        setEmployeeId(storedEmployeeId);
      } else {
        router.push('/login');
      }
    }
  }, [isClient, router]);

  const fetchChatHistory = useCallback(async (page: number = 1) => {
    if (!employeeId) return;

    setIsLoadingHistory(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      if (!baseUrl || !apiKey) {
        console.error("API Base URL or API Key not configured in .env");
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "API Base URL or API Key is missing.",
        });
        setIsLoadingHistory(false);
        return;
      }

      const url = `${baseUrl}/api/v1/chat?user_id=${employeeId}&page=${page}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatHistoryResponse = await response.json();

      if (data.status === 200 && data.data) {
        setChatHistory(prevHistory => [...prevHistory, ...data.data.chats]);
        setPagination(data.data.pagination);

        // Convert fetched chats to Conversation format for display in sidebar
        const newConversations: Conversation[] = data.data.chats.map(chat => ({
          id: chat.session_id, // Use session_id as conversation ID
          title: chat.message.content, // Use the first message content as title
          messages: [{
            id: chat.id.toString(),
            role: chat.message.type === 'human' ? 'user' : 'assistant',
            content: chat.message.content,
          }],
        }));

        setConversations(prevConversations => {
          const existingSessionIds = new Set(prevConversations.map(conv => conv.id));
          const uniqueNewConversations = newConversations.filter(conv => !existingSessionIds.has(conv.id));
          
          // Group messages by session_id to form conversations
          const groupedChats = [...prevConversations];
          uniqueNewConversations.forEach(newConv => {
            const existingConvIndex = groupedChats.findIndex(gc => gc.id === newConv.id);
            if (existingConvIndex > -1) {
              // If conversation already exists, add message to it
              groupedChats[existingConvIndex].messages.push(...newConv.messages);
            } else {
              // Otherwise, add new conversation
              groupedChats.push(newConv);
            }
          });
          
          // Sort conversations by date_time of their latest message (most recent first)
          groupedChats.sort((a, b) => {
            const lastMessageA = a.messages[a.messages.length - 1];
            const lastMessageB = b.messages[b.messages.length - 1];
            // Assuming message ID can be used for sorting or add date_time to Message interface
            // For now, using chat.date_time from the backend response for sorting
            const chatA = data.data.chats.find(c => c.session_id === a.id);
            const chatB = data.data.chats.find(c => c.session_id === b.id);
            return new Date(chatB?.date_time || 0).getTime() - new Date(chatA?.date_time || 0).getTime();
          });

          return groupedChats;
        });

      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: data.message || "Failed to fetch chat history.",
        });
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the backend.",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [employeeId, toast]);

  useEffect(() => {
    if (isAuthenticated && employeeId) {
      fetchChatHistory(1); // Fetch initial history on authentication
    }
  }, [isAuthenticated, employeeId, fetchChatHistory]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleCreateNewChat = () => {
    setActiveConversationId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const handleSelectChat = useCallback(async (sessionId: string) => {
    setActiveConversationId(sessionId);
    setActiveChatMessages([]); // Clear previous messages

    setIsLoadingChatMessages(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const apiKey = process.env.NEXT_PUBLIC_API_KEY;

      if (!baseUrl || !apiKey) {
        console.error("API Base URL or API Key not configured in .env");
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "API Base URL or API Key is missing.",
        });
        setIsLoadingChatMessages(false);
        return;
      }

      const url = `${baseUrl}/api/v1/chat/${sessionId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: { status: number; message: string; data: Chat[] } = await response.json();

      if (data.status === 200 && data.data) {
        const fetchedMessages: Message[] = data.data.map(chat => ({
          id: chat.id.toString(),
          role: chat.message.type === 'human' ? 'user' : 'assistant',
          content: chat.message.content,
        }));
        setActiveChatMessages(fetchedMessages);
      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: data.message || "Failed to fetch chat messages.",
        });
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the backend.",
      });
    } finally {
      setIsLoadingChatMessages(false);
    }
  }, [toast]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && pagination?.next_page_url && !isLoadingHistory) {
      const nextPage = (pagination.current_page || 0) + 1;
      fetchChatHistory(nextPage);
    }
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
      <header className="fixed top-0 left-0 right-0 z-10 p-4 bg-background/80 backdrop-blur-sm flex items-center justify-between w-full md:justify-end">
        {/* Sidebar toggle for mobile */}
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="p-0"> {/* Remove padding to prevent dot */}
              <ThemeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <Sidebar side="left" collapsible="icon">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
        />
      </Sidebar>
      <SidebarInset className="pt-16"> {/* Add padding-top to account for fixed header */}
        {isLoadingChatMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <ChatThread
            conversation={activeConversationId ? { id: activeConversationId, title: activeConversation?.title || 'Chat', messages: activeChatMessages } : undefined}
            onSendMessage={handleSendMessage}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
