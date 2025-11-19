"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { SocialLink } from "@/lib/extensions/email-social-links";

const PLATFORM_ORDER = ["linkedin", "facebook", "x", "youtube"] as const;

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: "/social-links/social-linkedin.png",
  facebook: "/social-links/social-facebook.png",
  x: "/social-links/social-x.png",
  youtube: "/social-links/social-youtube.png",
};

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  x: "X",
  youtube: "YouTube",
};

interface SocialLinksConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLinks?: SocialLink[];
  onSave: (links: SocialLink[]) => void;
}

export function SocialLinksConfigModal({
  open,
  onOpenChange,
  initialLinks = [],
  onSave,
}: SocialLinksConfigModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("linkedin");
  const [urlInput, setUrlInput] = useState("");
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);

  // Reset state when modal opens with new initial links
  useEffect(() => {
    if (open) {
      setLinks(initialLinks);
      setSelectedPlatform("linkedin");
      setUrlInput("");
    }
  }, [open, initialLinks]);

  const handleAdd = () => {
    if (!urlInput.trim()) return;

    // Check for duplicate platform
    if (links.some((link) => link.platform === selectedPlatform)) {
      return; // Could show error toast here
    }

    const newLink: SocialLink = {
      platform: selectedPlatform as SocialLink["platform"],
      url: urlInput.trim(),
    };

    setLinks([...links, newLink]);
    setUrlInput("");
  };

  const handleDelete = (platform: string) => {
    setLinks(links.filter((link) => link.platform !== platform));
  };

  const handleSave = () => {
    onSave(links);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const availablePlatforms = PLATFORM_ORDER.filter(
    (platform) => !links.some((link) => link.platform === platform)
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, links]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add your social networks</DialogTitle>
          <DialogDescription>
            Choose the social and add the url
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add form */}
          <div className="flex gap-2">
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
              disabled={availablePlatforms.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {PLATFORM_LABELS[platform]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="http://"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              className="flex-1"
            />

            <Button
              onClick={handleAdd}
              disabled={!urlInput.trim() || availablePlatforms.length === 0}
            >
              Add
            </Button>
          </div>

          {/* Links list */}
          {links.length > 0 && (
            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.platform}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <img
                    src={PLATFORM_ICONS[link.platform]}
                    alt={PLATFORM_LABELS[link.platform]}
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex-1 truncate text-sm">{link.url}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(link.platform)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleSave}>
            Save <span className="ml-2 text-xs text-muted-foreground">⌘↵</span>
          </Button>
          <Button onClick={handleCancel}>
            Cancel{" "}
            <span className="ml-2 text-xs text-muted-foreground">Esc</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
