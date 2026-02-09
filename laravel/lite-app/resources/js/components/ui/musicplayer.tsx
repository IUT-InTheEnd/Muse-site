import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon, Repeat1Icon, VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon, } from 'lucide-react';
import { useMusicPlayer } from '@/hooks/use-music-player';

function formatTime(s: number): string {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60)
        .toString()
        .padStart(2, '0');
    return `${m}:${sec}`;
}

export default function MusicPlayer() {
    const { track, playing, currentTime, duration, volume, shuffle, repeatMode, togglePlay, seek, setVolume, toggleMute, toggleShuffle, cycleRepeatMode, skipForward, skipBack, } = useMusicPlayer();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-100 dark:bg-[#0b1220] text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-white/10 px-8 py-4">
            <div className="flex items-center gap-8">
                {/* LEFT - Track info */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                    {track?.artwork ? (
                        <img
                            src={track.artwork}
                            alt={track.title}
                            className="w-20 h-20 rounded-lg object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-20 h-20 bg-neutral-200 dark:bg-white/10 rounded-lg shrink-0" />
                    )}

                    <div className="overflow-hidden">
                        <div className="text-lg font-semibold truncate">
                            {track?.title || 'No track'}
                        </div>
                        <div className="text-base text-neutral-500 dark:text-white/60 truncate">
                            {track?.artist || '—'}
                        </div>
                    </div>
                </div>

                {/* CENTER - Controls + progress */}
                <div className="flex flex-col flex-1 items-center gap-2">
                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <button onClick={toggleShuffle}>
                            <ShuffleIcon
                                size={28}
                                className={
                                    shuffle
                                        ? 'text-purple-500 dark:text-purple-400'
                                        : 'text-neutral-500 dark:text-white/70'
                                }
                            />
                        </button>

                        <button onClick={skipBack}>
                            <SkipBackIcon size={32} className="text-neutral-600 dark:text-white/80" />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black"
                        >
                            {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
                        </button>

                        <button onClick={skipForward}>
                            <SkipForwardIcon size={32} className="text-neutral-600 dark:text-white/80" />
                        </button>

                        <button onClick={cycleRepeatMode}>
                            {repeatMode === 'one' ? (
                                <Repeat1Icon size={28} className="text-purple-500 dark:text-purple-400" />
                            ) : (
                                <RepeatIcon
                                    size={28}
                                    className={
                                        repeatMode === 'all'
                                            ? 'text-purple-500 dark:text-purple-400'
                                            : 'text-neutral-500 dark:text-white/70'
                                    }
                                />
                            )}
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 w-full">
                        <span className="text-sm text-neutral-400 dark:text-white/50 w-10 text-right">
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
                        <span className="text-sm text-neutral-400 dark:text-white/50 w-10">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* RIGHT - Volume */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <button onClick={toggleMute} className="cursor-pointer">
                        {volume === 0 ? (
                            <VolumeXIcon size={28} className="text-neutral-500 dark:text-white/70" />
                        ) : volume < 0.33 ? (
                            <VolumeIcon size={28} className="text-neutral-500 dark:text-white/70" />
                        ) : volume < 0.66 ? (
                            <Volume1Icon size={28} className="text-neutral-500 dark:text-white/70" />
                        ) : (
                            <Volume2Icon size={28} className="text-neutral-500 dark:text-white/70" />
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
