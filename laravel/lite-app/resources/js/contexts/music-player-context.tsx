import * as React from 'react';
import { fetchTracks } from '../lib/track-api';

export type Track = {
    id?: number;
    src: string;
    title?: string;
    artist?: string;
    artistid?: number;
    artwork?: string;
};

export type RepeatMode = 'off' | 'all' | 'one';

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
    playlist: Track[];
    currentIndex: number;
    hasListenBeenCounted: boolean;
    showWaitingList: boolean;
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
    setPlaylist: (tracks: Track[], startIndex?: number) => void;
    addToQueue: (track: Track) => void;
    addToQueueNext: (track: Track) => void;
    removeFromQueue: (index: number) => void;
    clearQueue: () => void;
    playNext: () => void;
    playPrevious: () => void;
    waitingList: () => void;
};

export type MusicPlayerContextType = MusicPlayerState & MusicPlayerActions;

// Initialisation & Persistence
const STORAGE_KEY = 'music-player-state';

const initialState: MusicPlayerState = {
    track: null,
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    shuffle: false,
    repeatMode: 'off',
    minimized: false,
    error: null,
    isLoading: false,
    playlist: [],
    currentIndex: -1,
    hasListenBeenCounted: false,
    showWaitingList: false,
};

function loadPersistedState(): Partial<MusicPlayerState> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

type Action =
    | {
          type: 'SET_TRACK';
          payload: { track: Track; index: number; playlist?: Track[] };
      }
    | { type: 'SET_PLAYING'; payload: boolean }
    | { type: 'SET_PROGRESS'; payload: { current: number; duration: number } }
    | { type: 'SET_PLAYLIST'; payload: Track[] }
    | { type: 'SET_INDEX'; payload: number }
    | { type: 'UPDATE_STATE'; payload: Partial<MusicPlayerState> }
    | { type: 'RESET' };

function playerReducer(
    state: MusicPlayerState,
    action: Action,
): MusicPlayerState {
    switch (action.type) {
        case 'SET_TRACK':
            return {
                ...state,
                track: action.payload.track,
                currentIndex: action.payload.index,
                playlist: action.payload.playlist ?? state.playlist,
                hasListenBeenCounted: false,
                currentTime: 0,
                error: null,
                isLoading: true,
            };
        case 'SET_PLAYING':
            return { ...state, playing: action.payload };
        case 'SET_PROGRESS':
            return {
                ...state,
                currentTime: action.payload.current,
                duration: action.payload.duration,
            };
        case 'SET_PLAYLIST':
            return { ...state, playlist: action.payload };
        case 'SET_INDEX':
            return { ...state, currentIndex: action.payload };
        case 'UPDATE_STATE':
            return { ...state, ...action.payload };
        case 'RESET':
            return { ...initialState, volume: state.volume };
        default:
            return state;
    }
}

const MusicPlayerContext = React.createContext<MusicPlayerContextType | null>(
    null,
);

