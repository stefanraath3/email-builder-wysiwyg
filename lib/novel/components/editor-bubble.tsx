import { useCurrentEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import type { BubbleMenuProps } from "@tiptap/react/menus";
import { isNodeSelection } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import { forwardRef, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

export interface EditorBubbleProps extends Omit<BubbleMenuProps, "editor"> {
  readonly children: ReactNode;
  readonly tippyOptions?: {
    placement?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top-start"
      | "top-end"
      | "bottom-start"
      | "bottom-end"
      | "left-start"
      | "left-end"
      | "right-start"
      | "right-end";
    onHidden?: () => void;
    [key: string]: unknown;
  };
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
  ({ children, tippyOptions, ...rest }, ref) => {
    const { editor: currentEditor } = useCurrentEditor();

    const bubbleMenuProps: Omit<BubbleMenuProps, "children"> = useMemo(() => {
      const shouldShow: NonNullable<BubbleMenuProps["shouldShow"]> = ({
        editor,
        state,
      }: {
        editor: Editor;
        state: EditorState;
      }) => {
        const { selection } = state;
        const { empty } = selection;

        // don't show bubble menu if:
        // - the editor is not editable
        // - the selected node is an image
        // - the selection is empty
        // - the selection is a node selection (for drag handles)
        if (
          !editor.isEditable ||
          editor.isActive("image") ||
          empty ||
          isNodeSelection(selection)
        ) {
          return false;
        }
        return true;
      };

      return {
        shouldShow,
        options: tippyOptions?.placement
          ? {
              placement: tippyOptions.placement,
            }
          : undefined,
        editor: currentEditor ?? undefined,
        ...rest,
      };
    }, [rest, tippyOptions?.placement, currentEditor]);

    useEffect(() => {
      if (!currentEditor || !tippyOptions?.onHidden) return;

      const handleUpdate = () => {
        // Check if menu should be hidden
        const { selection } = currentEditor.state;
        const { empty } = selection;
        if (empty || isNodeSelection(selection)) {
          tippyOptions.onHidden?.();
        }
      };

      currentEditor.on("selectionUpdate", handleUpdate);
      return () => {
        currentEditor.off("selectionUpdate", handleUpdate);
      };
    }, [currentEditor, tippyOptions?.onHidden]);

    if (!currentEditor) return null;

    return (
      // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
      <div ref={ref}>
        <BubbleMenu {...bubbleMenuProps}>{children}</BubbleMenu>
      </div>
    );
  }
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;
