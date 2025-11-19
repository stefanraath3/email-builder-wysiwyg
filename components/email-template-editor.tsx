"use client";

import { useEffect, useState, useRef } from "react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "@/lib/novel";
import { useEmailTemplate } from "@/hooks/use-email-template";
import { emailExtensions } from "@/components/email-extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { EmailNodeSelector } from "./selectors/email-node-selector";
import { Separator } from "./ui/separator";
import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { emailSlashCommand, emailSuggestionItems } from "./email-slash-command";
import TemplateHeader from "./template-header";
import EmailTemplateDebugPanel from "./email-template-debug-panel";
import { useEditor } from "@/lib/novel";
import {
  findNodeByUid,
  findNodeByUidJson,
  updateNodeAttrsByUid,
} from "@/lib/email-blocks";
import { useActiveBlock } from "@/hooks/use-active-block";
import { AttributesPanel } from "./attributes-panel";
import { ActiveBlockTestPanel } from "./active-block-test-panel";
import {
  applyGlobalStylesToElement,
  getContainerAlignmentClass,
} from "@/lib/global-styles-css";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CONTAINER_WIDTH,
  DEFAULT_PADDING,
} from "@/lib/email-template-defaults";

const extensions = [...emailExtensions, emailSlashCommand];

/**
 * Main email template editor component
 * Wraps the TipTap editor and syncs with EmailTemplate context
 */
