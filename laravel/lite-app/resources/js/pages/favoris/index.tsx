import { Link } from '@inertiajs/react'
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard'
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard'
import { CardCover, CardContent, CardTitle, CardSubtitle } from '@/components/musecomponents/cards/Card'
import { MusicCard } from '@/components/musecomponents/cards/MusicCard'
import { AlbumSlider } from '@/components/musecomponents/sliders/AlbumSlider'
import { ArtistSlider } from '@/components/musecomponents/sliders/ArtistSlider'
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider'

type FavoritesPageProps = {
  tracks: never[]
  albums: never[]
  artists: never[]
}

export default function FavoritesPage({ tracks, albums, artists }: FavoritesPageProps) {
  return (
    <div className='flex flex-col items-center justify-center '>
      <div className='flex flex-col lg:justify-center w-full max-w-xl sm:max-w-2xl lg:max-w-4xl gap-6 px-6 py-10'>
        <h1 className="text-2xl font-bold mb-6">
          Mes favoris
        </h1>

        <MusicSlider title='Titres favoris'>
            {tracks?.filter(Boolean).map((track) => (
                <MusicCard key={track.id}>
                    <Link href={`/`}>
                    <CardCover src={track.cover} />
                    <CardContent>
                        <CardSubtitle>
                            <CardTitle>{track.title}</CardTitle>
                        </CardSubtitle>
                    </CardContent>
                    </Link>
                </MusicCard>
            ))}
        </MusicSlider>
        <AlbumSlider title='Albums favoris'>
            {albums?.filter(Boolean).map((album) => (
                <AlbumCard key={album.id}>
                    <Link href={`/`}>
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
        <ArtistSlider title='Artistes favoris'>
            {artists?.filter(Boolean).map((artist) => (
                <ArtistCard key={artist.id}>
                    <Link href={`/`}>
                    <CardCover src={artist.artist_image_file} />
                    <CardContent>
                        <CardSubtitle>
                            <CardTitle>{artist.artist_name}</CardTitle>
                        </CardSubtitle>
                    </CardContent>
                    </Link>
                </ArtistCard>
            ))}
        </ArtistSlider>
      </div>
    </div>
  )
}
