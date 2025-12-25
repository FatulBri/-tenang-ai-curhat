import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useApp } from "../context/AppContext";
import { MessageCircle, Sparkles } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function HistoryPage() {
  const navigate = useNavigate();
  const { curhats } = useApp();
  const [selectedCurhat, setSelectedCurhat] = useState<typeof curhats[0] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-gray-800 dark:text-gray-100 mb-2">
            Riwayat Curhat
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Lihat kembali perjalanan emosionalmu
          </p>
        </div>

        {curhats.length === 0 ? (
          <Card className="p-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-700 dark:text-gray-200 mb-2">
              Belum Ada Curhat
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Mulai berbagi perasaanmu dan dapatkan dukungan dari AI
            </p>
            <Button
              onClick={() => navigate("/curhat")}
              className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white"
            >
              Mulai Curhat
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {curhats.map((curhat) => (
              <Card
                key={curhat.id}
                onClick={() => setSelectedCurhat(curhat)}
                className="p-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:shadow-2xl transition-all cursor-pointer border-teal-100 dark:border-slate-700"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{curhat.mood}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {curhat.timestamp.toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {curhat.category && (
                        <span className="ml-2 px-2 py-1 text-xs bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded-full">
                          {curhat.category}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-800 dark:text-gray-100 line-clamp-2">
                      {curhat.message}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog for full curhat */}
        <Dialog open={!!selectedCurhat} onOpenChange={() => setSelectedCurhat(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-100">Detail Curhat</DialogTitle>
            </DialogHeader>
            {selectedCurhat && (
              <div className="space-y-6">
                {/* User Message */}
                <div className="p-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {selectedCurhat.timestamp.toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-gray-800 dark:text-gray-100 leading-relaxed mb-2">
                    {selectedCurhat.message}
                  </p>
                  <span className="text-2xl">{selectedCurhat.mood}</span>
                </div>

                {/* AI Response */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-purple-700 dark:text-purple-300">AI Response</p>
                  </div>
                  <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
                    {selectedCurhat.aiResponse}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}