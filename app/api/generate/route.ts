import { createOpenAI } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { streamText } from "ai";
import { match } from "ts-pattern";

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

export async function POST(req: Request): Promise<Response> {
  console.log("🚀 [API] POST /api/generate - Request received");
  console.log(
    "🚀 [API] Request headers:",
    Object.fromEntries(req.headers.entries())
  );

  // Check if the OPENAI_API_KEY is set, if not return 400
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
    console.error("❌ [API] Missing OPENAI_API_KEY");
    return new Response(
      "Missing OPENAI_API_KEY - make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }

  console.log("✅ [API] OPENAI_API_KEY is set");

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const ip = req.headers.get("x-forwarded-for");
    console.log("🔒 [API] Checking rate limit for IP:", ip);
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `novel_ratelimit_${ip}`
    );

    console.log("🔒 [API] Rate limit result:", {
      success,
      limit,
      reset,
      remaining,
    });

    if (!success) {
      console.warn("⚠️ [API] Rate limit exceeded");
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }

  const body = await req.json();
  console.log("📥 [API] Request body received:", JSON.stringify(body, null, 2));
  const { prompt, option, command } = body;
  console.log("📥 [API] Extracted values:", {
    prompt: prompt?.substring(0, 100) + "...",
    option,
    command,
  });
  console.log("🔧 [API] Building messages for option:", option);
  const messages = match(option)
    .with("continue", () => {
      console.log("📝 [API] Using 'continue' option");
      return [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that continues existing text based on context from prior text. " +
            "Give more weight/priority to the later characters than the beginning ones. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: prompt,
        },
      ];
    })
    .with("improve", () => {
      console.log("📝 [API] Using 'improve' option");
      return [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that improves existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: `The existing text is: ${prompt}`,
        },
      ];
    })
    .with("shorter", () => {
      console.log("📝 [API] Using 'shorter' option");
      return [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that shortens existing text. " +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: `The existing text is: ${prompt}`,
        },
      ];
    })
    .with("longer", () => {
      console.log("📝 [API] Using 'longer' option");
      return [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that lengthens existing text. " +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: `The existing text is: ${prompt}`,
        },
      ];
    })
    .with("fix", () => {
      console.log("📝 [API] Using 'fix' option");
      return [
        {
          role: "system" as const,
          content:
            "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
            "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: `The existing text is: ${prompt}`,
        },
      ];
    })
    .with("zap", () => {
      console.log("📝 [API] Using 'zap' option");
      return [
        {
          role: "system" as const,
          content:
            "You area an AI writing assistant that generates text based on a prompt. " +
            "You take an input from the user and a command for manipulating the text" +
            "Use Markdown formatting when appropriate.",
        },
        {
          role: "user" as const,
          content: `For this text: ${prompt}. You have to respect the command: ${command}`,
        },
      ];
    })
    .run();

  console.log("📨 [API] Messages prepared:", JSON.stringify(messages, null, 2));
  console.log("🤖 [API] Starting streamText call...");
  const result = streamText({
    model: openai.chat("gpt-4o-mini"),
    messages: messages,
    maxOutputTokens: 4096,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  console.log("✅ [API] streamText result created");
  console.log("📤 [API] Calling toTextStreamResponse() (text stream mode)...");
  const response = result.toTextStreamResponse();
  console.log("📤 [API] Response created successfully");
  console.log("📤 [API] Response status:", response.status);
  console.log(
    "📤 [API] Response headers:",
    Object.fromEntries(response.headers.entries())
  );
  console.log(
    "📤 [API] Response method used: toDataStreamResponse() (required for useCompletion)"
  );

  return response;
}
