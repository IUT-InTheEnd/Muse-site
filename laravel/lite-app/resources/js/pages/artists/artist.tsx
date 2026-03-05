import {
    allTracks,
    follow,
    show,
    unfollow,
} from '@/actions/App/Http/Controllers/ArtistController';
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard';
import {
    CardContent,
    CardCover,
    CardSubtitle,
    CardTitle,
} from '@/components/musecomponents/cards/Card';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { AlbumSlider } from '@/components/musecomponents/sliders/AlbumSlider';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { fetchTrack } from '@/lib/track-api';
import { Head, Link, router } from '@inertiajs/react';

export default function Artist({ artist, tracks, albums, isFollowing }: never) {
    const { playTrack } = useMusicPlayer();

    const playTracks = async (trackId: number) => {
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
            <Head title={artist.artist_name}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="relative flex min-h-screen flex-col p-36">
                <div className="backgroundimg-container">
                    <div className="gradient"></div>
                    <img
                        className="background-artist"
                        src={proxyUrl(artist.artist_image_file)}
                        alt="Cover"
                    />
                </div>

                <div className="relative ml-20 flex flex-col gap-24 pt-48">
                    <div className="flex flex-col">
                        <p className="mb-4 text-8xl font-bold text-shadow-lg/20">
                            {artist.artist_name.toUpperCase()}
                        </p>
                        <div className="flex flex-row gap-2">
                            <Button
                                size="lg"
                                className="cursor-pointer"
                                onClick={() => playTracks(tracks[0]?.id)}
                            >
                                Écouter
                            </Button>
                            <Button
                                size="lg"
                                className="cursor-pointer"
                                variant="secondary"
                                onClick={async () => {
                                    try {
                                        if (isFollowing) {
                                            await router.delete(
                                                unfollow({
                                                    id: artist.artist_id,
                                                }).url,
                                            );
                                        } else {
                                            await router.post(
                                                follow({ id: artist.artist_id })
                                                    .url,
                                            );
                                        }
                                        router.visit(show(artist.artist_id));
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                            >
                                {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-row flex-wrap justify-center gap-32">
                        <div className="flex flex-col">
                            <h2>Dernière Musique</h2>

                            {(() => {
                                const sorted = Array.isArray(tracks)
                                    ? [...tracks].sort(
                                          (a, b) =>
                                              (b.date.substring(0, 4) ?? 0) -
                                              (a.date.substring(0, 4) ?? 0),
                                      )
                                    : [];
                                return (
                                    <>
                                        <MusicCard className="size-60 overflow-visible px-0">
                                            <Link
                                                onClick={() =>
                                                    playTracks(sorted[0]?.id)
                                                }
                                            >
                                                <CardCover
                                                    src={proxyUrl(
                                                        sorted[0]?.artwork,
                                                    )}
                                                    alt={sorted[0]?.title}
                                                />
                                                <CardContent className="px-0">
                                                    <CardTitle className="line-clamp-2">
                                                        {sorted[0]?.title.toUpperCase()}
                                                    </CardTitle>
                                                    <CardSubtitle>
                                                        {sorted[0]?.date.substring(
                                                            0,
                                                            4,
                                                        )}
                                                    </CardSubtitle>
                                                </CardContent>
                                            </Link>
                                        </MusicCard>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex flex-col">
                            <h2>Dernier Album</h2>
                            {(() => {
                                const sorted = Array.isArray(albums)
                                    ? [...albums].sort(
                                          (a, b) =>
                                              (b.date.substring(0, 4) ?? 0) -
                                              (a.date.substring(0, 4) ?? 0),
                                      )
                                    : [];
                                const albumDateYear = sorted[0]?.date ? sorted[0].date.substring(0, 4) : 'Unknown Year';
                            return (
                                <>
                                    <AlbumCard className='size-60 overflow-visible px-0'>
                                        <Link href={"../album/" + sorted[0]?.id}>
                                            <CardCover src={proxyUrl(sorted[0]?.artwork)} alt={sorted[0]?.title} />
                                            <CardContent className='px-0'>
                                                <CardTitle className="line-clamp-2">{sorted[0]?.title?.toUpperCase()}</CardTitle>
                                                <CardSubtitle>{albumDateYear}</CardSubtitle>
                                            </CardContent>
                                        </Link>
                                    </AlbumCard>
                              </>
                            );
                        })()}
                    </div>
                </div>

                    <div className="mt-10 ml-20">
                        <div className="flex items-baseline justify-between">
                            <h2 className="mb-6 text-2xl font-bold">
                                Populaire
                            </h2>
                            <a
                                className="cursor-pointer hover:underline"
                                onClick={() => {
                                    router.visit(allTracks(artist.artist_id));
                                }}
                            >
                                Voir tout
                            </a>
                        </div>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-700 text-gray-400">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">TITRE</th>
                                    <th className="pb-2">LECTURES</th>
                                    <th className="pb-2 text-right">DURÉE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const sorted = Array.isArray(tracks)
                                        ? [...tracks].sort(
                                              (a, b) =>
                                                  (b.listens ?? 0) -
                                                  (a.listens ?? 0),
                                          )
                                        : [];
                                    return sorted.slice(0, 6);
                                })().map((track: never, index: number) => (
                                    <tr
                                        key={track.id}
                                        className="group cursor-pointer transition hover:bg-white/10"
                                        onClick={() => playTracks(track.id)}
                                    >
                                        <td className="rounded-l-lg p-3">
                                            {index + 1}
                                        </td>
                                        <td className="flex items-center gap-3 p-3">
                                            <img
                                                src={proxyUrl(track.artwork)}
                                                className="h-10 w-10 rounded bg-gray-800 object-cover"
                                            />
                                            <span className="font-medium transition group-hover:text-primary">
                                                {track.title}
                                            </span>
                                        </td>
                                        <td className="p-3">{track.listens}</td>
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
                    <div className="mt-10 ml-20">
                        <div className="flex-wrap">
                            <AlbumSlider title="Discographie">
                                {Array.isArray(albums)
                                    ? [...albums]
                                        .sort((a, b) => {
                                        // sécuriser les dates pour le tri
                                        const yearA = a.date ? parseInt(a.date.substring(0, 4)) : 0;
                                        const yearB = b.date ? parseInt(b.date.substring(0, 4)) : 0;
                                        return yearB - yearA;
                                        })
                                        .map((album) => {
                                        const year = album.date ? album.date.substring(0, 4) : 'Unknown Year';

                                        return (
                                            <AlbumCard key={album.id} className="size-80 overflow-visible">
                                            <Link className="size-60" href={"../album/" + album.id}>
                                                <CardCover src={proxyUrl(album.artwork)} alt={album.title} />
                                                <CardContent className="px-0">
                                                <CardTitle className="line-clamp-2">{album.title?.toUpperCase()}</CardTitle>
                                                <CardSubtitle>{year}</CardSubtitle>
                                                </CardContent>
                                            </Link>
                                            </AlbumCard>
                                        );
                                    })
                                : null}
                            </AlbumSlider>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
