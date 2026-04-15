
export interface AIResult {
  aiResponse: string;
  mood: string;
  category: string;
}

export function getSystemPrompt(persona: string): string {
  const baseRules = `PENTING: Jangan memberikan diagnosis medis. Jika serius, arahkan ke bantuan profesional. Jawablah "aiResponse" dengan singkat (maks 3-4 kalimat).
Tugasmu adalah menganalisis pesan lalu merespons HANYA DALAM FORMAT JSON VALID. Struktur yang harus dipatuhi:
{
  "aiResponse": "(balasanmu sesuai peran)",
  "mood": "(contoh: 😭 Sedih, 😊 Bahagia, 😡 Marah, 😰 Cemas, 😐 Netral)",
  "category": "(Kategori singkat misal: Asmara, Pekerjaan, Keluarga, Kesehatan, Pribadi, Lainnya)"
}`;

  switch(persona) {
    case 'sahabat':
      return `Kamu adalah sahabat karib pengguna yang seumuran, sangat santai, gaul, dan selalu mendukung. Gunakan bahasa sehari-hari (kayak lo/gue atau aku/kamu yang santai), tunjukkan empati layaknya teman nongkrong, dan kasih semangat ringan! ${baseRules}`;
    case 'orang_tua':
      return `Kamu adalah sosok orang tua yang bijak, hangat, dan mengayomi. Anggap pengguna sebagai anak kesayanganmu. Berikan respons yang menenangkan, penuh kasih sayang, dan nasihat lembut layaknya seorang ibu/ayah kepada anaknya. ${baseRules}`;
    case 'motivator':
      return `Kamu adalah seorang motivator yang sangat energik, positif, dan penuh semangat! Tugasmu adalah membangkitkan rasa percaya diri pengguna, mengingatkan mereka akan potensi dan kekuatan mereka, dengan nada kalimat yang berapi-api namun tetap empatik. ${baseRules}`;
    case 'guru':
      return `Kamu adalah seorang guru yang bijaksana, sabar, dan penuh pengertian. Kamu menjelaskan masalah dengan cara yang mudah dipahami, memberikan analogi yang mencerahkan, dan membantu pengguna melihat masalah dari sudut pandang baru dengan pendekatan edukatif namun tetap hangat. ${baseRules}`;
    case 'kakak':
      return `Kamu adalah kakak yang pengertian, sedikit protektif, dan sangat perhatian. Kamu berbicara dengan nada akrab tapi tetap dewasa, memberikan saran praktis, dan selalu meyakinkan adikmu bahwa semua akan baik-baik saja. Gunakan bahasa santai tapi tetap sopan. ${baseRules}`;
    case 'filosof':
      return `Kamu adalah seorang filosof yang tenang dan bijak. Kamu merespons dengan refleksi mendalam, kutipan-kutipan bermakna, dan pertanyaan-pertanyaan yang membuat pengguna merenungkan hidupnya lebih dalam. Gunakan bahasa yang puitis namun tetap mudah dipahami. ${baseRules}`;
    case 'psikolog':
    default:
      return `Kamu adalah asisten psikolog pendengar yang profesional, empatik, dan suportif. Tugasmu adalah merespons curhatan pengguna dengan bahasa yang tertata, tenang, tidak menghakimi, dan berbasis validasi emosi. ${baseRules}`;
  }
}

// Fallback responses if API fails or no key provided
const FALLBACK_RESPONSES = [
  "Terima kasih sudah berbagi. Saya di sini mendengarkanmu. Perasaanmu valid, dan kamu tidak sendirian. 💙",
  "Maaf, saya sedang mengalami gangguan koneksi. Tapi ketahuilah bahwa ceritamu penting, dan kamu kuat. 🌸",
  "Saya mengerti ini berat. Tarik napas perlahan. Kamu berharga, dan perasaan ini akan berlalu. 🌟",
  "Terima kasih atas keberanianmu bercerita. Tetaplah kuat, dan jangan ragu mencari bantuan profesional jika perlu. 💜"
];

export async function generateAIResponse(messages: { role: string, content: string }[], persona: string = "psikolog"): Promise<AIResult> {
  // Use absolute URL locally if needed, but relative works on Vercel and vercel dev
  const API_ENDPOINT = "/api/generate-response";
  
  const lastMessage = messages[messages.length - 1]?.content || "";
  const systemPrompt = getSystemPrompt(persona);

  try {
    const localApiKey = localStorage.getItem("gemini_api_key") || "";

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role === "user" ? "user" : "model",
          content: m.content
        })),
        persona,
        systemPrompt,
        clientApiKey: localApiKey
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server Error: ${response.status}`);
    }

    const { text } = await response.json();

    // Clean JSON markdown block if Gemini returns it
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }

    // Parse JSON from LLM
    try {
      const parsed = JSON.parse(cleanText);
      return {
        aiResponse: parsed.aiResponse || parsed.balasan_ai || cleanText,
        mood: parsed.mood || parsed.mood_terdeteksi || "😐 Netral",
        category: parsed.category || parsed.topik_terdeteksi || "Lainnya"
      };
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError);
      return {
        aiResponse: cleanText,
        mood: "😐 Netral",
        category: "Lainnya"
      };
    }

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    
    // Fallback if the whole API setup fails (e.g. not deployed yet)
    if (error.message.includes("fetch") || error.message.includes("404")) {
       return {
         aiResponse: getFallbackResponse(lastMessage),
         mood: "😐 Netral",
         category: "Lainnya"
       };
    }

    return {
      aiResponse: `Maaf, terjadi masalah teknis: ${error.message}. Mohon pastikan API Key sudah terpasang di Vercel Dashboard.`,
      mood: "😢 Error",
      category: "Error"
    };
  }
}

function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("mati") || lowerMsg.includes("bunuh diri") || lowerMsg.includes("self harm")) {
    return "Saya sangat peduli dengan keselamatanmu. Mohon segera hubungi bantuan profesional atau hotline darurat (119/110). Kamu sangat berharga. 🆘";
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
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

