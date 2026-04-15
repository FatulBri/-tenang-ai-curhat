import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
}

export interface Curhat {
  id: string;
  messages: ChatMessage[];
  timestamp: Date;
  mood: string;
  category?: string;
  persona?: string;
  bookmarked?: boolean;
}

export interface MoodEntry {
  id: string;
  mood: string;
  date: Date;
}

interface AppContextType {
  curhats: Curhat[];
  addCurhat: (curhat: Curhat) => void;
  moods: MoodEntry[];
  addMood: (mood: MoodEntry) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentCurhat: Curhat | null;
  setCurrentCurhat: (curhat: Curhat | null) => void;
  updateCurhatMessages: (id: string, newMessages: ChatMessage[]) => void;
  deleteCurhat: (id: string) => void;
  toggleBookmark: (id: string) => void;
  clearAllCurhats: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  aiName: string;
  setAiName: (name: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  streak: number;
  badges: Badge[];
  growthScore: number;
  isBlooming: boolean;
  exportData: () => void;
  importData: (file: File) => Promise<boolean>;
}

export interface Badge {
  id: string;
  title: string;
  emoji: string;
  description: string;
  unlocked: boolean;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [curhats, setCurhats] = useState<Curhat[]>(() => {
    const saved = localStorage.getItem("tenang_curhats");
    if (!saved) return [];
    try {
      // Re-hydrate Date objects
      const parsed = JSON.parse(saved);
      return parsed.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }));
    } catch { return []; }
  });

  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem("tenang_moods");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.map((m: any) => ({
        ...m,
        date: new Date(m.date)
      }));
    } catch { return []; }
  });

  const [darkMode, setDarkMode] = useState(false);
  const [currentCurhat, setCurrentCurhat] = useState<Curhat | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "");
  const [aiName, setAiName] = useState(() => localStorage.getItem("tenang_ai_name") || "Tenang AI");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem("tenang_notif") === "true");

  // Calculate streak (consecutive days with mood or curhat entries)
  const streak = (() => {
    const allDates = new Set<string>();
    curhats.forEach(c => allDates.add(new Date(c.timestamp).toDateString()));
    moods.forEach(m => allDates.add(new Date(m.date).toDateString()));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (allDates.has(d.toDateString())) {
        count++;
      } else {
        break;
      }
    }
    return count;
  })();

  // Calculate badges
  const badges: Badge[] = [
    { id: "first_curhat", title: "Langkah Pertama", emoji: "🌱", description: "Menulis curhat pertamamu", unlocked: curhats.length >= 1 },
    { id: "five_curhats", title: "Penulis Aktif", emoji: "✍️", description: "Menulis 5 curhat", unlocked: curhats.length >= 5 },
    { id: "ten_curhats", title: "Jiwa Terbuka", emoji: "💎", description: "Menulis 10 curhat", unlocked: curhats.length >= 10 },
    { id: "first_mood", title: "Pemantau Emosi", emoji: "🎯", description: "Pertama kali mencatat mood", unlocked: moods.length >= 1 },
    { id: "week_mood", title: "Konsisten 7 Hari", emoji: "📅", description: "Mencatat mood selama 7 hari", unlocked: moods.length >= 7 },
    { id: "streak_3", title: "On Fire!", emoji: "🔥", description: "Streak 3 hari berturut-turut", unlocked: streak >= 3 },
    { id: "streak_7", title: "Seminggu Penuh", emoji: "⭐", description: "Streak 7 hari berturut-turut", unlocked: streak >= 7 },
    { id: "streak_30", title: "Master Konsistensi", emoji: "👑", description: "Streak 30 hari berturut-turut", unlocked: streak >= 30 },
    { id: "bookmark_1", title: "Kolektor Hikmat", emoji: "📌", description: "Menyimpan curhat pertama", unlocked: curhats.some(c => c.bookmarked) },
  ];

  // Calculate Garden Growth
  const growthScore = curhats.length * 5 + moods.length * 2;
  
  // Calculate Blooming state (at least 2 positive moods in last 3 days)
  const isBlooming = (() => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentPositive = moods.filter(m => 
      new Date(m.date) >= threeDaysAgo && 
      ["happy", "very-happy"].includes(m.mood)
    );
    return recentPositive.length >= 2;
  })();

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem("tenang_curhats", JSON.stringify(curhats));
  }, [curhats]);

  useEffect(() => {
    localStorage.setItem("tenang_moods", JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("tenang_ai_name", aiName);
  }, [aiName]);

  useEffect(() => {
    localStorage.setItem("tenang_notif", notificationsEnabled ? "true" : "false");
  }, [notificationsEnabled]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addCurhat = (curhat: Curhat) => {
    setCurhats(prev => [curhat, ...prev]);
  };

  const updateCurhatMessages = (id: string, newMessages: ChatMessage[]) => {
    setCurhats(prev => prev.map(c => c.id === id ? { ...c, messages: newMessages } : c));
    if (currentCurhat?.id === id) {
      setCurrentCurhat(prev => prev ? { ...prev, messages: newMessages } : null);
    }
  };

  const addMood = (mood: MoodEntry) => {
    setMoods(prev => [mood, ...prev]);
  };

  const deleteCurhat = (id: string) => {
    setCurhats(prev => prev.filter(c => c.id !== id));
  };

  const toggleBookmark = (id: string) => {
    setCurhats(prev => prev.map(c => c.id === id ? { ...c, bookmarked: !c.bookmarked } : c));
  };

  const clearAllCurhats = () => {
    if (window.confirm("Hapus seluruh riwayat curhat? Tindakan ini tidak bisa dibatalkan.")) {
      setCurhats([]);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const exportData = () => {
    const data = {
      curhats,
      moods,
      settings: { aiName, darkMode, notificationsEnabled }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tenang_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.curhats) setCurhats(data.curhats.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })));
      if (data.moods) setMoods(data.moods.map((m: any) => ({ ...m, date: new Date(m.date) })));
      if (data.settings?.aiName) setAiName(data.settings.aiName);
      if (data.settings?.darkMode !== undefined) setDarkMode(data.settings.darkMode);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        curhats,
        addCurhat,
        moods,
        addMood,
        darkMode,
        toggleDarkMode,
        currentCurhat,
        setCurrentCurhat,
        updateCurhatMessages,
        deleteCurhat,
        toggleBookmark,
        clearAllCurhats,
        apiKey,
        setApiKey,
        aiName,
        setAiName,
        notificationsEnabled,
        setNotificationsEnabled,
        streak,
        badges,
        growthScore,
        isBlooming,
        exportData,
        importData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
