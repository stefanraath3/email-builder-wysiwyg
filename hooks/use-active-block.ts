import { useState, useEffect } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEditor, type EditorInstance } from "@/lib/novel";
import { BLOCK_UID_ATTR } from "@/lib/email-blocks";

/**
 * Active block information exposed by useActiveBlock hook
 */
export type ActiveBlock = {
  uid: string;
  type: string; // Node type, e.g. "paragraph", "heading", "bulletList"
  pos: number; // ProseMirror document position
  domRect: DOMRect | null; // Bounding box of the block's DOM node
} | null;

/**
 * Hook to get the currently active block based on editor selection
 * Returns the nearest block node with a uid attribute
 *
 * @returns ActiveBlock with uid, type, pos, and domRect, or null if no block found
 */
export function useActiveBlock(): ActiveBlock {
  const { editor } = useEditor();
  const [activeBlock, setActiveBlock] = useState<ActiveBlock>(null);

  useEffect(() => {
    if (!editor || !editor.state) {
      setActiveBlock(null);
      return;
    }

    const updateActiveBlock = () => {
      if (!editor || !editor.state) {
        setActiveBlock(null);
        return;
      }

      const { state, view } = editor;
      const { selection } = state;

      // Try to resolve a block directly from a NodeSelection first (e.g. images)
      let found: { node: any; pos: number } | null = null;

      if (selection instanceof NodeSelection) {
        const node = selection.node;
        const uid = node.attrs?.[BLOCK_UID_ATTR];

        if (uid) {
          const pos = selection.from;
          found = { node, pos };
        }
      }

      // If not a NodeSelection with a uid, walk upwards from the current depth
      // to find the nearest ancestor node with a uid
      if (!found) {
        const $from = selection.$from;

        for (let depth = $from.depth; depth > 0; depth--) {
          const node = $from.node(depth);
          const uid = node.attrs?.[BLOCK_UID_ATTR];
          if (!uid) continue;

          const pos = $from.before(depth); // position of that node start
          found = { node, pos };
          break;
        }
      }

      if (!found) {
        setActiveBlock(null);
        return;
      }

      // Extract block information
      const { node, pos } = found;
      const uid = node.attrs[BLOCK_UID_ATTR];
      const type = node.type.name;

      // Resolve DOM node and compute bounding rect
      const dom = view.nodeDOM(pos) as HTMLElement | null;
      const domRect = dom ? dom.getBoundingClientRect() : null;

      // Update state with new ActiveBlock, but only if something meaningful changed
      // This avoids unnecessary React re-renders during drag/scroll
      setActiveBlock((prev) => {
        if (
          prev &&
          prev.uid === uid &&
          prev.type === type &&
          prev.pos === pos &&
          prev.domRect?.top === domRect?.top &&
          prev.domRect?.left === domRect?.left &&
          prev.domRect?.width === domRect?.width &&
          prev.domRect?.height === domRect?.height
        ) {
          return prev; // No change, return previous value
        }
        return { uid, type, pos, domRect };
      });
    };

    // Subscribe to editor events
    const handler = () => updateActiveBlock();

    editor.on("selectionUpdate", handler);
    editor.on("transaction", handler);

    // Run once initially to capture current selection
    updateActiveBlock();

    return () => {
      editor.off("selectionUpdate", handler);
      editor.off("transaction", handler);
    };
  }, [editor]);

  return activeBlock;
}
