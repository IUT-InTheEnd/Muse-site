import { show } from '@/actions/App/Http/Controllers/ArtistController';
import { proxyUrl } from '@/components/proxy';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { fetchTrack } from '@/lib/track-api';
import { Head, router } from '@inertiajs/react';
import { LoaderIcon, PauseIcon, PlayIcon } from 'lucide-react';
import React from 'react';

export default function AllTracks({ artist, albums }: never) {
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
            <Head title={artist.artist_name + ' - Discographie'}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative min-h-screen p-10">
                <h1
                    onClick={() => router.visit(show(artist.artist_id))}
                    className="mb-6 cursor-pointer text-4xl font-bold hover:underline"
                >
                    {artist.artist_name}
                </h1>

                {(() => {
                    return Array.isArray(albums)
                        ? [...albums].sort(
                              (a, b) =>
                                  (b.date.substring(0, 4) ?? 0) -
                                  (a.date.substring(0, 4) ?? 0),
                          )
                        : [];
                })().map((album: never) => (
                    <div key={album.id} className="mb-20">
                        <div className="mb-8 flex">
                            <img
                                className="mr-8 size-60 rounded-lg object-cover"
                                src={proxyUrl(album.artwork)}
                                alt={album.title}
                            />
                            <div>
                                <h2
                                    onClick={() =>
                                        router.visit(`/album/${album.id}`)
                                    }
                                    className="mb-2 cursor-pointer text-3xl font-bold hover:underline"
                                >
                                    {album.title.toUpperCase()}
                                </h2>
                                <div className="mb-4 flex gap-1">
                                    <span className="text-gray-400">
                                        {album.type} •
                                    </span>
                                    <span className="text-gray-400">
                                        {album.date.substring(0, 4)} •
                                    </span>
                                    <span className="text-gray-400">
                                        {album.tracks.length}{' '}
                                        {album.tracks.length > 1
                                            ? 'titres'
                                            : 'titre'}
                                    </span>
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

                        <table className="mb-8 w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">TITRE</th>
                                    <th className="pb-2">LECTURES</th>
                                    <th className="pb-2 text-right">DURÉE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {album.tracks
                                    .sort(
                                        (a: never, b: never) =>
                                            (b.listens ?? 0) - (a.listens ?? 0),
                                    )
                                    .map((track: never, trackIndex: number) => (
                                        <tr
                                            key={track.id}
                                            className="group cursor-pointer transition hover:bg-white/10"
                                            onClick={() => playTracks(track.id)}
                                        >
                                            <td className="rounded-l-lg p-3">
                                                {trackIndex + 1}
                                            </td>
                                            <td className="flex items-center gap-3 p-3">
                                                <img
                                                    src={proxyUrl(
                                                        track.artwork,
                                                    )}
                                                    className="h-10 w-10 rounded bg-gray-800 object-cover"
                                                    alt={track.title}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {track.title}
                                                    </span>
                                                    <span
                                                        onClick={() =>
                                                            router.visit(
                                                                `/artiste/${track.artist.id}`,
                                                            )
                                                        }
                                                        className="cursor-pointer text-gray-500 hover:underline"
                                                    >
                                                        {track.artist.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {track.listens}
                                            </td>
                                            <td className="rounded-r-lg p-3 text-right font-mono text-sm">
                                                {track.duration
                                                    ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                                                    : '-'}
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
