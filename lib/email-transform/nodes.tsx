import { Text, Heading, Img, Link, Hr, Button } from "@react-email/components";
import type { JSONContent } from "@tiptap/react";
import type { GlobalStyles } from "@/types/email-template";
import { getNodeStyles } from "./styles";
import { transformInlineContent } from "./marks";

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
          {transformInlineContent(node.content, globalStyles)}
        </Text>
      );

    case "heading":
      const level = node.attrs?.level || 1;
      return (
        <Heading
          key={key}
          as={`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"}
          style={getNodeStyles(node, globalStyles, "heading")}
        >
          {transformInlineContent(node.content, globalStyles)}
        </Heading>
      );

    case "bulletList":
      return (
        <ul key={key} style={getNodeStyles(node, globalStyles, "bulletList")}>
          {node.content?.map((item, i) => transformNode(item, i, globalStyles))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} style={getNodeStyles(node, globalStyles, "orderedList")}>
          {node.content?.map((item, i) => transformNode(item, i, globalStyles))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} style={getNodeStyles(node, globalStyles, "listItem")}>
          {node.content?.map((child, i) =>
            transformNode(child, i, globalStyles)
          )}
        </li>
      );

    case "blockquote":
      const blockquoteStyle = {
        ...getNodeStyles(node, globalStyles, "blockquote"),
        borderLeft: "4px solid #ddd",
        paddingLeft: "16px",
        fontStyle: "italic",
        margin: "16px 0",
      };
      return (
        <div key={key} style={blockquoteStyle}>
          {node.content?.map((child, i) =>
            transformNode(child, i, globalStyles)
          )}
        </div>
      );

    case "codeBlock":
      const codeText = extractCodeBlockText(node);
      const codeBlockStyles = getNodeStyles(node, globalStyles, "codeBlock");
      return (
        <pre key={key} style={codeBlockStyles}>
          <code style={{ fontFamily: "monospace" }}>{codeText}</code>
        </pre>
      );

    case "image":
      const imgStyles = getNodeStyles(node, globalStyles, "image");
      // Handle image alignment with display block + margins (email-safe)
      if (node.attrs?.styles?.textAlign) {
        imgStyles.display = "block";
        if (node.attrs.styles.textAlign === "center") {
          imgStyles.marginLeft = "auto";
          imgStyles.marginRight = "auto";
        } else if (node.attrs.styles.textAlign === "right") {
          imgStyles.marginLeft = "auto";
          imgStyles.marginRight = "0";
        }
      }

      return (
        <Img
          key={key}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ""}
          width={node.attrs?.width}
          height={node.attrs?.height}
          style={imgStyles}
        />
      );

    case "youtube":
      const videoId = extractYoutubeId(node.attrs?.src);
      if (!videoId) return null;

      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return (
        <Link key={key} href={videoUrl}>
          <Img
            src={thumbnailUrl}
            alt="Video preview"
            style={{
              borderRadius: "8px",
              maxWidth: "480px",
              display: "block",
              ...getNodeStyles(node, globalStyles, "youtube"),
            }}
          />
        </Link>
      );

    case "twitter":
      const tweetUrl = node.attrs?.src;
      if (!tweetUrl) return null;

      return (
        <Text key={key} style={{ margin: "16px 0" }}>
          <Link
            href={tweetUrl}
            style={{
              color: globalStyles.link.color,
              textDecoration: globalStyles.link.textDecoration,
            }}
          >
            View post on X
          </Link>
        </Text>
      );

    case "horizontalRule":
      return (
        <Hr
          key={key}
          style={getNodeStyles(node, globalStyles, "horizontalRule")}
        />
      );

    case "buttonBlock":
      const buttonStyles = getNodeStyles(node, globalStyles, "buttonBlock");

      // Handle alignment - buttons need special treatment for email clients
      const alignment = node.attrs?.styles?.textAlign || "left";
      const wrapperStyle: React.CSSProperties = {
        textAlign: alignment as React.CSSProperties["textAlign"],
        margin: "16px 0",
      };

      return (
        <div key={key} style={wrapperStyle}>
          <Button href={node.attrs?.href || "#"} style={buttonStyles}>
            {node.attrs?.text || "Click me"}
          </Button>
        </div>
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

/**
 * Extract code block text content, preserving line breaks
 */
function extractCodeBlockText(node: JSONContent): string {
  if (!node.content) return "";
  return node.content
    .filter((n) => n.type === "text")
    .map((n) => n.text || "")
    .join("\n");
}

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
function extractYoutubeId(url: string | undefined): string | null {
  if (!url) return null;
  // Handle youtube.com/watch?v=ID and youtu.be/ID formats
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  return match ? match[1] : null;
}
