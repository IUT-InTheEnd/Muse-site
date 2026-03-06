import { Link } from '@inertiajs/react'
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard'
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard'
import { CardCover, CardContent, CardTitle, CardSubtitle } from '@/components/musecomponents/cards/Card'
import { MusicCard } from '@/components/musecomponents/cards/MusicCard'
import { AlbumSlider } from '@/components/musecomponents/sliders/AlbumSlider'
import { ArtistSlider } from '@/components/musecomponents/sliders/ArtistSlider'
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider'
import { proxyUrl } from '@/components/proxy';
import { useMusicPlayer } from '@/hooks/use-music-player';

type FavoritesPageProps = {
  tracks: []
  albums: []
  artists: []
}


export default function FavoritesPage({ tracks, albums, artists }: FavoritesPageProps) {
    const { playTrack } = useMusicPlayer();

    return (
    <div className='flex flex-col items-center justify-center '>
      <div className='flex flex-col lg:justify-center w-full max-w-xl sm:max-w-2xl lg:max-w-4xl gap-6 px-6 py-10'>
        <h1 className="text-2xl font-bold mb-6">
          Mes favoris
        </h1>
        {tracks.length === 0 && albums.length === 0 && artists.length === 0 && (
          <p>Aucun favori pour le moment.</p>
        )}

        {tracks.length !== 0 && (
            <MusicSlider title='Titres favoris'>
                {tracks?.filter(Boolean).map((track) => (
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
                            <CardSubtitle>{track.artist?.artist_name}</CardSubtitle>
                        </CardContent>
                    </MusicCard>
                ))}
            </MusicSlider>
        )}

        {albums.length !== 0 && (
            <AlbumSlider title='Albums favoris'>
                {albums?.filter(Boolean).map((album) => (
                    <AlbumCard key={album.id}>
                        <Link href={`/album/${album.id}`}>
                        <CardCover src={album.cover} />
                        <CardContent>
                            <CardSubtitle>
                                <CardTitle>{album.title}</CardTitle>
                            </CardSubtitle>
                        </CardContent>
                        </Link>
                    </AlbumCard>
                ))}
            </AlbumSlider>
        )}

        {artists.length !== 0 && (
            <ArtistSlider title='Artistes favoris'>
                {artists?.filter(Boolean).map((artist) => (
                    <ArtistCard key={artist.id}>
                        <Link href={`/artiste/${artist.id}`}>
                        <CardCover className="rounded-full" src={artist.cover} />
                        <CardContent>
                            <CardSubtitle>
                                <CardTitle>{artist.name}</CardTitle>
                            </CardSubtitle>
                        </CardContent>
                        </Link>
                    </ArtistCard>
                ))}
            </ArtistSlider>
        )}
      </div>
    </div>
  )
}
