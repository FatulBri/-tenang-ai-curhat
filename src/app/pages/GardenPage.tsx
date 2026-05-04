import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower, Send, Plus, Waves } from "lucide-react";
import { useApp, Bottle } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { toast } from "sonner";

export function GardenPage() {
  const { gratitudes, addGratitude, sendBottle, getNewBottle } = useApp();
  const [activeTab, setActiveTab] = useState<"garden" | "ocean">("garden");
  const [newGratitude, setNewGratitude] = useState("");
  const [newBottle, setNewBottle] = useState("");
  const [pickedBottle, setPickedBottle] = useState<Bottle | null>(null);
  const [isCasting, setIsCasting] = useState(false);

  const handleAddGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGratitude.trim()) return;
    addGratitude(newGratitude);
    setNewGratitude("");
    toast.success("Syukurmu telah bersemi. 🌸");
  };

  const handleSendBottle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBottle.trim()) return;
    setIsCasting(true);
    setTimeout(() => {
      sendBottle(newBottle);
      setNewBottle("");
      setIsCasting(false);
      toast.success("Pesanmu telah berlayar... 🍾");
    }, 2000);
  };

  const handlePickBottle = () => {
    const bottle = getNewBottle();
    setPickedBottle(bottle);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] flex flex-col relative overflow-hidden transition-colors duration-1000">
      <Navigation />

      {/* Immersive Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${activeTab === 'garden' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-teal-500/5 to-transparent dark:from-teal-900/10" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-500/5 dark:bg-emerald-900/10 blur-[120px] rounded-full" 
          />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ${activeTab === 'ocean' ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent dark:from-blue-900/10" />
          <motion.div 
            animate={{ y: [0, 50, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-full h-1/2 bg-blue-400/10 blur-[100px]" 
          />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter"
          >
            Ruang Tenang
          </motion.h1>
          <p className="text-gray-500 dark:text-teal-200/40 text-lg">Tempat di mana waktu melambat dan hati berbicara.</p>
        </div>

        {/* Cinematic Tab Switcher */}
        <div className="flex justify-center mb-16">
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl p-2 rounded-3xl flex gap-2 border border-white/50 dark:border-white/10 shadow-2xl">
            <button
              onClick={() => setActiveTab("garden")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-500 ${
                activeTab === "garden" 
                  ? "bg-teal-500 text-white shadow-xl shadow-teal-500/20 scale-105" 
                  : "text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
              }`}
            >
              <Flower className={`w-4 h-4 ${activeTab === 'garden' ? 'animate-bounce' : ''}`} /> Kebun Syukur
            </button>
            <button
              onClick={() => setActiveTab("ocean")}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all duration-500 ${
                activeTab === "ocean" 
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105" 
                  : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              <Waves className={`w-4 h-4 ${activeTab === 'ocean' ? 'animate-pulse' : ''}`} /> Samudera Pesan
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "garden" ? (
            <motion.div
              key="garden"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-16"
            >
              {/* Immersive Garden Visualization */}
              <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/5 rounded-[4rem] p-12 min-h-[450px] relative flex flex-wrap justify-center items-end gap-10 overflow-hidden shadow-2xl">
                {/* Grass texture/gradient base */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
                
                {gratitudes.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 dark:text-slate-700">
                    <Flower className="w-20 h-20 mb-6 opacity-20 animate-pulse" />
                    <p className="font-bold text-xl uppercase tracking-widest opacity-40">Tanam Benih Syukurmu</p>
                  </div>
                )}

                {gratitudes.map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ scale: 0, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: i * 0.05 }}
                    className="relative group"
                  >
                    <motion.div
                      animate={{ rotate: [-2, 2, -2] }}
                      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] cursor-help hover:scale-125 transition-transform duration-500"
                    >
                      {["🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🌿", "🍀"][i % 8]}
                    </motion.div>
                    
                    {/* Tooltip Card */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-48 p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 border border-white/50 dark:border-white/10 translate-y-2 group-hover:translate-y-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-white leading-relaxed">
                        "{g.content}"
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                        <span>Kenangan</span>
                        <span>{new Date(g.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Minimalist Input */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleAddGratitude} className="flex gap-3 bg-white/60 dark:bg-slate-900/60 p-2 rounded-[2.5rem] border border-white/50 dark:border-white/5 shadow-2xl">
                  <Input
                    value={newGratitude}
                    onChange={(e) => setNewGratitude(e.target.value)}
                    placeholder="Apa satu hal kecil yang membuatmu tersenyum hari ini?"
                    className="bg-transparent border-none rounded-[2rem] py-8 px-8 text-lg focus-visible:ring-0 placeholder:text-gray-400"
                  />
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white rounded-[2rem] h-16 w-16 flex-shrink-0 shadow-xl shadow-teal-500/20 transition-transform active:scale-90">
                    <Plus className="w-8 h-8" />
                  </Button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ocean"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-10"
            >
              {/* Cast a Bottle - Elegant Form */}
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-blue-100 dark:border-blue-900/20 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl">Kirim Harapan</h3>
                </div>
                <p className="text-gray-500 dark:text-blue-200/40 font-medium">Hanyutkan pesan positif untuk dibaca oleh seseorang di belahan dunia lain.</p>
                <form onSubmit={handleSendBottle} className="space-y-6">
                  <textarea
                    value={newBottle}
                    onChange={(e) => setNewBottle(e.target.value)}
                    placeholder="Tulis kata-kata penyemangat..."
                    className="w-full h-40 bg-blue-50/30 dark:bg-blue-900/10 border-none rounded-3xl p-6 text-sm focus:ring-4 focus:ring-blue-500/20 outline-none resize-none transition-all"
                  />
                  <Button 
                    disabled={isCasting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] py-8 font-black text-lg shadow-2xl shadow-blue-600/20 transition-all hover:-translate-y-1"
                  >
                    {isCasting ? "Menghanyutkan..." : "Lepas ke Laut 🍾"}
                  </Button>
                </form>
              </div>

              {/* Pick a Bottle - Cinematic interaction */}
              <div className="relative group perspective-1000">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-12 rounded-[3.5rem] text-white flex flex-col justify-center items-center text-center space-y-10 shadow-[0_30px_60px_rgba(37,99,235,0.3)] min-h-[500px] relative overflow-hidden">
                  {/* Animated Wave Background */}
                  <motion.div 
                    animate={{ y: [0, 20, 0], x: [-10, 10, -10] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute inset-0 opacity-20 pointer-events-none"
                  >
                    <Waves className="w-full h-full scale-150" />
                  </motion.div>

                  {!pickedBottle ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative z-10 space-y-8"
                    >
                      <motion.div 
                        animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto border border-white/30"
                      >
                        <span className="text-6xl">🍾</span>
                      </motion.div>
                      <div className="space-y-3">
                        <h3 className="text-3xl font-black">Botol Terdampar</h3>
                        <p className="text-blue-100/60 font-medium max-w-[200px] mx-auto">Seseorang telah mengirimkan energi positif untukmu.</p>
                      </div>
                      <Button 
                        onClick={handlePickBottle}
                        className="bg-white text-blue-600 hover:bg-blue-50 rounded-[2rem] px-12 py-7 font-black text-lg shadow-2xl transition-all hover:scale-105 active:scale-95"
                      >
                        Buka Pesan
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                      className="w-full space-y-8 relative z-10"
                    >
                      <div className="bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/30 shadow-2xl relative">
                        <div className="absolute -top-4 -left-4 text-4xl">✨</div>
                        <p className="text-2xl font-serif italic leading-relaxed text-blue-50">
                          "{pickedBottle.message}"
                        </p>
                      </div>
                      <div className="flex flex-col gap-4">
                        <Button 
                          onClick={handlePickBottle}
                          className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl py-6 font-black shadow-xl"
                        >
                          Cari Botol Lain
                        </Button>
                        <button 
                          onClick={() => setPickedBottle(null)}
                          className="text-blue-100/50 hover:text-white text-sm font-bold transition-colors"
                        >
                          Hanyutkan Kembali ke Laut
                        </button>
                      </div>
                    </motion.div>
                  )}
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

