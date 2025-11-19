import { Link } from "@react-email/components";
import type { JSONContent } from "@tiptap/react";
import type { GlobalStyles } from "@/types/email-template";

/**
 * Transform inline content (text nodes with marks) into React elements
 * Handles bold, italic, underline, strike, code, links, colors, highlights
 */
export function transformInlineContent(
  content: JSONContent[] | undefined,
  globalStyles: GlobalStyles
): React.ReactNode[] {
  if (!content || !Array.isArray(content)) {
    return [];
  }

  return content.map((node, idx) => {
    // Handle hardBreak nodes (Shift+Enter line breaks)
    if (node.type === "hardBreak") {
      return <br key={idx} />;
    }

    // Handle text nodes with marks
    if (node.type === "text") {
      return applyMarks(node.text || "", node.marks, globalStyles, idx);
    }

    // Fallback for other inline node types
    return node.text || null;
  });
}

/**
 * Apply marks to text content by wrapping in appropriate HTML elements
 * Marks are applied in order: formatting → code → color/highlight → link (outermost)
 */
function applyMarks(
  text: string,
  marks: JSONContent["marks"],
  globalStyles: GlobalStyles,
  key: number
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text;
  }

  let result: React.ReactNode = text;

  // Apply marks in specific order for proper nesting
  const sortedMarks = sortMarksByPriority(marks);

  sortedMarks.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        result = <strong>{result}</strong>;
        break;

      case "italic":
        result = <em>{result}</em>;
        break;

      case "underline":
        result = <u>{result}</u>;
        break;

      case "strike":
        result = <s>{result}</s>;
        break;

      case "code":
        result = (
          <code
            style={{
              backgroundColor:
                globalStyles.inlineCode?.backgroundColor || "#f3f4f6",
              color: globalStyles.inlineCode?.textColor || "#000000",
              borderRadius: `${globalStyles.inlineCode?.borderRadius || 4}px`,
              padding: "2px 4px",
              fontFamily: "monospace",
              fontSize: "0.9em",
            }}
          >
            {result}
          </code>
        );
        break;

      case "textStyle":
        // Handle text color from TextStyle extension
        if (mark.attrs?.color) {
          result = <span style={{ color: mark.attrs.color }}>{result}</span>;
        }
        break;

      case "highlight":
        // Handle highlight/background color
        result = (
          <span style={{ backgroundColor: mark.attrs?.color || "#ffeb3b" }}>
            {result}
          </span>
        );
        break;

      case "link":
        result = (
          <Link
            href={mark.attrs?.href || "#"}
            style={{
              color: globalStyles.link.color,
              textDecoration: globalStyles.link.textDecoration,
            }}
          >
            {result}
          </Link>
        );
        break;

      default:
        // Unknown mark type, keep result as-is
        break;
    }
  });

  // Wrap in span with key for React reconciliation
  return <span key={key}>{result}</span>;
}

/**
 * Sort marks by priority for proper nesting
 * Priority order (inner to outer):
 * 1. Formatting (bold, italic, underline, strike)
 * 2. Code
 * 3. Color/highlight
 * 4. Link (outermost)
 */
function sortMarksByPriority(marks: NonNullable<JSONContent["marks"]>) {
  const priority: Record<string, number> = {
    bold: 1,
    italic: 1,
    underline: 1,
    strike: 1,
    code: 2,
    textStyle: 3,
    highlight: 3,
    link: 4,
  };

  return [...marks].sort((a, b) => {
    const aPriority = priority[a.type] || 0;
    const bPriority = priority[b.type] || 0;
    return aPriority - bPriority;
  });
}
