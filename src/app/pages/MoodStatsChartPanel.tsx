import { BarChart2, LineChart as LineChartIcon, CalendarDays, Brain } from "lucide-react";
import { Card } from "../components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Area, AreaChart, PieChart, Pie, Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

export type ChartView = "bar" | "trend" | "analysis" | "heatmap";

export interface MoodStatsChartPanelProps {
  chartView: ChartView;
  setChartView: (v: ChartView) => void;
  barData: { mood: string; count: number; color: string }[];
  trendData: { label: string; skor: number | null; count: number }[];
  pieData: { name: string; value: number; color: string }[];
  heatmapData: { date: Date; score: number | null }[];
  wordCloud: { word: string; count: number; size: number }[];
  topCategories: [string, number][];
  textColor: string;
  gridColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  darkMode: boolean;
}

export default function MoodStatsChartPanel({
  chartView,
  setChartView,
  barData,
  trendData,
  pieData,
  heatmapData,
  wordCloud,
  topCategories,
  textColor,
  gridColor,
  tooltipBg,
  tooltipBorder,
  darkMode,
}: MoodStatsChartPanelProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {chartView === "bar" ? "Distribusi Mood" : chartView === "trend" ? "Tren Mood 7 Hari" : chartView === "heatmap" ? "Kalender Emosi" : "Analisis Mendalam"}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {chartView === "bar" ? "Frekuensi tiap jenis mood" : chartView === "trend" ? "Skor rata-rata emosi per hari" : chartView === "heatmap" ? "Pola emosional 12 minggu terakhir" : "Word cloud & breakdown emosi"}
            </p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {([["bar", <BarChart2 key="b" className="w-3.5 h-3.5" />, "Distribusi"], ["trend", <LineChartIcon key="t" className="w-3.5 h-3.5" />, "Tren"], ["heatmap", <CalendarDays key="h" className="w-3.5 h-3.5" />, "Heatmap"], ["analysis", <Brain key="a" className="w-3.5 h-3.5" />, "Analisis"]] as const).map(([v, icon, label]) => (
              <button key={v} type="button" onClick={() => setChartView(v as ChartView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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
                    formatter={(val: unknown) => [`${val} kali`, "Frekuensi"]} />
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
                    tickFormatter={(v) => ["", "😢", "😔", "😐", "🙂", "😁"][v] || String(v)} />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "13px" }}
                    formatter={(val: unknown, _n: string, props: { payload?: { count?: number } }) => {
                      if (val === null || val === undefined) return ["Tidak ada data", "Skor Mood"];
                      const s = Number(val);
                      const e = s >= 4.5 ? "😁" : s >= 3.5 ? "🙂" : s >= 2.5 ? "😐" : s >= 1.5 ? "😔" : "😢";
                      const cnt = props.payload?.count ?? 0;
                      return [`${e} ${val} / 5 (${cnt} catatan)`, "Skor Mood"];
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

          {chartView === "heatmap" && (
            <motion.div key="heatmap" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[600px] flex flex-col gap-1">
                  {Array.from({ length: 7 }).map((_, dayOfWeek) => (
                    <div key={`dow-${dayOfWeek}`} className="flex gap-1">
                      <span className="w-8 text-[10px] text-gray-400 dark:text-gray-500 flex items-center">
                        {dayOfWeek === 1 ? "Sen" : dayOfWeek === 3 ? "Rab" : dayOfWeek === 5 ? "Jum" : ""}
                      </span>
                      {Array.from({ length: 12 }).map((_, weekIndex) => {
                        const index = weekIndex * 7 + dayOfWeek;
                        const data = heatmapData[index];
                        if (!data) return <div key={index} className="w-4 h-4 rounded-sm bg-transparent" />;

                        let bgColor = "bg-gray-100 dark:bg-slate-800";
                        if (data.score !== null) {
                          if (data.score >= 4.5) bgColor = "bg-orange-400";
                          else if (data.score >= 3.5) bgColor = "bg-emerald-500";
                          else if (data.score >= 2.5) bgColor = "bg-gray-400";
                          else if (data.score >= 1.5) bgColor = "bg-blue-400";
                          else bgColor = "bg-purple-500";
                        }

                        return (
                          <div
                            key={`day-${index}`}
                            title={`${data.date.toLocaleDateString("id-ID")}: ${data.score !== null ? `Skor ${data.score.toFixed(1)}` : "Kosong"}`}
                            className={`w-5 h-5 rounded-md ${bgColor} hover:scale-125 transition-transform cursor-pointer border border-black/5 dark:border-white/5`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400 font-medium">Lebih Sedih</div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-slate-800" title="Kosong" />
                  <div className="w-3 h-3 rounded-sm bg-purple-500" title="Sangat Sedih" />
                  <div className="w-3 h-3 rounded-sm bg-blue-400" title="Sedih" />
                  <div className="w-3 h-3 rounded-sm bg-gray-400" title="Netral" />
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" title="Bahagia" />
                  <div className="w-3 h-3 rounded-sm bg-orange-400" title="Sangat Bahagia" />
                </div>
                <div className="text-xs text-gray-400 font-medium">Lebih Bahagia</div>
              </div>
            </motion.div>
          )}

          {chartView === "analysis" && (
            <motion.div key="analysis" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
              {pieData.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Proporsi Emosi</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                        {pieData.map((_entry, i) => <Cell key={i} fill={pieData[i].color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: "12px", fontSize: "13px" }}
                        formatter={(val: unknown) => [`${val} kali`]} />
                      <Legend formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-300">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

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
  );
}
