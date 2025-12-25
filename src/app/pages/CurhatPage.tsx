import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
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
import { generateAIResponse } from "../utils/aiResponse";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

export function CurhatPage() {
  const navigate = useNavigate();
  const { addCurhat, setCurrentCurhat } = useApp();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [selectedMood, setSelectedMood] = useState("😊");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions = [
    { emoji: "😊", label: "Bahagia", value: "happy" },
    { emoji: "😢", label: "Sedih", value: "sad" },
    { emoji: "😰", label: "Cemas", value: "anxious" },
    { emoji: "😡", label: "Marah", value: "angry" },
    { emoji: "😐", label: "Netral", value: "neutral" },
    { emoji: "😕", label: "Bingung", value: "confused" },
  ];
  /* Speech Recognition Logic */
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
      // AI Processing
      const aiResponseText = await generateAIResponse(message);

      const newCurhat = {
        id: Date.now().toString(),
        message,
        aiResponse: aiResponseText,
        timestamp: new Date(),
        mood: selectedMood,
        category,
      };

      addCurhat(newCurhat);
      setCurrentCurhat(newCurhat);

      // Navigate to AI Response page
      navigate("/response");
    } catch (error) {
      console.error("Error submitting curhat:", error);
      // Optional: Show toast error here if using sonner/toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 flex flex-col">
      <Navigation />

      <main className="max-w-3xl mx-auto px-6 py-8 flex-1">
        <Card className="p-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl border-teal-100 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl text-gray-800 dark:text-gray-100 mb-2">
                Ceritakan Perasaanmu
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Ruang aman untukmu berbagi, anonim dan rahasia
              </p>
            </div>

            {/* Mood Selector */}
            <div>
              <label className="block mb-3 text-gray-700 dark:text-gray-200">
                Bagaimana perasaanmu saat ini?
              </label>
              <div className="flex flex-wrap gap-3">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.emoji)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${selectedMood === mood.emoji
                      ? "bg-teal-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-sm">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector (Optional) */}
            <div>
              <label className="block mb-2 text-gray-700 dark:text-gray-200">
                Kategori (opsional)
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relationship">Hubungan</SelectItem>
                  <SelectItem value="work">Pekerjaan</SelectItem>
                  <SelectItem value="family">Keluarga</SelectItem>
                  <SelectItem value="health">Kesehatan</SelectItem>
                  <SelectItem value="personal">Pribadi</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message Textarea */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="curhat-message" className="block text-gray-700 dark:text-gray-200">
                  Tulis ceritamu di sini...
                </label>
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isListening
                    ? "bg-red-100 text-red-600 animate-pulse border border-red-200"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                >
                  {isListening ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Mendengarkan...
                    </>
                  ) : (
                    <>
                      🎤 Rekam Suara
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="curhat-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Apa yang ada di pikiranmu? Kamu aman di sini, semuanya anonim dan terjaga kerahasiaannya."
                className="w-full min-h-[200px] p-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 focus:outline-none resize-none transition-all"
                disabled={isSubmitting}
              />
            </div>

            {/* Character Count & Submit */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {message.length} karakter
              </p>
              <Button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="bg-gradient-to-r from-teal-500 to-purple-500 hover:from-teal-600 hover:to-purple-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Kirim Curhat
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl">
          <p className="text-sm text-teal-800 dark:text-teal-200 text-center">
            💙 Semua curhat bersifat anonim dan tidak disimpan secara permanen. Kamu bisa berbagi dengan bebas.
          </p>
        </div>
      </main>

      <Footer />

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>
    </div>
  );
}
