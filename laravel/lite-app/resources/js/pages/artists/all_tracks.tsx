import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { proxyUrl } from '@/components/proxy';
import { Head, router } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ArtistController';
import {PlayIcon, PauseIcon, LoaderIcon,} from 'lucide-react';
import { useMusicPlayer } from '@/hooks/use-music-player';
import React from 'react';

export default function AllTracks({ artist, albums }: any) {
    const { playTrack, isLoading, playing } = useMusicPlayer();
    const [currentTrackId, setCurrentTrackId] = React.useState<number | null>(null);

    const playTracks = async (trackId: number) => {
        if (trackId == null) return;
        setCurrentTrackId(trackId);
        try {
            const res = await fetch(`/test-music-player?id=${encodeURIComponent(trackId)}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const track = {
                src: proxyUrl(data.url) ?? '',
                title: data.title,
                artist: data.artist,
                artwork: proxyUrl(data.artwork),
            };
            playTrack(track);
        } catch (err) {
            console.error(err);
            void alert('Impossible de charger la musique.');
        }
    };

    return (
        <>        
            <Head title={artist.artist_name}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen p-10">
                <h1 
                    onClick={() => router.visit(show(artist.artist_id))} 
                    className="hover:underline cursor-pointer text-4xl font-bold mb-6"
                >
                    {artist.artist_name}
                </h1>

                {albums.map((album: any) => (
                    <div key={album.id} className="mb-20">
                        <div className="flex mb-8">
                            <img 
                                className="size-60 mr-8 rounded-lg object-cover" 
                                src={proxyUrl(album.artwork)} 
                                alt={album.title}
                            />
                            <div>
                                <h2 onClick={() => router.visit(`../album/${album.id}`)} className="hover:underline cursor-pointer text-3xl font-bold mb-2">
                                    {album.title.toUpperCase()}
                                </h2>
                                <div className="flex gap-4 mb-4">
                                    <span className="text-gray-400">{album.type}</span>
                                    <span className="text-gray-400">{album.date.substring(0, 4)}</span>
                                </div>
                                <button
                                    onClick={() => playTracks(album.tracks[0]?.id)}
                                    disabled={isLoading}
                                    className="w-14 h-14 cursor-pointer flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <LoaderIcon size={28} className="animate-spin" />
                                    ) : playing && currentTrackId === album.tracks[0]?.id ? (
                                        <PauseIcon size={28} />
                                    ) : (
                                        <PlayIcon size={28} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <table className="w-full text-left mb-8">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">TITRE</th>
                                    <th className="pb-2">LECTURES</th>
                                    <th className="pb-2 text-right">DURÉE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {album.tracks
                                    .sort((a: any, b: any) => (b.listens ?? 0) - (a.listens ?? 0))
                                    .map((track: any, trackIndex: number) => (
                                        <tr
                                            key={track.id}
                                            className="hover:bg-white/10 cursor-pointer transition group"
                                            onClick={() => playTracks(track.id)}
                                        >
                                            <td className="p-3 rounded-l-lg">{trackIndex + 1}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <img 
                                                    src={proxyUrl(track.artwork)} 
                                                    className="w-10 h-10 rounded object-cover bg-gray-800" 
                                                    alt={track.title}
                                                />
                                                <span className="font-medium group-hover:text-primary transition">
                                                    {track.title}
                                                </span>
                                            </td>
                                            <td className="p-3">{track.listens}</td>
                                            <td className="p-3 text-right rounded-r-lg font-mono text-sm">
                                                {track.duration
                                                    ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ))}

            </div>
        </>
    );
}