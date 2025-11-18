import { Extension } from "@tiptap/core";
import { Slice, Fragment } from "@tiptap/pm/model";
import * as pmView from "@tiptap/pm/view";
import {
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from "@tiptap/pm/state";

interface DragHandlePluginOptions {
  pluginKey: string;
  dragHandleWidth: number;
  scrollTreshold: number;
  dragHandleSelector?: string;
  excludedTags: string[];
  customNodes: string[];
}

interface GlobalDragHandleOptions
  extends Omit<DragHandlePluginOptions, "pluginKey"> {}

function getPmView() {
  try {
    return pmView as unknown as {
      __serializeForClipboard?: (
        view: any,
        slice: Slice
      ) => {
        dom: HTMLElement;
        text: string;
      };
    };
  } catch {
    return null;
  }
}

function serializeForClipboard(view: any, slice: Slice) {
  // Newer Tiptap/ProseMirror
  // @ts-ignore – runtime check for newer API
  if (view && typeof view.serializeForClipboard === "function") {
    // @ts-ignore
    return view.serializeForClipboard(slice) as {
      dom: HTMLElement;
      text: string;
    };
  }

  // Older version fallback
  const proseMirrorView = getPmView();
  if (
    proseMirrorView &&
    typeof proseMirrorView.__serializeForClipboard === "function"
  ) {
    return proseMirrorView.__serializeForClipboard(view, slice) as {
      dom: HTMLElement;
      text: string;
    };
  }

  throw new Error("No supported clipboard serialization method found.");
}

function absoluteRect(node: Element) {
  const data = node.getBoundingClientRect();
  // IMPORTANT:
  // We intentionally ignore any enclosing [role="dialog"] with CSS transforms.
  // getBoundingClientRect() already returns viewport coordinates, which is
  // exactly what we want for our fixed-position drag handle. This keeps the
  // handle aligned in both the main editor and dialog editors.
  return {
    top: data.top,
    left: data.left,
    width: data.width,
  };
}

function nodeDOMAtCoords(
  coords: { x: number; y: number },
  options: GlobalDragHandleOptions
) {
  const selectors = [
    "li",
    "p:not(:first-child)",
    "pre",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    ...options.customNodes.map((node) => `[data-type=${node}]`),
  ].join(", ");

  return document
    .elementsFromPoint(coords.x, coords.y)
    .find(
      (elem) =>
        elem instanceof Element &&
        (elem.parentElement?.matches?.(".ProseMirror") ||
          elem.matches(selectors))
    );
}

function nodePosAtDOM(
  node: Element,
  view: any,
  options: GlobalDragHandleOptions
) {
  const boundingRect = node.getBoundingClientRect();
  return view.posAtCoords({
    left: boundingRect.left + 50 + options.dragHandleWidth,
    top: boundingRect.top + 1,
  })?.inside;
}

function calcNodePos(pos: number, view: any) {
  const $pos = view.state.doc.resolve(pos);
  if ($pos.depth > 1) return $pos.before($pos.depth);
  return pos;
}

function DragHandlePlugin(options: DragHandlePluginOptions) {
  let listType = "";
  let lastHoveredPos: number | null = null;

  function handleDragStart(event: DragEvent, view: any) {
    view.focus();

    if (!event.dataTransfer) return;

    const node = nodeDOMAtCoords(
      {
        x: event.clientX + 50 + options.dragHandleWidth,
        y: event.clientY,
      },
      options
    );

    if (!(node instanceof Element)) return;

    let draggedNodePos = nodePosAtDOM(node, view, options);

    if (draggedNodePos == null || draggedNodePos < 0) return;

    draggedNodePos = calcNodePos(draggedNodePos, view);

    const { from, to } = view.state.selection;
    const diff = from - to;

    const fromSelectionPos = calcNodePos(from, view);

    let differentNodeSelected = false;

    const nodePos = view.state.doc.resolve(fromSelectionPos);

    // Check if nodePos points to the top level node
    if (nodePos.node().type.name === "doc") differentNodeSelected = true;
    else {
      const nodeSelection = NodeSelection.create(
        view.state.doc,
        nodePos.before()
      );

      // Check if the node where the drag event started is part of the current selection
      differentNodeSelected = !(
        draggedNodePos + 1 >= nodeSelection.$from.pos &&
        draggedNodePos <= nodeSelection.$to.pos
      );
    }

    let selection = view.state.selection;

    if (
      !differentNodeSelected &&
      diff !== 0 &&
      !(view.state.selection instanceof NodeSelection)
    ) {
      const endSelection = NodeSelection.create(view.state.doc, to - 1);

      selection = TextSelection.create(
        view.state.doc,
        draggedNodePos,
        endSelection.$to.pos
      );
    } else {
      selection = NodeSelection.create(view.state.doc, draggedNodePos);

      // if inline node is selected, e.g mention -> go to the parent node to select the whole node
      // if table row is selected, go to the parent node to select the whole node
      if (
        selection.node.type.isInline ||
        selection.node.type.name === "tableRow"
      ) {
        const $pos = view.state.doc.resolve(selection.from);
        selection = NodeSelection.create(view.state.doc, $pos.before());
      }
    }

    view.dispatch(view.state.tr.setSelection(selection));

    // If the selected node is a list item, we need to save the type of the wrapping list e.g. OL or UL
    if (
      view.state.selection instanceof NodeSelection &&
      view.state.selection.node.type.name === "listItem"
    ) {
      listType = (node.parentElement as HTMLElement).tagName;
    }

    const slice = view.state.selection.content() as Slice;
    const { dom, text } = serializeForClipboard(view, slice);

    event.dataTransfer.clearData();
    event.dataTransfer.setData("text/html", dom.innerHTML);
    event.dataTransfer.setData("text/plain", text);
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer.setDragImage(node, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    (view as any).dragging = { slice, move: event.ctrlKey };
  }

  let dragHandleElement: HTMLElement | null = null;
  let attributesHandleElement: HTMLElement | null = null;

  function hideDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.add("hide");
    }
    if (attributesHandleElement) {
      attributesHandleElement.classList.add("hide");
    }
  }

  function showDragHandle() {
    if (dragHandleElement) {
      dragHandleElement.classList.remove("hide");
    }
    if (attributesHandleElement) {
      attributesHandleElement.classList.remove("hide");
    }
  }

  function hideHandleOnEditorOut(event: MouseEvent) {
    // Check if we're moving to the handles from the editor
    const relatedTarget = event.relatedTarget as Element | null;

    const isInsideEditor =
      relatedTarget?.classList.contains("tiptap") ||
      relatedTarget?.classList.contains("drag-handle") ||
      relatedTarget?.classList.contains("block-attributes-handle") ||
      relatedTarget?.closest(".drag-handle") ||
      relatedTarget?.closest(".block-attributes-handle");

    if (isInsideEditor) return;

    hideDragHandle();
    lastHoveredPos = null;
  }

  return new Plugin({
    key: new PluginKey(options.pluginKey),

    view: (view) => {
      const handleBySelector = options.dragHandleSelector
        ? (document.querySelector(
            options.dragHandleSelector
          ) as HTMLElement | null)
        : null;

      dragHandleElement = handleBySelector ?? document.createElement("div");
      dragHandleElement.draggable = true;
      dragHandleElement.dataset.dragHandle = "";
      dragHandleElement.classList.add("drag-handle");

      // Create attributes handle element (replaces cog-icon)
      attributesHandleElement = document.createElement("div");
      attributesHandleElement.classList.add("block-attributes-handle");
      attributesHandleElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"></line>
          <line x1="4" y1="10" x2="4" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12" y2="3"></line>
          <line x1="20" y1="21" x2="20" y2="16"></line>
          <line x1="20" y1="12" x2="20" y2="3"></line>
          <line x1="1" y1="14" x2="7" y2="14"></line>
          <line x1="9" y1="8" x2="15" y2="8"></line>
          <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
      `;

      // Handle attributes button click: set selection to block start and emit event to open Sheet
      attributesHandleElement.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Guard: ensure we have a valid view and hovered position
        if (!view || lastHoveredPos == null || lastHoveredPos < 0) {
          return;
        }

        // Compute the block start position using existing helper
        const blockStartPos = calcNodePos(lastHoveredPos, view);

        // Try to create a NodeSelection first (works for atomic nodes and block nodes)
        let selection;
        try {
          selection = NodeSelection.create(view.state.doc, blockStartPos);
        } catch {
          // If NodeSelection fails, fall back to TextSelection
          // Place cursor just inside the block so useActiveBlock can find it
          const $pos = view.state.doc.resolve(blockStartPos);
          // Move one position forward to be inside the block content
          const insidePos =
            blockStartPos < view.state.doc.content.size
              ? blockStartPos + 1
              : blockStartPos;
          selection = TextSelection.create(view.state.doc, insidePos);
        }

        // Dispatch transaction to set selection and scroll into view
        view.dispatch(view.state.tr.setSelection(selection).scrollIntoView());

        // Emit custom event to request opening the React Attributes Sheet
        // React side will use useActiveBlock to get full block details
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("emailEditor:openAttributes", {
              detail: { pos: blockStartPos },
            })
          );
        }
      });

      // Keep handles visible when hovering over them
      attributesHandleElement.addEventListener("mouseenter", () => {
        showDragHandle();
      });

      dragHandleElement?.addEventListener("mouseenter", () => {
        showDragHandle();
      });

      function onDragHandleDragStart(e: DragEvent) {
        handleDragStart(e, view);
      }

      dragHandleElement?.addEventListener("dragstart", onDragHandleDragStart);

      function onDragHandleDrag(e: DragEvent) {
        hideDragHandle();

        const scrollY = window.scrollY;

        if (e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY - 30, behavior: "smooth" });
        } else if (window.innerHeight - e.clientY < options.scrollTreshold) {
          window.scrollTo({ top: scrollY + 30, behavior: "smooth" });
        }
      }

      dragHandleElement?.addEventListener("drag", onDragHandleDrag);

      hideDragHandle();

      // Get the container element - prefer parentElement, fallback to view.dom
      const parent =
        (view?.dom?.parentElement as HTMLElement | null) ||
        (view?.dom as HTMLElement | null);

      // Ensure the container is positioned so the absolutely positioned
      // drag handle is laid out relative to the editor box, not the page.
      if (parent && getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      if (!handleBySelector && parent) {
        parent.appendChild(dragHandleElement);
        parent.appendChild(attributesHandleElement);
      }

      parent?.addEventListener("mouseout", hideHandleOnEditorOut);

      return {
        destroy: () => {
          if (!handleBySelector) {
            dragHandleElement?.remove?.();
            attributesHandleElement?.remove?.();
          }

          dragHandleElement?.removeEventListener("drag", onDragHandleDrag);
          dragHandleElement?.removeEventListener(
            "dragstart",
            onDragHandleDragStart
          );

          dragHandleElement = null;
          attributesHandleElement = null;
          lastHoveredPos = null;

          parent?.removeEventListener("mouseout", hideHandleOnEditorOut);
        },
      };
    },

    props: {
      handleDOMEvents: {
        mousemove: (view, event: MouseEvent) => {
          if (!view.editable) {
            return;
          }

          // Check if mouse is over the handles themselves - keep them visible
          const target = event.target as Element | null;

          if (
            target?.classList.contains("block-attributes-handle") ||
            target?.classList.contains("drag-handle") ||
            target?.closest(".block-attributes-handle") ||
            target?.closest(".drag-handle")
          ) {
            return;
          }

          const node = nodeDOMAtCoords(
            {
              x: event.clientX + 50 + options.dragHandleWidth,
              y: event.clientY,
            },
            options
          );

          const notDragging = (node as Element | null)?.closest?.(
            ".not-draggable"
          );

          const excludedTagList = options.excludedTags
            .concat(["ol", "ul"])
            .join(", ");

          if (
            !(node instanceof Element) ||
            node.matches(excludedTagList) ||
            notDragging
          ) {
            hideDragHandle();
            lastHoveredPos = null;
            return;
          }

          const compStyle = window.getComputedStyle(node);
          const parsedLineHeight = parseInt(compStyle.lineHeight, 10);
          const lineHeight = Number.isNaN(parsedLineHeight)
            ? parseInt(compStyle.fontSize, 10) * 1.2
            : parsedLineHeight;

          const paddingTop = parseInt(compStyle.paddingTop, 10);

          const rect = absoluteRect(node);

          // Get container rect - prefer parentElement, fallback to view.dom
          const container =
            (view.dom.parentElement as HTMLElement | null) ||
            (view.dom as HTMLElement | null);

          const parentRect = container?.getBoundingClientRect() ?? {
            left: 0,
            top: 0,
          };

          rect.top += (lineHeight - 24) / 2;
          rect.top += paddingTop;

          // Li markers
          if (node.matches("ul:not([data-type=taskList]) li, ol li")) {
            rect.left -= options.dragHandleWidth;
          }

          rect.width = options.dragHandleWidth;

          if (!dragHandleElement || !attributesHandleElement) return;

          const left = rect.left - rect.width - parentRect.left;
          const top = rect.top - parentRect.top;

          dragHandleElement.style.left = `${left}px`;
          dragHandleElement.style.top = `${top}px`;

          // Position attributes handle to the left of the drag handle
          // Convert rem to pixels (assuming 16px base font size)
          const attributesHandleWidthPx = 1.2 * 16; // Same width as drag handle (1.2rem)
          attributesHandleElement.style.left = `${
            left - attributesHandleWidthPx - 4
          }px`; // 4px gap between handles
          attributesHandleElement.style.top = `${top}px`;

          // Store the hovered block's position for later use (Part 2/3)
          const inside = nodePosAtDOM(node, view, options);
          if (inside != null && inside >= 0) {
            lastHoveredPos = calcNodePos(inside, view);
          } else {
            lastHoveredPos = null;
          }

          showDragHandle();
        },

        keydown: () => {
          hideDragHandle();
          lastHoveredPos = null;
        },

        mousewheel: () => {
          hideDragHandle();
          lastHoveredPos = null;
        },

        // dragging class is used for CSS
        dragstart: (view) => {
          view.dom.classList.add("dragging");
        },

        drop: (view, event: DragEvent) => {
          view.dom.classList.remove("dragging");

          hideDragHandle();
          lastHoveredPos = null;

          let droppedNode: any = null;

          const dropPos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });

          if (!dropPos) return;

          if (view.state.selection instanceof NodeSelection) {
            droppedNode = view.state.selection.node;
          }

          if (!droppedNode) return;

          const resolvedPos = view.state.doc.resolve(dropPos.pos);

          const isDroppedInsideList =
            resolvedPos.parent.type.name === "listItem";

          // If the selected node is a list item and is not dropped inside a list, we need to wrap it inside <ol> tag otherwise
          // ol list items will be transformed into ul list item when dropped
          if (
            view.state.selection instanceof NodeSelection &&
            view.state.selection.node.type.name === "listItem" &&
            !isDroppedInsideList &&
            listType === "OL"
          ) {
            const newList = view.state.schema.nodes.orderedList?.createAndFill(
              null,
              droppedNode
            );

            if (!newList) return;

            const slice = new Slice(Fragment.from(newList), 0, 0);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            (view as any).dragging = { slice, move: event.ctrlKey };
          }
        },

        dragend: (view) => {
          view.dom.classList.remove("dragging");
        },
      },
    },
  });
}

const GlobalDragHandle = Extension.create<GlobalDragHandleOptions>({
  name: "globalDragHandle",

  addOptions() {
    return {
      dragHandleWidth: 20,
      scrollTreshold: 100,
      excludedTags: [],
      customNodes: [],
    };
  },

  addProseMirrorPlugins() {
    return [
      DragHandlePlugin({
        pluginKey: "globalDragHandle",
        dragHandleWidth: this.options.dragHandleWidth,
        scrollTreshold: this.options.scrollTreshold,
        dragHandleSelector: (this.options as any).dragHandleSelector,
        excludedTags: this.options.excludedTags,
        customNodes: this.options.customNodes,
      }),
    ];
  },
});

export { DragHandlePlugin, GlobalDragHandle as default };
