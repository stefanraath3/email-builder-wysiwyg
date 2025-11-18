"use client";

import { useEffect, useState } from "react";
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
  const { editor } = useEditor();

  // Initialize content from template (only once)
  useEffect(() => {
    if (!isInitialized && template.content) {
      setInitialContent(template.content);
      setIsInitialized(true);
    }
  }, [template.content, isInitialized]);

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
    <div className="email-editor-container w-full">
      {/* Template Header (read-only for Phase 1) */}
      <TemplateHeader />

      {/* Editor Canvas */}
      <div className="editor-canvas mt-6">
        <EditorRoot>
          <EditorContent
            initialContent={initialContent}
            extensions={extensions}
            className="relative min-h-[500px] w-full border-muted bg-background sm:rounded-lg sm:border sm:shadow-lg"
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
              <EmailNodeSelector open={openNode} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />
              <LinkSelector open={openLink} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <MathSelector />
              <Separator orientation="vertical" />
              <TextButtons />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          </EditorContent>
        </EditorRoot>
      </div>

      {/* JSON Debug Panel */}
      <EmailTemplateDebugPanel />
    </div>
  );
}
