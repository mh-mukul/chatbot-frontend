"use client";

import { cn } from "@/lib/utils";
import type { Message } from "./types";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Bot, Copy, ThumbsUp, ThumbsDown, RefreshCw, Pen } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPositiveFeedback, sendNegativeFeedback } from "@/api/chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ChatInput } from "./chat-input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyIcon, CheckIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onSendMessage: (input: string, originalMsgId?: number) => Promise<void>;
  isPublic?: boolean;
}

// Custom component for code blocks
const CodeBlock = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const codeString = String(children);
  const language = className ? className.replace('language-', '') : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2 group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 bg-secondary/80 backdrop-blur-sm"
          onClick={handleCopy}
        >
          {copied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
        </Button>
      </div>
      {language && (
        <div className="absolute left-2 top-2 text-xs text-muted-foreground px-2 py-1 rounded-t-md bg-secondary/40">
          {language}
        </div>
      )}
      <pre
        className={`rounded-md p-3 pt-8 bg-secondary text-secondary-foreground text-sm`}
        style={{
          maxWidth: '100%',
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      >
        <code
          className={`${language} text-xs sm:text-sm`}
          style={{
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word'
          }}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export function ChatMessage({ message, onSendMessage, isPublic = false }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const formatDuration = (duration: number) => {
    return duration.toFixed(1);
  };

  const onCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      description: "Message copied to clipboard.",
    });
  };

  const onEdit = () => {
    setIsEditing(true);
  };

  const onCancelEdit = () => {
    setIsEditing(false);
  };

  const onUpdateMessage = async (newContent: string) => {
    if (!message.originalId) return;
    await onSendMessage(newContent, message.originalId);
    setIsEditing(false);
  };

  const onLike = async () => {
    if (!message.originalId) return;

    try {
      // Create a copy of the current state before changing
      const prevPositive = message.positiveFeedback;
      const prevNegative = message.negativeFeedback;

      // Update local state immediately for responsive UI
      message.positiveFeedback = true;
      message.negativeFeedback = false;

      // Force a re-render
      const updatedMessage = { ...message };

      // Send API request
      await sendPositiveFeedback(message.originalId);
      toast({
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      console.error("Error sending positive feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback.",
      });
    }
  };

  const onUnlike = async () => {
    if (!message.originalId) return;

    try {
      // Create a copy of the current state before changing
      const prevPositive = message.positiveFeedback;
      const prevNegative = message.negativeFeedback;

      // Update local state immediately for responsive UI
      message.positiveFeedback = false;
      message.negativeFeedback = true;

      // Force a re-render
      const updatedMessage = { ...message };

      // Send API request
      await sendNegativeFeedback(message.originalId);
      toast({
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      console.error("Error sending negative feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback.",
      });
    }
  };

  const onResubmit = async () => {
    if (!message.originalId) return;

    try {
      // The use-chat-management hook will handle finding the correct user message
      // and preparing the AI message for resubmission
      await onSendMessage("", message.originalId);
    } catch (error) {
      console.error("Error resubmitting message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resubmit message.",
      });
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex items-start gap-3 w-full",
          isAssistant ? "justify-start" : "justify-end"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isAssistant && (
          <Avatar className="h-8 w-8 shrink-0">
            <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center rounded-full">
              <Bot className="h-5 w-5" />
            </div>
          </Avatar>
        )}

        <div
          className={cn(
            "flex flex-col gap-1",
            isEditing && "w-full",
            !isEditing && isAssistant && "w-full sm:max-w-[90%] md:max-w-[85%]",
            !isEditing && !isAssistant && "max-w-[85%] sm:max-w-[80%]",
            isAssistant ? "items-start" : (isEditing ? "" : "items-end")
          )}
        >
          <div className={cn("flex flex-col")}>
            {isAssistant ? (
              <div className="flex items-center space-x-2">
                <div className="text-left text-sm font-bold">AI Agent</div>
                <div className="text-left text-xs text-muted-foreground">
                  {isHovered ? (
                    new Date(message.createdAt)
                      .toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")
                  ) : message.duration ? (
                    `Thought for ${formatDuration(
                      message.duration
                    )} seconds`
                  ) : null}
                </div>
              </div>
            ) : null}
            {isEditing ? (
              <ChatInput
                onSendMessage={onUpdateMessage}
                isSendingMessage={message.isGenerating || false}
                initialInput={message.content}
                onCancel={onCancelEdit}
                isEditing={true}
              />
            ) : isAssistant ? (
              <div className="text-sm pt-1 w-full overflow-hidden">
                {message.isGenerating && !message.content ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none w-full overflow-hidden prose-headings:my-2 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-li:marker:text-foreground/70 prose-pre:my-1.5 prose-pre:bg-secondary prose-pre:text-secondary-foreground prose-code:text-secondary-foreground prose-code:bg-secondary prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-headings:text-foreground prose-a:text-primary prose-img:rounded-md prose-img:max-w-full prose-blockquote:my-2 prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-blockquote:border-l-2 prose-blockquote:border-primary/40">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        pre: ({ children }) => <div className="w-full overflow-hidden">{children}</div>,
                        code: ({ className, children }) => {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <CodeBlock className={className}>
                              {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                          ) : (
                            <code className="bg-secondary/70 px-1 py-0.5 rounded text-secondary-foreground text-xs sm:text-sm">
                              {children}
                            </code>
                          );
                        },
                        a: ({ href, children }) => {
                          // Check if the href is a valid URL
                          let url;
                          try {
                            url = new URL(href || '');
                          } catch (e) {
                            return <span className="text-primary">{children}</span>;
                          }

                          return (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                              {children}
                            </a>
                          );
                        },
                        li: ({ children }) => (
                          <li className="my-0.5">{children}</li>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-xl font-bold mt-2 mb-1">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-lg font-bold mt-2 mb-1">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-base font-bold mt-1.5 mb-0.5">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="my-1.5">{children}</p>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isGenerating && (
                      <span className="inline-block w-2 h-4 ml-1 animate-pulse bg-foreground" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card
                className={cn(
                  "rounded-2xl p-4 w-fit min-w-[60px]",
                  "bg-secondary text-secondary-foreground rounded-br-none border-0",
                  "ml-auto" // Add ml-auto to ensure it aligns to the right
                )}
              >
                <CardContent className="p-0 text-sm">
                  {message.isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {!message.isGenerating && !isEditing && (
              <div className={cn(
                "flex items-center gap-1 mt-2",
                !isAssistant && "justify-end" // Add justify-end for user messages
              )}>
                {isAssistant && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={onCopy}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Copy</TooltipContent>
                  </Tooltip>
                )}

                {!isAssistant && (
                  <div
                    className={cn(
                      "flex items-center gap-1 transition-opacity duration-300",
                      isHovered ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onCopy}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Copy</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onEdit}>
                          <Pen className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Edit</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {isAssistant && !isPublic && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onLike}
                        >
                          <ThumbsUp
                            className={cn(
                              "h-4 w-4",
                              message.positiveFeedback ? "fill-foreground" : ""
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Good Response</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onUnlike}
                        >
                          <ThumbsDown
                            className={cn(
                              "h-4 w-4",
                              message.negativeFeedback ? "fill-foreground" : ""
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Bad Response</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={onResubmit}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Resubmit</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
