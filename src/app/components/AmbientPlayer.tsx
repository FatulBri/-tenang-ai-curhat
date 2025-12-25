import { useState, useRef, useEffect } from "react";
import { Music, Volume2, VolumeX, Pause, Play, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./ui/popover";
import { cn } from "./ui/utils";

// Requested Video: https://www.youtube.com/watch?v=hoZEi4zina4
// Background Mode: Autoplay, Muted, Loop, No Controls
const VIDEO_ID = "hoZEi4zina4";

export function AmbientPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState([0.5]); // Default volume 50% (but starts muted)
    const playerRef = useRef<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    useEffect(() => {
        // Load YouTube IFrame API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const createPlayer = () => {
            const playerConfig = {
                height: '100%',
                width: '100%',
                videoId: VIDEO_ID,
                playerVars: {
                    'autoplay': 1,      // Auto-play
                    'controls': 0,      // No controls
                    'disablekb': 1,     // No keyboard
                    'fs': 0,            // No fullscreen button
                    'loop': 1,          // Loop
                    'modestbranding': 1,
                    'playsinline': 1,
                    'rel': 0,
                    'showinfo': 0,
                    'mute': 1,          // WAJIB: Muted (required for autoplay)
                    'playlist': VIDEO_ID, // Required for loop to work
                    'origin': window.location.origin,
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                }
            };
            playerRef.current = new (window as any).YT.Player('youtube-background', playerConfig);
        };

        if ((window as any).YT && (window as any).YT.Player) {
            createPlayer();
        } else {
            (window as any).onYouTubeIframeAPIReady = createPlayer;
        }

        // 5. CLEANUP: Destroy player on unmount
        return () => {
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
            }
        }
    }, []);

    // 2. SOLUSI AMAN: Jangan unmute di onReady
    const onPlayerReady = (event: any) => {
        setIsPlayerReady(true);
        event.target.mute(); // Ensure muted
        event.target.playVideo(); // Force play
    };

    // 4. FIX STATE: isPlaying set false valid
    const onPlayerStateChange = (event: any) => {
        // 1 = Playing
        if (event.data === 1) {
            setIsPlaying(true);
        }
        // 2 = Paused, 0 = Ended
        if (event.data === 2 || event.data === 0) {
            setIsPlaying(false);
            if (event.data === 0) {
                // Manual Loop fallback
                event.target.playVideo();
            }
        }
    };

    // 1. FIX VOLUME: Math.round integer 0-100
    useEffect(() => {
        if (playerRef.current && isPlayerReady && typeof playerRef.current.setVolume === 'function') {
            const vol = Math.round(volume[0] * 100);

            // Only update volume, don't force unmute here to allow safe autoplay
            playerRef.current.setVolume(vol);

            // If user explicitly drags slider > 0, we can try to unmute
            if (vol > 0 && isPlaying) {
                playerRef.current.unMute();
            } else if (vol === 0) {
                playerRef.current.mute();
            }
        }
    }, [volume, isPlayerReady, isPlaying]);

    // 3. FIX TOGGLE: Unlock audio context
    const togglePlay = () => {
        if (playerRef.current && isPlayerReady) {
            // UNLOCK Audio Context
            playerRef.current.unMute();
            playerRef.current.setVolume(Math.round(volume[0] * 100));

            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    return (
        <>
            {/* Background Video Layer */}
            <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay for Readability */}
                <div className="w-[300%] h-[300%] -ml-[100%] -mt-[100%]"> {/* Scale to cover */}
                    <div id="youtube-background" className="w-full h-full" />
                </div>
            </div>

            {/* Floating Control Button */}
            <div className="fixed bottom-6 left-6 z-50">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            className={cn(
                                "w-12 h-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
                                isPlaying
                                    ? "bg-red-600/90 hover:bg-red-700 backdrop-blur-sm text-white border-2 border-red-400/50"
                                    : "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20"
                            )}
                            size="icon"
                        >
                            {isPlaying ? (
                                <Music className="w-5 h-5 animate-pulse" />
                            ) : (
                                <Music className="w-5 h-5 opacity-50" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 mb-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl" side="top" align="start">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                <h4 className="font-semibold text-sm text-white flex items-center gap-2">
                                    <Music className="w-4 h-4 text-red-400" />
                                    Background Ambience
                                </h4>
                                {isPlaying && <span className="text-[10px] text-green-400 font-mono animate-pulse">LIVE</span>}
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={togglePlay}
                                    size="lg"
                                    className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20"
                                    disabled={!isPlayerReady}
                                >
                                    {isPlaying ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 pl-1" />}
                                </Button>
                            </div>

                            {/* Volume */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span>Volume</span>
                                    <span>{Math.round(volume[0] * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setVolume(volume[0] === 0 ? [0.5] : [0])}>
                                        {volume[0] === 0 ? <VolumeX className="w-4 h-4 text-gray-500" /> : <Volume2 className="w-4 h-4 text-red-400" />}
                                    </button>
                                    <Slider
                                        value={volume}
                                        max={1}
                                        step={0.01}
                                        onValueChange={setVolume}
                                        className="w-full cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 text-center mt-1">
                                    *Video mulai <strong>Mute</strong> (aturan browser). Naikkan volume atau klik Play untuk dengar.
                                </p>
                            </div>

                            <div className="pt-2 text-center">
                                <a
                                    href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] text-gray-500 hover:text-red-400 flex items-center justify-center gap-1"
                                >
                                    Buka di YouTube <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </>
    );
}
