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
        'flex items-start gap-3',
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
        <Card
          className={cn(
            'rounded-2xl p-4',
            isAssistant
              ? 'bg-card rounded-bl-none'
              : 'bg-primary text-primary-foreground rounded-br-none'
          )}
        >
          <CardContent className="p-0 text-sm">
            {message.isGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </CardContent>
        </Card>
        
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
        <Avatar className="h-8 w-8 shrink-0">
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center rounded-full">
            <User className="h-5 w-5" />
          </div>
        </Avatar>
      )}
    </div>
  );
}
