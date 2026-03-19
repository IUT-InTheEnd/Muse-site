import { Head, Link } from '@inertiajs/react';
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard';
import {
    CardCover,
    CardSubtitle,
} from '@/components/musecomponents/cards/Card';
import { ArtistSlider } from '@/components/musecomponents/sliders/ArtistSlider';
import { NewTracksSection } from '@/components/musecomponents/sliders/NewTracksSection';
import { TrackSliderSection } from '@/components/musecomponents/sliders/TrackSliderSection';
import { proxyUrl } from '@/components/proxy';
import { CardContent, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

type Track = {
  id: number
  title: string
  artist?: {
    artist_id: number
    artist_name: string
  } | null
  cover: string
}

type Artist = {
  id: number
  name: string
  cover: string
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accueil" />
                <div className='flex flex-col items-center justify-center '>
                    <div className='flex flex-col lg:justify-center w-full max-w-xl sm:max-w-2xl lg:max-w-4xl gap-6 px-6 py-10'>
                        <h1 className="text-lg font-semibold mb-6">
                            Bonjour {user.name}
                        </h1>
                        <TrackSliderSection
                            title="Titres récemment écoutés"
                            tracks={recentTracks}
                        />

                        <TrackSliderSection
                            title="Rien que pour vous"
                            tracks={recommendedTracks}
                        />

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

                        <NewTracksSection tracks={newTracks} />
                    </div>
                </div>
        </AppLayout>
    );
}
