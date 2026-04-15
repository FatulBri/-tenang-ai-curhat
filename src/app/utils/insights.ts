import { Curhat, MoodEntry } from "../context/AppContext";

export interface AIInsight {
  summary: string;
  recommendations: string[];
  growthNote: string;
}

export async function generateAIInsights(curhats: Curhat[], moods: MoodEntry[]): Promise<AIInsight> {
  const apiKey = localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY;
  const API_ENDPOINT = "/api/generate-response";

  // Filter last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentCurhats = curhats.filter(c => new Date(c.timestamp) >= sevenDaysAgo);
  const recentMoods = moods.filter(m => new Date(m.date) >= sevenDaysAgo);

  if (recentCurhats.length === 0 && recentMoods.length === 0) {
    return {
      summary: "Belum ada data yang cukup untuk minggu ini. Teruslah mencatat perasaanmu untuk melihat pola emosional yang bermakna.",
      recommendations: ["Mulai dengan menulis curhat pertama minggu ini.", "Gunakan Mood Tracker setiap hari."],
      growthNote: "Awal perjalanan adalah langkah tersulit. Kamu bisa melaluinya!"
    };
  }

  // Prepare context for AI
  const context = `
    Data Emosional Pengguna 7 Hari Terakhir:
    - Total Curhat: ${recentCurhats.length}
    - Mood harian recorded: ${recentMoods.map(m => m.mood).join(", ")}
    - Kategori masalah dominan: ${recentCurhats.map(c => c.category).join(", ")}
    - Pesan terakhir: "${recentCurhats[0]?.messages.filter(m => m.role === 'user').pop()?.content || ""}"

    Tugasmu: Analisis data di atas secara empatik dan profesional (sebagai psikolog pendukung).
    Berikan respons dalam format JSON:
    {
      "summary": "(ringkasan 2-3 kalimat tentang pola emosinya minggu ini)",
      "recommendations": ["(saran 1)", "(saran 2)"],
      "growthNote": "(satu kalimat penyemangat singkat)"
    }
  `;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: context }],
        persona: "psikolog",
        systemPrompt: "Kamu adalah asisten analisis emosi AI yang bijak. Keluarkan HANYA JSON."
      })
    });

    if (!response.ok) throw new Error("Failed to fetch insight");

    const { text } = await response.json();
    let cleanText = text.trim();
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    }

    const parsed = JSON.parse(cleanText);
    return {
      summary: parsed.summary || "Analisis sedang diproses...",
      recommendations: parsed.recommendations || ["Teruslah berproses."],
      growthNote: parsed.growthNote || "Kamu melakukan hal hebat!"
    };

  } catch (error) {
    console.error("Insight Error:", error);
    return {
      summary: "Maaf, AI sedang beristirahat sebentar. Silakan coba lagi nanti.",
      recommendations: ["Tetap jaga kesehatan mentalmu.", "Minum air putih yang cukup."],
      growthNote: "Kamu berharga dan kuat."
    };
  }
}
