import { cn } from '@/lib/utils';
import type { Message } from './types';
import { Avatar } from '@/components/ui/avatar';
import { User, Loader2 } from 'lucide-react';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface ChatMessageProps {
  message: Message;
  onSendMessage: (input: string) => Promise<void>;
}

export function ChatMessage({ message, onSendMessage }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <Avatar className="h-8 w-8 shrink-0">
          <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full">
            <Icons.bot className="h-5 w-5" />
          </div>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-2 max-w-[80%]", isAssistant ? 'items-start' : 'items-end')}>
        <div className={cn("flex flex-col")}>
        {isAssistant ? (
            <div className="flex items-center space-x-2">
              <div className="text-left text-sm font-bold">Smart Buddy</div>
              <div className="text-left text-xs text-muted-foreground">{new Date(message.createdAt).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }).replace(',', '')}</div>
            </div>
          ) : null}
        <Card
          className={cn(
            'rounded-2xl p-4 w-fit',
            isAssistant
              ? 'bg-transparent rounded-bl-none'
              : 'bg-secondary text-secondary-foreground rounded-br-none'
          )}
        >
          <CardContent className="p-0 text-sm">
            {message.isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </CardContent>
        </Card>
      </div>
        
        {!message.isGenerating && message.suggestedQuestions && message.suggestedQuestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {message.suggestedQuestions.map((q, i) => (
                <Button key={i} size="sm" variant="outline" onClick={() => onSendMessage(q)}>
                    {q}
                </Button>
            ))}
          </div>
        )}
      </div>

      {!isAssistant && (
        null
      )}
    </div>
  );
}
