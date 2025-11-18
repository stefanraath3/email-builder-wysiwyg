import type { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/react";
import { Node as PMNode } from "@tiptap/pm/model";

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
