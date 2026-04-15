import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { History, TrendingUp, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, Brain, Sparkles, Lightbulb } from "lucide-react";
import { generateAIInsights, AIInsight } from "../utils/insights";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Area, AreaChart, PieChart, Pie, Legend
} from "recharts";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

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

type ChartView = "bar" | "trend" | "analysis";

export function MoodStatsPage() {
  const navigate = useNavigate();
  const { moods, curhats, darkMode, streak, badges } = useApp();
  const [chartView, setChartView] = useState<ChartView>("bar");
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const handleGenerateInsight = async () => {
    setIsLoadingInsight(true);
    const result = await generateAIInsights(curhats, moods);
    setInsight(result);
    setIsLoadingInsight(false);
  };

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
                    onClick={handleGenerateInsight}
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
                        onClick={handleGenerateInsight}
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

            {/* Chart Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl">
                {/* Chart Header + Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      {chartView === "bar" ? "Distribusi Mood" : chartView === "trend" ? "Tren Mood 7 Hari" : "Analisis Mendalam"}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {chartView === "bar" ? "Frekuensi tiap jenis mood" : chartView === "trend" ? "Skor rata-rata emosi per hari" : "Word cloud & breakdown emosi"}
                    </p>
                  </div>
                  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                    {([["bar", <BarChart2 key="b" className="w-3.5 h-3.5" />, "Distribusi"], ["trend", <LineChartIcon key="t" className="w-3.5 h-3.5" />, "Tren"], ["analysis", <Brain key="a" className="w-3.5 h-3.5" />, "Analisis"]] as const).map(([v, icon, label]) => (
                      <button key={v} onClick={() => setChartView(v as ChartView)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          chartView === v ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-500 dark:text-gray-400"
                        }`}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {chartView === "bar" && (
                    <motion.div key="bar" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="mood" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: textColor, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip cursor={{ fill: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                            contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "13px" }}
                            formatter={(val: any) => [`${val} kali`, "Frekuensi"]} />
                          <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                            {barData.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {chartView === "trend" && (
                    <motion.div key="trend" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: textColor, fontSize: 11 }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => ["", "😢", "😔", "😐", "🙂", "😁"][v] || v} />
                          <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "13px" }}
                            formatter={(val: any, _n: any, props: any) => {
                              if (val === null) return ["Tidak ada data", "Skor Mood"];
                              const s = Number(val);
                              const e = s >= 4.5 ? "😁" : s >= 3.5 ? "🙂" : s >= 2.5 ? "😐" : s >= 1.5 ? "😔" : "😢";
                              return [`${e} ${val} / 5 (${props.payload.count} catatan)`, "Skor Mood"];
                            }} labelStyle={{ fontWeight: 600 }} />
                          <Area type="monotone" dataKey="skor" stroke="#14b8a6" strokeWidth={3} fill="url(#moodGrad)"
                            dot={{ fill: "#14b8a6", r: 5, strokeWidth: 0 }} activeDot={{ r: 7, fill: "#a855f7", strokeWidth: 0 }} connectNulls={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-3 flex-wrap">
                        {[["😢 1", "Sangat Sedih"], ["😔 2", "Sedih"], ["😐 3", "Netral"], ["🙂 4", "Bahagia"], ["😁 5", "Sangat Bahagia"]].map(([score, label]) => (
                          <span key={score} className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{score} = {label}</span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {chartView === "analysis" && (
                    <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                      {/* Pie Chart */}
                      {pieData.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Proporsi Emosi</p>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "13px" }}
                                formatter={(val: any) => [`${val} kali`]} />
                              <Legend formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Top Categories */}
                      {topCategories.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Topik Curhat Teratas</p>
                          <div className="flex flex-wrap gap-2">
                            {topCategories.map(([cat, cnt], i) => (
                              <span key={cat} className={`px-3 py-1.5 rounded-full text-sm font-semibold ${i === 0 ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"}`}>
                                {cat} <span className="opacity-60 text-xs">({cnt})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Word Cloud */}
                      {wordCloud.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Kata Paling Sering Kamu Tulis</p>
                          <div className="flex flex-wrap gap-2 items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl min-h-[120px]">
                            {wordCloud.map(({ word, count, size }) => (
                              <motion.span
                                key={word}
                                whileHover={{ scale: 1.1 }}
                                title={`${count} kali`}
                                className="cursor-default select-none font-semibold transition-colors"
                                style={{
                                  fontSize: size,
                                  color: `hsl(${(word.charCodeAt(0) * 37) % 360}, 60%, ${darkMode ? "65%" : "45%"})`,
                                  opacity: 0.6 + (size - 12) / 36,
                                }}
                              >
                                {word}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                          <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">Tulis lebih banyak curhat untuk melihat analisis kata</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

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