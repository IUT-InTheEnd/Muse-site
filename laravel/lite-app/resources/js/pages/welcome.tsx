import { Head, Link } from '@inertiajs/react';
import { NewTracksSection } from '@/components/musecomponents/sliders/NewTracksSection';
import { TrackSliderSection } from '@/components/musecomponents/sliders/TrackSliderSection';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

type RecommendedTrack = {
    id: number;
    title: string;
    artist?: string | null;
    cover?: string | null;
};

type WelcomeProps = {
    recommendedTracks?: RecommendedTrack[];
    newTracks?: RecommendedTrack[];
};

export default function Welcome({
    recommendedTracks = [],
    newTracks = [],
}: WelcomeProps) {
    return (
        <>
            <Head title="Welcome"></Head>
            <div className="flex flex-col items-center justify-center">
                <div
                    className="relative flex min-h-[calc(100vh-5rem-11rem)] w-full items-center justify-center bg-cover bg-center bg-no-repeat opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0"
                    style={{ backgroundImage: "url('/images/guy2.jpg')" }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-black/70"></div>

                    <main className="relative z-10 flex w-full flex-col items-center justify-center">
                        <div className="flex w-full max-w-xl flex-col gap-6 px-6 py-10 sm:max-w-2xl lg:max-w-4xl lg:justify-center">
                            <div className="flex flex-col gap-2">
                                <div className="flex max-w-md flex-col gap-2">
                                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                        Bienvenue sur Lite !
                                    </h1>
                                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                                        La plateforme de streaming musical n°1 des
                                        Côtes d'Armor
                                    </h2>
                                </div>

                                <p className="max-w-md text-sm text-white sm:text-base">
                                    Accédez à des millions de
                                    titres &mdash; connectez vous pour une meilleure expérience
                                </p>

                                <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Button className="w-full">
                                        <Link href={register()}>
                                            Créer un compte
                                        </Link>
                                    </Button>
                                    <Button
                                        className="w-full border-white"
                                        variant={'secondary'}
                                    >
                                        <Link href={login()} className="text-white">
                                            Se connecter
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <TrackSliderSection
                                title="Rien que pour vous"
                                tracks={recommendedTracks}
                            />

                            <NewTracksSection tracks={newTracks} />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
