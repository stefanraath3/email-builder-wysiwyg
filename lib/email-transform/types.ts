import type { JSONContent } from "@tiptap/react";
import type { GlobalStyles } from "@/types/email-template";

/**
 * Context passed through transformation pipeline
 */
export type TransformContext = {
  globalStyles: GlobalStyles;
  depth?: number;
};

/**
 * Function that transforms a TipTap node into React Email JSX
 */
export type NodeTransformer = (
  node: JSONContent,
  context: TransformContext
) => React.ReactNode;

