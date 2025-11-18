import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";
import { Node as PMNode } from "@tiptap/pm/model";
import type { BlockStyles } from "@/types/block-styles";
import type { GlobalStyles } from "@/types/email-template";

/**
 * Shared constant for the UID attribute name used by UniqueID extension
 */
export const BLOCK_UID_ATTR = "uid";

/**
 * Result type for JSON node lookup with path information
 */
export type JsonNodeWithPath = {
  node: JSONContent;
  path: number[]; // index path into `content` arrays
};

/**
 * Result type for ProseMirror node lookup with position
 */
export type EditorNodeWithPos = {
  node: PMNode;
  pos: number;
};

/**
 * Recursive helper to find a node by UID in JSON content
 * Performs depth-first traversal
 */
function findNodeByUidInJsonRecursive(
  node: JSONContent,
  uid: string,
  path: number[] = []
): JsonNodeWithPath | null {
  // Check if current node matches
  if (node.attrs?.[BLOCK_UID_ATTR] === uid) {
    return { node, path };
  }

  // Recursively search children
  if (node.content && Array.isArray(node.content)) {
    for (let i = 0; i < node.content.length; i++) {
      const child = node.content[i];
      const result = findNodeByUidInJsonRecursive(child, uid, [...path, i]);
      if (result) {
        return result;
      }
    }
  }

  return null;
}

/**
 * Find a node in JSON content by its UID
 * Returns the node and its path (array of indices) from the root doc
 *
 * @param doc - The JSONContent document to search
 * @param uid - The UID to search for
 * @returns The node with its path, or null if not found
 */
export function findNodeByUidJson(
  doc: JSONContent,
  uid: string
): JsonNodeWithPath | null {
  if (!doc || !uid) {
    return null;
  }

  return findNodeByUidInJsonRecursive(doc, uid);
}

/**
 * Find a node in the live TipTap editor by its UID
 * Uses ProseMirror's descendants iterator for efficient traversal
 *
 * @param editor - The TipTap editor instance
 * @param uid - The UID to search for
 * @returns The node with its position, or null if not found
 */
export function findNodeByUid(
  editor: Editor,
  uid: string
): EditorNodeWithPos | null {
  if (!editor || !uid) {
    return null;
  }

  let result: EditorNodeWithPos | null = null;

  editor.state.doc.descendants((node, pos) => {
    // Check if this node has the matching UID
    if (node.attrs?.[BLOCK_UID_ATTR] === uid) {
      result = { node, pos };
      return false; // Stop traversal
    }
    return true; // Continue traversal
  });

  return result;
}

/**
 * Update node attributes by UID in the live editor
 * Safely merges new attrs with existing attrs, preserving all other properties
 *
 * @param editor - The TipTap editor instance
 * @param uid - The UID of the node to update
 * @param attrs - The attributes to update (will be merged with existing attrs)
 * @returns true if node was found and updated, false if UID not found
 */
export function updateNodeAttrsByUid(
  editor: Editor,
  uid: string,
  attrs: Record<string, unknown>
): boolean {
  if (!editor || !uid || !attrs) {
    return false;
  }

  const found = findNodeByUid(editor, uid);

  if (!found) {
    return false;
  }

  const { node, pos } = found;

  // Merge new attrs with existing attrs, preserving all existing properties
  const nextAttrs = {
    ...node.attrs,
    ...attrs,
  };

  // Create transaction to update node markup (attrs only, not type or content)
  const tr = editor.state.tr.setNodeMarkup(pos, undefined, nextAttrs);

  // Dispatch the transaction
  editor.view.dispatch(tr);

  return true;
}

/**
 * Convert BlockStyles object to inline CSS string
 * Used in renderHTML to apply styles in editor view
 */
