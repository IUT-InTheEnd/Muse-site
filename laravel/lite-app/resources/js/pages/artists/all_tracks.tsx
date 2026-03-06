import { show } from '@/actions/App/Http/Controllers/ArtistController';
import { proxyUrl } from '@/components/proxy';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { fetchTrack } from '@/lib/track-api';
import { Head, router } from '@inertiajs/react';
import { LoaderIcon, PauseIcon, PlayIcon } from 'lucide-react';
import React from 'react';
import {
    TrackList,
} from '@/components/musecomponents/TrackList';

type Track = {
    id: number;
    title: string;
    duration?: number;
    listens?: number;
    artwork?: string;
    artist?: {
        id: number;
        name: string;
    };
    [key: string]: any;
};

type Album = {
    id: number;
    title: string;
    date: string;
    type: string;
    artwork: string;
    tracks: Track[];
};

type Artist = {
    artist_id: number;
    artist_name: string;
};

interface AllTracksProps {
    artist: Artist;
    albums: Album[];
}

export default function AllTracks({ artist, albums }: AllTracksProps) {
    const { playTrack, isLoading, playing } = useMusicPlayer();
    const [currentTrackId, setCurrentTrackId] = React.useState<number | null>(
        null,
    );

    const playTracks = async (trackId: number) => {
        if (trackId == null) return;
        setCurrentTrackId(trackId);
        try {
            const track = await fetchTrack(trackId);
            playTrack(track);
        } catch (err) {
            console.error(err);
            void alert('Impossible de charger la musique.');
        }
    };

    return (
        <>
            <Head title={artist.artist_name + ' - Discographie'}></Head>
            <div className="relative min-h-screen p-4 md:p-10">
                <h1
                    onClick={() => router.visit(show(artist.artist_id))}
                    className="hover:underline cursor-pointer text-2xl md:text-4xl font-bold mb-6"
                >
                    {artist.artist_name}
                </h1>

                {(() => {
                                return Array.isArray(albums)
                                    ? [...albums].sort((a, b) => parseInt(b.date.substring(0, 4) ?? '0') - parseInt(a.date.substring(0, 4) ?? '0'))
                                    : [];
                            })().map((album: Album) => (
                    <div key={album.id} className="mb-12 md:mb-20">
                        <div className="flex flex-col md:flex-row mb-8 gap-4 md:gap-8">
                            <img
                                className="size-40 md:size-60 rounded-lg object-cover"
                                src={proxyUrl(album.artwork)}
                                alt={album.title}
                            />
                            <div className="flex-1">
                                <h2 onClick={() => router.visit(`/album/${album.id}`)} className="hover:underline cursor-pointer text-xl md:text-3xl font-bold mb-2">
                                    {album.title.toUpperCase()}
                                </h2>
                                <div className="flex flex-wrap gap-1 mb-4 text-sm md:text-base">
                                    <span className="text-gray-400">{album.type}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-400">{album.date.substring(0, 4)}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-400">{album.tracks.length} {album.tracks.length > 1 ? "titres" : "titre"}</span>
                                </div>
                                <button
                                    onClick={() =>
                                        playTracks(album.tracks[0]?.id)
                                    }
                                    disabled={isLoading}
                                    className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white disabled:opacity-50 dark:bg-white dark:text-black"
                                >
                                    {isLoading ? (
                                        <LoaderIcon
                                            size={28}
                                            className="animate-spin"
                                        />
                                    ) : playing &&
                                      currentTrackId === album.tracks[0]?.id ? (
                                        <PauseIcon size={28} />
                                    ) : (
                                        <PlayIcon size={28} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="mb-8 max-w-5xl">
                            <div className="hidden md:flex items-center gap-4 border-b border-gray-700 mb-4 text-left pb-2 p-3 text-xs md:text-sm">
                                <div className="w-8">#</div>
                                <div className="flex-1">TITRE</div>
                                <div className="hidden md:block">LECTURES</div>
                                <div className="w-28 text-right">FAVORITES</div>
                                <div className="w-28 text-right">DURÉE</div>
                                <div className="flex items-center gap-1 w-20"></div>
                            </div>
                            <TrackList
                                tracks={album.tracks.map((track: Track) => ({
                                    track: {
                                        track_id: track.id,
                                        track_title: track.title,
                                        track_duration: track.duration,
                                        track_favorites: track.favorites,
                                        track_listens: track.listens,
                                        track_image_file: track.artwork,
                                    },
                                    artist: track.artist
                                        ? {
                                              artist_id: track.artist.id,
                                              artist_name: track.artist.name,
                                          }
                                        : undefined,
                                }))}
                                showIndex={true}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
