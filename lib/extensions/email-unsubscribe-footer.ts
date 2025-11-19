import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    unsubscribeFooterBlock: {
      /**
       * Insert an unsubscribe footer block
       * @example editor.commands.insertUnsubscribeFooter()
       */
      insertUnsubscribeFooter: () => ReturnType;
    };
  }
}

export const EmailUnsubscribeFooter = Node.create({
  name: "unsubscribeFooterBlock",
  group: "block",
  content: "inline*",
  draggable: true,

  addAttributes() {
    return {
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
    return [{ tag: 'div[data-type="unsubscribe-footer"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "unsubscribe-footer",
        class: "unsubscribe-footer",
      }),
      0, // content hole for inline editing
    ];
  },

  addCommands() {
    return {
      insertUnsubscribeFooter:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "text",
                text: "You are receiving this email because you opted in via our site. ",
              },
              {
                type: "text",
                marks: [
                  { type: "link", attrs: { href: "{{unsubscribe_url}}" } },
                ],
                text: "Unsubscribe",
              },
            ],
          });
        },
    };
  },
});