export function MusicPlayerProvider({
    children,
    userId,
}: {
    children: React.ReactNode;
    userId?: number;
}) {
    const [state, dispatch] = React.useReducer(playerReducer, {
        ...initialState,
        ...loadPersistedState(),
        playing: false, // On ne démarre jamais en lecture automatique au refresh
    });

    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const stateRef = React.useRef(state);
    const previousVolumeRef = React.useRef(state.volume);

    // Synchronisation de la Ref pour les callbacks d'événements
    React.useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Persistance locale
    React.useEffect(() => {
        const { playing, currentTime, duration, isLoading, ...toPersist } =
            state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    }, [state]);

    const getRandomIndex = (exclude: number, length: number) => {
        if (length <= 1) return 0;
        let next;
        do {
            next = Math.floor(Math.random() * length);
        } while (next === exclude);
        return next;
    };

    const playTrackAtIndex = React.useCallback((index: number) => {
        const { playlist } = stateRef.current;
        if (index < 0 || index >= playlist.length) return;

        const nextTrack = playlist[index];
        dispatch({ type: 'SET_TRACK', payload: { track: nextTrack, index } });

        if (audioRef.current) {
            audioRef.current.src = nextTrack.src;
            audioRef.current.play().catch(() => {
                // Gérer l'erreur de lecture (souvent due aux politiques d'autostart des navigateurs)
                dispatch({ type: 'SET_PLAYING', payload: false });
            });
        }
    }, []);

    const skipForward = React.useCallback(() => {
        const { currentIndex, playlist, shuffle, repeatMode } =
            stateRef.current;
        if (playlist.length === 0) return;

        let nextIdx;
        if (shuffle) {
            nextIdx = getRandomIndex(currentIndex, playlist.length);
        } else {
            nextIdx = currentIndex + 1;
            if (nextIdx >= playlist.length) {
                if (repeatMode === 'all') nextIdx = 0;
                else return; // Stop à la fin
            }
        }
        playTrackAtIndex(nextIdx);
    }, [playTrackAtIndex]);

    const skipBack = React.useCallback(() => {
        const { currentIndex, playlist, shuffle, repeatMode } =
            stateRef.current;
        if (!audioRef.current || playlist.length === 0) return;

        // Si on a dépassé 3s, on recommence le morceau
        if (audioRef.current.currentTime > 3) {
            audioRef.current.currentTime = 0;
            return;
        }

        let prevIdx;
        if (shuffle) {
            prevIdx = getRandomIndex(currentIndex, playlist.length);
        } else {
            prevIdx = currentIndex - 1;
            if (prevIdx < 0) {
                if (repeatMode === 'all') prevIdx = playlist.length - 1;
                else {
                    audioRef.current.currentTime = 0;
                    return;
                }
            }
        }
        playTrackAtIndex(prevIdx);
    }, [playTrackAtIndex]);

    const waitingList = React.useCallback(() => {
        dispatch({
            type: 'UPDATE_STATE',
            payload: { showWaitingList: !stateRef.current.showWaitingList},
        });
    }, []);

    React.useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.volume = stateRef.current.volume;

        const handlers = {
            play: () => dispatch({ type: 'SET_PLAYING', payload: true }),
            pause: () => dispatch({ type: 'SET_PLAYING', payload: false }),
            loadstart: () =>
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: { isLoading: true, error: null },
                }),
            loadedmetadata: () =>
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: { duration: audio.duration, isLoading: false },
                }),
            timeupdate: () => {
                dispatch({
                    type: 'SET_PROGRESS',
                    payload: {
                        current: audio.currentTime,
                        duration: audio.duration || 0,
                    },
                });

                // Comptage d'écoute à 50%
                const { track, hasListenBeenCounted } = stateRef.current;
                if (
                    !hasListenBeenCounted &&
                    audio.duration > 0 &&
                    audio.currentTime > audio.duration / 2
                ) {
                    dispatch({
                        type: 'UPDATE_STATE',
                        payload: { hasListenBeenCounted: true },
                    });
                    if (track?.id && userId) {
                        const csrf =
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '';
                        fetch('/add-listen', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrf,
                            },
                            body: JSON.stringify({ track_id: track.id }),
                        }).catch(console.error);
                    }
                }
            },
            ended: () => {
                if (stateRef.current.repeatMode === 'one') {
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    skipForward();
                }
            },
            error: () => {
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: {
                        error: 'Erreur de lecture audio',
                        playing: false,
                        isLoading: false,
                    },
                });
            },
        };

        Object.entries(handlers).forEach(([evt, fn]) =>
            audio.addEventListener(evt, fn),
        );

        return () => {
            audio.pause();
            Object.entries(handlers).forEach(([evt, fn]) =>
                audio.removeEventListener(evt, fn),
            );
        };
    }, [skipForward]);

    // Logic recommendation
    React.useEffect(() => {
        if (!userId || state.playlist.length === 0 || state.currentIndex < 0)
            return;

        // On déclenche s'il reste moins de 4 morceaux dans la liste
        const remaining = state.playlist.length - 1 - state.currentIndex;
        if (remaining > 3) return;

        const controller = new AbortController();
        const fetchReco = async () => {
            try {
                const trackId = state.track?.id;
                const type = trackId ? 'hybride' : 'user_based_p2';
                const res = await fetch(
                    `/recommendations?recommandation_type=${type}&track_id=${trackId || ''}&n=10`,
                    {
                        signal: controller.signal,
                        headers: { Accept: 'application/json' },
                    },
                );
                const data = await res.json();

                const existingIds = new Set(
                    stateRef.current.playlist.map((t) => t.id),
                );
                const newIds = (data.track_ids || [])
                    .filter((id: number) => !existingIds.has(id))
                    .slice(0, 4);

                if (newIds.length > 0) {
                    const newTracks = await fetchTracks(newIds);
                    if (newTracks.length > 0) {
                        dispatch({
                            type: 'SET_PLAYLIST',
                            payload: [
                                ...stateRef.current.playlist,
                                ...newTracks,
                            ],
                        });
                    }
                }
            } catch (e: any) {
                if (e.name !== 'AbortError') console.error(e);
            }
        };

        const timer = setTimeout(fetchReco, 1000);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [state.currentIndex, userId, state.track?.id, state.playlist.length]);

    const actions = React.useMemo<MusicPlayerActions>(
        () => ({
            playTrack: (track) => {
                dispatch({
                    type: 'SET_TRACK',
                    payload: { track, index: 0, playlist: [track] },
                });
                if (audioRef.current) {
                    audioRef.current.src = track.src;
                    audioRef.current.play();
                }
            },
            play: () => {
                if (!audioRef.current) return;
                if (!audioRef.current.src && stateRef.current.track)
                    audioRef.current.src = stateRef.current.track.src;
                audioRef.current.play();
            },
            pause: () => audioRef.current?.pause(),
            togglePlay: () =>
                stateRef.current.playing
                    ? audioRef.current?.pause()
                    : actions.play(),
            seek: (t) => {
                if (audioRef.current) audioRef.current.currentTime = t;
            },
            setVolume: (v) => {
                if (audioRef.current) audioRef.current.volume = v;
                dispatch({ type: 'UPDATE_STATE', payload: { volume: v } });
            },
            toggleMute: () => {
                if (stateRef.current.volume > 0) {
                    previousVolumeRef.current = stateRef.current.volume;
                    actions.setVolume(0);
                } else {
                    actions.setVolume(previousVolumeRef.current || 1);
                }
            },
            toggleShuffle: () =>
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: { shuffle: !stateRef.current.shuffle },
                }),
            cycleRepeatMode: () => {
                const modes: RepeatMode[] = ['off', 'all', 'one'];
                const nextMode =
                    modes[
                        (modes.indexOf(stateRef.current.repeatMode) + 1) %
                            modes.length
                    ];
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: { repeatMode: nextMode },
                });
            },
            skipForward,
            skipBack,
            toggleMinimized: () =>
                dispatch({
                    type: 'UPDATE_STATE',
                    payload: { minimized: !stateRef.current.minimized },
                }),
            clearError: () =>
                dispatch({ type: 'UPDATE_STATE', payload: { error: null } }),
            setPlaylist: (tracks, start = 0) => {
                dispatch({ type: 'SET_PLAYLIST', payload: tracks });
                playTrackAtIndex(start);
            },
            addToQueue: (track) =>
                dispatch({
                    type: 'SET_PLAYLIST',
                    payload: [...stateRef.current.playlist, track],
                }),
            addToQueueNext: (track) => {
                const list = [...stateRef.current.playlist];
                list.splice(stateRef.current.currentIndex + 1, 0, track);
                dispatch({ type: 'SET_PLAYLIST', payload: list });
            },
            removeFromQueue: (index) => {
                const list = [...stateRef.current.playlist];
                list.splice(index, 1);
                dispatch({ type: 'SET_PLAYLIST', payload: list });
                if (index < stateRef.current.currentIndex) {
                    dispatch({
                        type: 'SET_INDEX',
                        payload: stateRef.current.currentIndex - 1,
                    });
                }
            },
            clearQueue: () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = '';
                }
                dispatch({ type: 'RESET' });
            },
            playNext: skipForward,
            playPrevious: skipBack,
            waitingList: waitingList,
        }),
        [skipForward, skipBack, playTrackAtIndex],
    );

    return (
        <MusicPlayerContext.Provider value={{ ...state, ...actions }}>
            {children}
        </MusicPlayerContext.Provider>
    );
}

export function useMusicPlayer() {
    const context = React.useContext(MusicPlayerContext);
    if (!context)
        throw new Error(
            'useMusicPlayer must be used within MusicPlayerProvider',
        );
    return context;
}
