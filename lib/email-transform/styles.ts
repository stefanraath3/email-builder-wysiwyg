import type { GlobalStyles } from "@/types/email-template";
import type { BlockStyles } from "@/types/block-styles";
import type { JSONContent } from "@tiptap/react";
import { mergeWithGlobalStyles } from "@/lib/email-blocks";

/**
 * Convert GlobalStyles to CSS properties for email Body element
 */
export function getBodyStyles(globalStyles: GlobalStyles): React.CSSProperties {
  return {
    backgroundColor: globalStyles.body.backgroundColor,
    margin: 0,
    padding: 0,
    fontFamily: globalStyles.typography.fontFamily,
    fontSize: `${globalStyles.typography.fontSize}px`,
    lineHeight: globalStyles.typography.lineHeight,
    color: globalStyles.typography.color,
  };
}

/**
 * Convert GlobalStyles to CSS properties for email Container element
 */
export function getContainerStyles(
  globalStyles: GlobalStyles
): React.CSSProperties {
  const { container } = globalStyles;
  const css: React.CSSProperties = {
    maxWidth: `${container.width}px`,
    backgroundColor: container.backgroundColor,
    paddingTop: `${container.padding.top}px`,
    paddingRight: `${container.padding.right}px`,
    paddingBottom: `${container.padding.bottom}px`,
    paddingLeft: `${container.padding.left}px`,
  };

  // Apply horizontal alignment
  if (container.align === "center") {
    css.marginLeft = "auto";
    css.marginRight = "auto";
  } else if (container.align === "right") {
    css.marginLeft = "auto";
  }

  return css;
}

/**
 * Get merged and converted styles for a specific node
 * Merges block-level styles with global defaults and converts to React.CSSProperties
 */
export function getNodeStyles(
  node: JSONContent,
  globalStyles: GlobalStyles,
  nodeType: string
): React.CSSProperties {
  const blockStyles: BlockStyles = node.attrs?.styles || {};
  const mergedStyles = mergeWithGlobalStyles(
    blockStyles,
    globalStyles,
    nodeType
  );

  const css = convertToReactEmailCSS(mergedStyles);

  // Apply default heading sizes if not explicitly set
  if (nodeType === "heading" && !blockStyles.fontSize) {
    const level = node.attrs?.level || 1;
    const headingSizes: Record<number, number> = {
      1: 32,
      2: 24,
      3: 20,
      4: 16,
      5: 14,
      6: 12,
    };
    css.fontSize = `${headingSizes[level]}px`;
    // Also make headings bold by default
    if (!blockStyles.fontWeight) {
      css.fontWeight = 700;
    }
  }

  // Apply default button styles if not explicitly set
  if (nodeType === "buttonBlock") {
    // Default button display and cursor
    css.display = css.display || "inline-block";
    css.textDecoration = css.textDecoration || "none";
    css.cursor = "pointer";

    // Default button background if not set
    if (!blockStyles.backgroundColor && !mergedStyles.backgroundColor) {
      css.backgroundColor = "#000000";
    }

    // Default button text color if not set
    if (!blockStyles.textColor && !mergedStyles.textColor) {
      css.color = "#ffffff";
    }

    // Default button padding if not set
    if (!blockStyles.padding && !mergedStyles.padding) {
      css.paddingTop = "12px";
      css.paddingRight = "24px";
      css.paddingBottom = "12px";
      css.paddingLeft = "24px";
    }

    // Default border radius if not set
    if (
      blockStyles.borderRadius === undefined &&
      mergedStyles.borderRadius === undefined
    ) {
      css.borderRadius = "4px";
    }
  }

  return css;
}

/**
 * Convert BlockStyles to React.CSSProperties format
 * Handles camelCase conversion and proper value formatting for email-safe CSS
 */
function convertToReactEmailCSS(styles: BlockStyles): React.CSSProperties {
  const css: React.CSSProperties = {};

  // Background
  if (styles.backgroundColor) {
    css.backgroundColor = styles.backgroundColor;
  }

  // Typography
  if (styles.textColor) css.color = styles.textColor;
  if (styles.fontSize) css.fontSize = `${styles.fontSize}px`;
  if (styles.fontWeight) css.fontWeight = styles.fontWeight;
  if (styles.lineHeight) css.lineHeight = styles.lineHeight;
  if (styles.fontFamily) css.fontFamily = styles.fontFamily;
  if (styles.textAlign) css.textAlign = styles.textAlign;
  if (styles.textDecoration) css.textDecoration = styles.textDecoration;

  // Layout
  if (styles.padding) {
    css.paddingTop = `${styles.padding.top}px`;
    css.paddingRight = `${styles.padding.right}px`;
    css.paddingBottom = `${styles.padding.bottom}px`;
    css.paddingLeft = `${styles.padding.left}px`;
  }

  // Dimensions (for images)
  if (styles.width) css.width = `${styles.width}px`;
  if (styles.height && styles.height !== "auto") {
    css.height = `${styles.height}px`;
  } else if (styles.height === "auto") {
    css.height = "auto";
  }

  // Border
  if (styles.borderRadius !== undefined) {
    css.borderRadius = `${styles.borderRadius}px`;
  }
  if (styles.borderWidth) css.borderWidth = `${styles.borderWidth}px`;
  if (styles.borderStyle) css.borderStyle = styles.borderStyle;
  if (styles.borderColor) css.borderColor = styles.borderColor;

  return css;
}
