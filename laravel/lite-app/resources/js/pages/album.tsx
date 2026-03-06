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
import { fetchTracks } from '@/lib/track-api';
import type { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    album: {
        album_id: number;
        album_title: string;
        album_image_file: string;
        album_date_created: string;
    };
    artistes: {
        artist_name: string;
    }[];
    nombreMusiques: number;
    listeMusiques: {
        track: TrackData;
        artist: ArtistData;
    }[];
};

export default function Album({
    album,
    artistes,
    nombreMusiques,
    listeMusiques,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const { setPlaylist } = useMusicPlayer();
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if album is in library on mount
    useEffect(() => {
        if (!auth?.user) return;

        const checkLibraryStatus = async () => {
            try {
                const res = await fetch('/favorites/album/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                    body: JSON.stringify({ album_id: album.album_id }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsInLibrary(data.is_favorite);
                }
            } catch (err) {
                console.error('Error checking library status:', err);
            }
        };

        checkLibraryStatus();
    }, [auth?.user, album.album_id]);

    const handleToggleLibrary = async () => {
        if (!auth?.user) {
            alert(
                'Connectez-vous pour ajouter des albums a votre bibliotheque',
            );
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/favorites/album/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ album_id: album.album_id }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsInLibrary(data.is_favorite);
            }
        } catch (err) {
            console.error('Error toggling library:', err);
        } finally {
            setIsLoading(false);
        }
    };

    let total = 0;
    listeMusiques.forEach((element) => {
        total += element.track.track_duration ?? 0;
    });

    let listeArtistes = '';
    if (artistes.length > 2) {
        listeArtistes = `${artistes[0].artist_name} & ${artistes[1].artist_name}...`;
    } else {
        listeArtistes = artistes
            .map((artist: { artist_name: string }) => artist.artist_name)
            .join(' & ');
    }

    const h = Math.floor(total / 3600);
    const min = Math.floor((total - h * 3600) / 60);
    const sec = total % 60;
    const year = album.album_date_created?.split('-')?.[0] ?? 'Unknown Year';

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
                                {listeArtistes} • {year} •
                                {nombreMusiques > 0 ? ` ${nombreMusiques} titres` : '0 titre'} •
                                {h > 0 ? ` ${h}h ` : ''} {min % 60} min {sec} sec
                            </h2>
                        </div>
                        
                        <div className="flex max-w-sm gap-2">
                            <Button
                                className="flex-1"
                                onClick={async () => {
                                    try {
                                        const tracks = await fetchTracks(
                                            listeMusiques.map(
                                                (el) => el.track.track_id,
                                            ),
                                        );
                                        setPlaylist(tracks, 0);
                                    } catch (err) {
                                        console.error(err);
                                        alert(
                                            'Impossible de charger les musiques.',
                                        );
                                    }
                                }}
                            >
                                Écouter
                            </Button>
                            <Button
                                className="flex-1"
                                variant={isInLibrary ? 'secondary' : 'default'}
                                onClick={handleToggleLibrary}
                                disabled={isLoading}
                            >
                                {isInLibrary ? (
                                    <>
                                        <Check className="mr-2 h-4 w-4" />
                                        Dans ma bibliotheque
                                    </>
                                ) : (
                                    <>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter a ma bibliotheque
                                    </>
                                )}
                            </Button>
                        </div>
                    </main>
                </div>
                <div className="mb-10 w-full px-6">
                    <div className="mx-auto mt-10 mb-50 max-w-5xl">
                        <div className="flex border-b px-3 py-3 text-left text-sm">
                            <div className="w-10"></div> {/* Espace pour index */}
                            <div className="ml-15 w-[400px]">
                                TITRE
                            </div>
                            <div className="w-[120px] text-right">
                                LECTURES
                            </div>
                            <div className="w-[130px] text-right">
                                FAVORITES
                            </div>
                            <div className="w-[140px] pr-3 text-right">
                                DURÉE
                            </div>
                            <div className="w-20 pr-3 text-right"></div>
                        </div>
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
