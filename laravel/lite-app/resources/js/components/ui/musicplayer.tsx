import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon, Repeat1Icon, VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon, MusicIcon, ChevronDownIcon, LoaderIcon, AlertCircleIcon, XIcon, ListMusic } from 'lucide-react';
import MusicWaitingList from '@/components/ui/music-waiting-list';
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
    const { track, playing, currentTime, duration, volume, shuffle, repeatMode, minimized, error, isLoading, togglePlay, seek, setVolume, toggleMute, toggleShuffle, cycleRepeatMode, skipForward, skipBack, toggleMinimized, clearError, waitingList, showWaitingList } = useMusicPlayer();

    // État minimisé : afficher un bouton flottant avec l'icône de musique
    if (minimized) {
        return (
            <button
                onClick={toggleMinimized}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
                aria-label="Ouvrir le lecteur"
            >
                <MusicIcon size={28} />
                {playing && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
                {error && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
                {isLoading && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                )}
            </button>
        );
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 pointer-events-none">
            {showWaitingList && (
                <div className="pointer-events-auto absolute right-0 bottom-full">
                    <MusicWaitingList />
                </div>
            )}

            <div className="pointer-events-auto bg-neutral-100 dark:bg-[#0b1220] text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-white/10 px-8 py-4">
            {/* Bouton minimiser */}
            <button
                onClick={toggleMinimized}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors"
                aria-label="Minimiser le lecteur"
            >
                <ChevronDownIcon size={20} className="text-neutral-500 dark:text-white/60" />
            </button>

            <div className="flex items-center gap-8">
                {/* Info de la piste */}
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
                            {track?.artistid ? (
                                <a href={`/artiste/${track.artistid}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {track?.artist || '—'}
                                </a>
                            ) : (
                                <span>{track?.artist || '—'}</span>
                            )}
                        </div>
                        {error && (
                            <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertCircleIcon size={14} />
                                <span className="truncate">{error}</span>
                                <button
                                    onClick={clearError}
                                    className="ml-1 hover:text-red-400"
                                    aria-label="Fermer l'erreur"
                                >
                                    <XIcon size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contrôles + progression */}
                <div className="flex flex-col flex-1 items-center gap-2">
                    {/* Contrôles */}
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
                            disabled={isLoading}
                            className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black disabled:opacity-50"
                        >
                            {isLoading ? (
                                <LoaderIcon size={28} className="animate-spin" />
                            ) : playing ? (
                                <PauseIcon size={28} />
                            ) : (
                                <PlayIcon size={28} />
                            )}
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

                    {/* Barre de progression */}
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

                {/* Volume */}
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
                    {/* File d'attente */}
                    <button onClick={waitingList}>
                        <ListMusic size={32} className="text-neutral-600 dark:text-white/80 cursor-pointer duration-200 transition-all" />
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}
