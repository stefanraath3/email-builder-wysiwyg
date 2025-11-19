import { Node, mergeAttributes } from "@tiptap/core";
import { convertBlockStylesToInlineCSS } from "@/lib/email-blocks";

/**
 * Options for inserting a button
 */
type InsertButtonOptions = {
  text?: string;
  href?: string;
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    buttonBlock: {
      /**
       * Insert a button block
       * @param attrs Button attributes
       * @example editor.commands.insertButton({ text: "Click me", href: "#" })
       */
      insertButton: (attrs: InsertButtonOptions) => ReturnType;
    };
  }
}

export const EmailButton = Node.create({
  name: "buttonBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      text: {
        default: "Click me",
      },
      href: {
        default: "#",
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
    return [{ tag: 'div[data-type="button-block"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const blockStyles = node.attrs.styles || {};

    // Build button styles (will be applied to anchor tag via CSS variables + inline styles)
    // We need to create inline styles for the anchor that will show in editor
    const buttonStyleProps: string[] = [];

    // Background
    if (blockStyles.backgroundColor) {
      buttonStyleProps.push(`background-color: ${blockStyles.backgroundColor}`);
    } else {
      buttonStyleProps.push(
        `background-color: var(--email-button-bg, #2563eb)`
      );
    }

    // Text color
    if (blockStyles.textColor) {
      buttonStyleProps.push(`color: ${blockStyles.textColor}`);
    } else {
      buttonStyleProps.push(`color: var(--email-button-text, #ffffff)`);
    }

    // Border radius
    if (blockStyles.borderRadius !== undefined) {
      buttonStyleProps.push(`border-radius: ${blockStyles.borderRadius}px`);
    } else {
      buttonStyleProps.push(`border-radius: var(--email-button-radius, 4px)`);
    }

    // Padding
    if (blockStyles.padding) {
      const { top, right, bottom, left } = blockStyles.padding;
      buttonStyleProps.push(
        `padding: ${top}px ${right}px ${bottom}px ${left}px`
      );
    } else {
      buttonStyleProps.push(
        `padding: var(--email-button-padding-y, 12px) var(--email-button-padding-x, 24px)`
      );
    }

    // Font properties
    if (blockStyles.fontSize) {
      buttonStyleProps.push(`font-size: ${blockStyles.fontSize}px`);
    }
    if (blockStyles.fontWeight) {
      buttonStyleProps.push(`font-weight: ${blockStyles.fontWeight}`);
    }

    // Border
    if (blockStyles.borderWidth) {
      buttonStyleProps.push(`border-width: ${blockStyles.borderWidth}px`);
    }
    if (blockStyles.borderStyle) {
      buttonStyleProps.push(`border-style: ${blockStyles.borderStyle}`);
    }
    if (blockStyles.borderColor) {
      buttonStyleProps.push(`border-color: ${blockStyles.borderColor}`);
    }

    // Add display: inline-block so the button respects text-align
    buttonStyleProps.push(`display: inline-block`);
    buttonStyleProps.push(`text-decoration: none`);
    buttonStyleProps.push(`cursor: pointer`);

    const buttonStyles = buttonStyleProps.join("; ");

    // Wrapper alignment - default to left to match other blocks
    const alignment = blockStyles.textAlign || "left";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "button-block",
        style: `text-align: ${alignment}; margin: 16px 0;`,
      }),
      [
        "a",
        {
          href: node.attrs.href,
          onclick: "return false;",
          style: buttonStyles,
        },
        node.attrs.text,
      ],
    ];
  },

  addCommands() {
    return {
      insertButton:
        (attrs: InsertButtonOptions) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              text: attrs.text || "Click me",
              href: attrs.href || "#",
            },
          });
        },
    };
  },
});
