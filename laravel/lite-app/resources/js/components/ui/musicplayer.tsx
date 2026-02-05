import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon, Repeat1Icon, VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon } from "lucide-react";
import * as React from "react";

type Track = {
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
};

type MusicPlayerProps = {
    visible?: boolean;
    onClose?: () => void;
};

export default function MusicPlayer({ visible = true }: MusicPlayerProps) {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const [track, setTrack] = React.useState<Track | null>(null);
    const [playing, setPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolume] = React.useState(1);
    const [previousVolume, setPreviousVolume] = React.useState(1);
    const [shuffle, setShuffle] = React.useState(false);
    const [repeatMode, setRepeatMode] = React.useState<"off" | "one" | "all">(
        "off"
    );

    React.useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.volume = volume;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoaded = () => setDuration(audio.duration || 0);
        const onEnded = () => {
            if (repeatMode === "one") {
                audio.currentTime = 0;
                audio.play();
            } else {
                setPlaying(false);
                // Logic de playlist ici (shuffle, repeat all, etc.) à implémenter selon les besoins
            }
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.pause();
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
            audioRef.current = null;
        };
    }, [repeatMode]);

    React.useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as Track | undefined;
            if (!detail) return;
            setTrack(detail);
            const audio = audioRef.current!;
            audio.src = detail.src;
            audio.currentTime = 0;
            audio
                .play()
                .then(() => setPlaying(true))
                .catch(() => setPlaying(false));
        };
        window.addEventListener("playTrack", handler as EventListener);
        return () =>
            window.removeEventListener("playTrack", handler as EventListener);
    }, []);

    React.useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    const togglePlay = React.useCallback(() => {
        const audio = audioRef.current!;
        if (!audio.src) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio
                .play()
                .then(() => setPlaying(true))
                .catch(() => setPlaying(false));
        }
    }, [playing]);

    const seek = (value: number) => {
        const audio = audioRef.current!;
        audio.currentTime = value;
        setCurrentTime(value);
    };

    const formatTime = (s: number) => {
        if (!isFinite(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60)
            .toString()
            .padStart(2, "0");
        return `${m}:${sec}`;
    };

    const toggleMute = () => {
        if (volume > 0) {
            setPreviousVolume(volume);
            setVolume(0);
        } else {
            setVolume(previousVolume > 0 ? previousVolume : 1);
        }
    };

    if (!visible) return null; // n'affiche rien si pas visible

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0b1220] text-white border-t border-white/10 px-8 py-4">
            <div className="flex items-center gap-8">
                {/* LEFT – Track info */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    {track?.artwork ? (
                        <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-white/10 rounded-lg flex-shrink-0" />
                    )}

                    <div className="overflow-hidden">
                        <div className="text-lg font-semibold truncate">
                            {track?.title || "No track"}
                        </div>
                        <div className="text-base text-white/60 truncate">
                            {track?.artist || "—"}
                        </div>
                    </div>
                </div>

                {/* CENTER – Controls + progress */}
                <div className="flex flex-col flex-1 items-center gap-2">
                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShuffle((v) => !v)}>
                            <ShuffleIcon
                                size={28}
                                className={shuffle ? "text-purple-400" : "text-white/70"}
                            />
                        </button>

                        <SkipBackIcon size={32} className="text-white/80" />

                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black"
                        >
                            {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
                        </button>

                        <SkipForwardIcon size={32} className="text-white/80" />

                        <button
                            onClick={() =>
                                setRepeatMode((m) =>
                                    m === "off" ? "all" : m === "all" ? "one" : "off"
                                )
                            }
                        >
                            {repeatMode === "one" ? (
                                <Repeat1Icon size={28} className="text-purple-400" />
                            ) : (
                                <RepeatIcon
                                    size={28}
                                    className={
                                        repeatMode === "all" ? "text-purple-400" : "text-white/70"
                                    }
                                />
                            )}
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 w-full">
                        <span className="text-sm text-white/50 w-10 text-right">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(Number(e.target.value))}
                            className="flex-1 h-1.5 accent-purple-500"
                        />
                        <span className="text-sm text-white/50 w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* RIGHT – Volume */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <button onClick={toggleMute} className="cursor-pointer">
                        {volume === 0 ? (
                            <VolumeXIcon size={28} className="text-white/70" />
                        ) : volume < 0.33 ? (
                            <VolumeIcon size={28} className="text-white/70" />
                        ) : volume < 0.66 ? (
                            <Volume1Icon size={28} className="text-white/70" />
                        ) : (
                            <Volume2Icon size={28} className="text-white/70" />
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        aria-label="Volume"
                        className="w-40 accent-purple-500"
                    />
                </div>
            </div>
        </div>
    );
}
