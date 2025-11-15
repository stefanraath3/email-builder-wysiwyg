"use client";

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useRef } from "react";
import {
  SlashCommand as SlashCommandExtension,
  slashCommandItems,
} from "@/lib/slash-command-extension";
import { SlashCommand } from "@/components/slash-command";
import tippy, { Instance as TippyInstance } from "tippy.js";

const STORAGE_KEY = "email-editor-content";

export function EmailEditor() {
  const [editorJSON, setEditorJSON] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      SlashCommandExtension.configure({
        suggestion: {
          items: ({ query }: { query: string }) => {
            return slashCommandItems.filter((item) => {
              const searchTerm = query.toLowerCase();
              return (
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
              );
            });
          },
          render: () => {
            let component: ReactRenderer;
            let popup: TippyInstance[];

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(SlashCommand, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) {
                  return;
                }

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },
              onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                  return;
                }

                popup[0].setProps({
                  getReferenceClientRect: props.clientRect,
                });
              },
              onKeyDown(props: any) {
                if (props.event.key === "Escape") {
                  popup[0].hide();
                  return true;
                }
                return (component.ref as any)?.onKeyDown?.(props);
              },
              onExit() {
                popup[0].destroy();
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[200px] px-0 py-2 text-[14px] leading-[1.55] text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setEditorJSON(json);

      // Debounce localStorage saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
      }, 300);
    },
  });

  // Load content from localStorage on mount and initialize JSON
  useEffect(() => {
    if (!editor) return;

    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      try {
        const json = JSON.parse(savedContent);
        editor.commands.setContent(json);
        setEditorJSON(json);
      } catch (error) {
        console.error("Failed to load saved content:", error);
        setEditorJSON(editor.getJSON());
      }
    } else {
      // Initialize with empty editor JSON
      setEditorJSON(editor.getJSON());
    }
  }, [editor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <EditorContent editor={editor} />
      <div className="mt-8 border-t pt-6">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          JSON Output (Debug)
        </h3>
        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
          {JSON.stringify(editorJSON, null, 2)}
        </pre>
      </div>
    </div>
  );
}
