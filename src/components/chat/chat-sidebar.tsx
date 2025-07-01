"use client";

import { Plus, MessageSquare, MoreHorizontal, Trash } from 'lucide-react';
import { useState } from 'react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Conversation } from './types';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onDeleteChat: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectChat,
  onCreateNewChat,
  onScroll,
  onDeleteChat,
}: ChatSidebarProps) {
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  return (
    <>
      <SidebarHeader className="h-14 flex flex-row items-center justify-between border-b p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <h1 className="text-lg font-semibold tracking-tighter">Smart Buddy</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent onScroll={onScroll}>
        <div className="p-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
            onClick={onCreateNewChat}
          >
            <Plus size={16} />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
        </div>
        <SidebarMenu className="px-2">
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
                <MessageSquare size={16} />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {conv.messages.find((msg) => msg.role === 'user')?.content || 'New Chat'}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-md p-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        hoveredChatId === conv.id ? 'opacity-100' : 'opacity-0'
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
      </SidebarContent>
    </>
  );
}
