import { useState, useRef } from "react";
import { 
  Settings, 
  User, 
  Bot, 
  Key, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  ChevronRight,
  Check,
  AlertTriangle
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
    apiKey, setApiKey, 
    aiName, setAiName, 
    notificationsEnabled, setNotificationsEnabled,
    exportData, importData,
    clearAllCurhats
  } = useApp();

  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveApi = () => {
    setApiKey(tempApiKey);
    toast.success("Pengaturan API berhasil disimpan");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ok = await importData(file);
      if (ok) toast.success("Data berhasil dipulihkan!");
      else toast.error("Gagal mengimpor data. Format file salah.");
    }
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
                { label: "AI & API", icon: Key },
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

              {/* API Integration */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Google Gemini API</h3>
                  </div>
                  {apiKey && (
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> CONNECTED
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">API Key</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="password"
                        placeholder="AIza..."
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 rounded-xl flex-1"
                      />
                      <Button onClick={handleSaveApi} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl">Simpan</Button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                      Dapatkan key secara gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-teal-500 underline">Google AI Studio</a>.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Data Management */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Data & Privasi</h3>
                </div>
                
                <div className="space-y-6">
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
