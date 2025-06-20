import { Plus, MessageSquare } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import type { Conversation } from './types';
import { ThemeToggle } from '@/components/theme-toggle';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectChat: (id: string) => void;
  onCreateNewChat: () => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectChat,
  onCreateNewChat,
}: ChatSidebarProps) {
  return (
    <>
      <SidebarHeader className="h-14 flex flex-row items-center justify-between border-b p-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6">
                <rect width="256" height="256" fill="none"/>
                <path d="M128,24a104,104,0,1,0,104,104A104.12,104.12,0,0,0,128,24Z" opacity="0.2"/>
                <circle cx="128" cy="128" r="104" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"/>
                <path d="M168,188a40,40,0,0,0-80,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                <circle cx="92" cy="112" r="12"/>
                <circle cx="164" cy="112" r="12"/>
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tighter">SmartBuddy</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
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
            <SidebarMenuItem key={conv.id}>
              <SidebarMenuButton
                onClick={() => onSelectChat(conv.id)}
                isActive={conv.id === activeConversationId}
                className="w-full justify-start group-data-[collapsible=icon]:justify-center"
              >
                <MessageSquare size={16} />
                <span className="truncate group-data-[collapsible=icon]:hidden">{conv.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="px-2">
          <ThemeToggle />
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
