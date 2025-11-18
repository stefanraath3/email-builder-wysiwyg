import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { convertBlockStylesToInlineCSS } from "@/lib/email-blocks";

export const EmailBulletList = BulletList.extend({
  name: "bulletList",

  addAttributes() {
    return {
      ...this.parent?.(),
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
            style: convertBlockStylesToInlineCSS(attributes.styles),
          };
        },
      },
    };
  },
});

export const EmailOrderedList = OrderedList.extend({
  name: "orderedList",

  addAttributes() {
    return {
      ...this.parent?.(),
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
            style: convertBlockStylesToInlineCSS(attributes.styles),
          };
        },
      },
    };
  },
});

// ListItem doesn't need styles extension - styles are applied to parent list
export const EmailListItem = ListItem;
