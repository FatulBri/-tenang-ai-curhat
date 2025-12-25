const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash"
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const SYSTEM_PROMPT = `
Kamu adalah asisten pendengar yang empatik dan suportif.
Tugasmu adalah merespons curhatan pengguna dengan bahasa yang tenang, tidak menghakimi, dan penuh empati.
Jangan memberikan diagnosis medis atau menyarankan tindakan berbahaya.
Jika masalah terlihat serius, arahkan dengan lembut ke bantuan profesional.
Jawablah dengan singkat, hangat, dan menenangkan (maksimal 3-4 kalimat).
`;

// Fallback responses if API fails or no key provided
const FALLBACK_RESPONSES = [
  "Terima kasih sudah berbagi. Saya di sini mendengarkanmu. Perasaanmu valid, dan kamu tidak sendirian. 💙",
  "Maaf, saya sedang mengalami gangguan koneksi. Tapi ketahuilah bahwa ceritamu penting, dan kamu kuat. 🌸",
  "Saya mengerti ini berat. Tarik napas perlahan. Kamu berharga, dan perasaan ini akan berlalu. 🌟",
  "Terima kasih atas keberanianmu bercerita. Tetaplah kuat, dan jangan ragu mencari bantuan profesional jika perlu. 💜"
];

export async function generateAIResponse(message: string): Promise<string> {
  const apiKey = localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("No Gemini API Key found. Using mock response.");
    return "Error: API Key is missing. Please check .env or Settings.";
  }
  console.log("Using API Key:", apiKey.substring(0, 10) + "...");

  let lastError: Error | null = null;
  const TIMEOUT_MS = 10000; // 10 second timeout

  for (const model of MODELS) {
    try {
      console.log(`Trying model: ${model}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(`${BASE_URL}/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: SYSTEM_PROMPT },
                { text: `Curhatan Pengguna: "${message}"\n\nResponmu:` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error Body (${model}):`, errorBody);
        throw new Error(`API Error (${model}): ${response.status} - ${errorBody}`);
      }

      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiText) {
        throw new Error(`No response text provided by ${model}`);
      }

      return aiText.trim();

    } catch (error) {
      console.warn(`Failed to connect to ${model}:`, error);
      lastError = error as Error;
      // Continue to next model
    }
  }

  console.error("All Gemini API models failed. Last Error:", lastError);
  return getFallbackResponse(message);
}

function getFallbackResponse(message: string): string {
  // Simple keyword matching for better fallback context
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("mati") || lowerMsg.includes("bunuh diri") || lowerMsg.includes("self harm")) {
    return "Saya sangat peduli dengan keselamatanmu. Mohon segera hubungi bantuan profesional atau hotline darurat (119/110). Kamu sangat berharga. 🆘";
  }

  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[randomIndex];
}

