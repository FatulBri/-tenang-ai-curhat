import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mic, Square, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useApp } from "../context/AppContext";
import { useSpeechRecognition } from "../utils/useVoice";
import { FaceEmotionDetector } from "../components/FaceEmotionDetector";
import { Emotion } from "../utils/useFaceEmotion";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { CrisisBanner } from "../components/CrisisBanner";
import { toast } from "sonner";
import { EmotionalAvatar } from "../components/EmotionalAvatar";

const ICEBREAKER_PROMPTS = [
  "Apa satu hal yang paling menguras energimu hari ini?",
  "Ceritakan satu hal kecil yang bikin kamu tersenyum hari ini.",
  "Kalau perasaanmu sekarang adalah sebuah cuaca, seperti apa cuacanya?",
  "Ada beban pikiran apa yang membuatmu sulit tenang akhir-akhir ini?",
  "Apa hal yang sangat ingin kamu katakan kepada seseorang, tapi tidak bisa?",
  "Ceritakan sebuah momen hari ini di mana kamu merasa 'cukup'."
];

export function CurhatPage() {
  const navigate = useNavigate();
  const { addCurhat, setCurrentCurhat, speechLang, faceDetectionEnabled, setThemeColor } = useApp();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persona, setPersona] = useState("psikolog");
  const [zenMode, setZenMode] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);

  // Adaptive Theming Effect
  useEffect(() => {
    if (!currentEmotion) return;
    
    const emotionColors: Record<string, string> = {
      happy: "#f59e0b",
      sad: "#3b82f6",
      angry: "#ef4444",
      surprised: "#ec4899",
      fearful: "#8b5cf6",
      disgusted: "#10b981",
      neutral: "#14b8a6",
    };

    if (emotionColors[currentEmotion]) {
      setThemeColor(emotionColors[currentEmotion]);
    }
  }, [currentEmotion, setThemeColor]);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Recognition via hook
  const {
    isListening,
    interimTranscript,
    audioLevels,
    isSupported: speechSupported,
    toggle: toggleListening,
  } = useSpeechRecognition({
    lang: speechLang,
    continuous: true,
    onResult: (transcript) => {
      setMessage(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + transcript);
    },
    onError: (err) => {
      if (err === "network") {
        toast.error("Koneksi Speech API terputus. Gunakan Chrome murni (non-Brave) dan matikan AdBlock.");
      } else {
        toast.error(`Speech Error: ${err}`);
      }
    },
  });

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 384) + "px";
    }
  }, []);

  useEffect(() => {
    autoResize();
  }, [message, autoResize]);

  // Load random icebreakers
  useEffect(() => {
    const shuffled = [...ICEBREAKER_PROMPTS].sort(() => 0.5 - Math.random());
    setIcebreakers(shuffled.slice(0, 3));
  }, []);

  const handleIcebreakerClick = (prompt: string) => {
    if (!message) {
      setMessage(prompt + " ");
    } else {
      setMessage(prev => prev + "\n\n" + prompt + " ");
    }
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const initialUserMsg = { role: "user" as const, content: message, timestamp: now };

      const newCurhat = {
        id: Date.now().toString(),
        messages: [initialUserMsg],
        timestamp: new Date(),
        mood: "💭 Menunggu",
        category: "—",
        persona,
      };

      addCurhat(newCurhat);
      setCurrentCurhat(newCurhat);
      navigate("/response");
    } catch (error) {
      console.error("Error submitting curhat:", error);
      toast.error("Gagal mengirim curhat. Periksa koneksi atau pastikan server punya GEMINI_API_KEY.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col relative z-0 ${
      zenMode
        ? "bg-[#0a0a0f]"
        : "bg-[#fafafc] dark:bg-[#030213]"
    }`}>
      {!zenMode && <Navigation />}

      {/* Floating Face Detector + Avatar */}
      {faceDetectionEnabled && !zenMode && (
        <div className="absolute top-20 right-4 sm:right-6 z-20 flex flex-col items-center gap-3">
          <div className="w-24 sm:w-32 drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity">
            <FaceEmotionDetector 
              enabled={faceDetectionEnabled} 
              onEmotionChange={setCurrentEmotion} 
              compact={true} 
              className="aspect-[4/3] rounded-xl ring-1 ring-white/10 shadow-xl"
            />
          </div>
          <EmotionalAvatar emotion={currentEmotion} />
          <p className="text-[9px] text-gray-400 dark:text-gray-500 max-w-[100px] text-center leading-tight">
            Privasi Aman: Kamera hanya untuk baca ekspresi, tidak ada rekaman.
          </p>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 relative z-10 w-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" as any, stiffness: 100 }}
        >
          <Card className={`p-8 md:p-10 backdrop-blur-2xl shadow-2xl rounded-3xl relative overflow-hidden group ${
            zenMode
              ? "bg-[#111118]/90 border border-white/5"
              : "bg-white/70 dark:bg-slate-900/60 border border-white/50 dark:border-white/5"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-purple-50/50 dark:from-teal-900/10 dark:to-purple-900/10 pointer-events-none"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              {/* Title + Zen Toggle */}
              <div className="text-center mb-8 relative">
                <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${
                  zenMode
                    ? "text-white/90 font-serif"
                    : "bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400"
                }`}>
                  Ceritakan Perasaanmu
                </h1>
                <p className={zenMode ? "text-white/40" : "text-gray-600 dark:text-gray-400 font-medium"}>
                  Ruang aman untuk berdialog. Bebas, anonim, rahasia.
                </p>
                {/* Zen toggle */}
                <button
                  type="button"
                  onClick={() => setZenMode(z => !z)}
                  className={`absolute right-0 top-0 p-2 rounded-xl transition-all ${
                    zenMode
                      ? "text-white/40 hover:text-white/80 hover:bg-white/10"
                      : "text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  }`}
                  title={zenMode ? "Keluar Zen Mode" : "Aktifkan Zen Mode"}
                >
                  {zenMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  <span className="absolute -bottom-6 right-0 w-max text-[9px] bg-black/80 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {zenMode ? "Tampilan Biasa" : "Mode Fokus (Zen)"}
                  </span>
                </button>
              </div>

              {/* Persona Selector - Hidden in Zen Mode */}
              {!zenMode && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ingin curhat dengan siapa?
                </label>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-2">
                  Setiap karakter memberikan perspektif dan gaya bicara yang berbeda.
                </p>
                <Select value={persona} onValueChange={setPersona}>
                  <SelectTrigger className="w-full bg-white/50 dark:bg-slate-800/50 border-purple-200/50 dark:border-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl h-12 focus:ring-2 focus:ring-purple-500/50">
                    <SelectValue placeholder="Pilih karakter AI..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
                    <SelectItem value="psikolog">👩‍⚕️ Psikolog Profesional</SelectItem>
                    <SelectItem value="sahabat">👦 Sahabat Gaul</SelectItem>
                    <SelectItem value="orang_tua">👴 Orang Tua Bijak</SelectItem>
                    <SelectItem value="motivator">🔥 Motivator Enerjik</SelectItem>
                    <SelectItem value="guru">📚 Guru Bijaksana</SelectItem>
                    <SelectItem value="kakak">🤗 Kakak Pengertian</SelectItem>
                    <SelectItem value="filosof">🌙 Filosof Reflektif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}

              {/* Crisis Detection Banner */}
              <CrisisBanner text={message} />

              {/* Icebreaker Cards */}
              {!zenMode && message.length === 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Bingung mau mulai dari mana?</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {icebreakers.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleIcebreakerClick(prompt)}
                        className="text-left text-xs p-3 rounded-xl bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/30 text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Textarea */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="curhat-message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ceritamu...
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${isListening
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border-transparent"
                      : speechSupported
                        ? "bg-white/80 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                        : "bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-slate-700"
                      }`}
                    disabled={!speechSupported}
                  >
                    {isListening ? (
                      <><Square className="w-3.5 h-3.5 fill-current" /> Berhenti rekam</>
                    ) : (
                      <><Mic className="w-3.5 h-3.5" /> Rekam suara</>
                    )}
                  </motion.button>
                </div>
                
                <div className="relative group">
                  {/* Glowing border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-purple-500 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="releasing"
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -100, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeIn" }}
                        className="absolute inset-0 p-5 z-20 pointer-events-none"
                      >
                        <p className="text-gray-800 dark:text-gray-100 leading-relaxed opacity-50 whitespace-pre-wrap">
                          {message}
                        </p>
                      </motion.div>
                    ) : (
                      <textarea
                        id="curhat-message"
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tuliskan saja apa yang kamu rasakan... Tidak ada kata yang salah di sini."
                        className="relative w-full min-h-[180px] p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none transition-all z-10 leading-relaxed overflow-hidden"
                        disabled={isSubmitting}
                      />
                    )}
                  </AnimatePresence>
                  {/* Mic active overlay with waveform */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 border-2 border-red-500 rounded-2xl z-20 pointer-events-none"
                      >
                         {/* Audio waveform inside textarea */}
                         <div className="absolute left-4 bottom-4 flex items-end gap-[2px] h-6">
                           {audioLevels.slice(0, 16).map((level, i) => (
                             <motion.div
                               key={i}
                               className="w-1 rounded-full bg-red-400"
                               animate={{ height: Math.max(3, level * 24) }}
                               transition={{ duration: 0.05 }}
                             />
                           ))}
                         </div>
                         <div className="absolute right-4 bottom-4 flex items-center gap-2 text-red-500">
                           <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                           <span className="text-xs font-bold uppercase tracking-wider">Listening</span>
                         </div>
                         {/* Interim transcript preview */}
                         {interimTranscript && (
                           <div className="absolute left-4 top-3 right-4 z-30">
                             <p className="text-xs text-red-400/70 italic truncate">{interimTranscript}</p>
                           </div>
                         )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Depth of Expression Meter */}
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-gray-100 dark:bg-gray-800/50 rounded-full overflow-hidden z-20">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-teal-400 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (message.length / 500) * 100)}%` }}
                      transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    />
                  </div>
                </div>
              </div>

              {/* Character Count & Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                  {message.length} karakter dicatat
                </p>
                <Button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white px-8 py-6 rounded-xl font-semibold shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 group relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-3">
                      <div className="relative w-5 h-5">
                        <div className="absolute inset-0 bg-white rounded-full animate-breathe blur-sm opacity-50"></div>
                        <div className="absolute inset-1 bg-white rounded-full animate-pulse"></div>
                      </div>
                      Meresapi Ceritamu...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 relative z-10">
                      Utarakan Perasaan <Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Voice Mode Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 mx-auto self-center"
        >
          <button
            onClick={() => navigate("/voice-curhat")}
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-purple-500/10 to-teal-500/10 hover:from-purple-500/20 hover:to-teal-500/20 backdrop-blur-md rounded-2xl border border-purple-200/30 dark:border-purple-700/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.2)] group-hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-shadow">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Mode Suara 🎙️
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">
                Curhat langsung lewat suara — Hands-free
              </p>
            </div>
          </button>
        </motion.div>

        {/* Info Box */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 mx-auto self-center"
        >
          <div className="inline-flex items-center justify-center px-6 py-3 bg-teal-500/10 dark:bg-teal-500/20 backdrop-blur-md rounded-full border border-teal-200/50 dark:border-teal-700/50">
             <span className="text-xs font-medium text-teal-800 dark:text-teal-300 text-center flex gap-2 items-center">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              AI secara otomatis mendeteksi Topik dan Emosi Anda (NLP).
            </span>
          </div>
        </motion.div>
      </main>

      {!zenMode && <Footer />}

      {/* Decorative blobs */}
      {!zenMode && (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
         {/* Light mode base */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#fafafc] to-white dark:hidden"></div>
         {/* Dark mode base */}
         <div className="absolute inset-0 bg-[#030213] hidden dark:block"></div>

        {/* Glowing Orbs */}
        <div 
          className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob"
          style={{ backgroundColor: `var(--accent-color)` + '33' }} // 33 is ~20% opacity
        ></div>
        <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-purple-400/20 dark:bg-purple-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-3000"></div>
      </div>
      )}
    </div>
  );
}
