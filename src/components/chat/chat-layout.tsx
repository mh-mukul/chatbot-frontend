"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User, LogOut } from 'lucide-react';
import type { Conversation, Message, Chat, Pagination } from './types';
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
import { ChatInput } from './chat-input';
import { fetchChatHistory, fetchChatMessages, sendMessage } from '@/api/chat';


export function ChatLayout() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]); // New state for active chat messages
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null); // State for current chat session ID
  const [isSendingMessage, setIsSendingMessage] = useState(false); // State for message sending loading
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

  const fetchChatHistoryHandler = useCallback(async (page: number = 1) => {
    if (!employeeId) return;

    setIsLoadingHistory(true);
    try {
      const data = await fetchChatHistory(employeeId || '', page);

      if (data.status === 200 && data.data) {
        setChatHistory(prevHistory => [...prevHistory, ...data.data.chats]);
        setPagination(data.data.pagination);

        // Convert fetched chats to Conversation format for display in sidebar
        const newConversations: Conversation[] = data.data.chats.map((chat: Chat) => ({
          id: chat.session_id, // Use session_id as conversation ID
          title: chat.message.content, // Use the first message content as title
          messages: [{
            id: chat.id.toString(),
            role: chat.message.type === 'human' ? 'user' : 'assistant',
            content: chat.message.content,
            createdAt: new Date(chat.date_time).getTime(),
          }],
          date_time: chat.date_time,
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
            return new Date(b.date_time || 0).getTime() - new Date(a.date_time || 0).getTime();
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
      fetchChatHistoryHandler(1); // Fetch initial history on authentication
    }
  }, [isAuthenticated, employeeId, fetchChatHistoryHandler]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleCreateNewChat = () => {
    setActiveConversationId(null);
    setCurrentSessionId(null); // Reset session ID for new chat
    setActiveChatMessages([]); // Clear messages for new chat
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  const handleSelectChat = useCallback(async (sessionId: string) => {
    setActiveConversationId(sessionId);
    setCurrentSessionId(sessionId); // Set current session ID when selecting a chat
    setActiveChatMessages([]); // Clear previous messages

    setIsLoadingChatMessages(true);
    try {
      const data = await fetchChatMessages(sessionId);

      if (data.status === 200 && data.data) {
        const fetchedMessages: Message[] = data.data.map((chat: Chat) => ({
          id: chat.id.toString(),
          role: chat.message.type === 'human' ? 'user' : 'assistant',
          content: chat.message.content,
          createdAt: new Date(chat.date_time).getTime(),
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
      fetchChatHistoryHandler(nextPage);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!employeeId || isSendingMessage) return;

    // Generate a new session ID if there isn't one
    let newSessionId = currentSessionId;
    if (!newSessionId) {
      newSessionId = Date.now().toString(); // Generate a unique session ID
      setCurrentSessionId(newSessionId);
    }

    // If there is no active conversation, set it to the new session ID
    if (!activeConversationId) {
      setActiveConversationId(newSessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString() + '-user', // Unique ID for user message
      role: 'user',
      content: input,
      createdAt: Date.now(),
    };

    const assistantPlaceholder: Message = {
      id: Date.now().toString() + '-assistant-placeholder', // Unique ID for placeholder
      role: 'assistant',
      content: '',
      isGenerating: true,
      createdAt: Date.now(),
    };

    setActiveChatMessages(prevMessages => [...prevMessages, userMessage, assistantPlaceholder]);
    setIsSendingMessage(true);

    try {
      const data = await sendMessage(employeeId, input, currentSessionId || undefined);

      if (data.status === 200 && data.data) {
        const newSessionId = data.data.session_id;
        const assistantResponseContent = data.data.response;

        setCurrentSessionId(newSessionId);

        setActiveChatMessages(prevMessages => prevMessages.map(msg =>
          msg.id === assistantPlaceholder.id
            ? { ...msg, content: assistantResponseContent, isGenerating: false, createdAt: Date.now() }
            : msg
        ));

        // Update conversations for sidebar
        setConversations(prevConversations => {
          const existingConversationIndex = prevConversations.findIndex(conv => conv.id === newSessionId);
          const newAssistantMessage: Message = {
            id: Date.now().toString() + '-assistant',
            role: 'assistant',
            content: assistantResponseContent,
            createdAt: Date.now(),
          };

          if (existingConversationIndex > -1) {
            // Update existing conversation
            const updatedConversations = [...prevConversations];
            updatedConversations[existingConversationIndex].messages.push(userMessage, newAssistantMessage);
            updatedConversations[existingConversationIndex].date_time = new Date().toISOString(); // Update last activity
            return updatedConversations;
          } else {
            // Create new conversation
            const newConversation: Conversation = {
              id: newSessionId,
              title: input.substring(0, 50) + (input.length > 50 ? '...' : ''), // Use first part of user query as title
              messages: [userMessage, newAssistantMessage],
              date_time: new Date().toISOString(),
            };
            return [newConversation, ...prevConversations]; // Add new conversation to the top
          }
        });

        // If it's a new conversation, set it as active
        if (!activeConversationId) {
          setActiveConversationId(newSessionId);
        }

      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: data.message || "Failed to get chat response.",
        });
        setActiveChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantPlaceholder.id)); // Remove placeholder
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the backend or an unexpected error occurred.",
      });
      setActiveChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantPlaceholder.id)); // Remove placeholder
    } finally {
      setIsSendingMessage(false);
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
          onScroll={handleScroll}
        />
      </Sidebar>
      <SidebarInset className="pt-16"> {/* Add padding-top to account for fixed header */}
        {isLoadingChatMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          activeConversationId ? (
            <ChatThread
              conversation={{ id: activeConversationId, title: activeConversation?.title || 'Chat', messages: activeChatMessages }}
              onSendMessage={handleSendMessage}
              isSendingMessage={isSendingMessage}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center w-full">
                <div className="flex flex-col items-center justify-center text-center max-w-md  p-6">
                  <h1 className="text-3xl font-semibold text-foreground">
                    Where should we begin?
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    I can help you with a variety of tasks. Start a conversation below.
                  </p>
                </div>
                <div className="max-w-[70%] w-full p-4">
                  <ChatInput onSendMessage={handleSendMessage} isSendingMessage={isSendingMessage} />
                </div>
              </div>
            </div>
          )
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
