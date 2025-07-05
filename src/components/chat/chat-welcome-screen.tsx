import { ChatInput } from './chat-input';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatWelcomeScreenProps {
  onSendMessage: (input: string) => Promise<void>;
  isSendingMessage: boolean;
}

export function ChatWelcomeScreen({ onSendMessage, isSendingMessage }: ChatWelcomeScreenProps) {
  const isMobile = useIsMobile();

  return (
    <>
      <div className="flex h-full mt-40 justify-center">
        <div className="flex flex-col items-center w-full">
          <div className="flex flex-col items-center justify-center text-center max-w-md  p-6">
            <h1 className="text-3xl font-semibold text-foreground">
              Where should we begin?
            </h1>
          </div>
          {!isMobile && (
            <div className="max-w-[70%] w-full p-4">
              <ChatInput onSendMessage={onSendMessage} isSendingMessage={isSendingMessage} />
            </div>
          )}
        </div>
      </div>
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm z-10">
          <ChatInput onSendMessage={onSendMessage} isSendingMessage={isSendingMessage} />
        </div>
      )}
    </>
  );
}