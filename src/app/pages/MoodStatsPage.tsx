import { useState, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { History, TrendingUp, Brain, Sparkles, Lightbulb } from "lucide-react";
import { generateAIInsights, AIInsight } from "../utils/insights";
import type { ChartView } from "./MoodStatsChartPanel";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const MoodStatsChartPanel = lazy(() => import("./MoodStatsChartPanel"));

const moodColors: { [key: string]: string } = {
  "very-happy": "#f59e0b",
  "happy": "#10b981",
  "neutral": "#6b7280",
  "sad": "#3b82f6",
  "very-sad": "#8b5cf6",
};

const moodEmoji: { [key: string]: string } = {
  "very-happy": "😁",
  "happy": "🙂",
  "neutral": "😐",
  "sad": "😔",
  "very-sad": "😢",
};

const moodScore: { [key: string]: number } = {
  "very-happy": 5, "happy": 4, "neutral": 3, "sad": 2, "very-sad": 1,
};

const moodLabels: { [key: string]: string } = {
  "very-happy": "Sangat Bahagia", "happy": "Bahagia", "neutral": "Netral",
  "sad": "Sedih", "very-sad": "Sangat Sedih",
};

function buildTrendData(moods: { mood: string; date: Date }[]) {
  const days: { label: string; date: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days.push({ label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }), date: d });
  }
  return days.map(({ label, date }) => {
    const dayEntries = moods.filter(m => new Date(m.date).toDateString() === date.toDateString());
    if (dayEntries.length === 0) return { label, skor: null, count: 0 };
    const avg = dayEntries.reduce((s, m) => s + (moodScore[m.mood] || 3), 0) / dayEntries.length;
    return { label, skor: parseFloat(avg.toFixed(1)), count: dayEntries.length };
  });
}

