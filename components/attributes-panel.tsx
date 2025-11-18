"use client";

import { useEffect } from "react";
import { useEditor } from "@/lib/novel";
import { findNodeByUid } from "@/lib/email-blocks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";

type AttributesPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockUid: string | null;
  blockType: string | null;
};

/**
 * Stub Attributes Panel component for Phase 4 Part 3
 * Displays read-only block information: type, UID, and raw attrs JSON
 */
export function AttributesPanel({
  open,
  onOpenChange,
  blockUid,
  blockType,
}: AttributesPanelProps) {
  const { editor } = useEditor();

  // Find the node by UID when panel is open
  const nodeData = blockUid && editor ? findNodeByUid(editor, blockUid) : null;

  // Robustness: if panel is open but blockUid is null or node not found, close panel
  useEffect(() => {
    if (open && (!blockUid || !nodeData)) {
      onOpenChange(false);
    }
  }, [open, blockUid, nodeData, onOpenChange]);

  const handleCopyUid = async () => {
    if (blockUid) {
      await navigator.clipboard.writeText(blockUid);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] bg-background"
      >
        <SheetHeader>
          <SheetTitle>Block Attributes</SheetTitle>
          <SheetDescription>View and inspect block properties</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!blockUid || !nodeData ? (
            <div className="text-sm text-muted-foreground">
              No block selected or block not found
            </div>
          ) : (
            <>
              {/* Block Type */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">Type</div>
                <Badge variant="outline">{blockType || "unknown"}</Badge>
              </div>

              {/* Block UID */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">UID</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 break-all">
                    {blockUid}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleCopyUid}
                    title="Copy UID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Raw Attributes JSON */}
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Attributes (JSON)
                </div>
                <pre className="text-xs font-mono bg-muted p-3 rounded overflow-auto max-h-[400px]">
                  {JSON.stringify(nodeData.node.attrs, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
