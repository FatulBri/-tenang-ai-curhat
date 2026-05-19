export const CRISIS_KEYWORDS = [
  "bunuh diri",
  "ingin mati",
  "mau mati",
  "pengen mati",
  "tidak mau hidup",
  "nggak mau hidup",
  "mengakhiri hidup",
  "akhiri hidup",
  "self harm",
  "menyakiti diri",
  "nyakitin diri",
  "hilang saja",
  "tidak ada gunanya hidup",
  "nggak ada gunanya hidup",
  "capek hidup",
  "benci hidup",
  "tidak sanggup lagi",
  "tidak kuat lagi",
  "nggak kuat lagi",
  "menyerah hidup",
  "ingin menghilang",
  "mau menghilang",
];

export function detectCrisis(text: string): boolean {
  if (!text?.trim()) return false;
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

export function getLatestUserText(messages: { role: string; content: string }[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages[i].content;
  }
  return messages.map((m) => m.content).join("\n");
}

export const CRISIS_AI_RESPONSE = {
  aiResponse:
    "Saya sangat peduli dengan keselamatanmu. Perasaanmu valid, dan kamu tidak sendirian. Mohon segera hubungi layanan darurat: telepon 119 (Sejiwa) atau 500-454 (Kemenkes). Ada profesional yang siap mendengarkan 24 jam. Kamu berharga. 💙",
  mood: "😰 Cemas",
  category: "Krisis",
};

export function buildCrisisResponseJson(): string {
  return JSON.stringify(CRISIS_AI_RESPONSE);
}
