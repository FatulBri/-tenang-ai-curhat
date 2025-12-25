import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useApp } from "../context/AppContext";
import { BarChart3 } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

const moods = [
  { emoji: "😊", label: "Sangat Bahagia", value: "very-happy", color: "from-yellow-400 to-orange-400" },
  { emoji: "🙂", label: "Bahagia", value: "happy", color: "from-green-400 to-teal-400" },
  { emoji: "😐", label: "Netral", value: "neutral", color: "from-gray-400 to-gray-500" },
  { emoji: "😔", label: "Sedih", value: "sad", color: "from-blue-400 to-indigo-400" },
  { emoji: "😢", label: "Sangat Sedih", value: "very-sad", color: "from-indigo-500 to-purple-500" },
];

export function MoodTrackerPage() {
  const navigate = useNavigate();
  const { addMood } = useApp();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const moodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      date: new Date(),
    };

    addMood(moodEntry);
    setSaved(true);

    setTimeout(() => {
      navigate("/mood-stats");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-6 py-8 flex-1">
        <Card className="p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl border-teal-100 dark:border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-gray-800 dark:text-gray-100 mb-2">
              Bagaimana Perasaanmu Hari Ini?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Pilih emoji yang paling menggambarkan perasaanmu saat ini
            </p>
          </div>

          {/* Mood Selector */}
          <div className="space-y-4 mb-8">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                className={`w-full p-6 rounded-2xl transition-all flex items-center gap-4 ${
                  selectedMood === mood.value
                    ? `bg-gradient-to-r ${mood.color} text-white shadow-2xl scale-105`
                    : "bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200"
                }`}
              >
                <span className="text-5xl">{mood.emoji}</span>
                <span className="text-xl">{mood.label}</span>
              </button>
            ))}
          </div>

          {saved ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-lg text-teal-600 dark:text-teal-400">
                Mood berhasil dicatat!
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSaveMood}
                disabled={!selectedMood}
                className="flex-1 bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white py-6 rounded-xl shadow-lg disabled:opacity-50"
              >
                Simpan Mood
              </Button>
              
              <Button
                onClick={() => navigate("/mood-stats")}
                variant="outline"
                className="flex-1 border-2 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-6 rounded-xl"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                Lihat Statistik
              </Button>
            </div>
          )}
        </Card>

        {/* Daily Mood Log Info */}
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl">
          <p className="text-sm text-teal-800 dark:text-teal-200 text-center">
            💡 Tip: Catat moodmu setiap hari untuk melihat pola emosionalmu
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
