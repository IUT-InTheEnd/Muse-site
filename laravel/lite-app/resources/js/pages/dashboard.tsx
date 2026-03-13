import { Head, Link } from '@inertiajs/react';
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard';
import {
    CardCover,
    CardSubtitle,
} from '@/components/musecomponents/cards/Card';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { ArtistSlider } from '@/components/musecomponents/sliders/ArtistSlider';
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider';
import { proxyUrl } from '@/components/proxy';
import { CardContent, CardTitle } from '@/components/ui/card';
import { useMusicPlayer } from '@/hooks/use-music-player';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import type Artist from './artists/artist';

type Track = {
  id: number
  title: string
  artist: string
  cover: string
}

type Artist = {
  id: number
  artist_name: string
  artist_image_file: string
}

type Props = {
  user: {
    name: string
  }

  recentTracks: Track[]
  recommendedTracks: Track[]
  newTracks: Track[]
  artists: Artist[]
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard().url,
  },
]

export default function Dashboard({user, recentTracks, recommendedTracks, newTracks, artists}: Props) {
    const { playTrack } = useMusicPlayer();


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accueil" />
                <div className='flex flex-col items-center justify-center '>
                    <div className='flex flex-col lg:justify-center w-full max-w-xl sm:max-w-2xl lg:max-w-4xl gap-6 px-6 py-10'>
                        <h1 className="text-lg font-semibold mb-6">
                            Bonjour {user.name}
                        </h1>
                        {recentTracks.length !== 0 && (
                            <MusicSlider title='Titres récemment écoutés'>
                                {recentTracks?.filter(Boolean).map((track) => (
                                    <MusicCard
                                        key={track.id}
                                        trackId={track.id}
                                        showPlayButton={false}
                                        className="cursor-pointer"
                                        onClick={async () => {
                                        try {
                                            const res = await fetch(
                                                `/test-music-player?id=${encodeURIComponent(track.id)}`
                                            );
                                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                                const data = await res.json();
                                            playTrack({
                                                id: track.id,
                                                src: proxyUrl(data.url) ?? '',
                                                title: data.title,
                                                artist: data.artist,
                                                artwork: proxyUrl(data.artwork),
                                            });
                                            } catch (err) {
                                                console.error(err);
                                                void alert('Impossible de charger la musique.');
                                            }
                                        }}
                                    >
                                        <CardCover src={proxyUrl(track.cover)} />
                                        <CardContent>
                                            <CardTitle>{track.title}</CardTitle>
                                            <CardSubtitle><Link href={`/artiste/${track.artist?.artist_id}`}>{track.artist?.artist_name}</Link></CardSubtitle>
                                        </CardContent>
                                    </MusicCard>
                                ))}
                            </MusicSlider>
                        )}

                        <MusicSlider title='Rien que pour vous'>
                            {recommendedTracks?.filter(Boolean).map((track) => (
                                <MusicCard
                                    key={track.id}
                                    trackId={track.id}
                                    showPlayButton={false}
                                    className="cursor-pointer"
                                    onClick={async () => {
                                    try {
                                        const res = await fetch(
                                            `/test-music-player?id=${encodeURIComponent(track.id)}`
                                        );
                                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                            const data = await res.json();
                                        playTrack({
                                            id: track.id,
                                            src: proxyUrl(data.url) ?? '',
                                            title: data.title,
                                            artist: data.artist,
                                            artwork: proxyUrl(data.artwork),
                                        });
                                        } catch (err) {
                                            console.error(err);
                                            void alert('Impossible de charger la musique.');
                                        }
                                    }}
                                >
                                    <CardCover src={proxyUrl(track.cover)} />
                                    <CardContent>
                                        <CardTitle>{track.title}</CardTitle>
                                        <CardSubtitle><Link href={`/artiste/${track.artist?.artist_id}`}>{track.artist?.artist_name}</Link></CardSubtitle>
                                    </CardContent>
                                </MusicCard>
                            ))}
                        </MusicSlider>

                        <ArtistSlider title='Artistes favoris'>
                            {artists?.filter(Boolean).map((artist) => (
                                <ArtistCard key={artist.id}>
                                    <Link href={`/artiste/${artist.id}`}>
                                    <CardCover className="rounded-full"  src={proxyUrl(artist.cover) || '/images/default-artist.jpg'} />
                                    <CardContent>
                                        <CardSubtitle>
                                            <CardTitle>{artist.name}</CardTitle>
                                        </CardSubtitle>
                                    </CardContent>
                                    </Link>
                                </ArtistCard>
                            ))}
                        </ArtistSlider>

                        <MusicSlider title='Nouveautés'>
                            {newTracks?.filter(Boolean).map((track) => (
                                <MusicCard
                                    key={track.id}
                                    trackId={track.id}
                                    showPlayButton={false}
                                    className="cursor-pointer"
                                    onClick={async () => {
                                    try {
                                        const res = await fetch(
                                            `/test-music-player?id=${encodeURIComponent(track.id)}`
                                        );
                                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                                            const data = await res.json();
                                        playTrack({
                                            id: track.id,
                                            src: proxyUrl(data.url) ?? '',
                                            title: data.title,
                                            artist: data.artist,
                                            artwork: proxyUrl(data.artwork),
                                        });
                                        } catch (err) {
                                            console.error(err);
                                            void alert('Impossible de charger la musique.');
                                        }
                                    }}
                                >
                                    <CardCover src={proxyUrl(track.cover)} />
                                    <CardContent>
                                        <CardTitle>{track.title}</CardTitle>
                                        <CardSubtitle><Link href={`/artiste/${track.artist.artist_id}`}>{track.artist.artist_name}</Link></CardSubtitle>
                                    </CardContent>
                                </MusicCard>
                            ))}
                        </MusicSlider>
                    </div>
                </div>
        </AppLayout>
    );
}