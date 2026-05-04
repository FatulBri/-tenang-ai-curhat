import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  Menu,
  X,
  Settings as SettingsIcon,
  Sun,
  Moon,
  MessageCircle,
  Flower,
  Trophy,
  Phone,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Curhat", path: "/curhat", icon: MessageCircle, color: "bg-teal-500" },
    { label: "Mood", path: "/mood-stats", icon: Heart, color: "bg-purple-500" },
    { label: "Taman", path: "/garden", icon: Flower, color: "bg-emerald-500" },
    { label: "Misi", path: "/self-care", icon: Trophy, color: "bg-indigo-500" },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full px-4 py-6 md:px-8 pointer-events-none">
      <div className="mx-auto max-w-6xl pointer-events-auto">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 group transition-transform active:scale-95"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-400 blur-md opacity-0 group-hover:opacity-40 transition-opacity" />
                  <Heart className="h-8 w-8 text-teal-500 fill-teal-500 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white uppercase hidden sm:block">
                  Tenang
                </span>
              </button>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${
                    isActive(item.path)
                      ? `${item.color} text-white shadow-lg shadow-black/5 scale-105`
                      : "text-gray-600 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label.toUpperCase()}
                </button>
              ))}

              <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-2" />

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-slate-800 transition-all active:rotate-45"
              >
                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={() => navigate("/settings")}
                className={`p-2 rounded-xl transition-all ${isActive("/settings") ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "text-gray-500 hover:bg-white dark:hover:bg-slate-800"}`}
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </nav>

            {/* Mobile Button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-white/50 dark:border-white/5 bg-white/30 dark:bg-slate-900/30"
              >
                <div className="grid grid-cols-2 gap-2 p-4">
                  {[...navItems, 
                    { label: "Bantuan", path: "/hotline", icon: Phone, color: "bg-red-500" },
                    { label: "Setelan", path: "/settings", icon: SettingsIcon, color: "bg-slate-700" }
                  ].map((item) => (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl gap-2 transition-all ${
                        isActive(item.path) 
                          ? `${item.color} text-white shadow-lg` 
                          : "bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => { toggleDarkMode(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-200"
                  >
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{darkMode ? "Mode Terang" : "Mode Gelap"}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