// Build word cloud data from all user messages
function buildWordCloud(messages: string[]): { word: string; count: number; size: number }[] {
  const STOPWORDS = new Set(["aku", "kamu", "saya", "dia", "kita", "kami", "ya", "yang", "dan", "di", "ke", "dari", "dengan", "ini", "itu", "ada", "tidak", "bisa", "untuk", "juga", "tapi", "kalau", "atau", "sudah", "dengan", "sangat", "sekali", "aja", "jadi", "lagi", "karena", "mau", "buat", "terus", "udah", "sama", "lebih", "sih", "gak", "tak", "ga", "nggak", "gue", "lo", "lu", "gw", "memang", "banget", "lah", "deh", "dong", "nih", "kan", "kok", "si"]);
  const freq: { [k: string]: number } = {};
  messages.forEach(msg => {
    msg.toLowerCase().replace(/[^a-zA-Z\u00C0-\u024F\s]/g, "").split(/\s+/).forEach(w => {
      if (w.length > 3 && !STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 40);
  const max = sorted[0]?.[1] || 1;
  return sorted.map(([word, count]) => ({ word, count, size: Math.round(12 + (count / max) * 24) }));
}

function buildHeatmapData(moods: { mood: string; date: Date }[]) {
  const days: { date: Date; score: number | null }[] = [];
  // Generate last 84 days (12 weeks)
  for (let i = 83; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    
    // Find moods for this day
    const dayEntries = moods.filter(m => new Date(m.date).toDateString() === d.toDateString());
    let score = null;
    if (dayEntries.length > 0) {
      score = dayEntries.reduce((s, m) => s + (moodScore[m.mood] || 3), 0) / dayEntries.length;
    }
    
    days.push({ date: d, score });
  }
  return days;
}

export function MoodStatsPage() {
  const navigate = useNavigate();
  const { moods, curhats, darkMode, streak, badges } = useApp();
  const [chartView, setChartView] = useState<ChartView>("bar");
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const handleGenerateInsight = async (force = false) => {
    const d = new Date();
    const onejan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
    const cacheKey = `tenang_insight_${d.getFullYear()}-W${week}`;

    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setInsight(JSON.parse(cached));
          return;
        } catch {
          /* regenerate */
        }
      }
    }

    setIsLoadingInsight(true);
    const result = await generateAIInsights(curhats, moods);
    setInsight(result);
    localStorage.setItem(cacheKey, JSON.stringify(result));
    setIsLoadingInsight(false);
  };

  useEffect(() => {
    if (curhats.length === 0 && moods.length === 0) return;
    handleGenerateInsight();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const moodCounts = moods.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1; return acc;
  }, {} as { [key: string]: number });

  const barData = Object.entries(moodCounts).map(([mood, count]) => ({
    mood: `${moodEmoji[mood] || ""} ${moodLabels[mood] || mood}`, count, color: moodColors[mood] || "#6b7280",
  }));

  const pieData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: `${moodEmoji[mood] || ""} ${moodLabels[mood] || mood}`, value: count, color: moodColors[mood] || "#6b7280",
  }));

  const trendData = buildTrendData(moods);
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const avgScore = moods.length ? (moods.reduce((s, m) => s + (moodScore[m.mood] || 3), 0) / moods.length).toFixed(1) : null;
  const heatmapData = buildHeatmapData(moods);

  // Word cloud from user messages
  const allUserMessages = curhats.flatMap(c => c.messages.filter(m => m.role === "user").map(m => m.content));
  const wordCloud = buildWordCloud(allUserMessages);

  // Category stats
  const categoryCounts = curhats.reduce((acc, c) => {
    const cat = c.category || "Lainnya";
    acc[cat] = (acc[cat] || 0) + 1; return acc;
  }, {} as { [k: string]: number });
  const topCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const textColor = darkMode ? "#9ca3af" : "#6b7280";
  const gridColor = darkMode ? "#1e293b" : "#f1f5f9";
  const tooltipBg = darkMode ? "#0f172a" : "#ffffff";
  const tooltipBorder = darkMode ? "#334155" : "#e2e8f0";

  const unlockedBadges = badges.filter(b => b.unlocked);

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] transition-colors duration-500 flex flex-col relative z-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex-1 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400 mb-2">
            Statistik Mood
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Pantau perjalanan emosionalmu</p>
        </motion.div>

        {/* ── STREAK & BADGES ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Streak */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔥</span>
                </div>
                <div>
                  <p className="text-4xl font-black text-orange-500">{streak}</p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hari Streak</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden sm:block h-16 w-px bg-gray-100 dark:bg-slate-700" />

              {/* Badges */}
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Badge Terkumpul — {unlockedBadges.length}/{badges.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {badges.map(badge => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.05 }}
                      title={`${badge.title}: ${badge.description}`}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-default ${
                        badge.unlocked
                          ? "bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-400/30 dark:border-teal-600/40 text-teal-700 dark:text-teal-300"
                          : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-600 opacity-60 grayscale"
                      }`}
                    >
                      <span className={badge.unlocked ? "" : "grayscale"}>{badge.emoji}</span>
                      {badge.title}
                      {badge.unlocked && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ── AI REFLECTION ── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-teal-500/10 dark:from-indigo-900/40 dark:via-purple-900/20 dark:to-teal-900/40 backdrop-blur-2xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Animated background highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -ml-32 -mb-32 animate-pulse animation-delay-2000" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Refleksi AI Mingguan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Analisis pola pikiranmu menggunakan NLP</p>
                  </div>
                </div>
                
                {!insight && (
                  <Button 
                    onClick={() => handleGenerateInsight(true)}
                    disabled={isLoadingInsight}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 flex gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    {isLoadingInsight ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Menganalisis...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Bangkitkan Insight
                      </>
                    )}
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {insight && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Summary Card */}
                    <div className="p-6 bg-white/40 dark:bg-slate-900/40 rounded-3xl border border-white/40 dark:border-white/10">
                      <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed italic">
                        "{insight.summary}"
                      </p>
                    </div>

                    {/* Recommendations Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {insight.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-white/20 dark:bg-slate-800/40 rounded-2xl border border-white/10">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-5 h-5 text-indigo-500" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-tight">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Growth Note */}
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <div className="h-px flex-1 bg-indigo-500/20" />
                      <p className="px-4 py-2 bg-indigo-500/10 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                        {insight.growthNote}
                      </p>
                      <div className="h-px flex-1 bg-indigo-500/20" />
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleGenerateInsight(true)}
                        disabled={isLoadingInsight}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Perbarui Analisis
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {moods.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-14 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl text-center rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl">
              <TrendingUp className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Belum Ada Data Mood</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-sm mx-auto">
                Mulai catat moodmu setiap hari untuk melihat pola emosional yang bermakna
              </p>
              <Button onClick={() => navigate("/mood-tracker")} className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-8 py-5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
                Catat Mood Sekarang
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Summary Cards */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-md text-center">
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{moods.length}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Total Catatan</p>
              </Card>
              <Card className="p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-md text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgScore}<span className="text-sm font-normal text-gray-400">/5</span></p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Skor Rata-rata</p>
              </Card>
              {dominantMood && (
                <Card className="p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-slate-700/50 shadow-md text-center col-span-2 sm:col-span-1">
                  <p className="text-3xl">{moodEmoji[dominantMood[0]] || "❓"}</p>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{moodLabels[dominantMood[0]]}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Mood Terbanyak</p>
                </Card>
              )}
            </motion.div>

            <Suspense
              fallback={
                <Card className="p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl min-h-[360px] flex items-center justify-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Memuat grafik…</p>
                </Card>
              }
            >
              <MoodStatsChartPanel
                chartView={chartView}
                setChartView={setChartView}
                barData={barData}
                trendData={trendData}
                pieData={pieData}
                heatmapData={heatmapData}
                wordCloud={wordCloud}
                topCategories={topCategories}
                textColor={textColor}
                gridColor={gridColor}
                tooltipBg={tooltipBg}
                tooltipBorder={tooltipBorder}
                darkMode={darkMode}
              />
            </Suspense>

            {/* Encouraging Message */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              <Card className="p-5 bg-gradient-to-r from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 border border-teal-100 dark:border-teal-900/40 rounded-2xl">
                <p className="text-center text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  ✨ Setiap perasaan yang kamu catat adalah langkah kecil menuju kesadaran diri yang lebih dalam. Kamu luar biasa! 💪
                </p>
              </Card>
            </motion.div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button onClick={() => navigate("/mood-tracker")} className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white py-6 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all font-semibold">
            <TrendingUp className="w-5 h-5 mr-2" /> Catat Mood Baru
          </Button>
          <Button onClick={() => navigate("/history")} variant="outline" className="flex-1 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 py-6 rounded-xl font-semibold">
            <History className="w-5 h-5 mr-2" /> Riwayat Curhat
          </Button>
        </div>
      </main>
      <Footer />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafc] to-white dark:hidden" />
        <div className="absolute inset-0 bg-[#030213] hidden dark:block" />
        <div className="absolute top-[5%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-teal-400/15 dark:bg-teal-600/15 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-purple-400/15 dark:bg-purple-800/15 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-3000" />
      </div>
    </div>
  );
}