import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SocialLinksView } from "@/components/node-views/social-links-view";

/**
 * Social link configuration
 */
export type SocialLink = {
  platform: "linkedin" | "facebook" | "x" | "youtube";
  url: string;
};

/**
 * Options for inserting social links
 */
type InsertSocialLinksOptions = {
  links?: SocialLink[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    socialLinksBlock: {
      /**
       * Insert a social links block
       * @param options Social links configuration
       * @example editor.commands.insertSocialLinks({ links: [{ platform: "x", url: "https://x.com/..." }] })
       */
      insertSocialLinks: (options: InsertSocialLinksOptions) => ReturnType;
    };
  }
}

export const EmailSocialLinks = Node.create({
  name: "socialLinksBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      links: {
        default: [],
        parseHTML: (element: HTMLElement) => {
          const dataLinks = element.getAttribute("data-links");
          if (dataLinks) {
            try {
              return JSON.parse(dataLinks);
            } catch {
              return [];
            }
          }
          return [];
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.links || attributes.links.length === 0) {
            return {};
          }
          return {
            "data-links": JSON.stringify(attributes.links),
          };
        },
      },
      styles: {
        default: {},
        parseHTML: (element: HTMLElement) => {
          const dataStyles = element.getAttribute("data-styles");
          if (dataStyles) {
            try {
              return JSON.parse(dataStyles);
            } catch {
              return {};
            }
          }
          return {};
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (
            !attributes.styles ||
            Object.keys(attributes.styles).length === 0
          ) {
            return {};
          }
          return {
            "data-styles": JSON.stringify(attributes.styles),
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="social-links"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "social-links",
        class: "social-links-block",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SocialLinksView);
  },

  addCommands() {
    return {
      insertSocialLinks:
        (options: InsertSocialLinksOptions) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              links: options.links || [],
            },
          });
        },
    };
  },
});
