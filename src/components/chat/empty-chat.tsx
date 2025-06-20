import { ChatInput } from './chat-input';

interface EmptyChatProps {
    onSendMessage: (input: string) => Promise<void>;
}

export function EmptyChat({ onSendMessage }: EmptyChatProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center">
            <div className="flex flex-col items-center text-center p-6 max-w-md mx-auto">
                 <div className="bg-primary/10 text-primary p-3 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-10 w-10">
                        <rect width="256" height="256" fill="none"/>
                        <path d="M128,24a104,104,0,1,0,104,104A104.12,104.12,0,0,0,128,24Z" opacity="0.2"/>
                        <circle cx="128" cy="128" r="104" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="16"/>
                        <path d="M168,188a40,40,0,0,0-80,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
                        <circle cx="92" cy="112" r="12"/>
                        <circle cx="164" cy="112" r="12"/>
                    </svg>
                </div>
                <h1 className="text-3xl font-semibold text-foreground">
                    How can I help you?
                </h1>
                <p className="mt-2 text-muted-foreground">
                    I can help you with a variety of tasks. Start a conversation below.
                </p>
            </div>
            <div className="w-full max-w-2xl px-4 pb-4 mt-auto">
                <ChatInput onSendMessage={onSendMessage} />
            </div>
        </div>
    );
}
