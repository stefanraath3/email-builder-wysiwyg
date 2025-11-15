"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState, useRef } from "react";

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
