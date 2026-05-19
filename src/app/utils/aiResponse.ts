import { detectCrisis } from "../../../shared/crisis";

export interface AIResult {
  aiResponse: string;
  mood: string;
  category: string;
}

const API_ENDPOINT = "/api/generate-response";

export function getSystemPrompt(persona: string, faceEmotion?: string | null): string {
  let emotionContext = "";
  if (faceEmotion) {
    const emotionId =
      faceEmotion === "happy"
        ? "Senang 😊"
        : faceEmotion === "sad"
          ? "Sedih 😢"
          : faceEmotion === "angry"
            ? "Marah 😡"
            : faceEmotion === "fearful"
              ? "Takut/Cemas 😰"
              : faceEmotion === "disgusted"
                ? "Jijik 🤢"
                : faceEmotion === "surprised"
                  ? "Terkejut 😲"
                  : "Netral 😐";
    emotionContext = `\n[KONTEKS VISUAL PENTING]: Ekspresi wajah pengguna saat ini terdeteksi: "${emotionId}". Gunakan sinyal wajah ini untuk memberikan respons yang lebih berempati dan sesuai dengan perasaannya saat ini secara natural.`;
  }

  const baseRules = `PENTING: Jangan memberikan diagnosis medis. Jika serius, arahkan ke bantuan profesional. Jawablah "aiResponse" dengan singkat (maks 3-4 kalimat).${emotionContext}
Tugasmu adalah menganalisis pesan lalu merespons HANYA DALAM FORMAT JSON VALID. Struktur yang harus dipatuhi:
{
  "aiResponse": "(balasanmu sesuai peran)",
  "mood": "(contoh: 😭 Sedih, 😊 Bahagia, 😡 Marah, 😰 Cemas, 😐 Netral)",
  "category": "(Kategori singkat misal: Asmara, Pekerjaan, Keluarga, Kesehatan, Pribadi, Lainnya)"
}`;

  switch (persona) {
    case "sahabat":
      return `Kamu adalah sahabat karib pengguna yang seumuran, sangat santai, gaul, dan selalu mendukung. Gunakan bahasa sehari-hari (kayak lo/gue atau aku/kamu yang santai), tunjukkan empati layaknya teman nongkrong, dan kasih semangat ringan! ${baseRules}`;
    case "orang_tua":
      return `Kamu adalah sosok orang tua yang bijak, hangat, dan mengayomi. Anggap pengguna sebagai anak kesayanganmu. Berikan respons yang menenangkan, penuh kasih sayang, dan nasihat lembut layaknya seorang ibu/ayah kepada anaknya. ${baseRules}`;
    case "motivator":
      return `Kamu adalah seorang motivator yang sangat energik, positif, dan penuh semangat! Tugasmu adalah membangkitkan rasa percaya diri pengguna, mengingatkan mereka akan potensi dan kekuatan mereka, dengan nada kalimat yang berapi-api namun tetap empatik. ${baseRules}`;
    case "guru":
      return `Kamu adalah seorang guru yang bijaksana, sabar, dan penuh pengertian. Kamu menjelaskan masalah dengan cara yang mudah dipahami, memberikan analogi yang mencerahkan, dan membantu pengguna melihat masalah dari sudut pandang baru dengan pendekatan edukatif namun tetap hangat. ${baseRules}`;
    case "kakak":
      return `Kamu adalah kakak yang pengertian, sedikit protektif, dan sangat perhatian. Kamu berbicara dengan nada akrab tapi tetap dewasa, memberikan saran praktis, dan selalu meyakinkan adikmu bahwa semua akan baik-baik saja. Gunakan bahasa santai tapi tetap sopan. ${baseRules}`;
    case "filosof":
      return `Kamu adalah seorang filosof yang tenang dan bijak. Kamu merespons dengan refleksi mendalam, kutipan-kutipan bermakna, dan pertanyaan-pertanyaan yang membuat pengguna merenungkan hidupnya lebih dalam. Gunakan bahasa yang puitis namun tetap mudah dipahami. ${baseRules}`;
    case "psikolog":
    default:
      return `Kamu adalah asisten psikolog pendengar yang profesional, empatik, dan suportif. Tugasmu adalah merespons curhatan pengguna dengan bahasa yang tertata, tenang, tidak menghakimi, dan berbasis validasi emosi. ${baseRules}`;
  }
}

