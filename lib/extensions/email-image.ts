import { TiptapImage } from "@/lib/novel";
import { UploadImagesPlugin } from "@/lib/novel";
import { cx } from "class-variance-authority";
import { convertBlockStylesToInlineCSS } from "@/lib/email-blocks";

export const EmailImage = TiptapImage.extend({
  name: "image",

  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      styles: {
        default: {},
        parseHTML: (element) => {
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
        renderHTML: (attributes) => {
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
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});
