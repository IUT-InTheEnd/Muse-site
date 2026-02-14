import { CardCover, CardContent, CardTitle, CardSubtitle } from '@/components/musecomponents/cards/Card'
import { MusicCard } from '@/components/musecomponents/cards/MusicCard'
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider'
import { Link } from '@inertiajs/react'

type FavoritesPageProps = {
  tracks: any[]
}

export default function FavoritesPage({ tracks }: FavoritesPageProps) {
  return (
    <div className='flex flex-col lg:justify-center p-10'>
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
    </div>
  )
}
