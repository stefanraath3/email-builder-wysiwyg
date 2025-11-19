"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface EmailTransformTestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
}

export function EmailTransformTestModal({
  open,
  onOpenChange,
  html,
}: EmailTransformTestModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Transform Preview</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML Source</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-muted-foreground">
                {html.length.toLocaleString()} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy HTML
                  </>
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="preview" className="flex-1 mt-0">
            <div className="h-full overflow-auto bg-muted/20 rounded-lg p-4">
              <iframe
                srcDoc={html}
                className="w-full border-0 bg-white rounded mx-auto"
                style={{
                  minHeight: "600px",
                  maxWidth: "100%",
                  display: "block",
                }}
                title="Email Preview"
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 mt-0">
            <div className="h-full overflow-auto">
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                <code>{html}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
