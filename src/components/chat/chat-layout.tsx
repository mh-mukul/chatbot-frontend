"use client";

import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { ChatSidebar } from './chat-sidebar';
import { ChatThread } from './chat-thread';
import { ChatHeader } from './chat-header';
import { ChatWelcomeScreen } from './chat-welcome-screen';
import { DeleteChatDialog } from './delete-chat-dialog';
import { useChatManagement } from '@/hooks/use-chat-management';
import { useIsMobile } from '@/hooks/use-mobile';

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
      <ChatHeader onLogout={handleLogout} />
      <Sidebar side="left" collapsible="icon">
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectChat={handleSelectChat}
          onCreateNewChat={handleCreateNewChat}
          onScroll={handleScroll}
          onDeleteChat={handleDeleteChat}
        />
      </Sidebar>
      <SidebarInset className={`pt-16 ${isMobile && !activeConversationId ? 'pb-24' : ''}`}>
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
