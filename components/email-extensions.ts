import {
  AIHighlight,
  CharacterCount,
  CodeBlockLowlight,
  Color,
  CustomKeymap,
  GlobalDragHandle,
  HighlightExtension,
  HorizontalRule,
  MarkdownExtension,
  Mathematics,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TextStyle,
  TiptapLink,
  TiptapUnderline,
  Twitter,
  UploadImagesPlugin,
  Youtube,
} from "@/lib/novel";

import { cx } from "class-variance-authority";
import { common, createLowlight } from "lowlight";
import { UniqueID } from "@tiptap/extension-unique-id";
import { EmailParagraph } from "@/lib/extensions/email-paragraph";
import { EmailHeading } from "@/lib/extensions/email-heading";
import { EmailBlockquote } from "@/lib/extensions/email-blockquote";
import { EmailCodeBlock } from "@/lib/extensions/email-code-block";
import { EmailImage } from "@/lib/extensions/email-image";
import { EmailButton } from "@/lib/extensions/email-button";
import { EmailSocialLinks } from "@/lib/extensions/email-social-links";
import { EmailUnsubscribeFooter } from "@/lib/extensions/email-unsubscribe-footer";
import {
  EmailBulletList,
  EmailOrderedList,
  EmailListItem,
} from "@/lib/extensions/email-lists";

// Configure placeholder for email editor
const placeholder = Placeholder.configure({
  placeholder: "Press '/' for email blocks",
  includeChildren: true,
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer"
    ),
  },
});

// EmailImage already includes UploadImagesPlugin and configuration

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2 "),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const starterKit = StarterKit.configure({
  paragraph: false, // We'll use EmailParagraph
  heading: false, // We'll use EmailHeading
  blockquote: false, // We'll use EmailBlockquote
  codeBlock: false, // We'll use EmailCodeBlock
  bulletList: false, // We'll use EmailBulletList
  orderedList: false, // We'll use EmailOrderedList
  listItem: false, // We'll use EmailListItem
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4,
  },
  gapcursor: false,
});

// Configure email-specific nodes with styling
const emailBulletList = EmailBulletList.configure({
  HTMLAttributes: {
    class: cx("list-disc list-outside leading-3 -mt-2"),
  },
});

const emailOrderedList = EmailOrderedList.configure({
  HTMLAttributes: {
    class: cx("list-decimal list-outside leading-3 -mt-2"),
  },
});

const emailListItem = EmailListItem.configure({
  HTMLAttributes: {
    class: cx("leading-normal -mb-2"),
  },
});

const emailBlockquote = EmailBlockquote.configure({
  HTMLAttributes: {
    class: cx("border-l-4 border-primary"),
  },
});

const emailCodeBlock = EmailCodeBlock.configure({
  HTMLAttributes: {
    class: cx(
      "rounded-md bg-muted text-muted-foreground border p-5 font-mono font-medium"
    ),
  },
});

const codeBlockLowlight = CodeBlockLowlight.configure({
  lowlight: createLowlight(common),
});

const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
  inline: false,
});

const twitter = Twitter.configure({
  HTMLAttributes: {
    class: cx("not-prose"),
  },
  inline: false,
});

const mathematics = Mathematics.configure({
  HTMLAttributes: {
    class: cx("text-foreground rounded p-1 hover:bg-accent cursor-pointer"),
  },
  katexOptions: {
    throwOnError: false,
  },
});

const characterCount = CharacterCount.configure();

const markdownExtension = MarkdownExtension.configure({
  html: true,
  tightLists: true,
  tightListClass: "tight",
  bulletListMarker: "-",
  linkify: false,
  breaks: false,
  transformPastedText: false,
  transformCopiedText: false,
});

const aiHighlight = AIHighlight;

// Configure UniqueID extension for stable block identity
const uniqueId = UniqueID.configure({
  attributeName: "uid",
  types: [
    "paragraph",
    "heading",
    "blockquote",
    "codeBlock",
    "bulletList",
    "orderedList",
    "taskList",
    "taskItem",
    "image",
    "youtube",
    "twitter",
    "buttonBlock",
    "socialLinksBlock",
    "unsubscribeFooterBlock",
    "horizontalRule",
  ],
  generateID: () => crypto.randomUUID(),
});

/**
 * Email-specific extensions configuration
 * Includes all necessary extensions for the email editor
 */
export const emailExtensions = [
  starterKit,
  EmailParagraph,
  EmailHeading,
  emailBlockquote,
  emailCodeBlock,
  emailBulletList,
  emailOrderedList,
  emailListItem,
  EmailImage,
  EmailButton,
  EmailSocialLinks,
  EmailUnsubscribeFooter,
  uniqueId,
  placeholder,
  tiptapLink,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
  codeBlockLowlight,
  youtube,
  twitter,
  mathematics,
  characterCount,
  TiptapUnderline,
  markdownExtension,
  HighlightExtension,
  TextStyle,
  Color,
  CustomKeymap,
  GlobalDragHandle.configure({
    dragHandleWidth: 20,
    scrollTreshold: 100,
    excludedTags: [],
    customNodes: [
      "youtube",
      "twitter",
      "image",
      "buttonBlock",
      "socialLinksBlock",
      "unsubscribeFooterBlock",
      // Add other email-specific block types here as they're implemented
    ],
  }),
];
