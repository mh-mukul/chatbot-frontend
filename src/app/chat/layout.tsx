'use client';

import { ChatLayout } from "@/components/chat/chat-layout";

export default function ChatRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="flex h-[100dvh] flex-col items-center justify-center">
            <ChatLayout />
        </main>
    );
}
