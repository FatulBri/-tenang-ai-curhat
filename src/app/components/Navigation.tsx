import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Heart,
  MessageCircle,
  History,
  Phone,
  Moon,
  Sun,
  ChevronDown,
  BarChart3,
  Settings as SettingsIcon,
  ExternalLink,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode, curhats, moods, apiKey, setApiKey } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const menuItems = {
    curhat: {
      label: "Curhat",
      icon: MessageCircle,
      items: [
        { label: "Mulai Curhat", path: "/curhat", icon: MessageCircle },
        { label: "Riwayat Curhat", path: "/history", icon: History, badge: curhats.length },
      ]
    },
    mood: {
      label: "Mood",
      icon: Heart,
      items: [
        { label: "Catat Mood", path: "/mood-tracker", icon: Heart },
        { label: "Statistik Mood", path: "/mood-stats", icon: BarChart3, badge: moods.length },
      ]
    },
    bantuan: {
      label: "Bantuan",
      icon: Phone,
      items: [
        { label: "Hotline Darurat", path: "/hotline", icon: Phone },
      ]
    }
  };



  return (
    <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <Heart className="w-8 h-8 text-teal-500 fill-teal-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600 dark:from-teal-400 dark:to-purple-400">
              TENANG
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {/* Curhat Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
                <MessageCircle className="w-4 h-4" />
                <span>Curhat</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                {menuItems.curhat.items.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20"
                  >
                    <item.icon className="w-4 h-4 mr-2 text-teal-600 dark:text-teal-400" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-teal-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mood Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all">
                <Heart className="w-4 h-4" />
                <span>Mood</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                {menuItems.mood.items.map((item) => (
                  <DropdownMenuItem
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <item.icon className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bantuan Link */}
            <button
              onClick={() => navigate("/hotline")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive("/hotline")
                ? "bg-red-500 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
            >
              <Phone className="w-4 h-4" />
              <span>Bantuan Darurat</span>
            </button>

            <DropdownMenuSeparator className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

            {/* Settings Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon className={`w-5 h-5 ${apiKey ? "text-teal-600 dark:text-teal-400" : "text-gray-500"}`} />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-gray-100">Pengaturan API</DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400">
                    Masukkan API Key Google Gemini Anda untuk mengaktifkan fitur chat AI.
                    Key ini hanya disimpan di browser Anda (localStorage).
                    <br />
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center mt-2 group"
                    >
                      Dapatkan API Key Gratis
                      <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-gray-700 dark:text-gray-300">Gemini API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-600"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Biarkan kosong untuk menggunakan mode Demo (Response Terbatas/Mock).
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700 animate-in slide-in-from-top">
            <div className="space-y-2">
              {/* Curhat Section */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Curhat
                </div>
                {menuItems.curhat.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                      ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-teal-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mood Section */}
              <div className="space-y-1 pt-2">
                <div className="px-4 py-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Mood Tracker
                </div>
                {menuItems.mood.items.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(item.path)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Emergency Help */}
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    navigate("/hotline");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span className="flex-1 text-left">Bantuan Darurat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
