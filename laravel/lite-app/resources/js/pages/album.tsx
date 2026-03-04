import {
    TrackList,
    type TrackListItem,
} from '@/components/musecomponents/TrackList';
import {
    type ArtistData,
    type TrackData,
} from '@/components/musecomponents/TrackRow';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/contexts/music-player-context';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

type Props = {
    album: Record<string, any>;
    artistes: Record<string, any>;
    nombreMusiques: number;
    listeMusiques: {
        track: Record<string, any>;
        artist: Record<string, any>;
    }[];
};

export default function album({
    album,
    artistes,
    nombreMusiques,
    listeMusiques,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    const { playTrack } = useMusicPlayer();

    let total = 0;
    listeMusiques.forEach((element) => {
        total += element.track.track_duration;
    });

    let listeArtistes = '';
    if (artistes.length > 2) {
        listeArtistes = `${artistes[0].artist_name} & ${artistes[1].artist_name}...`;
    } else {
        listeArtistes = artistes
            .map((artist: { artist_name: any }) => artist.artist_name)
            .join(' & ');
    }

    const h = Math.floor(total / 3600);
    const min = Math.floor((total - h * 3600) / 60);
    const sec = total % 60;

    return (
        <>
            <Head title={album.album_title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center lg:justify-center">
                <div
                    className="relative flex h-80 w-full items-center bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${proxyUrl(album.album_image_file)})`,
                    }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-black/70"></div>
                    <main className="relative z-10 ml-8 flex flex-col gap-6 px-6 py-10 text-left">
                        <div className="flex flex-col gap-2">
                            <h1 className="!text-6xl font-bold">
                                {album.album_title}
                            </h1>
                            <h2 className="text-lg font-semibold text-white">
                                {listeArtistes} •{' '}
                                {album.album_date_created.split('-')[0]} •
                                {nombreMusiques > 0
                                    ? ` ${nombreMusiques} titres`
                                    : '0 titre'}{' '}
                                •{h > 0 ? ` ${h}h ` : ''} {min % 60} min {sec}{' '}
                                sec
                            </h2>
                        </div>

                        <div className="flex max-w-sm gap-2">
                            <Button
                                className="flex-1"
                                onClick={async () => {
                                    try {
                                        const res = await fetch(
                                            `/test-music-player?id=${encodeURIComponent(listeMusiques[0].track.track_id)}`,
                                        );
                                        if (!res.ok)
                                            throw new Error(
                                                `HTTP ${res.status}`,
                                            );
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
                                        void alert(
                                            'Impossible de charger la musique.',
                                        );
                                    }
                                }}
                            >
                                Écouter
                            </Button>
                            <Button className="flex-2">
                                Ajouter à ma bibliothèque
                            </Button>
                        </div>
                    </main>
                </div>
                <div className="mb-10 w-full px-6">
                    <div className="mx-auto mt-10 mb-50 max-w-5xl">
                        <TrackList
                            tracks={listeMusiques.map(
                                (element): TrackListItem => ({
                                    track: element.track as TrackData,
                                    artist: element.artist as ArtistData,
                                }),
                            )}
                            showIndex={true}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
