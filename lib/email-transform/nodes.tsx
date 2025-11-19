import { Text } from "@react-email/components";
import type { JSONContent } from "@tiptap/react";
import type { GlobalStyles } from "@/types/email-template";
import { getNodeStyles } from "./styles";

/**
 * Transform TipTap document content into React Email components
 */
export function transformContent(
  content: JSONContent,
  globalStyles: GlobalStyles
): React.ReactNode[] {
  if (!content.content || !Array.isArray(content.content)) {
    return [];
  }

  return content.content
    .map((node, idx) => {
      try {
        return transformNode(node, idx, globalStyles);
      } catch (error) {
        console.error("Transform error:", error, node);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Transform a single TipTap node into React Email JSX
 */
function transformNode(
  node: JSONContent,
  idx: number,
  globalStyles: GlobalStyles
): React.ReactNode {
  const key = node.attrs?.uid || idx;

  switch (node.type) {
    case "paragraph":
      return (
        <Text key={key} style={getNodeStyles(node, globalStyles, "paragraph")}>
          {getTextContent(node)}
        </Text>
      );

    default:
      console.warn("Unsupported node type:", node.type);
      return null;
  }
}

/**
 * Extract plain text from node content (no mark handling yet)
 * Part 3 will handle marks (bold, italic, links, etc.)
 */
function getTextContent(node: JSONContent): string {
  if (!node.content) return "";
  
  return node.content
    .filter((n) => n.type === "text")
    .map((n) => n.text || "")
    .join("");
}

