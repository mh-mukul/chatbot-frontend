import { ChatInput } from './chat-input';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState } from 'react';

interface ChatWelcomeScreenProps {
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage: boolean;
}

export function ChatWelcomeScreen({ onSendMessage, isSendingMessage }: ChatWelcomeScreenProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wrap the onSendMessage to immediately update the UI
  const handleSendMessage = async (input: string) => {
    setIsSubmitting(true); // This will force a re-render and the parent component will switch to ChatThread
    await onSendMessage(input);
  };

  return (
    <div className="relative w-full h-full">
      <div className="fixed inset-0 overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-green-500 to-red-400 opacity-40 blur-3xl"></div>
      </div>
      <div className="relative flex h-full items-center justify-center">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center text-center max-w-md p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Where should we begin?
            </h1>
          </div>
          {!isMobile && (
            <div className="max-w-[70%] w-full p-4 bg-transparent backdrop-blur-sm z-10">
              <ChatInput onSendMessage={handleSendMessage} isSendingMessage={isSendingMessage} />
            </div>
          )}
        </div>
      </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent backdrop-blur-sm z-10">
          <ChatInput onSendMessage={handleSendMessage} isSendingMessage={isSendingMessage} />
        </div>
      )}
    </div>
  );
}