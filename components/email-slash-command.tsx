import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  List,
  ListOrdered,
  Text,
  TextQuote,
  Twitter,
  Youtube,
  MousePointerClick,
  Minus,
  Layout,
  Share2,
  UserMinus,
  Code2,
  Braces,
} from "lucide-react";
import { Command, createSuggestionItems, renderItems } from "@/lib/novel";
import { uploadFn } from "./image-upload";

// Category header item (non-selectable)
const createCategoryHeader = (title: string) => ({
  title,
  description: "",
  icon: <div className="w-[18px] h-[18px]" />, // Empty icon space
  searchTerms: [],
  command: ({ editor, range }: { editor: any; range: any }) => {
    // No-op - category headers are not selectable
  },
  isCategoryHeader: true as const,
});

// Placeholder block command
const createPlaceholderCommand =
  (blockName: string) =>
  ({ editor, range }: { editor: any; range: any }) => {
    editor.chain().focus().deleteRange(range).run();
    // Insert paragraph with placeholder styling using HTML
    editor
      .chain()
      .insertContent(
        `<p class="email-block-placeholder">[${blockName} - Coming Soon]</p>`
      )
      .run();
  };

export const emailSuggestionItems = createSuggestionItems([
  // TEXT category
  createCategoryHeader("Text"),
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large", "h1"],
    icon: <Heading1 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium", "h2"],
    icon: <Heading2 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small", "h3"],
    icon: <Heading3 size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .toggleBlockquote()
        .run(),
  },
  {
    title: "Code Block",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },

  // MEDIA category
  createCategoryHeader("Media"),
  {
    title: "Image",
    description: "Upload an image from your computer.",
    searchTerms: ["photo", "picture", "media"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor.view, pos);
        }
      };
      input.click();
    },
  },
  {
    title: "YouTube",
    description: "Embed a Youtube video.",
    searchTerms: ["video", "youtube", "embed"],
    icon: <Youtube size={18} />,
    command: ({ editor, range }) => {
      const videoLink = prompt("Please enter Youtube Video Link");
      if (!videoLink) return;

      //From https://regexr.com/3dj5t
      const ytregex = new RegExp(
        /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
      );

      if (ytregex.test(videoLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setYoutubeVideo({
            src: videoLink,
          })
          .run();
      } else {
        alert("Please enter a correct Youtube Video Link");
      }
    },
  },
  {
    title: "X (former Twitter)",
    description: "Embed an X (Twitter) post.",
    searchTerms: ["twitter", "x", "embed", "tweet"],
    icon: <Twitter size={18} />,
    command: ({ editor, range }) => {
      const tweetLink = prompt("Please enter Twitter/X Link");
      if (!tweetLink) return;

      const tweetRegex = new RegExp(
        /^https?:\/\/(www\.)?x\.com\/([a-zA-Z0-9_]{1,15})(\/status\/(\d+))?(\/\S*)?$/
      );

      if (tweetRegex.test(tweetLink)) {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setTweet({
            src: tweetLink,
          })
          .run();
      } else {
        alert("Please enter a correct Twitter/X Link");
      }
    },
  },

  // LAYOUT category (placeholders)
  createCategoryHeader("Layout"),
  {
    title: "Button",
    description: "Add a call-to-action button.",
    searchTerms: ["button", "cta", "link"],
    icon: <MousePointerClick size={18} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertButton({
          text: "Click me",
          href: "#",
        })
        .run();
    },
  },
  {
    title: "Divider",
    description: "Add a horizontal divider.",
    searchTerms: ["hr", "separator", "line"],
    icon: <Minus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Section",
    description: "Add a section container.",
    searchTerms: ["section", "container", "columns"],
    icon: <Layout size={18} />,
    command: createPlaceholderCommand("Section Block"),
  },
  {
    title: "Social Links",
    description: "Add social media links with icons.",
    searchTerms: [
      "social",
      "icons",
      "links",
      "twitter",
      "facebook",
      "linkedin",
    ],
    icon: <Share2 size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();

      // Emit custom event to open modal
      window.dispatchEvent(
        new CustomEvent("emailEditor:openSocialLinksModal", {
          detail: {
            currentLinks: [],
            callback: (links: any[]) => {
              editor.chain().focus().insertSocialLinks({ links }).run();
            },
          },
        })
      );
    },
  },
  {
    title: "Unsubscribe Footer",
    description: "Add unsubscribe footer with link.",
    searchTerms: ["unsubscribe", "footer", "opt-out"],
    icon: <UserMinus size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertUnsubscribeFooter().run();
    },
  },

  // UTILITY category (placeholders)
  createCategoryHeader("Utility"),
  {
    title: "HTML",
    description: "Insert raw HTML code.",
    searchTerms: ["html", "code", "raw"],
    icon: <Code2 size={18} />,
    command: createPlaceholderCommand("HTML Block"),
  },
  {
    title: "Variable",
    description: "Insert a template variable.",
    searchTerms: ["variable", "placeholder", "dynamic"],
    icon: <Braces size={18} />,
    command: createPlaceholderCommand("Variable Block"),
  },
]);

export const emailSlashCommand = Command.configure({
  suggestion: {
    items: () => emailSuggestionItems,
    render: renderItems,
  },
});
