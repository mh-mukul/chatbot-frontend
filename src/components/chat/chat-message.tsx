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

interface ChatMessageProps {
  message: Message;
  onSendMessage: (input: string, originalMsgId?: number) => Promise<void>;
  isPublic?: boolean;
}

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
            "flex flex-col gap-2",
            isEditing ? "w-full" : "max-w-[80%]",
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
              <div className="text-sm pt-2">
                {message.isGenerating && !message.content ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isGenerating && (
                      <span className="inline-block w-2 h-4 ml-1 animate-pulse bg-foreground" />
                    )}
                  </p>
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
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
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
