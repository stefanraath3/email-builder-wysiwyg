import CodeBlock from "@tiptap/extension-code-block";
import { convertBlockStylesToInlineCSS } from "@/lib/email-blocks";

export const EmailCodeBlock = CodeBlock.extend({
  name: "codeBlock",

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
