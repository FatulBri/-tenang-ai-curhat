import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useApp } from "../context/AppContext";
import { History, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

const moodColors: { [key: string]: string } = {
  "very-happy": "#fbbf24",
  "happy": "#10b981",
  "neutral": "#6b7280",
  "sad": "#3b82f6",
  "very-sad": "#8b5cf6",
};

const moodLabels: { [key: string]: string } = {
  "very-happy": "Sangat Bahagia",
  "happy": "Bahagia",
  "neutral": "Netral",
  "sad": "Sedih",
  "very-sad": "Sangat Sedih",
};

export function MoodStatsPage() {
  const navigate = useNavigate();
  const { moods, darkMode } = useApp();

  // Count mood occurrences
  const moodCounts = moods.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(moodCounts).map(([mood, count]) => ({
    mood: moodLabels[mood] || mood,
    count,
    color: moodColors[mood] || "#gray",
  }));

  // Find dominant mood
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 flex-1">
        <div className="text-center mb-6">
          <h1 className="text-3xl text-gray-800 dark:text-gray-100 mb-2">
            Statistik Mood
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Pantau perjalanan emosionalmu
          </p>
        </div>

        {moods.length === 0 ? (
          <Card className="p-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-700 dark:text-gray-200 mb-2">
              Belum Ada Data Mood
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Mulai catat moodmu setiap hari untuk melihat pola emosionalmu
            </p>
            <Button
              onClick={() => navigate("/mood-tracker")}
              className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
            >
              Catat Mood Sekarang
            </Button>
          </Card>
        ) : (
          <>
            {/* Dominant Mood Card */}
            {dominantMood && (
              <Card className="p-6 bg-gradient-to-br from-teal-100 to-purple-100 dark:from-teal-900/40 dark:to-purple-900/40 backdrop-blur-sm shadow-lg border-teal-200 dark:border-slate-600">
                <h3 className="text-lg text-gray-700 dark:text-gray-200 mb-3">
                  Mood Dominan
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-5xl">
                    {dominantMood[0] === "very-happy" && "😊"}
                    {dominantMood[0] === "happy" && "🙂"}
                    {dominantMood[0] === "neutral" && "😐"}
                    {dominantMood[0] === "sad" && "😔"}
                    {dominantMood[0] === "very-sad" && "😢"}
                  </div>
                  <div>
                    <p className="text-2xl text-gray-800 dark:text-gray-100">
                      {moodLabels[dominantMood[0]]}
                    </p>
                    <p className="text-teal-600 dark:text-teal-400">
                      {dominantMood[1]} kali dicatat
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  Kamu paling sering merasa {moodLabels[dominantMood[0]].toLowerCase()} minggu ini.
                  Terus jaga kesehatan mentalmu! 💪
                </p>
              </Card>
            )}

            {/* Chart */}
            <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg">
              <h3 className="text-lg text-gray-800 dark:text-gray-100 mb-6">
                Grafik Mood Mingguan
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis
                    dataKey="mood"
                    tick={{ fill: darkMode ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: darkMode ? "#9ca3af" : "#6b7280" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                      border: "1px solid " + (darkMode ? "#475569" : "#e5e7eb"),
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Encouraging Message */}
            <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-slate-600">
              <p className="text-center text-gray-700 dark:text-gray-200 leading-relaxed">
                ✨ Setiap hari adalah kesempatan baru. Kamu melakukan yang terbaik, dan itu sudah cukup.
                Terus jalani perjalananmu dengan penuh kasih sayang pada dirimu sendiri.
              </p>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/mood-tracker")}
            className="flex-1 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white py-6 rounded-xl shadow-lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Catat Mood Baru
          </Button>

          <Button
            onClick={() => navigate("/history")}
            variant="outline"
            className="flex-1 border-2 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-6 rounded-xl"
          >
            <History className="w-5 h-5 mr-2" />
            Riwayat Curhat
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}