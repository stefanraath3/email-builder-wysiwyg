import { Extension } from "@tiptap/core";
import Suggestion, { SuggestionOptions } from "@tiptap/suggestion";
import {
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  type LucideIcon,
} from "lucide-react";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: (props: { editor: any; range: any }) => void;
}

export const slashCommandItems: SlashCommandItem[] = [
  {
    title: "Paragraph",
    description: "Regular text paragraph",
    icon: Pilcrow,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large heading",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium heading",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small heading",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleHeading({ level: 3 })
        .run();
    },
  },
];

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandItem>, "editor">;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
