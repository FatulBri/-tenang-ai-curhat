import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, ArrowLeft, Volume2, VolumeX, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useApp, ChatMessage } from "../context/AppContext";
import { generateAIResponse, mapAIMoodToKey } from "../utils/aiResponse";
import { useSpeechRecognition, useTextToSpeech } from "../utils/useVoice";
import { FaceEmotionDetector } from "../components/FaceEmotionDetector";
import { Emotion } from "../utils/useFaceEmotion";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

export function VoiceCurhatPage() {
  const navigate = useNavigate();
  const {
    addCurhat,
    setCurrentCurhat,
    addMood,
    ttsSpeed,
    ttsVoice,
    speechLang,
    faceDetectionEnabled,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [persona, setPersona] = useState("psikolog");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [latestAIResponse, setLatestAIResponse] = useState("");
  const [showSetup, setShowSetup] = useState(true);
  const [muted, setMuted] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleTranscriptResult = useCallback((transcript: string) => {
    setCurrentTranscript(prev => prev + (prev ? " " : "") + transcript);
  }, []);

  const {
    interimTranscript,
    audioLevels,
    isSupported: speechSupported,
    start: startListening,
    stop: stopListening,
  } = useSpeechRecognition({
    lang: speechLang,
    continuous: true,
    onResult: handleTranscriptResult,
    onError: (err) => {
      toast.error(`Speech Error: ${err}`);
      setVoiceState("idle");
    },
  });

  const {
    speak,
    stop: stopTTS,
  } = useTextToSpeech({
    rate: ttsSpeed,
    voiceURI: ttsVoice,
    lang: speechLang,
    onEnd: () => {
      setVoiceState("idle");
    },
  });

  // Process the collected transcript — send to AI
  const processTranscript = useCallback(async () => {
    const fullText = currentTranscript.trim();
    if (!fullText) {
      setVoiceState("idle");
      return;
    }

    setVoiceState("processing");
    setCurrentTranscript("");

    const now = new Date().toISOString();
    const userMsg: ChatMessage = { role: "user", content: fullText, timestamp: now };
    const allMessages = [...messagesRef.current, userMsg];
    setMessages(allMessages);

    try {
      const aiResult = await generateAIResponse(
        allMessages.map(m => ({ role: m.role, content: m.content })),
        persona,
        currentEmotion
      );

      const aiMsg: ChatMessage = {
        role: "model",
        content: aiResult.aiResponse,
        timestamp: new Date().toISOString(),
      };
      const updatedMessages = [...allMessages, aiMsg];
      setMessages(updatedMessages);
      setLatestAIResponse(aiResult.aiResponse);

      // Auto mood tracking
      const moodKey = mapAIMoodToKey(aiResult.mood);
      addMood({
        id: Date.now().toString() + "_voice",
        mood: moodKey,
        date: new Date(),
      });

      // Speak the response
      if (!muted) {
        setVoiceState("speaking");
        speak(aiResult.aiResponse);
      } else {
        setVoiceState("idle");
      }
    } catch (error) {
      console.error("Voice AI Error:", error);
      toast.error("Gagal mendapatkan respon AI.");
      setVoiceState("idle");
    }
  }, [currentTranscript, persona, addMood, muted, speak]);

  // Handle main button tap
  const handleMainButton = useCallback(() => {
    switch (voiceState) {
      case "idle":
        setVoiceState("listening");
        setCurrentTranscript("");
        startListening();
        break;
      case "listening":
        stopListening();
        setVoiceState("processing");
        // Small delay to capture last transcript
        setTimeout(() => processTranscript(), 500);
        break;
      case "speaking":
        stopTTS();
        setVoiceState("idle");
        break;
      case "processing":
        // Don't interrupt processing
        break;
    }
  }, [voiceState, startListening, stopListening, processTranscript, stopTTS]);

  // Save conversation when leaving
  const saveConversation = useCallback(() => {
    if (messagesRef.current.length < 2) return;
    const newCurhat = {
      id: Date.now().toString(),
      messages: messagesRef.current,
      timestamp: new Date(),
      mood: "🗣️ Voice Chat",
      category: "Voice",
      persona,
    };
    addCurhat(newCurhat);
    setCurrentCurhat(newCurhat);
  }, [persona, addCurhat, setCurrentCurhat]);

  const resetConversation = () => {
    stopListening();
    stopTTS();
    setMessages([]);
    setCurrentTranscript("");
    setLatestAIResponse("");
    setVoiceState("idle");
    setShowSetup(true);
  };

  // Average audio level for orb animation
  const avgLevel = audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length;

  const stateLabels: Record<VoiceState, string> = {
    idle: "Ketuk untuk mulai bicara",
    listening: "Mendengarkan... Ketuk untuk kirim",
    processing: "AI sedang berpikir...",
    speaking: "AI sedang berbicara... Ketuk untuk stop",
  };

  const stateColors: Record<VoiceState, string> = {
    idle: "from-teal-400 to-purple-500",
    listening: "from-red-400 to-pink-500",
    processing: "from-amber-400 to-orange-500",
    speaking: "from-teal-400 to-cyan-400",
  };

  if (!speechSupported) {
    return (
      <div className="min-h-screen bg-[#030213] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <MicOff className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Browser Tidak Didukung</h2>
          <p className="text-gray-400">Fitur suara hanya tersedia di Chrome atau Edge.</p>
          <Button onClick={() => navigate("/curhat")} className="bg-teal-500 text-white rounded-xl">
            Kembali ke Mode Teks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030213] flex flex-col relative overflow-hidden">
      {/* Background animated gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#030213]" />
        <motion.div
          animate={{
            scale: voiceState === "listening" ? [1, 1.2, 1] : 1,
            opacity: voiceState === "idle" ? 0.15 : 0.3,
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-teal-600/30 rounded-full filter blur-[120px]"
        />
        <motion.div
          animate={{
            scale: voiceState === "speaking" ? [1, 1.3, 1] : 1,
            opacity: voiceState === "idle" ? 0.1 : 0.25,
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[20%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-purple-700/30 rounded-full filter blur-[120px]"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <button
          onClick={() => {
            saveConversation();
            navigate("/curhat");
          }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Kembali</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className={`p-2.5 rounded-xl transition-all ${muted ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/60 hover:text-white"}`}
            title={muted ? "Unmute TTS" : "Mute TTS"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={resetConversation}
            className="p-2.5 rounded-xl bg-white/10 text-white/60 hover:text-white transition-all"
            title="Reset Percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Face Emotion Detector (Top Right context) */}
      {faceDetectionEnabled && !showSetup && (
        <div className="absolute top-20 right-4 sm:right-6 z-20 w-32 sm:w-40 drop-shadow-xl">
          <FaceEmotionDetector 
            enabled={faceDetectionEnabled} 
            onEmotionChange={setCurrentEmotion} 
            compact={true} 
            className="aspect-[4/3] rounded-2xl ring-2 ring-white/10 shadow-2xl"
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 pb-32">
        {/* Setup Screen */}
        <AnimatePresence mode="wait">
          {showSetup ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm space-y-8 text-center"
            >
              <div>
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.3)]">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Mode Suara</h1>
                <p className="text-white/50 text-sm">Curhat langsung lewat suara. Hands-free.</p>
              </div>

              <div className="space-y-3 text-left">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/40">
                  Pilih Teman Bicara
                </label>
                <Select value={persona} onValueChange={setPersona}>
                  <SelectTrigger className="w-full bg-white/10 border-white/10 text-white rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-slate-800 border-slate-700">
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

              <Button
                onClick={() => setShowSetup(false)}
                className="w-full py-6 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(20,184,166,0.2)]"
              >
                🎙️ Mulai Mode Suara
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="voice"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-8 w-full max-w-lg"
            >
              {/* Transcript / AI Response display */}
              <div className="w-full min-h-[120px] max-h-[200px] overflow-y-auto text-center px-4">
                <AnimatePresence mode="wait">
                  {voiceState === "listening" && (currentTranscript || interimTranscript) ? (
                    <motion.div
                      key="transcript"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">Anda berkata:</p>
                      <p className="text-white/90 text-lg leading-relaxed">
                        {currentTranscript}
                        {interimTranscript && (
                          <span className="text-white/40 italic"> {interimTranscript}</span>
                        )}
                      </p>
                    </motion.div>
                  ) : voiceState === "speaking" || (voiceState === "idle" && latestAIResponse) ? (
                    <motion.div
                      key="response"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> AI berkata:
                      </p>
                      <p className="text-white/80 text-sm leading-relaxed">{latestAIResponse}</p>
                    </motion.div>
                  ) : voiceState === "processing" ? (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </motion.div>
                  ) : (
                    <motion.p
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-white/30 text-sm"
                    >
                      Tekan tombol di bawah untuk mulai bicara
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Audio Waveform Visualizer */}
              <AnimatePresence>
                {voiceState === "listening" && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    className="flex items-end justify-center gap-[3px] h-16 w-full max-w-xs"
                  >
                    {audioLevels.slice(0, 24).map((level, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 rounded-full bg-gradient-to-t from-teal-400 to-purple-400"
                        animate={{ height: Math.max(4, level * 64) }}
                        transition={{ duration: 0.05 }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Central Orb Button */}
              <div className="relative">
                {/* Outer pulse rings */}
                {(voiceState === "listening" || voiceState === "speaking") && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${stateColors[voiceState]}`}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.9, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                      className={`absolute inset-0 rounded-full bg-gradient-to-r ${stateColors[voiceState]}`}
                    />
                  </>
                )}

                <motion.button
                  onClick={handleMainButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: voiceState === "listening" ? [1, 1 + avgLevel * 0.15, 1] : 1,
                  }}
                  transition={{
                    scale: { duration: 0.15 },
                  }}
                  disabled={voiceState === "processing"}
                  className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br ${stateColors[voiceState]} flex items-center justify-center shadow-[0_0_80px_rgba(20,184,166,0.3)] transition-all disabled:opacity-60 disabled:cursor-wait`}
                >
                  <div className="absolute inset-1 rounded-full bg-[#030213]/30 backdrop-blur-sm" />
                  <div className="relative z-10">
                    {voiceState === "processing" ? (
                      <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : voiceState === "listening" ? (
                      <div className="w-8 h-8 rounded-md bg-white" />
                    ) : voiceState === "speaking" ? (
                      <Volume2 className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </div>
                </motion.button>
              </div>

              {/* State Label */}
              <motion.p
                key={voiceState}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/50 text-sm font-medium tracking-wide"
              >
                {stateLabels[voiceState]}
              </motion.p>

              {/* Message count */}
              {messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-xs text-white/30 font-medium">
                    {messages.filter(m => m.role === "user").length} pesan terkirim
                  </span>
                  <button
                    onClick={() => {
                      saveConversation();
                      navigate("/response");
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                  >
                    Lihat di Mode Teks →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom info */}
      <div className="relative z-10 pb-6 text-center">
        <p className="text-[10px] text-white/20 font-medium tracking-wider uppercase">
          Voice Powered by Web Speech API • {speechLang}
        </p>
      </div>
    </div>
  );
}
