import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Mic, Square, Maximize2, Minimize2 } from "lucide-react";
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
import { generateAIResponse, mapAIMoodToKey } from "../utils/aiResponse";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { CrisisBanner } from "../components/CrisisBanner";

export function CurhatPage() {
  const navigate = useNavigate();
  const { addCurhat, setCurrentCurhat, addMood } = useApp();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persona, setPersona] = useState("psikolog");
  const [isListening, setIsListening] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Browser tidak mendukung fitur suara (Gunakan Chrome/Edge).");
        return;
      }
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const now = new Date().toISOString();
      const initialUserMsg = { role: "user" as const, content: message, timestamp: now };
      const aiResult = await generateAIResponse([initialUserMsg], persona);

      const newCurhat = {
        id: Date.now().toString(),
        messages: [
          initialUserMsg,
          { role: "model" as const, content: aiResult.aiResponse, timestamp: new Date().toISOString() }
        ],
        timestamp: new Date(),
        mood: aiResult.mood,
        category: aiResult.category,
        persona,
      };


      addCurhat(newCurhat);
      
      // Auto-add to Mood Tracker
      const moodKey = mapAIMoodToKey(aiResult.mood);
      addMood({
        id: Date.now().toString() + "_auto",
        mood: moodKey,
        date: new Date()
      });

      setCurrentCurhat(newCurhat);

      navigate("/response");
    } catch (error) {
      console.error("Error submitting curhat:", error);
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
                </button>
              </div>

              {/* Persona Selector - Hidden in Zen Mode */}
              {!zenMode && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Teman Bicara AI
                </label>
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
                    onClick={handleMicClick}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${isListening
                      ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] border-transparent"
                      : "bg-white/80 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
                      }`}
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
                  <textarea
                    id="curhat-message"
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Apa yang memberatkan langkahmu hari ini? Ceritakan pelan-pelan..."
                    className="relative w-full min-h-[180px] p-5 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none transition-all z-10 leading-relaxed overflow-hidden"
                    disabled={isSubmitting}
                  />
                  {/* Mic pulse effect layout */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 border-2 border-red-500 rounded-2xl z-20 pointer-events-none"
                      >
                         <div className="absolute right-4 bottom-4 flex items-center gap-2 text-red-500">
                           <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                           <span className="text-xs font-bold uppercase tracking-wider">Listening</span>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analisis AI Berjalan...
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

        {/* Info Box */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 mx-auto self-center"
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
        <div className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-teal-400/20 dark:bg-teal-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-purple-400/20 dark:bg-purple-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-3000"></div>
      </div>
      )}
    </div>
  );
}