const FALLBACK_RESPONSES = [
  "Terima kasih sudah berbagi. Saya di sini mendengarkanmu. Perasaanmu valid, dan kamu tidak sendirian. 💙",
  "Maaf, saya sedang mengalami gangguan koneksi. Tapi ketahuilah bahwa ceritamu penting, dan kamu kuat. 🌸",
  "Saya mengerti ini berat. Tarik napas perlahan. Kamu berharga, dan perasaan ini akan berlalu. 🌟",
  "Terima kasih atas keberanianmu bercerita. Tetaplah kuat, dan jangan ragu mencari bantuan profesional jika perlu. 💜",
];

function normalizeApiMessages(messages: { role: string; content: string }[]) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    content: m.content,
  }));
}

export function parseAIResultText(text: string): AIResult {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
  }

  try {
    const parsed = JSON.parse(cleanText);
    return {
      aiResponse: parsed.aiResponse || parsed.balasan_ai || cleanText,
      mood: parsed.mood || parsed.mood_terdeteksi || "😐 Netral",
      category: parsed.category || parsed.topik_terdeteksi || "Lainnya",
    };
  } catch {
    return {
      aiResponse: cleanText,
      mood: "😐 Netral",
      category: "Lainnya",
    };
  }
}

export type StreamCallbacks = {
  onChunk: (accumulatedRaw: string) => void;
  onParsedPreview?: (preview: string) => void;
};

export async function generateAIResponseStream(
  messages: { role: string; content: string }[],
  persona: string = "psikolog",
  faceEmotion?: string | null,
  callbacks?: StreamCallbacks
): Promise<AIResult> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const systemPrompt = getSystemPrompt(persona, faceEmotion);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: normalizeApiMessages(messages),
        systemPrompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error((errorData as { error?: string }).error || `Server Error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Streaming tidak didukung");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (!payload) continue;
        try {
          const event = JSON.parse(payload) as {
            type: string;
            text?: string;
            message?: string;
          };
          if (event.type === "chunk" && event.text) {
            accumulated += event.text;
            callbacks?.onChunk(accumulated);
            try {
              const parsed = parseAIResultText(accumulated);
              if (parsed.aiResponse) callbacks?.onParsedPreview?.(parsed.aiResponse);
            } catch {
              /* partial JSON */
            }
          } else if (event.type === "error") {
            throw new Error(event.message || "Stream error");
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }

    return parseAIResultText(accumulated);
  } catch (error) {
    const err = error as Error;
    console.error("AI Stream Error:", err);
    if (err.message.includes("fetch") || err.message.includes("404")) {
      return {
        aiResponse: getFallbackResponse(lastMessage),
        mood: "😐 Netral",
        category: "Lainnya",
      };
    }
    throw err;
  }
}

export async function generateAIResponse(
  messages: { role: string; content: string }[],
  persona: string = "psikolog",
  faceEmotion?: string | null
): Promise<AIResult> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const systemPrompt = getSystemPrompt(persona, faceEmotion);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: normalizeApiMessages(messages),
        systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    const { text } = await response.json();
    return parseAIResultText(text);
  } catch (error) {
    const err = error as Error;
    console.error("AI Generation Error:", err);

    if (err.message.includes("fetch") || err.message.includes("404")) {
      return {
        aiResponse: getFallbackResponse(lastMessage),
        mood: "😐 Netral",
        category: "Lainnya",
      };
    }

    return {
      aiResponse: `Maaf, terjadi masalah teknis: ${err.message}. Jika Anda meng-host sendiri, setel variabel GEMINI_API_KEY di environment server (bukan di browser).`,
      mood: "😢 Error",
      category: "Error",
    };
  }
}

function getFallbackResponse(message: string): string {
  if (detectCrisis(message)) {
    return "Saya sangat peduli dengan keselamatanmu. Mohon segera hubungi bantuan profesional atau hotline darurat (119/500-454). Kamu sangat berharga. 🆘";
  }
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

export function mapAIMoodToKey(aiMoodEmoji: string): string {
  const m = aiMoodEmoji.toLowerCase();
  if (m.includes("bahagia") || m.includes("senang") || m.includes("😊") || m.includes("😁")) return "happy";
  if (m.includes("sedih") || m.includes("😭") || m.includes("😢")) return "very-sad";
  if (m.includes("kecewa") || m.includes("😔")) return "sad";
  if (m.includes("marah") || m.includes("😡") || m.includes("kesal")) return "sad";
  if (m.includes("cemas") || m.includes("😰") || m.includes("khawatir")) return "sad";
  return "neutral";
}
