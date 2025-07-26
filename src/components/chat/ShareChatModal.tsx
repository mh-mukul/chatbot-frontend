import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { Share, X } from "lucide-react";
import { shareChat } from "@/api/chat";
import { useToast } from "@/hooks/use-toast";
import { DialogClose } from "@radix-ui/react-dialog";

interface ShareChatModalProps {
  sessionId: string;
}

export function ShareChatModal({ sessionId }: ShareChatModalProps) {
  const [isLinkCreated, setIsLinkCreated] = useState(false);
  const [isDiscoverable, setIsDiscoverable] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const { toast } = useToast();

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
        <Button variant="ghost" size="icon" className="size-8">
          <Share className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share public link to chat</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg bg-muted p-4 flex items-center gap-2">
          
          This conversation may include personal information. Take a moment to check the content before sharing the link.
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Input value={shareLink} readOnly className="truncate" />
          {!isLinkCreated ? (
            <Button onClick={handleCreateLink}>Create link</Button>
          ) : (
            <Button onClick={handleCopyLink}>Copy link</Button>
          )}
        </div>
        {isLinkCreated && (
          <div className="mt-4 flex items-center">
            <Checkbox
              id="discoverable"
              checked={isDiscoverable}
              onCheckedChange={(checked) => setIsDiscoverable(typeof checked === 'boolean' ? checked : false)}
            />
            <label
              htmlFor="discoverable"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Make this chat discoverable
            </label>
          </div>
        )}
        <DialogClose asChild>
          <button className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}