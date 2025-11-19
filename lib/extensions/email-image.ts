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
          // Always render style attribute to apply global border radius via CSS variables
          // even if no explicit styles are set
          const styles = attributes.styles || {};
          const hasExplicitStyles = Object.keys(styles).length > 0;

          if (!hasExplicitStyles) {
            // No explicit styles, but we still want CSS variables to apply
            return {
              "data-styles": JSON.stringify({}),
              // Empty style tag allows CSS variable inheritance
              style: "",
            };
          }

          return {
            "data-styles": JSON.stringify(styles),
            // Images need special treatment for alignment, so we pass
            // the isImage flag to convertBlockStylesToInlineCSS.
            style: convertBlockStylesToInlineCSS(styles, {
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
