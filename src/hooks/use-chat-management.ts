import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { Conversation, Message, Chat, Pagination } from '@/components/chat/types';
import { useToast } from '@/hooks/use-toast';
import { fetchChatHistory, fetchChatMessages, sendMessage, deleteChat, getChatTitle } from '@/api/chat';
import { logout } from '@/api/auth';
import { clearTokens, getRefreshToken, redirectToLogin } from '@/lib/auth-utils';
import { useIsMobile } from '@/hooks/use-mobile';

export function useChatManagement() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDeleteId, setChatToDeleteId] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isUrlNavigation, setIsUrlNavigation] = useState(false);
  const previousSessionIdRef = useRef<string | null>(null);

  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Define handleSelectChat first since it's used in the URL-based navigation effect
  const handleSelectChat = useCallback(async (sessionId: string) => {
    // Skip if we're already on this chat
    if (sessionId === activeConversationId && activeChatMessages.length > 0) {
      return;
    }

    setActiveConversationId(sessionId);
    setCurrentSessionId(sessionId);
    setActiveChatMessages([]);
    previousSessionIdRef.current = sessionId;

    // Only update the URL if not coming from URL navigation
    if (!isUrlNavigation) {
      router.push(`/chat/${sessionId}`);
    }

    setIsLoadingChatMessages(true);
    try {
      const response = await fetchChatMessages(sessionId);

      if (response.status === 200 && response.data) {
        const fetchedMessages: Message[] = response.data.map((chat: Chat) => ({
          id: chat.id.toString(),
          role: chat.type === 'human' ? 'user' : 'assistant',
          content: chat.message,
          createdAt: new Date(chat.date_time).getTime(),
          duration: chat.duration ?? undefined,
        }));
        setActiveChatMessages(fetchedMessages);
      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: response.message || "Failed to fetch chat messages.",
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
  }, [activeConversationId, activeChatMessages.length, isUrlNavigation, router, toast]);

  useEffect(() => {
    if (isClient) {
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken) {
        setIsAuthenticated(true);

        // Extract session ID from the path if we're on a specific chat page
        if (pathname && pathname.startsWith('/chat/')) {
          const sessionId = pathname.split('/').pop();
          if (sessionId && sessionId !== previousSessionIdRef.current) {
            previousSessionIdRef.current = sessionId;
            setActiveConversationId(sessionId);
            setCurrentSessionId(sessionId);
            // Set flag to trigger URL-based navigation
            setIsUrlNavigation(true);
          }
        }
      } else {
        router.push('/login');
      }
    }
  }, [isClient, router, pathname]);

  // Effect to handle URL-based navigation after handleSelectChat is defined
  useEffect(() => {
    if (isUrlNavigation && isAuthenticated && activeConversationId) {
      handleSelectChat(activeConversationId);
      setIsUrlNavigation(false);
    }
  }, [isUrlNavigation, isAuthenticated, activeConversationId, handleSelectChat]);

  const fetchChatHistoryHandler = useCallback(async (page: number = 1) => {
    if (!isAuthenticated) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetchChatHistory(page, isMobileRef.current ? 20 : 30);

      if (response.status === 200 && response.data) {
        setPagination(response.data.pagination);

        const newConversations: Conversation[] = response.data.sessions.map((session) => ({
          id: session.session_id,
          title: session.title,
          messages: [],
          date_time: session.date_time,
        }));

        setConversations(prevConversations => {
          const existingSessionIds = new Set(prevConversations.map(conv => conv.id));
          const uniqueNewConversations = newConversations.filter(conv => !existingSessionIds.has(conv.id));

          const groupedChats = [...prevConversations];
          uniqueNewConversations.forEach(newConv => {
            const existingConvIndex = groupedChats.findIndex(gc => gc.id === newConv.id);
            if (existingConvIndex > -1) {
              groupedChats[existingConvIndex].messages.push(...newConv.messages);
            } else {
              groupedChats.push(newConv);
            }
          });

          groupedChats.sort((a, b) => {
            const lastMessageA = a.messages[a.messages.length - 1];
            const lastMessageB = b.messages[b.messages.length - 1];
            return new Date(b.date_time || 0).getTime() - new Date(a.date_time || 0).getTime();
          });

          return groupedChats;
        });

      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: response.message || "Failed to fetch chat history.",
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
  }, [isAuthenticated, toast]);

  useEffect(() => {
    if (isAuthenticated && !initialLoadComplete) {
      fetchChatHistoryHandler(1);
      setInitialLoadComplete(true);
    }
  }, [isAuthenticated, fetchChatHistoryHandler, initialLoadComplete]);

  const handleCreateNewChat = useCallback(() => {
    if (activeConversationId) {
      setActiveConversationId(null);
      setCurrentSessionId(null);
      setActiveChatMessages([]);
      previousSessionIdRef.current = null;
      router.push('/chat');
    }
  }, [router, activeConversationId]);

  const handleLogout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout API error:", error);
      }
    }
    clearTokens();
    redirectToLogin();
  }, []);

  const handleDeleteChat = useCallback((sessionId: string) => {
    setChatToDeleteId(sessionId);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDeleteChat = useCallback(async () => {
    if (!chatToDeleteId) return;

    try {
      await deleteChat(chatToDeleteId);
      setConversations(prevConversations => prevConversations.filter(conv => conv.id !== chatToDeleteId));
      if (activeConversationId === chatToDeleteId) {
        setActiveConversationId(null);
        setActiveChatMessages([]);
        setCurrentSessionId(null);
      }
      toast({
        title: "Chat Deleted",
        description: "The chat has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat.",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setChatToDeleteId(null);
    }
  }, [chatToDeleteId, activeConversationId, toast]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && pagination?.next_page_url && !isLoadingHistory) {
      const nextPage = (pagination.current_page || 0) + 1;
      fetchChatHistoryHandler(nextPage);
    }
  }, [pagination, isLoadingHistory, fetchChatHistoryHandler]);

  const handleSendMessage = useCallback(async (input: string) => {
    if (!isAuthenticated || isSendingMessage) return;

    let newSessionId = currentSessionId;
    if (!newSessionId) {
      newSessionId = Date.now().toString();
      setCurrentSessionId(newSessionId);
    }

    if (!activeConversationId) {
      setActiveConversationId(newSessionId);
    }

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: input,
      createdAt: Date.now(),
    };

    const assistantPlaceholder: Message = {
      id: Date.now().toString() + '-assistant-placeholder',
      role: 'assistant',
      content: '',
      isGenerating: true,
      createdAt: Date.now(),
    };

    setActiveChatMessages(prevMessages => [...prevMessages, userMessage, assistantPlaceholder]);
    setIsSendingMessage(true);

    try {
      const response = await sendMessage(input, currentSessionId || undefined);

      if (response.status === 200 && response.data) {
        const newSessionId = response.data.session_id;
        const assistantResponseContent = response.data.response;
        const assistantResponseDuration = response.data.duration;

        setCurrentSessionId(newSessionId);

        setActiveChatMessages(prevMessages => prevMessages.map(msg =>
          msg.id === assistantPlaceholder.id
            ? {
              ...msg,
              content: assistantResponseContent,
              isGenerating: false,
              createdAt: Date.now(),
              duration: assistantResponseDuration
            }
            : msg
        ));

        setConversations(prevConversations => {
          const existingConversationIndex = prevConversations.findIndex(conv => conv.id === newSessionId);
          const newAssistantMessage: Message = {
            id: Date.now().toString() + '-assistant',
            role: 'assistant',
            content: assistantResponseContent,
            createdAt: Date.now(),
            duration: assistantResponseDuration,
          };

          if (existingConversationIndex > -1) {
            const updatedConversations = [...prevConversations];
            const updatedIndex = updatedConversations.findIndex(conv => conv.id === newSessionId);
            if (updatedIndex > -1) {
              const [updatedConversation] = updatedConversations.splice(updatedIndex, 1);
              updatedConversation.messages.push(userMessage, newAssistantMessage);
              updatedConversation.date_time = new Date().toISOString();
              updatedConversations.unshift(updatedConversation);
            }
            return updatedConversations;
          } else {
            const newConversation: Conversation = {
              id: newSessionId,
              title: 'New Chat',
              messages: [userMessage, newAssistantMessage],
              date_time: new Date().toISOString(),
            };
            return [newConversation, ...prevConversations];
          }
        });

        if (!activeConversationId) {
          setActiveConversationId(newSessionId);
          router.push(`/chat/${newSessionId}`);
        }
        
        if (!activeConversationId) {
          try {
            const titleResponse = await getChatTitle(input, newSessionId);
            if (titleResponse.status === 200 && titleResponse.data) {
              setConversations(prevConversations => {
                const updatedConversations = [...prevConversations];
                const conversationIndex = updatedConversations.findIndex(conv => conv.id === newSessionId);
                if (conversationIndex > -1) {
                  updatedConversations[conversationIndex].title = titleResponse.data.title;
                }
                return updatedConversations;
              });
            }
          } catch (error) {
            console.error("Error fetching chat title:", error);
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "API Error",
          description: response.message || "Failed to get chat response.",
        });
        setActiveChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantPlaceholder.id));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the backend or an unexpected error occurred.",
      });
      setActiveChatMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantPlaceholder.id));
    } finally {
      setIsSendingMessage(false);
    }
  }, [isAuthenticated, isSendingMessage, currentSessionId, activeConversationId, toast, router]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return {
    conversations,
    activeConversationId,
    activeChatMessages,
    currentSessionId,
    isSendingMessage,
    isClient,
    isAuthenticated,
    isLoadingHistory,
    isLoadingChatMessages,
    isDeleteDialogOpen,
    chatToDeleteId,
    activeConversation,
    setIsDeleteDialogOpen,
    handleCreateNewChat,
    handleLogout,
    handleDeleteChat,
    confirmDeleteChat,
    handleSelectChat,
    handleScroll,
    handleSendMessage,
  };
}