import { NextRequest, NextResponse } from "next/server";
import { resend, mapResendError } from "@/lib/resend/client";
import { transformToReactEmail } from "@/lib/email-transform";
import { render } from "@react-email/render";
import type { EmailTemplate } from "@/types/email-template";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emails, template, variables, subject } = body;

    // Validate inputs
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "No recipient emails provided" },
        { status: 400 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: "No email template provided" },
        { status: 400 }
      );
    }

    // Transform template to React Email and render to HTML
    const reactEmail = transformToReactEmail(template as EmailTemplate);
    const htmlContent = await render(reactEmail, {
      pretty: true,
    });

    // Apply variables if provided (simple string replacement for now)
    let finalHtml = htmlContent;
    if (variables && Object.keys(variables).length > 0) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        finalHtml = finalHtml.replace(
          new RegExp(placeholder, "g"),
          String(value)
        );
      });
    }

    // Determine from email address
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: emails,
      subject: subject || "[TEST] Email Template Preview",
      html: finalHtml,
      headers: {
        "X-Email-Type": "test",
      },
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { error: mapResendError(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${emails.join(", ")}`,
      data: { sentTo: emails },
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}
