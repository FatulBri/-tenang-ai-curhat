import { useState, useRef, useEffect } from "react";
import { Music, Volume2, VolumeX, Play, Pause, CloudRain, Flame, Coffee, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";
import { cn } from "./ui/utils";

const SOUNDS = [
    {
        id: "rain",
        name: "Hujan Deras",
        icon: CloudRain,
        url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
        defaultVol: 0.5,
        color: "text-blue-400"
    },
    {
        id: "fire",
        name: "Api Unggun",
        icon: Flame,
        url: "https://actions.google.com/sounds/v1/household/crackling_fireplace.ogg",
        defaultVol: 0,
        color: "text-orange-400"
    },
    {
        id: "cafe",
        name: "Suasana Kafe",
        icon: Coffee,
        url: "https://actions.google.com/sounds/v1/crowds/restaurant_ambience.ogg",
        defaultVol: 0,
        color: "text-amber-600"
    },
    {
        id: "night",
        name: "Malam Hari",
        icon: Moon,
        url: "https://actions.google.com/sounds/v1/animals/crickets_in_field.ogg",
        defaultVol: 0,
        color: "text-indigo-400"
    }
];

const LS_KEY_AMBIENT = "tenang_ambient_volumes";
const LS_KEY_PLAYING = "tenang_ambient_playing";

export function AmbientPlayer() {
    const [isOpen, setIsOpen] = useState(false);
    
    // Global playing state
    const [isPlaying, setIsPlaying] = useState(() => localStorage.getItem(LS_KEY_PLAYING) === "true");

    // Volumes state
    const [volumes, setVolumes] = useState<Record<string, number>>(() => {
        const saved = localStorage.getItem(LS_KEY_AMBIENT);
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        const initial: Record<string, number> = {};
        SOUNDS.forEach(s => initial[s.id] = s.defaultVol);
        return initial;
    });

    // Refs for audio elements
    const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    // Save state to LS
    useEffect(() => {
        localStorage.setItem(LS_KEY_AMBIENT, JSON.stringify(volumes));
    }, [volumes]);

    useEffect(() => {
        localStorage.setItem(LS_KEY_PLAYING, isPlaying ? "true" : "false");
    }, [isPlaying]);

    // Handle Play/Pause
    useEffect(() => {
        Object.entries(audioRefs.current).forEach(([id, audio]) => {
            if (!audio) return;
            if (isPlaying && volumes[id] > 0) {
                audio.play().catch(() => {
                    // Browser might block autoplay
                    if (isPlaying) setIsPlaying(false);
                });
            } else {
                audio.pause();
            }
        });
    }, [isPlaying, volumes]);

    // Handle Volume Change
    useEffect(() => {
        Object.entries(audioRefs.current).forEach(([id, audio]) => {
            if (!audio) return;
            audio.volume = volumes[id];
            
            // Auto play/pause when sliding from/to 0
            if (isPlaying) {
                if (volumes[id] > 0 && audio.paused) audio.play().catch(()=>{});
                else if (volumes[id] === 0 && !audio.paused) audio.pause();
            }
        });
    }, [volumes, isPlaying]);

    const handleVolumeChange = (id: string, newVol: number) => {
        setVolumes(prev => ({ ...prev, [id]: newVol }));
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const activeSoundsCount = Object.values(volumes).filter(v => v > 0).length;

    return (
        <>
            {/* Hidden Audio Elements */}
            {SOUNDS.map(sound => (
                <audio
                    key={sound.id}
                    ref={el => { audioRefs.current[sound.id] = el; }}
                    src={sound.url}
                    loop
                    preload="auto"
                />
            ))}

            {/* Floating Control Button */}
            <div className="fixed bottom-6 left-6 z-50">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            className={cn(
                                "w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
                                isPlaying && activeSoundsCount > 0
                                    ? "bg-teal-600/90 hover:bg-teal-700 backdrop-blur-sm text-white border-2 border-teal-400/50"
                                    : "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
                            )}
                            size="icon"
                        >
                            {isPlaying && activeSoundsCount > 0 ? (
                                <Music className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Music className="w-5 h-5 opacity-50" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    
                    <PopoverContent className="w-80 p-5 mb-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl" side="top" align="start">
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div>
                                    <h4 className="font-bold text-base text-white flex items-center gap-2">
                                        <Music className="w-4 h-4 text-teal-400" />
                                        Soundscapes
                                    </h4>
                                    <p className="text-[10px] text-gray-400 mt-1">Mix suara alam untuk ketenangan</p>
                                </div>
                                <Button
                                    onClick={togglePlay}
                                    size="icon"
                                    className={cn(
                                        "rounded-full w-10 h-10 shadow-lg transition-colors",
                                        isPlaying ? "bg-teal-500 hover:bg-teal-600" : "bg-gray-700 hover:bg-gray-600"
                                    )}
                                >
                                    {isPlaying ? <Pause className="fill-current w-4 h-4" /> : <Play className="fill-current w-4 h-4 pl-0.5" />}
                                </Button>
                            </div>

                            {/* Mixers */}
                            <div className="space-y-4">
                                {SOUNDS.map(sound => {
                                    const Icon = sound.icon;
                                    const vol = volumes[sound.id] || 0;
                                    return (
                                        <div key={sound.id} className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Icon className={cn("w-4 h-4", vol > 0 ? sound.color : "text-gray-500")} />
                                                    <span className={vol > 0 ? "text-gray-200 font-medium" : "text-gray-500"}>
                                                        {sound.name}
                                                    </span>
                                                </div>
                                                <span className="text-gray-400 font-mono w-8 text-right">
                                                    {Math.round(vol * 100)}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleVolumeChange(sound.id, vol === 0 ? 0.5 : 0)}>
                                                    {vol === 0 ? (
                                                        <VolumeX className="w-4 h-4 text-gray-600" />
                                                    ) : (
                                                        <Volume2 className={cn("w-4 h-4", sound.color)} />
                                                    )}
                                                </button>
                                                <Slider
                                                    value={[vol]}
                                                    max={1}
                                                    step={0.01}
                                                    onValueChange={(val) => handleVolumeChange(sound.id, val[0])}
                                                    className="w-full cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    );
}
