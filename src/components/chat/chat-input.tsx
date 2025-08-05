"use client";

import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUp, Plus, Mic, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import { cn } from "@/lib/utils"; // Import cn utility

interface ChatInputProps {
  onSendMessage: (input: string, originalMsgId?: number) => Promise<void>;
  isSendingMessage: boolean;
  initialInput?: string; // New prop for initial message content when editing
  onCancel?: () => void; // New prop for cancel button in edit mode
  isEditing?: boolean; // New prop to indicate if it's in editing mode
  className?: string; // Allow passing custom class names
}

export function ChatInput({
  onSendMessage,
  isSendingMessage,
  initialInput = "",
  onCancel,
  isEditing = false,
  className, // Destructure className
}: ChatInputProps) {
  const [input, setInput] = useState(initialInput);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxRows = 8;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      const currentRows = Math.ceil(scrollHeight / lineHeight);

      if (currentRows > maxRows) {
        textareaRef.current.style.overflowY = 'auto';
        textareaRef.current.style.height = `${maxRows * lineHeight}px`;
      } else {
        textareaRef.current.style.overflowY = 'hidden';
        textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSendingMessage) return;

    const message = input;
    if (!isEditing) { // Clear input immediately to improve user experience
      setInput('');
    }

    // Send message after UI update
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <form onSubmit={handleSubmit} className={cn("w-full", className)}>
        <div className="bg-muted rounded-2xl p-2 shadow-lg">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            ref={textareaRef}
            className="bg-transparent w-full text-foreground placeholder-muted-foreground focus:outline-none resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isSendingMessage}
          />
          <div className="flex justify-between items-center mt-1">
            {isEditing ? (
              <div className="flex items-center space-x-2 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sm"
                  onClick={onCancel}
                  disabled={isSendingMessage}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-foreground text-background rounded-full px-4 py-2 text-sm shadow-lg hover:bg-foreground/90"
                  disabled={isSendingMessage || !input.trim()}
                >
                  Send
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Attachments</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Globe className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Web Search</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Voice input</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="submit"
                        size="icon"
                        className="bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90"
                        disabled={isSendingMessage || !input.trim()}
                      >
                        <ArrowUp className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Send message</TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>
        {!isEditing && (
          <div className="text-xs mt-2 text-center">
            AI can make mistakes. Always verify important info.
          </div>
        )}
      </form>
    </TooltipProvider>
  );
}
