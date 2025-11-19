"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@/lib/novel";
import { findNodeByUid, updateNodeAttrsByUid, getDefaultStylesForBlockType } from "@/lib/email-blocks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Copy } from "lucide-react";
import type { BlockStyles } from "@/types/block-styles";
import type { GlobalStyles } from "@/types/email-template";
import { AlignmentControl } from "./attributes-panel/alignment-control";
import {
  StyleDropdownMenu,
  type StyleOption,
} from "./attributes-panel/style-dropdown-menu";
import { StyleControl } from "./attributes-panel/style-control";

type AttributesPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockUid: string | null;
  blockType: string | null;
  globalStyles: GlobalStyles;
};

/**
 * Interactive Attributes Panel (Resend-inspired)
 * - Alignment toggle at top for all blocks
 * - Styles section with + dropdown to add/remove style overrides
 * - Shows inherited defaults from global styles
 */
export function AttributesPanel({
  open,
  onOpenChange,
  blockUid,
  blockType,
  globalStyles,
}: AttributesPanelProps) {
  const { editor } = useEditor();
  const [styles, setStyles] = useState<BlockStyles>({});
  const [activeStyleKeys, setActiveStyleKeys] = useState<Set<StyleOption>>(
    new Set()
  );

  // Get inherited defaults for this block type
  const inheritedDefaults = blockType && globalStyles
    ? getDefaultStylesForBlockType(blockType, globalStyles)
    : {};

  // Load current styles from node and determine which style keys are active
  useEffect(() => {
    if (!editor || !blockUid) return;

    const result = findNodeByUid(editor, blockUid);
    if (result) {
      const nodeStyles = (result.node.attrs.styles as BlockStyles) || {};
      setStyles(nodeStyles);

      // Determine which style keys have values
      const active = new Set<StyleOption>();
      if (nodeStyles.backgroundColor) active.add("backgroundColor");
      if (nodeStyles.borderRadius !== undefined) active.add("borderRadius");
      if (nodeStyles.borderWidth !== undefined) active.add("borderWidth");
      if (nodeStyles.borderStyle) active.add("borderStyle");
      if (nodeStyles.borderColor) active.add("borderColor");
      if (nodeStyles.textColor) active.add("textColor");
      if (nodeStyles.fontSize) active.add("fontSize");
      if (nodeStyles.fontWeight) active.add("fontWeight");
      if (nodeStyles.lineHeight) active.add("lineHeight");
      if (nodeStyles.textDecoration) active.add("textDecoration");
      if (nodeStyles.padding) active.add("padding");

      setActiveStyleKeys(active);
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

  // Add a style control with a sensible default value
  const handleAddStyle = (styleKey: StyleOption) => {
    setActiveStyleKeys((prev) => new Set(prev).add(styleKey));

    // Set default values for newly added styles
    const defaultValues: Partial<Record<StyleOption, any>> = {
      backgroundColor: "#ffffff",
      borderRadius: 0,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#000000",
      textColor: "#000000",
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
      textDecoration: "none",
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    };

    if (defaultValues[styleKey] !== undefined) {
      updateStyle(styleKey as keyof BlockStyles, defaultValues[styleKey]);
    }
  };

  // Remove a style control
  const handleRemoveStyle = (styleKey: StyleOption) => {
    setActiveStyleKeys((prev) => {
      const next = new Set(prev);
      next.delete(styleKey);
      return next;
    });

    // Remove the style value from the node
    const newStyles = { ...styles };
    delete newStyles[styleKey];
    setStyles(newStyles);
    if (editor && blockUid) {
      updateNodeAttrsByUid(editor, blockUid, { styles: newStyles });
    }
  };

  // Reset to defaults - clears all style overrides
  const resetStyles = () => {
    if (!editor || !blockUid) return;
    setStyles({});
    setActiveStyleKeys(new Set());
    updateNodeAttrsByUid(editor, blockUid, { styles: {} });
  };

  const handleCopyUid = async () => {
    if (blockUid) {
      await navigator.clipboard.writeText(blockUid);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] sm:max-w-[400px] p-6 bg-[hsl(var(--background))] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Attributes</SheetTitle>
          <SheetDescription>Customize block styling</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!blockUid ? (
            <div className="text-sm text-muted-foreground">
              No block selected
            </div>
          ) : (
            <>
              {/* Block Type */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Type</div>
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

              <Separator />

              {/* Alignment Control - Always visible for all blocks */}
              <div>
                <Label className="mb-2 block">Alignment</Label>
                <AlignmentControl
                  value={styles.textAlign}
                  onChange={(val) => updateStyle("textAlign", val)}
                />
              </div>

              <Separator />

              {/* Styles Section with Dropdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Styles</Label>
                  <StyleDropdownMenu
                    activeStyles={activeStyleKeys}
                    onAddStyle={handleAddStyle}
                    blockType={blockType}
                  />
                </div>

                {/* Active Style Controls */}
                {activeStyleKeys.size === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No style overrides
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.from(activeStyleKeys).map((styleKey) => (
                      <StyleControl
                        key={styleKey}
                        styleKey={styleKey}
                        styles={styles}
                        onChange={updateStyle}
                        onRemove={() => handleRemoveStyle(styleKey)}
                        inheritedDefault={inheritedDefaults[styleKey]}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Separator />

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
