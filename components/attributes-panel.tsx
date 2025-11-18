"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@/lib/novel";
import { findNodeByUid, updateNodeAttrsByUid } from "@/lib/email-blocks";
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
import { Accordion } from "./ui/accordion";
import { AppearanceSection } from "./attributes-panel/appearance-section";
import { TypographySection } from "./attributes-panel/typography-section";
import { LayoutSection } from "./attributes-panel/layout-section";
import { ImageSection } from "./attributes-panel/image-section";
import type { BlockStyles } from "@/types/block-styles";

type AttributesPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockUid: string | null;
  blockType: string | null;
};

const TEXT_BLOCKS = ["paragraph", "heading", "blockquote"];
const IMAGE_BLOCKS = ["image"];
const CODE_BLOCKS = ["codeBlock"];

/**
 * Interactive Attributes Panel component for Phase 5
 * Allows users to customize block appearance, typography, and layout
 */
export function AttributesPanel({
  open,
  onOpenChange,
  blockUid,
  blockType,
}: AttributesPanelProps) {
  const { editor } = useEditor();
  const [styles, setStyles] = useState<BlockStyles>({});

  // Load current styles from node
  useEffect(() => {
    if (!editor || !blockUid) return;

    const result = findNodeByUid(editor, blockUid);
    if (result) {
      setStyles((result.node.attrs.styles as BlockStyles) || {});
    }
  }, [editor, blockUid]);

  // Auto-close if node not found
  useEffect(() => {
    if (open && (!blockUid || !editor)) {
      onOpenChange(false);
    }
  }, [open, blockUid, editor, onOpenChange]);

  // Update style handler
  const updateStyle = (key: keyof BlockStyles, value: any) => {
    if (!editor || !blockUid) return;

    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);

    // Apply to editor immediately (real-time WYSIWYG)
    updateNodeAttrsByUid(editor, blockUid, { styles: newStyles });
  };

  // Reset to defaults
  const resetStyles = () => {
    if (!editor || !blockUid) return;
    setStyles({});
    updateNodeAttrsByUid(editor, blockUid, { styles: {} });
  };

  const handleCopyUid = async () => {
    if (blockUid) {
      await navigator.clipboard.writeText(blockUid);
    }
  };

  const isTextBlock = blockType && TEXT_BLOCKS.includes(blockType);
  const isImageBlock = blockType && IMAGE_BLOCKS.includes(blockType);
  const isCodeBlock = blockType && CODE_BLOCKS.includes(blockType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] p-6 bg-[hsl(var(--background))] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Block Attributes</SheetTitle>
          <SheetDescription>
            Customize block appearance and styling
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {!blockUid ? (
            <div className="text-sm text-muted-foreground">
              No block selected
            </div>
          ) : (
            <>
              {/* Block Info */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Type</div>
                <Badge variant="outline">{blockType || "unknown"}</Badge>
              </div>

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

              {/* Style Controls */}
              <Accordion
                type="multiple"
                defaultValue={["appearance", "layout"]}
                className="w-full"
              >
                <AppearanceSection styles={styles} onChange={updateStyle} />

                {isTextBlock && (
                  <TypographySection styles={styles} onChange={updateStyle} />
                )}

                {isImageBlock && (
                  <ImageSection styles={styles} onChange={updateStyle} />
                )}

                <LayoutSection
                  styles={styles}
                  onChange={updateStyle}
                  blockType={blockType}
                />
              </Accordion>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={resetStyles}
              >
                Reset to Defaults
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
