"use client";

import { cn } from "@/lib/utils";
import type { Message } from "./types";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { Icons } from "../icons";
import { Card, CardContent } from "../ui/card";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: Message;
  onSendMessage: (input: string) => Promise<void>;
}

export function ChatMessage({ message, onSendMessage }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const [isHovered, setIsHovered] = useState(false);
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

  const onLike = () => {
    // TODO: Implement backend API call
    console.log("Liked message");
  };

  const onUnlike = () => {
    // TODO: Implement backend API call
    console.log("Unliked message");
  };

  const onResubmit = () => {
    // TODO: Implement backend API call
    console.log("Resubmitting message");
  };

  return (
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
            <Icons.bot className="h-5 w-5" />
          </div>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          isAssistant ? "items-start" : "items-end"
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
                ) : message.chat_metadata?.duration ? (
                  `Thought for ${formatDuration(
                    message.chat_metadata.duration
                  )} seconds`
                ) : null}
              </div>
            </div>
          ) : null}
          {isAssistant ? (
            <div className="text-sm pt-2">
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
            </div>
          ) : (
            <Card
              className={cn(
                "rounded-2xl p-4 w-fit",
                "bg-secondary text-secondary-foreground rounded-br-none border-0"
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
          {isAssistant && !message.isGenerating && (
            <div className="flex items-center gap-1 mt-2">
              <Button variant="ghost" size="icon" onClick={onCopy} title="Copy">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onLike} title="Like">
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onUnlike} title="Dislike">
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onResubmit} title="Resubmit">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
