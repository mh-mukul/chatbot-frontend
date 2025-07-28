import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Share, X, Link, Info } from "lucide-react";
import { shareChat } from "@/api/chat";
import { useToast } from "@/hooks/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";

interface ShareChatModalProps {
  sessionId: string;
}

export function ShareChatModal({ sessionId }: ShareChatModalProps) {
  const [isLinkCreated, setIsLinkCreated] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const { toast } = useToast();

  // Set placeholder on component mount
  useEffect(() => {
    const baseUrl = window.location.origin;
    setPlaceholder(`${baseUrl}/share/...`);
  }, []);

  const handleCreateLink = async () => {
    try {
      const response = await shareChat(sessionId);

      if (response.status === 200) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/share/${sessionId}`;
        setShareLink(link);
        setIsLinkCreated(true);
      } else {
        console.error("Failed to create share link", response.message);
        // Handle error case
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      // Handle error case
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      description: "Link copied to clipboard",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Share className="size-4" />
          <span >Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90%] h-auto rounded-lg sm:max-w-[550px] p-0 overflow-hidden">
        <DialogHeader className="p-4">
          <DialogTitle>{isLinkCreated ? "Public link is created" : "Share Chat"}</DialogTitle>
          <DialogDescription>
            {isLinkCreated
              ? "Copy the link from below and share with others."
              : "Share this chat with others by creating a public link."}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 pt-0">
          <div className="rounded-lg bg-muted p-4 flex items-center gap-2">
            <Info className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <b>This conversation may include personal information.</b>
              <br />Take a moment to check the content before sharing the link.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Input
              value={shareLink}
              placeholder={placeholder}
              disabled
              className="truncate"
            />
            {!isLinkCreated ? (
              <Button onClick={handleCreateLink} disabled={!sessionId}>
                <Link className="size-4" />
                Create link
              </Button>
            ) : (
              <Button onClick={handleCopyLink}>
                <Link className="size-4" />
                Copy link
              </Button>
            )}
          </div>
          {isLinkCreated && (
            <></>
          )}
        </div>
        <DialogClose asChild>
          <Button className='absolute top-2 right-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5' variant="ghost" size="icon">
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}