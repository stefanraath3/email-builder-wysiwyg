import type { GlobalStyles } from "@/types/email-template";
import {
  DEFAULT_CONTAINER_WIDTH,
  DEFAULT_PADDING,
  createDefaultGlobalStyles,
} from "@/lib/email-template-defaults";

/**
 * Convert GlobalStyles to CSS custom properties (variables)
 * Returns an object with CSS variable names and values
 * Uses defaults for any missing nested properties
 */
export function globalStylesToCSSVariables(
  globalStyles: Partial<GlobalStyles>
): Record<string, string> {
  // Merge with defaults to ensure all properties exist
  const defaults = createDefaultGlobalStyles();
  const styles: GlobalStyles = {
    container: {
      ...defaults.container,
      ...globalStyles.container,
      padding: {
        ...defaults.container.padding,
        ...globalStyles.container?.padding,
      },
    },
    typography: {
      ...defaults.typography,
      ...globalStyles.typography,
    },
    link: {
      ...defaults.link,
      ...globalStyles.link,
    },
    image: {
      ...defaults.image,
      ...globalStyles.image,
    },
    button: {
      ...defaults.button,
      ...globalStyles.button,
      padding: {
        ...defaults.button.padding,
        ...globalStyles.button?.padding,
      },
    },
    codeBlock: {
      ...defaults.codeBlock,
      ...globalStyles.codeBlock,
      padding: {
        ...defaults.codeBlock.padding,
        ...globalStyles.codeBlock?.padding,
      },
    },
    inlineCode: {
      ...defaults.inlineCode,
      ...globalStyles.inlineCode,
    },
    customCSS: globalStyles.customCSS ?? defaults.customCSS,
  };

  return {
    // Typography
    "--email-font-family": styles.typography.fontFamily,
    "--email-font-size": `${styles.typography.fontSize}px`,
    "--email-line-height": `${styles.typography.lineHeight}`,
    "--email-text-color": styles.typography.color,

    // Link
    "--email-link-color": styles.link.color,
    "--email-link-decoration": styles.link.textDecoration,

    // Container
    "--email-container-width": `${styles.container.width}px`,
    "--email-container-padding-top": `${styles.container.padding.top}px`,
    "--email-container-padding-right": `${styles.container.padding.right}px`,
    "--email-container-padding-bottom": `${styles.container.padding.bottom}px`,
    "--email-container-padding-left": `${styles.container.padding.left}px`,

    // Image
    "--email-image-border-radius": `${styles.image.borderRadius}px`,

    // Button
    "--email-button-bg": styles.button.backgroundColor,
    "--email-button-text": styles.button.textColor,
    "--email-button-radius": `${styles.button.borderRadius}px`,
    "--email-button-padding-top": `${styles.button.padding.top}px`,
    "--email-button-padding-right": `${styles.button.padding.right}px`,
    "--email-button-padding-bottom": `${styles.button.padding.bottom}px`,
    "--email-button-padding-left": `${styles.button.padding.left}px`,

    // Code Block
    "--email-code-block-bg": styles.codeBlock.backgroundColor,
    "--email-code-block-radius": `${styles.codeBlock.borderRadius}px`,
    "--email-code-block-padding-top": `${styles.codeBlock.padding.top}px`,
    "--email-code-block-padding-right": `${styles.codeBlock.padding.right}px`,
    "--email-code-block-padding-bottom": `${styles.codeBlock.padding.bottom}px`,
    "--email-code-block-padding-left": `${styles.codeBlock.padding.left}px`,

    // Inline Code
    "--email-inline-code-bg": styles.inlineCode.backgroundColor,
    "--email-inline-code-text": styles.inlineCode.textColor,
    "--email-inline-code-radius": `${styles.inlineCode.borderRadius}px`,
  };
}

/**
 * Apply CSS variables to an element's style
 */
export function applyGlobalStylesToElement(
  element: HTMLElement,
  globalStyles: Partial<GlobalStyles> | GlobalStyles
): void {
  if (!globalStyles) return;
  const cssVars = globalStylesToCSSVariables(globalStyles);
  Object.entries(cssVars).forEach(([key, value]) => {
    element.style.setProperty(key, value);
  });
}

/**
 * Get container alignment CSS class/value
 */
export function getContainerAlignmentClass(
  align: "left" | "center" | "right"
): string {
  switch (align) {
    case "center":
      return "mx-auto";
    case "right":
      return "ml-auto";
    case "left":
    default:
      return "";
  }
}
