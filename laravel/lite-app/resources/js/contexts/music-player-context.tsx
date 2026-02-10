import * as React from 'react';

export type Track = {
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

export function MusicPlayerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const previousVolumeRef = React.useRef<number>(1);

    // Charger l'état persisté au montage
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

    // Initialiser l'élément audio une seule fois
    React.useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.volume = volume;

        // Si on a une piste persistée, la définir comme source (sans lecture automatique)
        if (track?.src) {
            audio.src = track.src;
        }

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoaded = () => setDuration(audio.duration || 0);
        const onEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                setPlaying(false);
                // À venir : logique de playlist pour lecture aléatoire/répétition totale
            }
        };
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);

        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.pause();
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audioRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Mettre à jour le comportement du mode répétition quand il change
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onEnded = () => {
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else {
                setPlaying(false);
            }
        };

        audio.addEventListener('ended', onEnded);
        return () => audio.removeEventListener('ended', onEnded);
    }, [repeatMode]);

    // Synchroniser le volume avec l'élément audio
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Persister les changements d'état
    React.useEffect(() => {
        savePersistedState({ volume, shuffle, repeatMode, track, minimized });
    }, [volume, shuffle, repeatMode, track, minimized]);

    // Actions
    const playTrack = React.useCallback((newTrack: Track) => {
        setTrack(newTrack);
        const audio = audioRef.current;
        if (!audio) return;

        audio.src = newTrack.src;
        audio.currentTime = 0;
        audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
    }, []);

    const play = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
    }, []);

    const pause = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        setPlaying(false);
    }, []);

    const togglePlay = React.useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play().catch(() => setPlaying(false));
        }
    }, [playing]);

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
        // À venir : support des playlists
        console.log('Skip forward - playlist support coming soon');
    }, []);

    const skipBack = React.useCallback(() => {
        // À venir : support des playlists
        // Pour l'instant, redémarrer la piste actuelle si on dépasse 3 secondes
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        }
    }, []);

    const toggleMinimized = React.useCallback(() => {
        setMinimized((v) => !v);
    }, []);

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
