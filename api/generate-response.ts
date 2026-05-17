
export const config = {
  runtime: 'edge',
};

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest"
];

/** Baca env server tanpa merujuk ke `process` (hindari TS2591 bila CI tidak memuat @types/node). */
function serverEnv(key: string): string | undefined {
  const proc = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { messages, systemPrompt } = (await req.json()) as {
      messages: { role: string; content: string }[];
      systemPrompt: string;
    };
    const apiKey = serverEnv("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "GEMINI_API_KEY belum disetel di server (mis. Vercel → Settings → Environment Variables). Kunci tidak boleh dikirim dari browser.",
        }),
        { status: 503 }
      );
    }

    let lastError = null;
    
    // Attempt with models
    for (const model of MODELS) {
      try {
        const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: messages.map((m: any, i: number) => {
               // First user message gets the big system prompt instruction
               if (i === 0 && m.role === "user") {
                 return {
                   role: "user",
                   parts: [
                     { text: systemPrompt },
                     { text: `Konteks/Pesan Awal: "${m.content}"` }
                   ]
                 };
               }
               return {
                 role: m.role,
                 parts: [{ text: m.content }]
               };
            }),
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          })
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`Gemini API Error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) throw new Error("Empty response from AI");

        return new Response(JSON.stringify({ text: aiText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (err: any) {
        lastError = err;
        continue; // try next model
      }
    }

    return new Response(JSON.stringify({ error: lastError?.message || 'All models failed' }), { status: 502 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}
