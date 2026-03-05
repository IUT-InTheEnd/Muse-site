import * as React from 'react';
import { fetchTracks } from '../lib/track-api';

export type Track = {
    id?: number;
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
};

export type RepeatMode = 'off' | 'one' | 'all';

export type MusicPlayerState = {
    track: Track | null;
    playing: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    shuffle: boolean;
    repeatMode: RepeatMode;
    minimized: boolean;
    error: string | null;
    isLoading: boolean;
    // Playlist state
    playlist: Track[];
    currentIndex: number;
    hasListenBeenCounted: boolean;
};

export type MusicPlayerActions = {
    playTrack: (track: Track) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleShuffle: () => void;
    cycleRepeatMode: () => void;
    skipForward: () => void;
    skipBack: () => void;
    toggleMinimized: () => void;
    clearError: () => void;
    // Playlist actions
    setPlaylist: (tracks: Track[], startIndex?: number) => void;
    addToQueue: (track: Track) => void;
    addToQueueNext: (track: Track) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    playNext: () => void;
    playPrevious: () => void;
};

export type MusicPlayerContextType = MusicPlayerState & MusicPlayerActions;

const MusicPlayerContext = React.createContext<MusicPlayerContextType | null>(
    null,
);

const STORAGE_KEY = 'music-player-state';

type PersistedState = {
    volume: number;
    shuffle: boolean;
    repeatMode: RepeatMode;
    track: Track | null;
    minimized: boolean;
    playlist: Track[];
    currentIndex: number;
};

function loadPersistedState(): Partial<PersistedState> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignorer les erreurs de parsing
    }
    return {};
}

function savePersistedState(state: PersistedState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignorer les erreurs de stockage
    }
}

// Fonction pour appeler l'API add-listen
async function addListenToTrack(trackId: number): Promise<void> {
    try {
        const response = await fetch('/add-listen', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
            },
            body: JSON.stringify({
                track_id: trackId,
            }),
        });

        if (!response.ok) {
            console.error('Failed to add listen:', response.status);
        }
    } catch (error) {
        console.error('Error adding listen:', error);
    }
}

// Fonction utilitaire pour obtenir un index aléatoire différent du courant
function getRandomIndex(currentIndex: number, playlistLength: number): number {
    if (playlistLength <= 1) return 0;
    let newIndex: number;
    do {
        newIndex = Math.floor(Math.random() * playlistLength);
    } while (newIndex === currentIndex);
    return newIndex;
}

