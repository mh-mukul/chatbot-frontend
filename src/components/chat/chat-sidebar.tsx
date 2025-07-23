"use client";

import { MoreHorizontal, Trash, Bot, SquarePen, Search } from 'lucide-react';
import { useState } from 'react';
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
} from '@/components/ui/dropdown-menu';
import { ChatHeader } from './chat-header';
import type { Conversation } from './types';

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
            onClick={onCreateNewChat}
          >
            <Search size={16} />
            <span className="group-data-[collapsible=icon]:hidden">Search Chat</span>
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
                    {conv.messages.find((msg) => msg.role === 'user')?.content || 'New Chat'}
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
                        className="flex items-center gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:bg-destructive/90 focus:text-destructive-foreground"
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
      <ChatHeader onLogout={onLogout} />
    </>
  );
}
