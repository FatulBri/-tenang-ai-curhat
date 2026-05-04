import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useApp } from "../context/AppContext";
import { MessageCircle, Sparkles, Search, Trash2, Bookmark, BookmarkCheck, Trash, Download } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";

export function HistoryPage() {
  const navigate = useNavigate();
  const { curhats, deleteCurhat, toggleBookmark, clearAllCurhats } = useApp();
  const [selectedCurhat, setSelectedCurhat] = useState<typeof curhats[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "bookmarked">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBurnDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    setTimeout(() => {
      deleteCurhat(id);
      setDeletingId(null);
    }, 800); // 800ms for burn animation
  };

  const exportHistory = () => {
    let content = "RIWAYAT CURHAT - TENANG AI\n";
    content += "========================================\n\n";
    curhats.forEach(c => {
      content += `Tanggal: ${c.timestamp.toLocaleString('id-ID')}\n`;
      content += `Mood: ${c.mood} | Kategori: ${c.category || "Umum"}\n\n`;
      c.messages.forEach(m => {
        content += `${m.role === "user" ? "Anda" : "AI"}: ${m.content}\n\n`;
      });
      content += "----------------------------------------\n\n";
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Riwayat_Curhat_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCurhats = curhats
    .filter(c => filter === "all" || c.bookmarked)
    .filter(c => 
      c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400 mb-2">
            Riwayat Curhat
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Lihat kembali perjalanan emosionalmu
          </p>
        </motion.div>

        {curhats.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="Cari pesan atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200 dark:border-slate-700/50 rounded-2xl focus:ring-2 focus:ring-teal-500/30 focus:outline-none transition-all text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === "all" 
                    ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilter("bookmarked")}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === "bookmarked" 
                    ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Tersimpan
              </button>
            </div>

              {/* Export All */}
              <Button
                variant="outline"
                onClick={exportHistory}
                className="hidden md:flex border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-2xl"
              >
                <Download className="w-4 h-4 mr-2" /> Ekspor (TXT)
              </Button>

              {/* Clear All */}
              <Button
                variant="ghost"
                onClick={clearAllCurhats}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl"
              >
                <Trash className="w-4 h-4 mr-2" /> Hapus Semua
              </Button>
          </div>
        )}

        {curhats.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-14 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl text-center rounded-3xl border border-gray-100 dark:border-slate-700/50 shadow-xl">
              <MessageCircle className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Belum Ada Curhat</h3>
              <p className="text-gray-400 dark:text-gray-500 mb-8 max-w-sm mx-auto">
                Mulai berbagi perasaanmu dan dapatkan dukungan dari para asisten AI kami.
              </p>
              <Button
                onClick={() => navigate("/curhat")}
                className="bg-gradient-to-r from-teal-500 to-purple-600 text-white px-8 py-5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Mulai Curhat Sekarang
              </Button>
            </Card>
          </motion.div>
        ) : filteredCurhats.length === 0 ? (
          <div className="text-center py-20">
             <Search className="w-12 h-12 text-gray-200 dark:text-slate-700 mx-auto mb-3" />
             <p className="text-gray-500">Tidak menemukan yang kamu cari...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredCurhats.map((curhat) => (
                <motion.div
                  key={curhat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={deletingId === curhat.id ? { 
                    opacity: 0, 
                    scale: 0.8, 
                    filter: "sepia(1) hue-rotate(-50deg) saturate(5) brightness(0.6) blur(4px)",
                    y: -20
                  } : { opacity: 1, scale: 1, filter: "none", y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: deletingId === curhat.id ? 0.8 : 0.2 }}
                  className="relative"
                >
                  {/* Fire Particles Overlay */}
                  <AnimatePresence>
                    {deletingId === curhat.id && (
                      <motion.div 
                        initial={{ opacity: 0, bottom: 0 }}
                        animate={{ opacity: [0, 1, 0], bottom: "100%" }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 z-10 flex justify-center items-end pointer-events-none overflow-hidden rounded-3xl"
                      >
                         <div className="w-full h-full bg-gradient-to-t from-orange-600 via-red-500 to-transparent mix-blend-color-burn opacity-80" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Card
                    onClick={() => { if (!deletingId) setSelectedCurhat(curhat); }}
                    className={`group p-6 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-2xl transition-all cursor-pointer border border-gray-100 dark:border-slate-700/50 rounded-3xl overflow-hidden relative ${
                      deletingId === curhat.id ? "pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-4xl filter drop-shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {curhat.mood.split(" ")[0]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              {curhat.timestamp.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {curhat.category && (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800/50">
                                {curhat.category}
                              </span>
                            )}
                            {curhat.bookmarked && (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/50 flex items-center gap-1">
                                <BookmarkCheck className="w-2.5 h-2.5" /> Tersimpan
                              </span>
                            )}
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(curhat.id); }}
                              className={`p-2 rounded-full transition-colors ${curhat.bookmarked ? "text-purple-500 bg-purple-50 dark:bg-purple-900/30" : "text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10"}`}
                            >
                              {curhat.bookmarked ? <Bookmark className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={(e) => handleBurnDelete(curhat.id, e)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                              title="Hapus / Bakar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed line-clamp-2">
                          {curhat.messages[0]?.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Dialog for full curhat */}
        <Dialog open={!!selectedCurhat} onOpenChange={() => setSelectedCurhat(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800">
            <DialogHeader>
              <DialogTitle className="text-gray-800 dark:text-gray-100">Detail Curhat</DialogTitle>
            </DialogHeader>
            {selectedCurhat && (
              <div className="space-y-4">
                {/* Header Date & Mood */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-700">
                   <span className="text-3xl">{selectedCurhat.mood}</span>
                   <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                     {selectedCurhat.timestamp.toLocaleString('id-ID', {
                       day: 'numeric', month: 'long', year: 'numeric',
                       hour: '2-digit', minute: '2-digit'
                     })}
                   </p>
                </div>
                
                {selectedCurhat.messages.map((msg, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${msg.role === "user" ? "bg-teal-50 dark:bg-teal-900/30" : "bg-purple-50 dark:bg-purple-900/30"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {msg.role === "model" ? (
                        <>
                          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <p className="font-semibold text-purple-700 dark:text-purple-300">Respon AI</p>
                        </>
                      ) : (
                        <p className="font-semibold text-teal-700 dark:text-teal-300">Anda</p>
                      )}
                    </div>
                    <p className="text-gray-800 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}