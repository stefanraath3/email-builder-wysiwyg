import type { JSONContent } from "@tiptap/react";

/**
 * Email header information for the email template
 */
export interface EmailHeader {
  /** Sender email address */
  from: string;
  /** Reply-to email address */
  replyTo: string;
  /** Email subject line (supports variables like {{name}} in future) */
  subject: string;
  /** Preview text shown in email clients (supports variables) */
  preview: string;
}

/**
 * Padding values for layout properties
 */
export interface Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Body styling for the email template (outer background)
 */
export interface BodyStyles {
  /** Body background color */
  backgroundColor: string;
  /** Body alignment (where content sits) */
  align: "left" | "center" | "right";
  /** Body border color */
  borderColor?: string;
}

/**
 * Container styling for the email template (inner content container)
 */
export interface ContainerStyles {
  /** Container width in pixels (default: 600px) */
  width: number;
  /** Container alignment */
  align: "left" | "center" | "right";
  /** Container padding */
  padding: Padding;
  /** Container background color */
  backgroundColor?: string;
}

/**
 * Typography defaults for the email template
 */
export interface TypographyStyles {
  /** Base font family */
  fontFamily: string;
  /** Base font size in pixels */
  fontSize: number;
  /** Base line height (unitless ratio) */
  lineHeight: number;
  /** Base text color */
  color: string;
}

/**
 * Link styling defaults
 */
export interface LinkStyles {
  /** Link text color */
  color: string;
  /** Link text decoration */
  textDecoration: "none" | "underline";
}

/**
 * Image styling defaults
 */
export interface ImageStyles {
  /** Default border radius in pixels */
  borderRadius: number;
}

/**
 * Button styling defaults
 */
export interface ButtonStyles {
  /** Default background color */
  backgroundColor: string;
  /** Default text color */
  textColor: string;
  /** Default border radius in pixels */
  borderRadius: number;
  /** Default padding */
  padding: Padding;
}

/**
 * Code block styling defaults
 */
export interface CodeBlockStyles {
  /** Background color */
  backgroundColor: string;
  /** Border radius in pixels */
  borderRadius: number;
  /** Padding */
  padding: Padding;
}

/**
 * Inline code styling defaults
 */
export interface InlineCodeStyles {
  /** Background color */
  backgroundColor: string;
  /** Text color */
  textColor: string;
  /** Border radius in pixels */
  borderRadius: number;
}

/**
 * Global styles applied to the entire email template
 */
export interface GlobalStyles {
  /** Body styles (outer background) */
  body: BodyStyles;
  /** Container styles (inner content container) */
  container: ContainerStyles;
  /** Typography defaults */
  typography: TypographyStyles;
  /** Link defaults */
  link: LinkStyles;
  /** Image defaults */
  image: ImageStyles;
  /** Button defaults */
  button: ButtonStyles;
  /** Code block defaults */
  codeBlock: CodeBlockStyles;
  /** Inline code defaults */
  inlineCode: InlineCodeStyles;
  /** Custom CSS injection (advanced, for edge cases) */
  customCSS?: string;
}

/**
 * Template variable definition
 */
export interface Variable {
  /** Unique identifier for the variable */
  id: string;
  /** Variable name (e.g., "firstName") */
  name: string;
  /** Variable type */
  type: "string" | "number";
  /** Default value if variable not provided */
  defaultValue: string | number;
  /** Optional description */
  description?: string;
}

/**
 * Complete email template structure
 */
export interface EmailTemplate {
  /** Unique template identifier */
  id: string;
  /** Email header information */
  header: EmailHeader;
  /** Global styling defaults */
  globalStyles: GlobalStyles;
  /** TipTap document content (ProseMirror JSON) */
  content: JSONContent;
  /** Template variables for personalization */
  variables: Variable[];
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
}
