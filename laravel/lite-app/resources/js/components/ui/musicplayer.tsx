import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, ShuffleIcon, RepeatIcon, Repeat1Icon, VolumeIcon, Volume1Icon, Volume2Icon, VolumeXIcon, MusicIcon, ChevronDownIcon, LoaderIcon, AlertCircleIcon, XIcon, ListMusic,Heart } from 'lucide-react';
import * as React from "react";
import { ReactionButtons } from '@/components/reaction-buttons';
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
    const { track, playing, currentTime, duration, volume, shuffle, repeatMode, minimized, error, isLoading, autoPlayNext, togglePlay, seek, setVolume, toggleMute, toggleShuffle, cycleRepeatMode, skipForward, skipBack, toggleMinimized, clearError, waitingList, showWaitingList, toggleAutoPlayNext, dispatch } = useMusicPlayer();

    const isFavorite = !!track?.is_favorite;
    const [isTogglingFavorite, setIsTogglingFavorite] = React.useState(false);


    const handleToggleFavorite = async () => {
        if (!track?.id && !track?.id) return;
        const trackId = track.id;
        
        setIsTogglingFavorite(true);
        try {
            const response = await fetch('/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ track_id: trackId }),
            });

            if (response.ok) {
                const data = await response.json();
                dispatch({ 
                    type: 'TOGGLE_FAVORITE', 
                    payload: { trackId, isFavorite: data.is_favorite } 
                });
            }
        } catch (err) {
            console.error('Erreur favoris:', err);
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    // État minimisé : afficher un bouton flottant avec l'icône de musique
    if (minimized) {
        return (
            <button
                type="button"
                onClick={toggleMinimized}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-purple-600"
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

            <div className="pointer-events-auto border-t border-border bg-background px-8 py-4 text-foreground">
            {/* Bouton minimiser */}
            <button
                type="button"
                onClick={toggleMinimized}
                className="absolute top-2 right-2 rounded-full p-1 transition-colors hover:bg-accent"
                aria-label="Minimiser le lecteur"
            >
                <ChevronDownIcon size={20} className="text-muted-foreground" />
            </button>

            <div className="flex items-center gap-8">
                {/* Info de la piste */}
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="flex items-center gap-5 min-w-0">
                        {track?.artwork ? (
                            <img
                                src={track.artwork}
                                alt={track.title}
                                className="w-20 h-20 rounded-lg object-cover shrink-0"
                            />
                        ) : (
                            <div className="h-20 w-20 shrink-0 rounded-lg bg-muted" />
                        )}

                        <div className="overflow-hidden">
                            <div className="text-lg font-semibold truncate">
                                {track?.title || 'No track'}
                            </div>
                            <div className="text-base text-muted-foreground truncate">
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
                        type="button"
                        aria-label="Fermer l'erreur"
                    >
                        <XIcon size={14} />
                    </button>
                                </div>
                            )}
                        </div>
                        {error && (
                            <div className="flex items-center gap-1 text-sm text-red-500 mt-1">
                                <AlertCircleIcon size={14} />
                                <span className="truncate">{error}</span>
                                <button
                                    type="button"
                                    onClick={clearError}
                                    className="ml-1 hover:text-red-400 cursor-pointer"
                                    aria-label="Fermer l'erreur"
                                >
                                    <XIcon size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {track?.id && (
                        <ReactionButtons
                            key={track.id}
                            resource="tracks"
                            resourceId={track.id}
                            initialReaction={track.reaction ?? null}
                            initialLikes={track.likes ?? 0}
                            initialDislikes={track.dislikes ?? 0}
                            size="default"
                            showCounts={false}
                            appearance="player"
                            className="shrink-0"
                        />
                    )}
                </div>

                {/* Contrôles + progression */}
                <div className="flex flex-col flex-1 items-center gap-2">
                    {/* Contrôles */}
                    <div className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={toggleShuffle}
                            aria-label={
                                shuffle
                                    ? 'Désactiver la lecture aléatoire'
                                    : 'Activer la lecture aléatoire'
                            }
                            aria-pressed={shuffle}
                        >
                            <ShuffleIcon
                                size={28}
                                className={
                                    shuffle
                                        ? 'text-purple-500 dark:text-purple-400'
                                        : 'text-muted-foreground'
                                }
                            />
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleToggleFavorite}
                            disabled={isTogglingFavorite || !track}
                            className="transition-transform active:scale-90"
                            aria-label={
                                track?.is_favorite
                                    ? 'Retirer ce titre des favoris'
                                    : 'Ajouter ce titre aux favoris'
                            }
                        >
    {isTogglingFavorite ? (
        <LoaderIcon size={24} className="animate-spin text-purple-500" />
    ) : (
        <Heart 
            size={24} 
            className={track?.is_favorite 
                ? 'fill-purple-500 text-purple-500' 
                : 'text-neutral-500 dark:text-white/70'
            } 
        />
    )}
                        </button>

                        <button
                            type="button"
                            onClick={skipBack}
                            aria-label="Lire le titre précédent"
                        >
                            <SkipBackIcon size={32} className="text-foreground" />
                        </button>

                        <button
                            type="button"
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="flex h-14 w-14 items-center justify-center rounded-full bg-inverse text-inverse-foreground disabled:opacity-50"
                            aria-label={
                                isLoading
                                    ? 'Chargement du titre'
                                    : playing
                                      ? 'Mettre la lecture en pause'
                                      : 'Lancer la lecture'
                            }
                        >
                            {isLoading ? (
                                <LoaderIcon size={28} className="animate-spin" />
                            ) : playing ? (
                                <PauseIcon size={28} />
                            ) : (
                                <PlayIcon size={28} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={skipForward}
                            aria-label="Lire le titre suivant"
                        >
                            <SkipForwardIcon size={32} className="text-foreground" />
                        </button>

                        <button
                            type="button"
                            onClick={cycleRepeatMode}
                            aria-label={
                                repeatMode === 'one'
                                    ? 'Passer à la répétition de toute la file'
                                    : repeatMode === 'all'
                                      ? 'Désactiver la répétition'
                                      : 'Répéter la file de lecture'
                            }
                        >
                            {repeatMode === 'one' ? (
                                <Repeat1Icon size={28} className="text-purple-500 dark:text-purple-400" />
                            ) : (
                                <RepeatIcon
                                    size={28}
                                    className={
                                        repeatMode === 'all'
                                            ? 'text-purple-500 dark:text-purple-400'
                                            : 'text-muted-foreground'
                                    }
                                />
                            )}
                        </button>
                    </div>

                    {/* Barre de progression */}
                    <div className="flex items-center gap-3 w-full">
                        <span className="w-10 text-right text-sm text-muted-foreground">
                            {formatTime(currentTime)}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={(e) => seek(Number(e.target.value))}
                            aria-label="Position de lecture"
                            className="flex-1 h-1.5 accent-purple-500"
                        />
                        <span className="w-10 text-sm text-muted-foreground">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                    <button
                        type="button"
                        onClick={toggleAutoPlayNext}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                            autoPlayNext
                                ? 'border-purple-500 text-purple-600'
                                : 'border-border text-muted-foreground'
                        }`}
                        aria-pressed={autoPlayNext}
                        title="Lecture automatique"
                    >
                        Lecture automatique : {autoPlayNext ? 'activée' : 'désactivée'}
                    </button>
                    <button
                        type="button"
                        onClick={toggleMute}
                        className="cursor-pointer"
                        aria-label={volume === 0 ? 'Réactiver le son' : 'Couper le son'}
                    >
                        {volume === 0 ? (
                            <VolumeXIcon size={28} className="text-muted-foreground" />
                        ) : volume < 0.33 ? (
                            <VolumeIcon size={28} className="text-muted-foreground" />
                        ) : volume < 0.66 ? (
                            <Volume1Icon size={28} className="text-muted-foreground" />
                        ) : (
                            <Volume2Icon size={28} className="text-muted-foreground" />
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
                    <button
                        type="button"
                        onClick={waitingList}
                        aria-label="Afficher la file d'attente"
                    >
                        <ListMusic size={32} className="cursor-pointer text-foreground duration-200 transition-all" />
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
}
