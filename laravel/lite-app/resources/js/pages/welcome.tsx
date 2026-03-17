import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';
import { Head, Link } from '@inertiajs/react';

type RecommendedTrack = {
    id: number;
    title: string;
    artist?: string | null;
    cover?: string | null;
};

type WelcomeProps = {
    recommendedTracks?: RecommendedTrack[];
};

export default function Welcome({ recommendedTracks = [] }: WelcomeProps) {
    return (
        <>
            <Head title="Welcome"></Head>
            <div className="flex flex-col items-center lg:justify-center">
                <div
                    className="relative flex min-h-[calc(100vh-5rem-11rem)] w-full items-center justify-center bg-cover bg-center bg-no-repeat opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0"
                    style={{ backgroundImage: "url('/images/guy2.jpg')" }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-black/70"></div>

                    <main className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center gap-8 px-6 py-10 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex max-w-md flex-col gap-2 text-center lg:text-left">
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    Bienvenue sur Lite !
                                </h1>
                                <h2 className="text-lg font-semibold text-white sm:text-xl">
                                    La plateforme de streaming musical n°1 des
                                    Côtes d'Armor
                                </h2>
                            </div>

                            <p className="max-w-md text-center text-sm text-white sm:text-base lg:text-left">
                                Avant de pouvoir accéder à des millions de
                                titres pensez à vous créer un compte ou à vous
                                connecter si vous en avez déjà un.
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

                        {recommendedTracks.length > 0 && (
                            <section className="w-full max-w-xl rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-sm">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        Aperçu des recommandations
                                    </h3>
                                    <p className="text-sm text-white/75">
                                        Une sélection générée pour les visiteurs
                                        sans compte.
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    {recommendedTracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                                        >
                                            <img
                                                src={
                                                    track.cover ||
                                                    '/images/default-artist.jpg'
                                                }
                                                alt={track.title}
                                                className="h-14 w-14 rounded-md object-cover"
                                            />
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-white">
                                                    {track.title}
                                                </p>
                                                <p className="truncate text-xs text-white/70">
                                                    {track.artist ||
                                                        'Artiste inconnu'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