export function convertBlockStylesToInlineCSS(styles: BlockStyles): string {
  const cssProps: string[] = [];

  if (styles.backgroundColor) {
    cssProps.push(`background-color: ${styles.backgroundColor}`);
  }
  if (styles.textColor) {
    cssProps.push(`color: ${styles.textColor}`);
  }
  if (styles.fontSize) {
    cssProps.push(`font-size: ${styles.fontSize}px`);
  }
  if (styles.fontWeight) {
    cssProps.push(`font-weight: ${styles.fontWeight}`);
  }
  if (styles.lineHeight) {
    cssProps.push(`line-height: ${styles.lineHeight}`);
  }
  if (styles.textAlign) {
    cssProps.push(`text-align: ${styles.textAlign}`);
  }
  if (styles.borderRadius !== undefined) {
    cssProps.push(`border-radius: ${styles.borderRadius}px`);
  }
  if (styles.borderWidth !== undefined) {
    cssProps.push(`border-width: ${styles.borderWidth}px`);
  }
  if (styles.borderStyle) {
    cssProps.push(`border-style: ${styles.borderStyle}`);
  }
  if (styles.borderColor) {
    cssProps.push(`border-color: ${styles.borderColor}`);
  }
  if (styles.padding) {
    const { top, right, bottom, left } = styles.padding;
    cssProps.push(`padding: ${top}px ${right}px ${bottom}px ${left}px`);
  }
  if (styles.width !== undefined) {
    cssProps.push(`width: ${styles.width}px`);
  }
  if (styles.height !== undefined) {
    if (styles.height === "auto") {
      cssProps.push(`height: auto`);
    } else {
      cssProps.push(`height: ${styles.height}px`);
    }
  }
  if (styles.display) {
    cssProps.push(`display: ${styles.display}`);
  }
  if (styles.textDecoration) {
    cssProps.push(`text-decoration: ${styles.textDecoration}`);
  }
  if (styles.fontFamily) {
    cssProps.push(`font-family: ${styles.fontFamily}`);
  }

  return cssProps.join("; ");
}

/**
 * Merge block styles with global defaults
 * Returns computed styles with global fallbacks applied
 */
export function mergeWithGlobalStyles(
  blockStyles: BlockStyles,
  globalStyles: GlobalStyles,
  blockType: string
): BlockStyles {
  const merged: BlockStyles = { ...blockStyles };

  // Apply global defaults only if block doesn't have custom value
  if (blockType === "paragraph" || blockType === "heading") {
    if (!merged.textColor && globalStyles.typography.color) {
      merged.textColor = globalStyles.typography.color;
    }
    if (!merged.fontSize && globalStyles.typography.fontSize) {
      merged.fontSize = globalStyles.typography.fontSize;
    }
    if (!merged.lineHeight && globalStyles.typography.lineHeight) {
      merged.lineHeight = globalStyles.typography.lineHeight;
    }
    if (!merged.fontFamily && globalStyles.typography.fontFamily) {
      merged.fontFamily = globalStyles.typography.fontFamily;
    }
  }

  if (blockType === "image") {
    if (
      merged.borderRadius === undefined &&
      globalStyles.image.borderRadius !== undefined
    ) {
      merged.borderRadius = globalStyles.image.borderRadius;
    }
  }

  if (blockType === "codeBlock") {
    if (!merged.backgroundColor && globalStyles.codeBlock.backgroundColor) {
      merged.backgroundColor = globalStyles.codeBlock.backgroundColor;
    }
    if (
      merged.borderRadius === undefined &&
      globalStyles.codeBlock.borderRadius !== undefined
    ) {
      merged.borderRadius = globalStyles.codeBlock.borderRadius;
    }
    if (merged.padding === undefined && globalStyles.codeBlock.padding) {
      merged.padding = globalStyles.codeBlock.padding;
    }
  }

  return merged;
}

/**
 * Get default styles for a block type from global styles
 * Returns appropriate defaults based on block type
 */
export function getDefaultStylesForBlockType(
  blockType: string,
  globalStyles: GlobalStyles
): Partial<BlockStyles> {
  const defaults: Partial<BlockStyles> = {};

  if (blockType === "paragraph" || blockType === "heading") {
    defaults.textColor = globalStyles.typography.color;
    defaults.fontSize = globalStyles.typography.fontSize;
    defaults.lineHeight = globalStyles.typography.lineHeight;
    defaults.fontFamily = globalStyles.typography.fontFamily;
  }

  if (blockType === "image") {
    defaults.borderRadius = globalStyles.image.borderRadius;
  }

  if (blockType === "codeBlock") {
    defaults.backgroundColor = globalStyles.codeBlock.backgroundColor;
    defaults.borderRadius = globalStyles.codeBlock.borderRadius;
    defaults.padding = globalStyles.codeBlock.padding;
  }

  return defaults;
}
