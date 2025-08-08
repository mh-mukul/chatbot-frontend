'use client';
import { FC, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchChatHistory as fetchChatHistoryApi, searchChats } from '@/api/chat';
import { Session } from './types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchResults, setSearchResults] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch initial chat history when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    try {
      // Use the fetchChatHistory function from chat.ts
      const response = await fetchChatHistoryApi(1, 50);

      if (response.status === 200 && response.data && response.data.sessions) {
        // Make sure sessions is an array before setting state
        if (Array.isArray(response.data.sessions)) {
          setSessions(response.data.sessions);
        } else {
          console.error("Sessions data is not an array:", response.data);
          setSessions([]);
          toast({
            variant: "destructive",
            title: "Data Format Error",
            description: "Chat history returned an unexpected data format.",
          });
        }
      } else {
        console.error("API Error in fetchChatHistory:", response);
        setSessions([]);
        toast({
          variant: "destructive",
          title: "API Error",
          description: response.message || "Failed to fetch chat history.",
        });
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setSessions([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch chat history.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Set new timeout (500ms debounce)
    const timeout = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Use the searchChats function from chat.ts
        const response = await searchChats(query);

        if (response.status === 200 && response.data) {
          // Ensure data exists and is an array before setting state
          if (Array.isArray(response.data)) {
            setSearchResults(response.data);
          } else {
            console.error("Search API returned non-array data:", response.data);
            setSearchResults([]);
            toast({
              variant: "destructive",
              title: "Data Format Error",
              description: "The search returned an unexpected data format.",
            });
          }
        } else {
          console.error("Search API error:", response);
          setSearchResults([]);
          toast({
            variant: "destructive",
            title: "Search Error",
            description: response.message || "Failed to search chats.",
          });
        }
      } catch (error) {
        console.error("Error searching chats:", error);
        setSearchResults([]);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to search chats.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 500);

    setSearchTimeout(timeout);
  }, [searchTimeout, toast]);

  const handleChatClick = (sessionId: string) => {
    const chatUrl = `/chat/${sessionId}`;
    window.location.href = chatUrl;
    onClose();
  };

  const renderChatList = (chats: Session[]) => (
    <div className="mb-4">
      <h3 className="text-xs text-muted-foreground mb-2 px-4">Recent Chats</h3>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat.session_id}
            className="flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
            onClick={() => handleChatClick(chat.session_id)}
          >
            <MessageSquare className="w-5 h-5 mr-3 text-muted-foreground" />
            <span>{chat.title || "Untitled Chat"}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%] h-auto rounded-lg sm:max-w-[700px] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="p-2">
          <div className="flex items-center justify-between mb-4">
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent border-0 border-b rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <DialogClose className="rounded-full p-2 hover:bg-accent group">
              <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-focus:text-foreground transition-colors" />
            </DialogClose>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              {searchQuery ? (
                searchResults && searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-xs text-muted-foreground mb-2 px-4">Search Results</h3>
                    <ul>
                      {searchResults.map((result) => (
                        <li
                          key={result.session_id}
                          className="flex items-start p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={() => handleChatClick(result.session_id)}
                        >
                          <MessageSquare className="w-5 h-5 mr-3 mt-1 text-muted-foreground" />
                          <div>
                            <p className="font-semibold">{result.title || "Untitled Chat"}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.date_time).toLocaleString()}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                )
              ) : sessions && sessions.length > 0 ? (
                renderChatList(sessions)
              ) : (
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">No recent chats</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;