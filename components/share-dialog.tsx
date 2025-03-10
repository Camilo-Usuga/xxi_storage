"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shareFile } from "@/lib/appwrite-config";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface ShareDialogProps {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({
  fileId,
  fileName,
  isOpen,
  onClose,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address to share with.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSharing(true);
      await shareFile(fileId, email);
      toast({
        title: "File shared",
        description: `${fileName} has been shared with ${email}.`,
      });
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Error sharing file:", error);
      toast({
        title: "Error",
        description:
          "Failed to share the file. Please check the email and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Share "{fileName}" with another user by email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter recipient's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing}>
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
