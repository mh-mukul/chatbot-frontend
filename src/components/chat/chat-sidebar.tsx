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
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectChat,
  onCreateNewChat,
  onScroll,
}: ChatSidebarProps) {
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
            <SidebarMenuItem key={conv.id}>
              <SidebarMenuButton
                onClick={() => onSelectChat(conv.id)}
                isActive={conv.id === activeConversationId}
                className="w-full justify-start group-data-[collapsible=icon]:justify-center"
              >
                <MessageSquare size={16} />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {conv.messages.length > 0 ? conv.messages[conv.messages.length - 1].content : 'New Chat'}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarMenu className="px-2">
          <ThemeToggle />
        </SidebarMenu>
      </SidebarFooter> */}
    </>
  );
}
