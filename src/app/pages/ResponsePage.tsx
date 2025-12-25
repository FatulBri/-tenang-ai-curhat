import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useApp } from "../context/AppContext";
import { useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function ResponsePage() {
  const navigate = useNavigate();
  const { currentCurhat } = useApp();

  useEffect(() => {
    if (!currentCurhat) {
      navigate("/curhat");
    }
  }, [currentCurhat, navigate]);

  if (!currentCurhat) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6 flex-1">
        {/* User Message */}
        <Card className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-teal-100 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-purple-400 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {currentCurhat.timestamp.toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                {currentCurhat.message}
              </p>
              <span className="inline-block mt-2 text-2xl">{currentCurhat.mood}</span>
            </div>
          </div>
        </Card>

        {/* AI Response */}
        <Card className="p-6 bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-900/30 dark:to-purple-900/30 backdrop-blur-sm shadow-lg border-teal-200 dark:border-slate-600">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-teal-700 dark:text-teal-300 mb-3">
                AI Response - TENANG
              </p>
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                {currentCurhat.aiResponse}
              </p>
            </div>
          </div>
        </Card>

        {/* Suggestion Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <Card className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer border-blue-100 dark:border-slate-700">
            <h3 className="text-lg text-gray-800 dark:text-gray-100 mb-2">🌬️ Latihan Pernapasan</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Tenangkan pikiranmu dengan teknik pernapasan 4-4-4
            </p>
            <div className="text-xs text-teal-600 dark:text-teal-400">
              Tarik napas (4 detik) → Tahan (4 detik) → Hembuskan (4 detik)
            </div>
          </Card>

          <Card className="p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer border-purple-100 dark:border-slate-700">
            <h3 className="text-lg text-gray-800 dark:text-gray-100 mb-2">💭 Tips Kesehatan Mental</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Jalan kaki, tidur cukup, dan tetap terhubung dengan orang-orang terkasih
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            onClick={() => navigate("/mood-tracker")}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-6 rounded-xl shadow-lg"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Lihat Mood Saya
          </Button>

          <Button
            onClick={() => navigate("/curhat")}
            variant="outline"
            className="flex-1 border-2 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 py-6 rounded-xl"
          >
            Curhat Lagi
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}