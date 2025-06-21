import { ChatInput } from './chat-input';

interface EmptyChatProps {
    onSendMessage: (input: string) => Promise<void>;
}

export function EmptyChat({ onSendMessage }: EmptyChatProps) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center"> {/* Changed justify-between to justify-center */}
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto"> {/* Removed flex-1 */}
                <h1 className="text-3xl font-semibold text-foreground">
                    Where should we begin?
                </h1>
                <p className="mt-2 text-muted-foreground">
                    I can help you with a variety of tasks. Start a conversation below.
                </p>
            </div>
            <div className="w-full flex justify-center px-4 pb-4">
                <div className="max-w-md w-full">
                    <ChatInput onSendMessage={onSendMessage} isSendingMessage={false} />
                </div>
            </div>
        </div>
    );
}
