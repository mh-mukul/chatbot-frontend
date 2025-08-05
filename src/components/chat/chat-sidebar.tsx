"use client";

import { MoreHorizontal, Trash, Bot, SquarePen, Search, LogOut, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SettingsModal } from '@/components/chat/settings-modal';
import { LogoutConfirmationModal } from '@/components/chat/logout-confirmation-modal';
import type { Conversation, LoginResponse } from './types';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectChat,
  onCreateNewChat,
  onScroll,
  onDeleteChat,
  onLogout,
}: ChatSidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const { state } = useSidebar();
  const [user, setUser] = useState<LoginResponse['data']['user'] | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '';

  return (
    <>
      <SidebarHeader className="h-14 flex flex-row items-center justify-between p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center p-2 group-data-[collapsible=icon]:hidden">
          <Bot size={24} className="text-primary" />
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent onScroll={onScroll}>
        <div className='p-2'>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
            onClick={onCreateNewChat}
          >
            <SquarePen size={16} />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <Search size={16} />
            <span className="group-data-[collapsible=icon]:hidden">Search Chats</span>
          </Button>
        </div>
        {state === 'expanded' && (
          <SidebarMenu className="px-2">
            <p className="text-xs text-muted-foreground pt-2 px-3 group-data-[collapsible=icon]:hidden">
              Chats
            </p>
            {conversations.map((conv) => (
              <SidebarMenuItem
                key={conv.id}
                onMouseEnter={() => setHoveredChatId(conv.id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <SidebarMenuButton
                  onClick={() => onSelectChat(conv.id)}
                  isActive={conv.id === activeConversationId}
                  className="w-full justify-start group-data-[collapsible=icon]:justify-center relative pr-10"
                >
                  <span className="truncate group-data-[collapsible=icon]:hidden p-1">
                    {conv.title || 'New Chat'}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md p-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground ${hoveredChatId === conv.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={16} />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(conv.id);
                        }}
                        className="text-red-500 dark:text-red-500 focus:text-red-500 dark:focus:text-red-500 focus:bg-red-300 dark:focus:bg-red-900/50"
                      >
                        <Trash size={16} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarContent>
      <div className="flex items-center justify-start w-full p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-full justify-start px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:px-0"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image_url || ''} alt={user?.name || ''} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 ml-2 overflow-hidden text-left group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsLogoutModalOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={onLogout}
        userEmail={user?.email || null}
      />
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
