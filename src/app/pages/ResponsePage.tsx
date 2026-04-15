import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, RefreshCw, Send, User, ChevronDown, Copy, Share2, FileDown, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useApp, ChatMessage } from "../context/AppContext";
import { generateAIResponse, mapAIMoodToKey } from "../utils/aiResponse";
import { useTypewriter } from "../utils/useTypewriter";
import { CrisisBanner } from "../components/CrisisBanner";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

function formatTime(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ── Single message bubble (typewriter only on latest AI msg) ─────────────────
interface BubbleProps {
  msg: ChatMessage;
  isLatestAI: boolean;
  animate: boolean;
}

function MessageBubble({ msg, isLatestAI, animate }: BubbleProps) {
  const { displayed, done } = useTypewriter(msg.content, isLatestAI && animate, 16);
  const text = isLatestAI && animate ? displayed : msg.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md mt-1 ${
          msg.role === "user"
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25"
            : "bg-gradient-to-br from-teal-400 to-purple-500 shadow-teal-500/25"
        }`}>
          {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            msg.role === "user"
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700/50 rounded-tl-sm"
          }`}>
            {text}
            {/* blinking cursor while typing */}
            {isLatestAI && animate && !done && (
              <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 align-middle animate-pulse" />
            )}
          </div>
          {msg.timestamp && (
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 px-1 select-none">
              {formatTime(msg.timestamp)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
export function ResponsePage() {
  const navigate = useNavigate();
  const { currentCurhat, updateCurhatMessages, addMood, aiName } = useApp();
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // Track which is the "animatable" last AI message index
  const [animateIndex, setAnimateIndex] = useState<number>(-1);
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!currentCurhat) navigate("/curhat");
  }, [currentCurhat, navigate]);

  // Set the last AI message to animate on mount (the first AI reply)
  useEffect(() => {
    if (!currentCurhat) return;
    const lastAI = [...currentCurhat.messages].map((m, i) => ({ m, i })).filter(({ m }) => m.role === "model").pop();
    if (lastAI) setAnimateIndex(lastAI.i);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentCurhat?.messages, isSubmitting, scrollToBottom]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const autoResizeReply = useCallback(() => {
    const el = replyTextareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 160) + "px"; }
  }, []);

  useEffect(() => { autoResizeReply(); }, [replyMessage, autoResizeReply]);

  if (!currentCurhat) return null;

  const messageCount = currentCurhat.messages.length;
  const userMsgCount = currentCurhat.messages.filter(m => m.role === "user").length;

  // Latest user message text (for crisis detection in reply box)
  const latestUserText = replyMessage;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || isSubmitting) return;

    const now = new Date().toISOString();
    const newMessages: ChatMessage[] = [
      ...currentCurhat.messages,
      { role: "user", content: replyMessage, timestamp: now }
    ];
    updateCurhatMessages(currentCurhat.id, newMessages);
    setReplyMessage("");
    setIsSubmitting(true);

    try {
      const aiResult = await generateAIResponse(newMessages, currentCurhat.persona || "psikolog");
      const aiMsg: ChatMessage = { role: "model", content: aiResult.aiResponse, timestamp: new Date().toISOString() };
      const full: ChatMessage[] = [...newMessages, aiMsg];
      updateCurhatMessages(currentCurhat.id, full);
      setAnimateIndex(full.length - 1); // animate the new AI message

      // Auto-add to Mood Tracker
      const moodKey = mapAIMoodToKey(aiResult.mood);
      addMood({
        id: Date.now().toString() + "_auto_reply",
        mood: moodKey,
        date: new Date()
      });

      toast.success("AI sudah membalas! 💬", {
        description: aiResult.aiResponse.slice(0, 80) + (aiResult.aiResponse.length > 80 ? "…" : ""),
        duration: 4000,
      });
    } catch {
      toast.error("Gagal mendapatkan balasan AI. Coba lagi.", { duration: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentCurhat) return;
    const allText = currentCurhat.messages
      .map(m => `${m.role === 'user' ? 'Anda' : 'AI'}: ${m.content}`)
      .join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopied(true);
    toast.success("Percakapan disalin! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    if (!currentCurhat) return;
    const allText = `TENANG AI - CATATAN CURHAT\n` +
      `Tanggal: ${currentCurhat.timestamp.toLocaleString('id-ID')}\n` +
      `Mood: ${currentCurhat.mood}\n` +
      `------------------------------------------\n\n` +
      currentCurhat.messages
        .map(m => `${m.role === 'user' ? 'ANDA' : 'AI'}:\n${m.content}`)
        .join("\n\n---\n\n");
    
    const blob = new Blob([allText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `curhat-tenang-${currentCurhat.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File .txt berhasil diunduh! 📄");
  };

  const shareChat = async () => {
    if (!currentCurhat) return;
    const lastAI = currentCurhat.messages.filter(m => m.role === 'model').pop();
    const shareText = `Curhat di Tenang AI: "${lastAI?.content.slice(0, 100)}..."`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tenang AI - Curhat Anonim',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) { console.log("Share failed", err); }
    } else {
      copyToClipboard();
      toast.info("Browser tidak mendukung share API. Teks telah disalin ke clipboard.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] transition-colors duration-500 flex flex-col relative z-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full relative z-10 flex flex-col gap-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 border border-gray-200/50 dark:border-slate-700/50 shadow-sm flex flex-wrap items-center justify-between gap-3"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <span className="text-2xl">{currentCurhat.mood.split(" ")[0]}</span>
              <span>Obrolan dengan {aiName}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50">
                {userMsgCount} pesan
              </span>
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
              {currentCurhat.timestamp.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              {" "}• Topik:{" "}
              <span className="text-purple-600 dark:text-purple-400 font-semibold">{currentCurhat.category}</span>
              {" "}• Persona:{" "}
              <span className="text-teal-600 dark:text-teal-400 font-semibold capitalize">{currentCurhat.persona}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/mood-tracker")} variant="outline" size="sm"
              className="text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl font-medium text-xs">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Lacak Mood
            </Button>
            <Button onClick={() => navigate("/curhat")} variant="outline" size="sm"
              className="text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl font-medium text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Topik Baru
            </Button>
          </div>

          {/* New Share Actions Row */}
          <div className="w-full flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-slate-700/50 mt-1">
             <Button onClick={copyToClipboard} variant="ghost" size="sm"
                className="text-gray-500 hover:text-teal-600 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                {copied ? <Check className="w-3 h-3 mr-1.5" /> : <Copy className="w-3 h-3 mr-1.5" />}
                {copied ? "Tersalin" : "Salin"}
             </Button>
             <Button onClick={downloadTxt} variant="ghost" size="sm"
                className="text-gray-500 hover:text-purple-600 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <FileDown className="w-3 h-3 mr-1.5" /> Unduh .txt
             </Button>
             <Button onClick={shareChat} variant="ghost" size="sm"
                className="text-gray-500 hover:text-blue-600 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                <Share2 className="w-3 h-3 mr-1.5" /> Bagikan
             </Button>
          </div>
        </motion.div>

        {/* Chat area */}
        <div className="relative flex-1">
          <Card
            ref={chatContainerRef}
            className="min-h-[48vh] max-h-[58vh] p-4 md:p-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-xl rounded-3xl border border-white/50 dark:border-white/5 overflow-y-auto flex flex-col gap-5"
            style={{ scrollbarWidth: "thin" }}
          >
            <AnimatePresence initial={false}>
              {currentCurhat.messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  msg={msg}
                  isLatestAI={msg.role === "model" && index === animateIndex}
                  animate={index === animateIndex}
                />
              ))}

              {isSubmitting && (
                <motion.div key="typing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex w-full justify-start">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="px-5 py-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-0" />
          </Card>

          {/* Scroll-to-bottom button */}
          <AnimatePresence>
            {showScrollBtn && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollToBottom()}
                className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg flex items-center justify-center hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-300 transition-all group"
              >
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-teal-500 transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Crisis Banner (monitors reply input) */}
        <CrisisBanner text={latestUserText} />

        {/* Reply Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <form onSubmit={handleReply} className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-purple-500 rounded-2xl blur opacity-15 group-focus-within:opacity-40 transition duration-500" />
            <div className="relative flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-lg">
              <textarea
                ref={replyTextareaRef}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Ketik balasan Anda… (Enter kirim, Shift+Enter baris baru)"
                rows={1}
                className="flex-1 resize-none bg-transparent border-0 focus:ring-0 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none overflow-hidden leading-relaxed"
                disabled={isSubmitting}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(e); }
                }}
              />
              <Button
                type="submit"
                disabled={!replyMessage.trim() || isSubmitting}
                className="h-11 px-6 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-xl shadow-md transition-all self-end shrink-0 disabled:opacity-40"
              >
                <Send className="w-4 h-4 mr-2" /> Kirim
              </Button>
            </div>
          </form>
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-2 font-medium">
            {messageCount} pesan dalam sesi ini • Shift+Enter untuk baris baru
          </p>
        </motion.div>
      </main>

      <Footer />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fafafc] to-white dark:hidden" />
        <div className="absolute inset-0 bg-[#030213] hidden dark:block" />
        <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-purple-400/20 dark:bg-purple-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] max-w-[450px] max-h-[450px] bg-sky-200/30 dark:bg-sky-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>
    </div>
  );
}