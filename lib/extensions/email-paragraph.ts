import Paragraph from "@tiptap/extension-paragraph";
import { convertBlockStylesToInlineCSS } from "@/lib/email-blocks";

export const EmailParagraph = Paragraph.extend({
  name: "paragraph",

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