export function MusicPlayerProvider({
    children,
    userId,
}: {
    children: React.ReactNode;
    userId?: number;
}) {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const previousVolumeRef = React.useRef<number>(1);

    // Charger l'etat persiste au montage
    const persistedState = React.useMemo(() => loadPersistedState(), []);

    const [track, setTrack] = React.useState<Track | null>(
        persistedState.track ?? null,
    );
    const [playing, setPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [volume, setVolumeState] = React.useState(persistedState.volume ?? 1);
    const [shuffle, setShuffleState] = React.useState(
        persistedState.shuffle ?? false,
    );
    const [repeatMode, setRepeatModeState] = React.useState<RepeatMode>(
        persistedState.repeatMode ?? 'off',
    );
    const [minimized, setMinimized] = React.useState(
        persistedState.minimized ?? false,
    );
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    // Playlist state
    const [playlist, setPlaylistState] = React.useState<Track[]>(
        persistedState.playlist ?? [],
    );
    const [currentIndex, setCurrentIndex] = React.useState<number>(
        persistedState.currentIndex ?? -1,
    );
    const [hasListenBeenCounted, setHasListenBeenCounted] =
        React.useState(false);

    // Refs pour eviter les closures stales dans les event listeners
    const playlistRef = React.useRef(playlist);
    const currentIndexRef = React.useRef(currentIndex);
    const shuffleRef = React.useRef(shuffle);
    const repeatModeRef = React.useRef(repeatMode);
    const trackRef = React.useRef(track);
    const hasListenBeenCountedRef = React.useRef(hasListenBeenCounted);

    // Refs pour la gestion des recommandations
    const isFetchingRecommendationsRef = React.useRef(false);
    const lastRecoFetchIndexRef = React.useRef<number>(-1);

    // Mettre a jour les refs quand les valeurs changent
    React.useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);
    React.useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);
    React.useEffect(() => {
        shuffleRef.current = shuffle;
    }, [shuffle]);
    React.useEffect(() => {
        repeatModeRef.current = repeatMode;
    }, [repeatMode]);
    React.useEffect(() => {
        trackRef.current = track;
    }, [track]);
    React.useEffect(() => {
        hasListenBeenCountedRef.current = hasListenBeenCounted;
    }, [hasListenBeenCounted]);

    // Fonction pour jouer une piste de la playlist par index
    const playTrackAtIndex = React.useCallback((index: number) => {
        const currentPlaylist = playlistRef.current;
        if (index < 0 || index >= currentPlaylist.length) return;

        const newTrack = currentPlaylist[index];
        setTrack(newTrack);
        setCurrentIndex(index);
        setError(null);
        setHasListenBeenCounted(false);

        const audio = audioRef.current;
        if (!audio) return;

        audio.src = newTrack.src;
        audio.currentTime = 0;
        audio
            .play()
            .then(() => setPlaying(true))
            .catch((err) => {
                setPlaying(false);
                console.error('Error playing track at index:', err);
            });
    }, []);

    // Fonction pour passer a la piste suivante
    const goToNextTrack = React.useCallback(() => {
        const currentPlaylist = playlistRef.current;
        const currentIdx = currentIndexRef.current;
        const isShuffled = shuffleRef.current;
        const repeat = repeatModeRef.current;

        if (currentPlaylist.length === 0) return;

        let nextIndex: number;

        if (isShuffled) {
            nextIndex = getRandomIndex(currentIdx, currentPlaylist.length);
        } else {
            nextIndex = currentIdx + 1;
            if (nextIndex >= currentPlaylist.length) {
                if (repeat === 'all') {
                    nextIndex = 0;
                } else {
                    // Fin de la playlist, ne pas continuer
                    setPlaying(false);
                    return;
                }
            }
        }

        playTrackAtIndex(nextIndex);
    }, [playTrackAtIndex]);

    // Fonction pour revenir a la piste precedente
    const goToPreviousTrack = React.useCallback(() => {
        const currentPlaylist = playlistRef.current;
        const currentIdx = currentIndexRef.current;
        const isShuffled = shuffleRef.current;
        const repeat = repeatModeRef.current;

        if (currentPlaylist.length === 0) return;

        // Si on est au debut de la piste (< 3s), aller a la precedente
        // Sinon, redemarrer la piste actuelle
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        let prevIndex: number;

        if (isShuffled) {
            prevIndex = getRandomIndex(currentIdx, currentPlaylist.length);
        } else {
            prevIndex = currentIdx - 1;
            if (prevIndex < 0) {
                if (repeat === 'all') {
                    prevIndex = currentPlaylist.length - 1;
                } else {
                    // Debut de la playlist, redemarrer la piste actuelle
                    if (audio) audio.currentTime = 0;
                    return;
                }
            }
        }

        playTrackAtIndex(prevIndex);
    }, [playTrackAtIndex]);

    React.useEffect(() => {
        const remainingAfterCurrent = playlist.length - 1 - currentIndex;

        if (
            userId == null ||
            playlist.length === 0 ||
            currentIndex < 0 ||
            remainingAfterCurrent > 4 ||
            isFetchingRecommendationsRef.current ||
            lastRecoFetchIndexRef.current === currentIndex
        ) {
            return;
        }

        const run = () => {
            isFetchingRecommendationsRef.current = true;
            lastRecoFetchIndexRef.current = currentIndex;

            const currentTrackId = trackRef.current?.id;

            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') ?? '';

            const type = currentTrackId ? 'hybride' : 'user_based_p2';

            const params = new URLSearchParams({
                recommandation_type: type,
                n: '10',
            });

            if (currentTrackId) {
                params.set('track_id', String(currentTrackId));
            }

            fetch(`/recommendations?${params.toString()}`, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            })
                .then((r) => r.json())
                .then(async (data: { track_ids: number[] }) => {
                    const existingIds = new Set(
                        playlistRef.current.map((t) => t.id),
                    );

                    const newIds = (data.track_ids ?? [])
                        .filter((id) => !existingIds.has(id))
                        .slice(0, 4);

                    if (newIds.length === 0) return;

                    const newTracks = await fetchTracks(newIds);

                    if (newTracks.length) {
                        setPlaylistState((prev) => [...prev, ...newTracks]);
                    }
                })
                .finally(() => {
                    isFetchingRecommendationsRef.current = false;
                });
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(run, { timeout: 2000 });
        } else {
            setTimeout(run, 500);
        }
    }, [currentIndex, playlist.length, userId]);

    // Initialiser l'element audio une seule fois
    React.useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.volume = volume;

        // NOTE: On ne charge PAS automatiquement la piste persistee au montage
        // pour eviter les erreurs de proxy avant que la session soit etablie.
        // L'utilisateur devra cliquer sur play pour relancer la piste.

        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);

            // Verifier si on a atteint 50% de la piste et enregistrer l'ecoute
            if (
                audio.duration > 0 &&
                audio.currentTime >= audio.duration / 2 &&
                !hasListenBeenCountedRef.current
            ) {
                const currentTrack = trackRef.current;
                if (currentTrack?.id) {
                    setHasListenBeenCounted(true);
                    addListenToTrack(currentTrack.id);
                }
            }
        };

        const onLoaded = () => {
            setDuration(audio.duration || 0);
            setIsLoading(false);
            setError(null);
        };

        const onEnded = () => {
            const repeat = repeatModeRef.current;

            if (repeat === 'one') {
                audio.currentTime = 0;
                setHasListenBeenCounted(false);
                audio.play();
            } else {
                // Passer a la piste suivante selon le mode
                goToNextTrack();
            }
        };

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        const onError = () => {
            setIsLoading(false);
            setPlaying(false);
            // Verifier le type d'erreur
            const mediaError = audio.error;
            if (mediaError) {
                switch (mediaError.code) {
                    case MediaError.MEDIA_ERR_ABORTED:
                        setError('Lecture annulee');
                        break;
                    case MediaError.MEDIA_ERR_NETWORK:
                        setError('Erreur reseau lors du chargement');
                        break;
                    case MediaError.MEDIA_ERR_DECODE:
                        setError('Impossible de decoder le fichier audio');
                        break;
                    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                        setError('Format audio non supporte');
                        break;
                    default:
                        setError('Erreur de lecture audio');
                }
            } else {
                setError('Erreur de lecture audio');
            }
            console.error('Audio error:', mediaError);
        };
        const onLoadStart = () => {
            setIsLoading(true);
            setError(null);
        };

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);
        audio.addEventListener('loadstart', onLoadStart);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('error', onError);
            audio.removeEventListener('loadstart', onLoadStart);
            audioRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goToNextTrack]);

    // Synchroniser le volume avec l'element audio
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Persister les changements d'etat
    React.useEffect(() => {
        savePersistedState({
            volume,
            shuffle,
            repeatMode,
            track,
            minimized,
            playlist,
            currentIndex,
        });
    }, [volume, shuffle, repeatMode, track, minimized, playlist, currentIndex]);

    // Actions
    const playTrack = React.useCallback((newTrack: Track) => {
        setTrack(newTrack);
        setError(null);
        setHasListenBeenCounted(false);
        // Si on joue une piste individuelle, la mettre dans une playlist d'un element
        setPlaylistState([newTrack]);
        setCurrentIndex(0);

        const audio = audioRef.current;
        if (!audio) return;

        audio.src = newTrack.src;
        audio.currentTime = 0;
        audio
            .play()
            .then(() => setPlaying(true))
            .catch((err) => {
                setPlaying(false);
                console.error('Error playing track:', err);
            });
    }, []);

    const play = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Si on a une piste persistee mais pas de source chargee, la charger
        if (!audio.src && track?.src) {
            audio.src = track.src;
        }

        if (!audio.src) return;

        setError(null);
        audio
            .play()
            .then(() => setPlaying(true))
            .catch((err) => {
                setPlaying(false);
                console.error('Error playing:', err);
            });
    }, [track]);

    const pause = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        setPlaying(false);
    }, []);

    const togglePlay = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Si on a une piste persistee mais pas de source chargee, la charger
        if (!audio.src && track?.src) {
            audio.src = track.src;
        }

        if (!audio.src) return;

        if (playing) {
            audio.pause();
        } else {
            setError(null);
            audio.play().catch((err) => {
                setPlaying(false);
                console.error('Error in togglePlay:', err);
            });
        }
    }, [playing, track]);

    const seek = React.useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        setCurrentTime(time);
    }, []);

    const setVolume = React.useCallback((newVolume: number) => {
        setVolumeState(newVolume);
    }, []);

    const toggleMute = React.useCallback(() => {
        if (volume > 0) {
            previousVolumeRef.current = volume;
            setVolumeState(0);
        } else {
            setVolumeState(
                previousVolumeRef.current > 0 ? previousVolumeRef.current : 1,
            );
        }
    }, [volume]);

    const toggleShuffle = React.useCallback(() => {
        setShuffleState((v) => !v);
    }, []);

    const cycleRepeatMode = React.useCallback(() => {
        setRepeatModeState((m) =>
            m === 'off' ? 'all' : m === 'all' ? 'one' : 'off',
        );
    }, []);

    const skipForward = React.useCallback(() => {
        goToNextTrack();
    }, [goToNextTrack]);

    const skipBack = React.useCallback(() => {
        goToPreviousTrack();
    }, [goToPreviousTrack]);

    const toggleMinimized = React.useCallback(() => {
        setMinimized((v) => !v);
    }, []);

    const clearError = React.useCallback(() => {
        setError(null);
    }, []);

    // Actions de playlist
    const setPlaylist = React.useCallback(
        (tracks: Track[], startIndex: number = 0) => {
            setPlaylistState(tracks);
            if (
                tracks.length > 0 &&
                startIndex >= 0 &&
                startIndex < tracks.length
            ) {
                playTrackAtIndex(startIndex);
            }
        },
        [playTrackAtIndex],
    );

    const addToQueue = React.useCallback((newTrack: Track) => {
        setPlaylistState((prev) => [...prev, newTrack]);
    }, []);

    // Ajouter une piste juste apres la piste en cours (sera jouee ensuite)
    const addToQueueNext = React.useCallback(
        (newTrack: Track) => {
            setPlaylistState((prev) => {
                const newPlaylist = [...prev];
                // Inserer juste apres la position courante
                const insertIndex = currentIndex + 1;
                newPlaylist.splice(insertIndex, 0, newTrack);
                return newPlaylist;
            });
        },
        [currentIndex],
    );

    const removeFromQueue = React.useCallback(
        (index: number) => {
            setPlaylistState((prev) => {
                const newPlaylist = [...prev];
                newPlaylist.splice(index, 1);

                // Ajuster l'index courant si necessaire
                if (index < currentIndex) {
                    setCurrentIndex((curr) => curr - 1);
                } else if (index === currentIndex && newPlaylist.length > 0) {
                    // Si on supprime la piste en cours, jouer la suivante
                    const newIndex = Math.min(index, newPlaylist.length - 1);
                    playTrackAtIndex(newIndex);
                }

                return newPlaylist;
            });
        },
        [currentIndex, playTrackAtIndex],
    );

    const clearQueue = React.useCallback(() => {
        setPlaylistState([]);
        setCurrentIndex(-1);
        setTrack(null);
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = '';
        }
        setPlaying(false);
    }, []);

    const playNext = React.useCallback(() => {
        goToNextTrack();
    }, [goToNextTrack]);

    const playPrevious = React.useCallback(() => {
        goToPreviousTrack();
    }, [goToPreviousTrack]);

    const value = React.useMemo<MusicPlayerContextType>(
        () => ({
            track,
            playing,
            currentTime,
            duration,
            volume,
            shuffle,
            repeatMode,
            minimized,
            error,
            isLoading,
            playlist,
            currentIndex,
            hasListenBeenCounted,
            playTrack,
            play,
            pause,
            togglePlay,
            seek,
            setVolume,
            toggleMute,
            toggleShuffle,
            cycleRepeatMode,
            skipForward,
            skipBack,
            toggleMinimized,
            clearError,
            setPlaylist,
            addToQueue,
            addToQueueNext,
            removeFromQueue,
            clearQueue,
            playNext,
            playPrevious,
        }),
        [
            track,
            playing,
            currentTime,
            duration,
            volume,
            shuffle,
            repeatMode,
            minimized,
            error,
            isLoading,
            playlist,
            currentIndex,
            hasListenBeenCounted,
            playTrack,
            play,
            pause,
            togglePlay,
            seek,
            setVolume,
            toggleMute,
            toggleShuffle,
            cycleRepeatMode,
            skipForward,
            skipBack,
            toggleMinimized,
            clearError,
            setPlaylist,
            addToQueue,
            addToQueueNext,
            removeFromQueue,
            clearQueue,
            playNext,
            playPrevious,
        ],
    );

    return (
        <MusicPlayerContext.Provider value={value}>
            {children}
        </MusicPlayerContext.Provider>
    );
}

export function useMusicPlayer(): MusicPlayerContextType {
    const context = React.useContext(MusicPlayerContext);
    if (!context) {
        throw new Error(
            'useMusicPlayer must be used within a MusicPlayerProvider',
        );
    }
    return context;
}

export { MusicPlayerContext };
