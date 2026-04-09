import { Head } from '@/components/head';
import { TrackSliderSection } from '@/components/musecomponents/sliders/TrackSliderSection';
import AppLayout from '@/layouts/app-layout';

type Track = {
  id: number
  title: string
  artist?: {
    artist_id: number
    artist_name: string
  } | null
  cover: string
}

type RecoProps = {
    recommendedTracks: Track[]
    popularTracks: Track[]
    lastListenRecommendedTracks: Track[]
    lastListen: Track | null
}

const Recommandation = ({recommendedTracks, popularTracks, lastListenRecommendedTracks, lastListen}: RecoProps) => {
    return (
        <AppLayout>
            <Head
                title="Recommandations"
                description="Découvrez des recommandations musicales personnalisées, des titres populaires et des sélections liées à vos dernières écoutes."
            />
                <div className='flex flex-col items-center justify-center '>
                    <div className='flex flex-col lg:justify-center w-full max-w-xl sm:max-w-2xl lg:max-w-4xl gap-6 px-6 py-10'>
                        <h1 className="text-lg font-semibold mb-6">
                            Recommandations
                        </h1>
                        <TrackSliderSection
                            title="Rien que pour vous"
                            tracks={recommendedTracks}
                        />

                        <TrackSliderSection
                            title="Musiques populaires"
                            tracks={popularTracks}
                        />

                        {lastListen && (
                            <TrackSliderSection
                                title={`Parce que vous avez écouté ${lastListen.title}`}
                                tracks={lastListenRecommendedTracks}
                            />
                        )}
                    </div>
                </div>
        </AppLayout>
    )
}

export default Recommandation;
