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
};

function loadPersistedState(): Partial<PersistedState> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Ignore parse errors
    }
    return {};
}

function savePersistedState(state: PersistedState): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // Ignore storage errors
    }
}

export function MusicPlayerProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const previousVolumeRef = React.useRef<number>(1);

    // Load persisted state on mount
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

    // Initialize audio element once
    React.useEffect(() => {
        const audio = new Audio();
        audioRef.current = audio;
        audio.volume = volume;

        // If we have a persisted track, set it as src (but don't autoplay)
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
                // Future: playlist logic for shuffle/repeat all
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

    // Update repeat mode behavior when it changes
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

    // Sync volume to audio element
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Persist state changes
    React.useEffect(() => {
        savePersistedState({ volume, shuffle, repeatMode, track });
    }, [volume, shuffle, repeatMode, track]);

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
        // Future: playlist support
        console.log('Skip forward - playlist support coming soon');
    }, []);

    const skipBack = React.useCallback(() => {
        // Future: playlist support
        // For now, restart current track if past 3 seconds
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
        }
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
        }),
        [
            track,
            playing,
            currentTime,
            duration,
            volume,
            shuffle,
            repeatMode,
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
