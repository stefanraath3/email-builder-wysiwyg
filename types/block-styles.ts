import type { Padding } from "./email-template";

/**
 * Block-level styles that can be applied to email blocks
 * All properties are optional - undefined means "use global default"
 */
export interface BlockStyles {
  // Appearance
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderColor?: string;

  // Typography (text blocks)
  textColor?: string;
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  lineHeight?: number;
  textDecoration?: "none" | "underline" | "line-through";
  fontFamily?: string;

  // Layout
  padding?: Padding;
  textAlign?: "left" | "center" | "right" | "justify";

  // Media-specific
  width?: number;
  height?: number | "auto";
  display?: "block" | "inline-block";
}

// Export block-specific type subsets
export type TextBlockStyles = Pick<
  BlockStyles,
  | "backgroundColor"
  | "textColor"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "textAlign"
  | "padding"
  | "borderRadius"
>;

export type ImageBlockStyles = Pick<
  BlockStyles,
  | "borderRadius"
  | "borderWidth"
  | "borderStyle"
  | "borderColor"
  | "padding"
  | "textAlign"
  | "width"
  | "height"
>;

export type CodeBlockStyles = Pick<
  BlockStyles,
  | "backgroundColor"
  | "textColor"
  | "fontSize"
  | "fontFamily"
  | "padding"
  | "borderRadius"
  | "borderWidth"
  | "borderColor"
>;

export type ListBlockStyles = Pick<
  BlockStyles,
  "textColor" | "fontSize" | "lineHeight" | "padding"
>;
