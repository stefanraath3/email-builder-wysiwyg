import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Error mapping for user-friendly messages
export function mapResendError(error: any): string {
  const errorType = error?.name || error?.message || "";

  if (errorType.includes("validation")) return "Invalid email address format";
  if (errorType.includes("unauthorized")) return "Resend API key is invalid";
  if (errorType.includes("rate_limit"))
    return "Too many requests. Please wait and try again";

  return error?.message || "Failed to send test email";
}
