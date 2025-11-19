"use client";

import { Command, CommandInput } from "@/components/ui/command";

import { useCompletion } from "@ai-sdk/react";
import { ArrowUp } from "lucide-react";
import { useEditor, addAIHighlight } from "@/lib/novel";
import { useState } from "react";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import { ScrollArea } from "../ui/scroll-area";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector({ onOpenChange }: AISelectorProps) {
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  console.log("🎨 [AI-Selector] Component rendered");
  console.log("🎨 [AI-Selector] Editor available:", !!editor);

  const { completion, complete, isLoading } = useCompletion({
    api: "/api/generate",
    // The API is using result.toTextStreamResponse(), so we must tell the hook
    // to expect a plain text stream instead of the default data-stream protocol.
    streamProtocol: "text",
    onError: (error) => {
      console.error("❌ [AI-Selector] useCompletion error:", error);
      console.error("❌ [AI-Selector] Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(error.message);
    },
    onFinish: (prompt, completion) => {
      console.log("✅ [AI-Selector] Completion finished!");
      console.log("✅ [AI-Selector] Prompt:", prompt?.substring(0, 100));
      console.log("✅ [AI-Selector] Completion length:", completion?.length);
      console.log(
        "✅ [AI-Selector] Completion preview:",
        completion?.substring(0, 200)
      );
    },
  });

  console.log("🎨 [AI-Selector] State:", {
    completionLength: completion.length,
    completionPreview: completion.substring(0, 100),
    isLoading,
    hasInputValue: inputValue.length > 0,
  });

  const hasCompletion = completion.length > 0;
  console.log("🎨 [AI-Selector] hasCompletion:", hasCompletion);

  console.log(
    "🎨 [AI-Selector] Rendering UI - hasCompletion:",
    hasCompletion,
    "isLoading:",
    isLoading
  );

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose prose-sm dark:prose-invert ai-popover-markdown p-2 px-4">
              <Markdown>{completion}</Markdown>
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground">
          <Magic className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => editor && addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
              onClick={() => {
                console.log("🖱️ [AI-Selector] Submit button clicked");
                console.log("🖱️ [AI-Selector] Current state:", {
                  hasCompletion: completion.length > 0,
                  inputValue,
                  hasEditor: !!editor,
                });

                if (!editor) {
                  console.error("❌ [AI-Selector] No editor available!");
                  return;
                }

                if (completion) {
                  console.log(
                    "📤 [AI-Selector] Calling complete with existing completion (zap mode)"
                  );
                  console.log("📤 [AI-Selector] Body:", {
                    option: "zap",
                    command: inputValue,
                  });
                  return complete(completion, {
                    body: { option: "zap", command: inputValue },
                  })
                    .then(() => {
                      console.log(
                        "✅ [AI-Selector] Complete finished (zap mode)"
                      );
                      setInputValue("");
                    })
                    .catch((err) => {
                      console.error(
                        "❌ [AI-Selector] Complete error (zap mode):",
                        err
                      );
                    });
                }

                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(
                  slice.content
                );
                console.log(
                  "📤 [AI-Selector] Calling complete with selected text"
                );
                console.log(
                  "📤 [AI-Selector] Selected text:",
                  text.substring(0, 100)
                );
                console.log("📤 [AI-Selector] Body:", {
                  option: "zap",
                  command: inputValue,
                });

                complete(text, {
                  body: { option: "zap", command: inputValue },
                })
                  .then(() => {
                    console.log("✅ [AI-Selector] Complete finished");
                    setInputValue("");
                  })
                  .catch((err) => {
                    console.error("❌ [AI-Selector] Complete error:", err);
                  });
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor?.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) => {
                console.log(
                  "🎯 [AI-Selector] AISelectorCommands onSelect called"
                );
                console.log(
                  "🎯 [AI-Selector] Value:",
                  value?.substring(0, 100)
                );
                console.log("🎯 [AI-Selector] Option:", option);
                console.log("🎯 [AI-Selector] Calling complete with:", {
                  value: value?.substring(0, 100),
                  option,
                });
                complete(value, { body: { option } })
                  .then(() => {
                    console.log(
                      "✅ [AI-Selector] Complete finished from AISelectorCommands"
                    );
                  })
                  .catch((err) => {
                    console.error(
                      "❌ [AI-Selector] Complete error from AISelectorCommands:",
                      err
                    );
                  });
              }}
            />
          )}
        </>
      )}
    </Command>
  );
}
