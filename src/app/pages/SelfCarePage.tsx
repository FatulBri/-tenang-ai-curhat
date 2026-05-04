import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Clock, Lock, LockOpen, CheckCircle2, Circle, Calendar, Star } from "lucide-react";
import { useApp, Quest, TimeCapsule } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export function SelfCarePage() {
  const { quests, completeQuest, capsules, createCapsule, openCapsule } = useApp();
  const [activeTab, setActiveTab] = useState<"quests" | "capsules">("quests");
  const [newCapsuleText, setNewCapsuleText] = useState("");
  const [capsuleDays, setCapsuleDays] = useState(30);

  const handleCompleteQuest = (quest: Quest) => {
    if (quest.completed) return;
    completeQuest(quest.id);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a855f7", "#ec4899"]
    });
    toast.success("Energi positif bertambah! ✨");
  };

  const handleCreateCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCapsuleText.trim()) return;
    createCapsule(newCapsuleText, capsuleDays);
    setNewCapsuleText("");
    toast.success(`Kenangan terkunci. Kembali lagi dalam ${capsuleDays} hari. ⏳`);
  };

  const isAvailable = (capsule: TimeCapsule) => {
    return new Date() >= new Date(capsule.openAt);
  };

  const handleOpenCapsule = (capsule: TimeCapsule) => {
    if (!isAvailable(capsule)) {
      toast.error("Waktunya belum tiba. Kapsul ini masih tersegel. 🔒");
      return;
    }
    openCapsule(capsule.id);
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: ["#818cf8", "#c084fc", "#ffffff"]
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] flex flex-col relative overflow-hidden transition-colors duration-700">
      <Navigation />

      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-500/10 dark:bg-purple-900/15 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/10 dark:bg-indigo-900/15 blur-[140px] rounded-full" 
        />
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 mb-6 shadow-sm"
          >
            <Trophy className="w-8 h-8 text-indigo-500" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
          >
            Evolusi Diri
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 dark:text-indigo-200/50 max-w-lg mx-auto text-lg"
          >
            Selesaikan misi harian dan simpan momen berharga untuk masa depanmu.
          </motion.p>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-1.5 rounded-[2rem] flex gap-1 border border-white/50 dark:border-white/5 shadow-2xl">
            <button
              onClick={() => setActiveTab("quests")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.6rem] text-sm font-bold transition-all duration-500 ${
                activeTab === "quests" 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl scale-105" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-indigo-300"
              }`}
            >
              <Trophy className={`w-4 h-4 ${activeTab === "quests" ? "animate-bounce" : ""}`} /> Misi Harian
            </button>
            <button
              onClick={() => setActiveTab("capsules")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.6rem] text-sm font-bold transition-all duration-500 ${
                activeTab === "capsules" 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl scale-105" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-indigo-300"
              }`}
            >
              <Clock className={`w-4 h-4 ${activeTab === "capsules" ? "animate-spin-slow" : ""}`} /> Kapsul Waktu
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "quests" ? (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid gap-6"
            >
              <div className="grid sm:grid-cols-3 gap-6">
                {quests.map((quest, i) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleCompleteQuest(quest)}
                    className={`group cursor-pointer p-8 rounded-[2.5rem] border backdrop-blur-3xl transition-all duration-500 relative overflow-hidden ${
                      quest.completed 
                        ? "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5" 
                        : "bg-white/60 dark:bg-slate-900/40 border-white/50 dark:border-white/10 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2"
                    }`}
                  >
                    {/* Background glow for cards */}
                    <div className={`absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${
                      quest.completed ? "from-emerald-400 to-teal-600" : "from-indigo-400 to-purple-600"
                    }`} />

                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        quest.completed 
                          ? "bg-emerald-500 text-white rotate-[360deg]" 
                          : "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 group-hover:scale-110"
                      }`}>
                        {quest.completed ? <CheckCircle2 className="w-8 h-8" /> : <Star className="w-8 h-8" />}
                      </div>
                      <div className="space-y-2">
                        <h3 className={`text-xl font-bold ${quest.completed ? "text-emerald-700 dark:text-emerald-400 line-through opacity-60" : "text-gray-800 dark:text-white"}`}>
                          {quest.text}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-indigo-200/40 font-medium tracking-wide uppercase">
                          {quest.completed ? "Misi Berhasil" : "Misi Aktif"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-center text-sm font-medium text-gray-400 dark:text-indigo-200/20 mt-12">
                Misi akan berganti secara otomatis saat matahari terbit. 🌅
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="capsules"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid md:grid-cols-12 gap-10"
            >
              {/* Form Side */}
              <div className="md:col-span-5">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/50 dark:border-white/5 shadow-2xl space-y-8 sticky top-32">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-black text-2xl text-gray-900 dark:text-white">Kapsul Waktu</h3>
                  </div>
                  
                  <form onSubmit={handleCreateCapsule} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2">Isi Pesan</label>
                      <textarea
                        value={newCapsuleText}
                        onChange={(e) => setNewCapsuleText(e.target.value)}
                        placeholder="Tulis pesan rahasia untuk dirimu di masa depan..."
                        className="w-full h-48 bg-gray-50/50 dark:bg-slate-800/50 border-none rounded-[2rem] p-6 text-sm focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-2">Durasi Penguncian</label>
                      <div className="flex gap-3">
                        {[30, 60, 90].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setCapsuleDays(d)}
                            className={`flex-1 py-4 rounded-2xl text-xs font-black border transition-all duration-500 ${
                              capsuleDays === d 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl scale-105" 
                                : "bg-white/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 text-gray-500 hover:border-indigo-400"
                            }`}
                          >
                            {d} Hari
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[2rem] py-8 font-black text-lg shadow-2xl shadow-indigo-500/20 group">
                      Kunci Kapsul <Lock className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    </Button>
                  </form>
                </div>
              </div>

              {/* List Side */}
              <div className="md:col-span-7 space-y-6">
                <div className="flex items-center justify-between px-4">
                  <h3 className="font-black text-gray-400 dark:text-indigo-200/30 uppercase tracking-widest text-xs">Arsip Kenangan</h3>
                  <span className="text-xs font-bold text-indigo-500">{capsules.length} Kapsul</span>
                </div>
                
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar pb-12">
                  {capsules.length === 0 && (
                    <div className="text-center py-32 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
                      <Clock className="w-16 h-16 mx-auto mb-6 text-gray-300 dark:text-slate-700 animate-pulse" />
                      <p className="text-gray-400 dark:text-indigo-200/20 font-bold">Kapsul waktumu masih kosong.</p>
                    </div>
                  )}
                  {capsules.map((capsule) => {
                    const available = isAvailable(capsule);
                    return (
                      <motion.div
                        key={capsule.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-8 rounded-[2.5rem] border transition-all duration-500 relative group overflow-hidden ${
                          capsule.isOpened 
                            ? "bg-white/80 dark:bg-slate-900/80 border-white/50 dark:border-white/5" 
                            : available
                              ? "bg-indigo-500/10 border-indigo-400 cursor-pointer shadow-2xl shadow-indigo-500/10"
                              : "bg-white/40 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800/50 opacity-80"
                        }`}
                        onClick={() => !capsule.isOpened && handleOpenCapsule(capsule)}
                      >
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            available || capsule.isOpened ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-400"
                          }`}>
                            {capsule.isOpened ? <LockOpen className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 dark:text-indigo-200/30 uppercase tracking-widest">Dibuat Pada</p>
                            <p className="text-xs font-bold text-gray-600 dark:text-indigo-300">
                              {new Date(capsule.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        
                        {capsule.isOpened ? (
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-lg text-gray-800 dark:text-gray-100 italic font-medium leading-relaxed relative z-10"
                          >
                            "{capsule.message}"
                          </motion.p>
                        ) : (
                          <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-end">
                              <p className={`text-sm font-black ${available ? "text-indigo-500 animate-pulse" : "text-gray-500"}`}>
                                {available ? "SIAP DIBUKA ✨" : "MASIH TERKUNCI"}
                              </p>
                              {!available && (
                                <p className="text-[10px] font-bold text-gray-400">
                                  Tersedia: {new Date(capsule.openAt).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                            {!available && (
                              <div className="w-full bg-gray-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: "65%" }} // Visual only
                                  className="bg-indigo-500 h-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