export function EmailTemplateEditor() {
  const { template, updateContent } = useEmailTemplate();
  const [initialContent, setInitialContent] = useState<JSONContent | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);
  const [isAttributesOpen, setIsAttributesOpen] = useState(false);
  const { editor } = useEditor();
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const bodyWrapperRef = useRef<HTMLDivElement>(null);

  // Initialize content from template (only once)
  useEffect(() => {
    if (!isInitialized && template.content) {
      setInitialContent(template.content);
      setIsInitialized(true);
    }
  }, [template.content, isInitialized]);

  // Listen for attributes handle click event from GlobalDragHandle plugin
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOpenAttributes = () => {
      setIsAttributesOpen(true);
    };

    window.addEventListener("emailEditor:openAttributes", handleOpenAttributes);

    return () => {
      window.removeEventListener(
        "emailEditor:openAttributes",
        handleOpenAttributes
      );
    };
  }, []);

  // Apply global styles as CSS variables to editor wrapper and body content.
  // NOTE:
  // - On first mount after a full page reload, the EmailTemplate (with
  //   persisted globalStyles) is available *before* the editor DOM (and
  //   editorWrapperRef) is attached.
  // - If we only depend on template.globalStyles here, the effect can run
  //   once with a null ref and never re-run, so CSS variables are not
  //   applied until the user changes a global style (which triggers a new
  //   render and re-runs this effect).
  // - That is exactly why the container background appears correct right
  //   after editing, but is lost after a hard refresh until another change
  //   is made.
  //
  // To fix this, we also depend on `isInitialized` so that we re-apply
  // global styles after the editor DOM is ready on initial load.
  useEffect(() => {
    if (!template.globalStyles || !isInitialized) return;

    // Apply to container wrapper (where the editor canvas lives)
    if (editorWrapperRef.current) {
      applyGlobalStylesToElement(
        editorWrapperRef.current,
        template.globalStyles
      );
    }

    // Apply to body content (sibling element with class email-body-content)
    if (typeof window !== "undefined") {
      const bodyContent = document.querySelector(
        ".email-body-content"
      ) as HTMLElement | null;
      if (bodyContent) {
        applyGlobalStylesToElement(bodyContent, template.globalStyles);
      }
    }
  }, [template.globalStyles, isInitialized]);

  // Dev helper: expose editor and helper functions to window for testing
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      (window as any).__emailEditor = {
        editor,
        template,
        helpers: {
          findNodeByUid: (uid: string) => editor && findNodeByUid(editor, uid),
          findNodeByUidJson: (uid: string) =>
            template.content && findNodeByUidJson(template.content, uid),
          updateNodeAttrsByUid: (uid: string, attrs: Record<string, unknown>) =>
            editor && updateNodeAttrsByUid(editor, uid, attrs),
        },
      };
    }
  }, [editor, template]);

  // Handle editor updates
  const handleUpdate = (editor: EditorInstance) => {
    const json = editor.getJSON();
    updateContent(json);
  };

  if (!initialContent || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <>
      {/* Email Header - Separate row, not affected by body background */}
      <div className="w-full bg-background border-b border-border py-4">
        <div className="mx-auto max-w-7xl px-6">
          <TemplateHeader />
        </div>
      </div>

      {/* Body Background - This is what gets the body backgroundColor */}
      <div className="email-body-content flex-1 py-8">
        {/* Editor Canvas - Container sits on Body */}
        <div
          ref={editorWrapperRef}
          className="editor-canvas mx-auto"
          style={{
            width: `${
              template.globalStyles?.container?.width ?? DEFAULT_CONTAINER_WIDTH
            }px`,
            paddingTop: `${
              template.globalStyles?.container?.padding?.top ??
              DEFAULT_PADDING.top
            }px`,
            paddingRight: `${
              template.globalStyles?.container?.padding?.right ??
              DEFAULT_PADDING.right
            }px`,
            paddingBottom: `${
              template.globalStyles?.container?.padding?.bottom ??
              DEFAULT_PADDING.bottom
            }px`,
            paddingLeft: `${
              template.globalStyles?.container?.padding?.left ??
              DEFAULT_PADDING.left
            }px`,
          }}
        >
          <EditorRoot>
            <div
              className={cn(
                "relative min-h-[500px] w-full",
                getContainerAlignmentClass(
                  template.globalStyles?.container?.align ?? "center"
                )
              )}
              style={{
                backgroundColor:
                  template.globalStyles?.container?.backgroundColor ??
                  "#ffffff",
              }}
            >
              <EditorContent
                initialContent={initialContent}
                extensions={extensions}
                editorProps={{
                  handleDOMEvents: {
                    keydown: (_view, event) => handleCommandNavigation(event),
                  },
                  handlePaste: (view, event) =>
                    handleImagePaste(view, event, uploadFn),
                  handleDrop: (view, event, _slice, moved) =>
                    handleImageDrop(view, event, moved, uploadFn),
                  attributes: {
                    class:
                      "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
                  },
                }}
                onUpdate={({ editor }) => {
                  handleUpdate(editor);
                }}
                slotAfter={<ImageResizer />}
              >
                {/* Slash Command Menu */}
                <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
                  <EditorCommandEmpty className="px-2 text-muted-foreground">
                    No results
                  </EditorCommandEmpty>
                  <EditorCommandList>
                    {emailSuggestionItems.map((item, index) => {
                      // Check if this is a category header
                      const isCategoryHeader =
                        (item as any).isCategoryHeader === true;

                      if (isCategoryHeader) {
                        return (
                          <div
                            key={`category-${item.title}`}
                            className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                          >
                            {item.title}
                          </div>
                        );
                      }

                      return (
                        <EditorCommandItem
                          value={item.title}
                          onCommand={(val) => item.command?.(val)}
                          className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                          key={`item-${index}-${item.title}`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </EditorCommandItem>
                      );
                    })}
                  </EditorCommandList>
                </EditorCommand>

                {/* Bubble Menu */}
                <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
                  <Separator orientation="vertical" />
                  <EmailNodeSelector
                    open={openNode}
                    onOpenChange={setOpenNode}
                  />
                  <Separator orientation="vertical" />
                  <LinkSelector open={openLink} onOpenChange={setOpenLink} />
                  <Separator orientation="vertical" />
                  <MathSelector />
                  <Separator orientation="vertical" />
                  <TextButtons />
                  <Separator orientation="vertical" />
                  <ColorSelector open={openColor} onOpenChange={setOpenColor} />
                </GenerativeMenuSwitch>

                {/* Active Block Test Panel (Dev Only) - temporarily enabled for verification */}
                {process.env.NODE_ENV === "development" && (
                  <ActiveBlockTestPanel />
                )}

                {/* Attributes Panel - uses activeBlock from useActiveBlock hook */}
                {/* Sheet uses portals so it can be rendered here but will portal to body */}
                <AttributesPanelWrapper
                  isOpen={isAttributesOpen}
                  onOpenChange={setIsAttributesOpen}
                />
              </EditorContent>
            </div>
          </EditorRoot>
        </div>
      </div>

      {/* JSON Debug Panel */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <EmailTemplateDebugPanel />
      </div>
    </>
  );
}

/**
 * Wrapper component to use useActiveBlock inside EditorContent context
 * This ensures the hook has access to TipTap's editor context
 */
function AttributesPanelWrapper({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const activeBlock = useActiveBlock();
  const { template } = useEmailTemplate();

  return (
    <AttributesPanel
      open={isOpen}
      onOpenChange={onOpenChange}
      blockUid={activeBlock?.uid ?? null}
      blockType={activeBlock?.type ?? null}
      globalStyles={template.globalStyles}
    />
  );
}
