import {
  Html,
  Head,
  Body,
  Container,
  Preview,
} from "@react-email/components";
import type { EmailTemplate } from "@/types/email-template";
import { transformContent } from "./nodes";
import { getBodyStyles, getContainerStyles } from "./styles";

/**
 * Transform an EmailTemplate into React Email JSX
 * This is the main entry point for the email transformation pipeline
 *
 * @param template - The EmailTemplate to transform
 * @returns React Email JSX element ready to be rendered to HTML
 */
export function transformToReactEmail(template: EmailTemplate) {
  const { header, globalStyles, content } = template;

  return (
    <Html>
      <Head>
        <title>{header.subject || "Email"}</title>
      </Head>
      <Preview>{header.preview || ""}</Preview>
      <Body style={getBodyStyles(globalStyles)}>
        <Container style={getContainerStyles(globalStyles)}>
          {transformContent(content, globalStyles)}
        </Container>
      </Body>
    </Html>
  );
}

