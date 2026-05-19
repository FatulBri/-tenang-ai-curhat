import {
  buildCrisisResponseJson,
  detectCrisis,
  getLatestUserText,
} from "../shared/crisis";
import { checkRateLimit, getClientIp, pruneRateLimitBuckets } from "./_lib/rateLimit";

export const config = {
  runtime: "edge",
};

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-flash-latest"];

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TOTAL_CHARS = 16000;

function serverEnv(key: string): string | undefined {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

function jsonResponse(body: unknown, status: number, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function validateMessages(messages: { role: string; content: string }[]): string | null {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "messages wajib berupa array tidak kosong";
  }
  if (messages.length > MAX_MESSAGES) {
    return `Maksimal ${MAX_MESSAGES} pesan per permintaan`;
  }
  let total = 0;
  for (const m of messages) {
    if (!m?.content || typeof m.content !== "string") {
      return "Setiap pesan harus memiliki content string";
    }
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return `Pesan terlalu panjang (maks ${MAX_MESSAGE_CHARS} karakter)`;
    }
    total += m.content.length;
  }
  if (total > MAX_TOTAL_CHARS) {
    return "Total percakapan terlalu panjang";
  }
  return null;
}

function buildGeminiContents(
  messages: { role: string; content: string }[],
  systemPrompt: string
) {
  return messages.map((m, i) => {
    if (i === 0 && m.role === "user") {
      return {
        role: "user",
        parts: [{ text: systemPrompt }, { text: `Konteks/Pesan Awal: "${m.content}"` }],
      };
    }
    return {
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    };
  });
}

async function callGemini(
  model: string,
  apiKey: string,
  body: object,
  stream: boolean
): Promise<Response> {
  const action = stream ? "streamGenerateContent" : "generateContent";
  const alt = stream ? "&alt=sse" : "";
  return fetch(`${BASE_URL}/${model}:${action}?key=${apiKey}${alt}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function extractTextFromGeminiChunk(line: string): string {
  const payload = line.startsWith("data: ") ? line.slice(6) : line;
  if (!payload.trim() || payload === "[DONE]") return "";
  try {
    const data = JSON.parse(payload);
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch {
    return "";
  }
}

async function streamGeminiToClient(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  apiKey: string
): Promise<Response> {
  const generationBody = {
    contents: buildGeminiContents(messages, systemPrompt),
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const upstream = await callGemini(model, apiKey, generationBody, true);
      if (!upstream.ok) {
        const err = await upstream.text();
        throw new Error(`Gemini API Error: ${upstream.status} - ${err}`);
      }
      if (!upstream.body) throw new Error("Empty stream body");

      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const send = (obj: object) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
          };

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const line of lines) {
                const chunk = extractTextFromGeminiChunk(line.trim());
                if (chunk) send({ type: "chunk", text: chunk });
              }
            }
            send({ type: "done" });
          } catch (err) {
            send({ type: "error", message: err instanceof Error ? err.message : "Stream error" });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  return jsonResponse({ error: lastError?.message || "All models failed" }, 502);
}

async function generateOnce(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  apiKey: string
): Promise<{ text: string } | { error: string }> {
  const generationBody = {
    contents: buildGeminiContents(messages, systemPrompt),
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const response = await callGemini(model, apiKey, generationBody, false);
      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Gemini API Error: ${response.status} - ${err}`);
      }
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiText) throw new Error("Empty response from AI");
      return { text: aiText };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  return { error: lastError?.message || "All models failed" };
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  pruneRateLimitBuckets();
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return jsonResponse(
      { error: "Terlalu banyak permintaan. Coba lagi beberapa menit." },
      429,
      { "Retry-After": String(rate.retryAfterSec) }
    );
  }

  try {
    const body = (await req.json()) as {
      messages: { role: string; content: string }[];
      systemPrompt: string;
      stream?: boolean;
    };

    const { messages, systemPrompt, stream } = body;
    const validationError = validateMessages(messages);
    if (validationError) {
      return jsonResponse({ error: validationError }, 400);
    }
    if (!systemPrompt || typeof systemPrompt !== "string") {
      return jsonResponse({ error: "systemPrompt wajib diisi" }, 400);
    }

    const userText = getLatestUserText(messages);
    if (detectCrisis(userText)) {
      const crisisText = buildCrisisResponseJson();
      if (stream) {
        const encoder = new TextEncoder();
        const crisisStream = new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "chunk", text: crisisText })}\n\n`)
            );
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done", crisis: true })}\n\n`)
            );
            controller.close();
          },
        });
        return new Response(crisisStream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Crisis-Detected": "true",
          },
        });
      }
      return jsonResponse({ text: crisisText, crisis: true }, 200, {
        "X-Crisis-Detected": "true",
      });
    }

    const apiKey = serverEnv("GEMINI_API_KEY");
    if (!apiKey) {
      return jsonResponse(
        {
          error:
            "GEMINI_API_KEY belum disetel di server (mis. Vercel → Settings → Environment Variables). Kunci tidak boleh dikirim dari browser.",
        },
        503
      );
    }

    if (stream) {
      return streamGeminiToClient(messages, systemPrompt, apiKey);
    }

    const result = await generateOnce(messages, systemPrompt, apiKey);
    if ("error" in result) {
      return jsonResponse({ error: result.error }, 502);
    }

    return jsonResponse({ text: result.text }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bad request";
    return jsonResponse({ error: message }, 400);
  }
}
