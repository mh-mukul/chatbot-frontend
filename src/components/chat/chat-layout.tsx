"use client";

import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { ChatSidebar } from './chat-sidebar';
import { ChatThread } from './chat-thread';
import { ChatWelcomeScreen } from './chat-welcome-screen';
import { DeleteChatDialog } from './delete-chat-dialog';
import { useChatManagement } from '@/hooks/use-chat-management';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Archive, Flag, Trash } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ShareChatModal } from './ShareChatModal';

export function ChatLayout() {
  const {
    conversations,
    activeConversationId,
    activeChatMessages,
    isSendingMessage,
    isClient,
    isAuthenticated,
    isLoadingChatMessages,
    isDeleteDialogOpen,
    activeConversation,
    setIsDeleteDialogOpen,
    handleCreateNewChat,
    handleLogout,
    handleDeleteChat,
    confirmDeleteChat,
    handleSelectChat,
    handleScroll,
    handleSendMessage,
  } = useChatManagement();

  const isMobile = useIsMobile();

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" collapsible="icon">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onScroll={handleScroll}
          onDeleteChat={handleDeleteChat}
          onLogout={handleLogout}
        />
      </Sidebar>
      <SidebarInset className={`pt-16 ${isMobile && !activeConversationId ? 'pb-24' : ''}`}>
        {isMobile && (
          <div className="fixed left-4 top-4 z-10">
            <SidebarTrigger />
          </div>
        )}
        {activeConversationId && (
          <div className="fixed top-0 right-0 z-10 p-4">
            <ShareChatModal sessionId={activeConversationId} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive />
                  <span>Archive</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Flag />
                  <span>Report</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 dark:text-red-500 focus:text-red-500 dark:focus:text-red-500 focus:bg-red-300 dark:focus:bg-red-900/50"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="text-red-500 dark:text-red-500" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {isLoadingChatMessages ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          activeConversationId || activeChatMessages.length > 0 ? (
            <ChatThread
              messages={activeChatMessages}
              onSendMessage={handleSendMessage}
              isSendingMessage={isSendingMessage}
            />
          ) : (
            <ChatWelcomeScreen onSendMessage={handleSendMessage} isSendingMessage={isSendingMessage} />
          )
        )}
      </SidebarInset>
      <DeleteChatDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={confirmDeleteChat}
      />
    </SidebarProvider>
  );
}
