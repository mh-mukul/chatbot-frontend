'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-4">
                404
            </h1>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-6">
                Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Button asChild>
                <Link href="/chat">
                    Return to Chat
                </Link>
            </Button>
        </div>
    );
}
