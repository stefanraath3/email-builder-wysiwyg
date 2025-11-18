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
      // Width/height are required so the ImageResizer can persist size
      // via the setImage() command. Without these, resized images snap
      // back to their natural dimensions on the next render.
      width: {
        default: null,
      },
      height: {
        default: null,
      },
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
            // Images need special treatment for alignment, so we pass
            // the isImage flag to convertBlockStylesToInlineCSS.
            style: convertBlockStylesToInlineCSS(attributes.styles, {
              isImage: true,
            }),
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
