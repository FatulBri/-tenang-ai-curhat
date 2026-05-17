import { useState, useRef, useEffect } from "react";
import { 
  Settings, 
  User, 
  Bot, 
  Bell, 
  Cloud,
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  ChevronRight,
  AlertTriangle,
  Volume2,
  Lock,
  Ghost,
  Mic,
  Camera
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useApp } from "../context/AppContext";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function SettingsPage() {
  const { 
    aiName, setAiName, 
    exportData, importData,
    clearAllCurhats,
    autoTTS, setAutoTTS,
    ttsSpeed, setTtsSpeed,
    ttsVoice, setTtsVoice,
    speechLang, setSpeechLang,
    faceDetectionEnabled, setFaceDetectionEnabled,
    incognitoMode, setIncognitoMode,
    appPin, setAppPin,
  } = useApp();

  const [newPin, setNewPin] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load TTS voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ok = await importData(file);
      if (ok) toast.success("Data berhasil dipulihkan!");
      else toast.error("Gagal mengimpor data. Format file salah.");
    }
  };

  const handleSavePin = () => {
    if (newPin.length !== 4) {
      toast.error("PIN harus 4 digit angka.");
      return;
    }
    setAppPin(newPin);
    setNewPin("");
    toast.success("PIN berhasil dipasang. Aplikasi akan terkunci jika ditinggalkan.");
  };

  const handleRemovePin = () => {
    setAppPin(null);
    toast.success("PIN berhasil dihapus.");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#030213] transition-colors duration-500 flex flex-col relative z-0">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 relative z-10 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-teal-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pengaturan</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola privasi, asisten AI, dan data Anda</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar nav - visual only for now */}
            <div className="md:col-span-1 space-y-2">
              {[
                { label: "Personalization", icon: User, active: true },
                { label: "AI & server", icon: Cloud },
                { label: "Suara & TTS", icon: Volume2 },
                { label: "Data & Privacy", icon: ShieldCheck },
                { label: "Notifications", icon: Bell },
              ].map((item, i) => (
                <button
                  key={i}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    item.active 
                      ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {item.active && <ChevronRight className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Main Settings Body */}
            <div className="md:col-span-2 space-y-6">
              {/* Profile/Assistant */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Bot className="w-5 h-5 text-teal-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Asisten AI</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nama Panggilan AI</Label>
                    <Input 
                      value={aiName}
                      onChange={(e) => setAiName(e.target.value)}
                      className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </Card>

              {/* AI backend (no client key) */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Cloud className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Kunci AI (hanya di server)</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Kunci Google Gemini <strong className="font-semibold text-gray-800 dark:text-gray-200">tidak disimpan di browser</strong> dan tidak perlu Anda tempel di aplikasi. Pemilik deployment men-set variabel{" "}
                  <code className="text-xs bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">GEMINI_API_KEY</code> di Vercel (atau platform lain). Pengguna hanya memakai aplikasi; kunci tetap di server.
                </p>
                <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-2 list-disc pl-4 mb-4">
                  <li>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 underline font-medium">Google AI Studio</a>
                    {" "}— buat kunci untuk dipasang di environment server.
                  </li>
                  <li>
                    <a href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 underline font-medium">Environment variables (Vercel)</a>
                    {" "}— tempel sebagai <code className="text-[10px] bg-gray-100 dark:bg-slate-800 px-1 rounded">GEMINI_API_KEY</code>, lalu redeploy.
                  </li>
                </ul>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200/90 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Deploy statis tanpa backend (mis. hanya GitHub Pages tanpa API) tidak bisa memanggil Gemini lewat aplikasi ini kecuali Anda menambahkan proxy server terpisah.</span>
                </div>
              </Card>

              {/* Voice & TTS Settings */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Volume2 className="w-5 h-5 text-cyan-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Pengaturan Suara</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Auto TTS Toggle */}
                  <div className="flex items-center justify-between p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/10">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Auto Text-to-Speech</h4>
                      <p className="text-xs text-gray-500">Otomatis membacakan balasan AI.</p>
                    </div>
                    <button 
                      onClick={() => setAutoTTS(!autoTTS)}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        autoTTS ? "bg-teal-500" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        autoTTS ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* TTS Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Kecepatan Suara</Label>
                      <span className="text-xs font-bold text-teal-500">{ttsSpeed.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={ttsSpeed}
                      onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-full bg-gray-200 dark:bg-slate-700 accent-teal-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Lambat (0.5x)</span>
                      <span>Normal (1x)</span>
                      <span>Cepat (2x)</span>
                    </div>
                  </div>

                  {/* Voice Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Pilihan Suara TTS</Label>
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-teal-500/50 focus:outline-none"
                    >
                      <option value="">🔊 Auto (default browser)</option>
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500">
                      {availableVoices.length} suara tersedia di browser Anda.
                    </p>
                  </div>

                  {/* Speech Recognition Language */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-purple-500" />
                      <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Bahasa Speech Recognition</Label>
                    </div>
                    <select
                      value={speechLang}
                      onChange={(e) => setSpeechLang(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-purple-500/50 focus:outline-none"
                    >
                      <option value="id-ID">🇮🇩 Bahasa Indonesia</option>
                      <option value="en-US">🇺🇸 English (US)</option>
                      <option value="en-GB">🇬🇧 English (UK)</option>
                      <option value="ms-MY">🇲🇾 Bahasa Melayu</option>
                      <option value="jv-ID">Javanese</option>
                      <option value="su-ID">Sundanese</option>
                    </select>
                  </div>

                  {/* Face Emotion Recognition Toggle */}
                  <div className="flex items-start justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mt-4">
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera className="w-4 h-4 text-emerald-500" />
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Deteksi Emosi Wajah</h4>
                      </div>
                      <p className="text-xs text-gray-500">Membaca mikro-ekspresi wajah via kamera agar AI merespons lebih empatik. <br/><span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">100% Privat: Diproses lokal di browser.</span></p>
                    </div>
                    <button 
                      onClick={() => setFaceDetectionEnabled(!faceDetectionEnabled)}
                      className={`relative w-12 h-7 rounded-full transition-colors mt-1 shrink-0 ${
                        faceDetectionEnabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        faceDetectionEnabled ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* Test TTS */}
                  <Button
                    onClick={() => {
                      if (!('speechSynthesis' in window)) return;
                      window.speechSynthesis.cancel();
                      const utt = new SpeechSynthesisUtterance("Halo, ini suara Tenang AI. Saya siap mendengarkan ceritamu.");
                      utt.rate = ttsSpeed;
                      utt.lang = speechLang;
                      if (ttsVoice) {
                        const v = availableVoices.find(v => v.voiceURI === ttsVoice);
                        if (v) utt.voice = v;
                      }
                      window.speechSynthesis.speak(utt);
                    }}
                    className="w-full bg-gradient-to-r from-cyan-500/10 to-teal-500/10 hover:from-cyan-500/20 hover:to-teal-500/20 border border-cyan-200/50 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-300 rounded-2xl py-5 font-semibold flex gap-2 transition-all"
                    variant="outline"
                  >
                    <Volume2 className="w-5 h-5" /> Test Suara
                  </Button>
                </div>
              </Card>

              {/* Data Management */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Data & Privasi</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Incognito Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-500/5 rounded-2xl border border-slate-500/10">
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Ghost className="w-4 h-4 text-slate-500" />
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Mode Rahasia (Incognito)</h4>
                      </div>
                      <p className="text-xs text-gray-500">Percakapan tidak akan disimpan di LocalStorage dan langsung terhapus saat web dimuat ulang.</p>
                    </div>
                    <button 
                      onClick={() => setIncognitoMode(!incognitoMode)}
                      className={`relative w-12 h-7 rounded-full transition-colors mt-1 shrink-0 ${
                        incognitoMode ? "bg-slate-700" : "bg-gray-300 dark:bg-slate-600"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                        incognitoMode ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>

                  {/* App Lock PIN */}
                  <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-orange-500" />
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Kunci Aplikasi (PIN)</h4>
                    </div>
                    <p className="text-xs text-gray-500">Kunci layar aplikasi saat ditinggalkan (pindah tab/minimize) untuk mencegah orang lain membaca curhat Anda.</p>
                    
                    {appPin ? (
                      <div className="flex items-center justify-between bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-[0.5em]">••••</span>
                        <Button variant="ghost" size="sm" onClick={handleRemovePin} className="text-red-500 hover:bg-red-500/10 hover:text-red-600 h-8">
                          Hapus PIN
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input 
                          type="password"
                          maxLength={4}
                          placeholder="Buat 4 digit PIN..."
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                          className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-xl flex-1 text-center tracking-[0.5em] font-bold"
                        />
                        <Button onClick={handleSavePin} disabled={newPin.length !== 4} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">
                          Pasang
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Backup Data</h4>
                      <p className="text-xs text-gray-500">Unduh seluruh riwayat curhat Anda.</p>
                    </div>
                    <Button variant="outline" onClick={exportData} className="rounded-xl flex gap-2 border-teal-500/20 text-teal-600 hover:bg-teal-500 hover:text-white transition-all">
                      <Download className="w-4 h-4" /> Ekspor
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Pulihkan Data</h4>
                      <p className="text-xs text-gray-500">Unggah file backup (.json).</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-xl flex gap-2 border-blue-500/20 text-blue-600 hover:bg-blue-500 hover:text-white transition-all">
                      <Upload className="w-4 h-4" /> Impor
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                       <AlertTriangle className="w-4 h-4 text-red-500" />
                       <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight">Zone Bahaya</p>
                    </div>
                    <Button 
                      onClick={clearAllCurhats}
                      className="w-full bg-transparent border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl py-6 font-bold flex gap-2 transition-all"
                    >
                      <Trash2 className="w-5 h-5" /> Hapus Seluruh Riwayat
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-teal-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[30vw] h-[30vw] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
