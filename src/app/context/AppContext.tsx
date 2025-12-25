import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Curhat {
  id: string;
  message: string;
  aiResponse: string;
  timestamp: Date;
  mood: string;
  category?: string;
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
  apiKey: string;
  setApiKey: (key: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [curhats, setCurhats] = useState<Curhat[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [currentCurhat, setCurrentCurhat] = useState<Curhat | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || import.meta.env.VITE_GEMINI_API_KEY || "");

  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

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

  const addMood = (mood: MoodEntry) => {
    setMoods(prev => [mood, ...prev]);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
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
        apiKey,
        setApiKey,
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
