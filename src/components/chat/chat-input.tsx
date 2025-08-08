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
  const lineHeightRef = useRef<number>(0);

  // Effect to set initial height to one row and initialize line height
  useEffect(() => {
    if (textareaRef.current) {
      const lineHeight = parseInt(getComputedStyle(textareaRef.current).lineHeight);
      lineHeightRef.current = lineHeight;

      // Set initial height to one row
      textareaRef.current.style.height = `${lineHeight}px`;
    }
  }, []);

  // Effect to adjust height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${lineHeightRef.current}px`; // Reset to one row
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = lineHeightRef.current;
      const currentRows = Math.ceil(scrollHeight / lineHeight);

      if (currentRows > maxRows) {
        textareaRef.current.style.overflowY = 'auto';
        textareaRef.current.style.height = `${maxRows * lineHeight}px`;
      } else {
        textareaRef.current.style.overflowY = 'hidden';
        textareaRef.current.style.height = `${scrollHeight}px`;
      }
    }
  }, [input, maxRows]);

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
        <div className={cn(
          "bg-muted p-2 shadow-lg",
          input.split('\n').length <= 1 && input.length < 50 
            ? "rounded-full" 
            : "rounded-2xl"
        )}>
          <div className="flex flex-col">
            <div className="flex items-center">
              {/* Left button for single line view */}
              {!isEditing && input.split('\n').length <= 1 && input.length < 50 && (
                <div className="flex-shrink-0 mr-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Attachments</TooltipContent>
                  </Tooltip>
                </div>
              )}

              <div className="relative flex-grow">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  ref={textareaRef}
                  rows={1}
                  className={cn(
                    "bg-transparent w-full text-foreground placeholder-muted-foreground focus:outline-none resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0 overflow-hidden",
                    (input.split('\n').length <= 1 && input.length < 50) ? (isEditing ? "" : "pl-0") : ""
                  )}
                  disabled={isSendingMessage}
                />

                {/* Right buttons for single line view */}
                {input.split('\n').length <= 1 && input.length < 50 && (
                  isEditing ? (
                    <div className="absolute right-0 top-0 flex items-center h-full space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-3 py-1 text-xs"
                        onClick={onCancel}
                        disabled={isSendingMessage}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-foreground text-background rounded-full px-3 py-1 text-xs shadow-lg hover:bg-foreground/90"
                        disabled={isSendingMessage || !input.trim()}
                      >
                        Send
                      </Button>
                    </div>
                  ) : (
                    <div className="absolute right-0 top-0 flex items-center h-full space-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <Mic className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Voice input</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90"
                            disabled={isSendingMessage || !input.trim()}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Send message</TooltipContent>
                      </Tooltip>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Buttons at the bottom when text expands */}
            {(input.split('\n').length > 1 || input.length >= 50) && (
              <div className="flex justify-between items-center mt-2 px-1">
                {!isEditing && (
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Attachments</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {isEditing ? (
                  <div className="flex items-center space-x-2 ml-auto">
                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-full px-3 py-1 text-xs"
                      onClick={onCancel}
                      disabled={isSendingMessage}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-foreground text-background rounded-full px-3 py-1 text-xs shadow-lg hover:bg-foreground/90"
                      disabled={isSendingMessage || !input.trim()}
                    >
                      Send
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 ml-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Voice input</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          size="icon"
                          className="h-8 w-8 bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90"
                          disabled={isSendingMessage || !input.trim()}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Send message</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
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
