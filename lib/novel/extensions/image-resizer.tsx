import { useCurrentEditor } from "@tiptap/react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import Moveable from "react-moveable";

export const ImageResizer: FC = () => {
  const { editor } = useCurrentEditor();
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [selectionKey, setSelectionKey] = useState<number>(0);

  useEffect(() => {
    if (!editor?.isActive("image")) {
      setTarget(null);
      setSelectionKey(0);
      return;
    }

    const updateTarget = () => {
      const selectedNode = document.querySelector(
        ".ProseMirror-selectednode"
      ) as HTMLElement;
      if (selectedNode) {
        setTarget(selectedNode);
        // Use selection position as key to force Moveable to re-initialize when image moves
        const selection = editor.state.selection;
        if (selection.from !== undefined) {
          setSelectionKey(selection.from);
        }
      }
    };

    // Update target immediately
    updateTarget();

    // Listen to selection updates
    const handleUpdate = () => {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        updateTarget();
      });
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  if (!editor?.isActive("image") || !target) return null;

  const updateMediaSize = () => {
    const imageInfo = target as HTMLImageElement;
    if (imageInfo) {
      const selection = editor.state.selection;
      const setImage = editor.commands.setImage as (options: {
        src: string;
        width: number;
        height: number;
      }) => boolean;

      setImage({
        src: imageInfo.src,
        width: Number(imageInfo.style.width.replace("px", "")),
        height: Number(imageInfo.style.height.replace("px", "")),
      });
      editor.commands.setNodeSelection(selection.from);
    }
  };

  return (
    <Moveable
      key={selectionKey}
      target={target}
      container={null}
      origin={false}
      /* Resize event edges */
      edge={false}
      throttleDrag={0}
      /* When resize or scale, keeps a ratio of the width, height. */
      keepRatio={true}
      /* resizable*/
      /* Only one of resizable, scalable, warpable can be used. */
      resizable={true}
      throttleResize={0}
      onResize={({
        target,
        width,
        height,
        // dist,
        delta,
      }) => {
        if (delta[0]) target.style.width = `${width}px`;
        if (delta[1]) target.style.height = `${height}px`;
      }}
      // { target, isDrag, clientX, clientY }: any
      onResizeEnd={() => {
        updateMediaSize();
      }}
      /* scalable */
      /* Only one of resizable, scalable, warpable can be used. */
      scalable={true}
      throttleScale={0}
      /* Set the direction of resizable */
      renderDirections={["w", "e"]}
      onScale={({
        target,
        // scale,
        // dist,
        // delta,
        transform,
      }) => {
        target.style.transform = transform;
      }}
    />
  );
};
