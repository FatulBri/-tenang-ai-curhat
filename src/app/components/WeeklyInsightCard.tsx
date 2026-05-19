import { useEffect, useState } from "react";
import { Brain, Sparkles, Lightbulb, RefreshCw } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useApp } from "../context/AppContext";
import { generateAIInsights, AIInsight } from "../utils/insights";
import { motion, AnimatePresence } from "framer-motion";

function getWeekKey(): string {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}

interface WeeklyInsightCardProps {
  autoLoad?: boolean;
  compact?: boolean;
}

export function WeeklyInsightCard({ autoLoad = false, compact = false }: WeeklyInsightCardProps) {
  const { curhats, moods } = useApp();
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const loadInsight = async (force = false) => {
    const weekKey = getWeekKey();
    const cacheKey = `tenang_insight_${weekKey}`;

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

    setLoading(true);
    try {
      const result = await generateAIInsights(curhats, moods);
      setInsight(result);
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoLoad) return;
    if (curhats.length === 0 && moods.length === 0) return;
    loadInsight();
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasData = curhats.length > 0 || moods.length > 0;

  return (
    <Card
      className={`relative overflow-hidden border border-indigo-200/40 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-teal-500/5 dark:from-indigo-950/40 dark:to-teal-950/20 backdrop-blur-xl ${
        compact ? "p-5 rounded-2xl" : "p-8 rounded-[2rem]"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-4"
      >
        <motion.div layout className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div layout className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className={`font-bold text-gray-800 dark:text-white ${compact ? "text-base" : "text-lg"}`}>
                Refleksi Mingguan
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ringkasan pola emosimu 7 hari terakhir</p>
            </div>
          </div>
          {!insight && hasData && (
            <Button
              size="sm"
              onClick={() => loadInsight(true)}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shrink-0"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" /> Lihat
                </>
              )}
            </Button>
          )}
        </motion.div>

        {!hasData && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Catat mood atau curhat dulu untuk mendapatkan insight mingguan.
          </p>
        )}

        <AnimatePresence mode="wait">
          {insight && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <p className={`text-gray-700 dark:text-gray-200 leading-relaxed italic ${compact ? "text-sm" : "text-base"}`}>
                &ldquo;{insight.summary}&rdquo;
              </p>
              <ul className="space-y-2">
                {insight.recommendations.slice(0, compact ? 2 : 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    {rec}
                  </li>
                ))}
              </ul>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 text-center pt-1">
                {insight.growthNote}
              </p>
              <div className="flex justify-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadInsight(true)}
                  disabled={loading}
                  className="text-xs text-gray-500"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? "animate-spin" : ""}`} />
                  Perbarui
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}
