import type {
  EmailTemplate,
  GlobalStyles,
  EmailHeader,
} from "@/types/email-template";
import type { JSONContent } from "@tiptap/react";

/**
 * Default container width for email templates (industry standard)
 */
export const DEFAULT_CONTAINER_WIDTH = 600;

/**
 * Default base font size in pixels
 */
export const DEFAULT_FONT_SIZE = 14;

/**
 * Default line height ratio
 */
export const DEFAULT_LINE_HEIGHT = 1.55;

/**
 * Default padding values (all sides)
 * Note: Horizontal padding is essential for mobile email clients
 * to prevent content from being flush against container edges
 */
export const DEFAULT_PADDING = {
  top: 0,
  right: 16,
  bottom: 0,
  left: 16,
};

/**
 * Creates default global styles matching email industry standards
 * and Resend aesthetic
 */
export function createDefaultGlobalStyles(): GlobalStyles {
  return {
    body: {
      backgroundColor: "#ffffff",
      align: "center",
      borderColor: "#000000",
    },
    container: {
      width: DEFAULT_CONTAINER_WIDTH,
      align: "center",
      padding: DEFAULT_PADDING,
      backgroundColor: "#ffffff",
    },
    typography: {
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: DEFAULT_FONT_SIZE,
      lineHeight: DEFAULT_LINE_HEIGHT,
      color: "#000000",
    },
    link: {
      color: "#2563eb",
      textDecoration: "underline",
    },
    image: {
      borderRadius: 8,
    },
    button: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      borderRadius: 4,
      padding: {
        top: 12,
        right: 24,
        bottom: 12,
        left: 24,
      },
    },
    codeBlock: {
      backgroundColor: "#f3f4f6",
      borderRadius: 4,
      padding: {
        top: 16,
        right: 16,
        bottom: 16,
        left: 16,
      },
    },
    inlineCode: {
      backgroundColor: "#f3f4f6",
      textColor: "#000000",
      borderRadius: 4,
    },
  };
}

/**
 * Creates default email header with placeholder values
 */
export function createDefaultEmailHeader(): EmailHeader {
  return {
    from: "",
    replyTo: "",
    subject: "",
    preview: "",
  };
}

/**
 * Creates a default empty TipTap document
 */
export function createDefaultContent(): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  };
}

/**
 * Generates a unique template ID
 */
export function generateTemplateId(): string {
  return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Creates a fresh email template with all defaults
 */
export function createDefaultEmailTemplate(): EmailTemplate {
  const now = new Date().toISOString();

  return {
    id: generateTemplateId(),
    header: createDefaultEmailHeader(),
    globalStyles: createDefaultGlobalStyles(),
    content: createDefaultContent(),
    variables: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validates an email template structure
 * Returns true if valid, false otherwise
 */
export function validateEmailTemplate(
  template: unknown
): template is EmailTemplate {
  if (!template || typeof template !== "object") {
    return false;
  }

  const t = template as Partial<EmailTemplate>;

  // Check required fields
  if (
    !t.id ||
    !t.header ||
    !t.globalStyles ||
    !t.content ||
    !Array.isArray(t.variables) ||
    !t.createdAt ||
    !t.updatedAt
  ) {
    return false;
  }

  // Validate header structure
  const header = t.header as Partial<EmailHeader>;
  if (
    typeof header.from !== "string" ||
    typeof header.replyTo !== "string" ||
    typeof header.subject !== "string" ||
    typeof header.preview !== "string"
  ) {
    return false;
  }

  // Validate content is valid JSONContent
  if (!t.content || typeof t.content !== "object" || t.content.type !== "doc") {
    return false;
  }

  return true;
}
