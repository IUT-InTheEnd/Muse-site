import { Head, Link } from '@inertiajs/react';
import {
    CardCover,
    CardSubtitle,
} from '@/components/musecomponents/cards/Card';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider';
import { proxyUrl } from '@/components/proxy';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { login, register } from '@/routes';

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
    const { playTrack } = useMusicPlayer();

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
                                <MusicSlider title="Rien que pour vous">
                                    {recommendedTracks.map((track) => (
                                        <MusicCard
                                            key={track.id}
                                            trackId={track.id}
                                            showPlayButton={false}
                                            className="cursor-pointer"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(
                                                        `/test-music-player?id=${encodeURIComponent(track.id)}`,
                                                    );
                                                    if (!res.ok) {
                                                        throw new Error(
                                                            `HTTP ${res.status}`,
                                                        );
                                                    }

                                                    const data =
                                                        await res.json();
                                                    playTrack({
                                                        id: track.id,
                                                        src:
                                                            proxyUrl(
                                                                data.url,
                                                            ) ?? '',
                                                        title: data.title,
                                                        artist: data.artist,
                                                        artistid: data.artistid,
                                                        artwork: proxyUrl(
                                                            data.artwork,
                                                        ),
                                                    });
                                                } catch (err) {
                                                    console.error(err);
                                                    void alert(
                                                        'Impossible de charger la musique.',
                                                    );
                                                }
                                            }}
                                        >
                                            <CardCover
                                                src={
                                                    proxyUrl(track.cover) ||
                                                    '/images/default-artist.jpg'
                                                }
                                            />
                                            <CardContent>
                                                <CardTitle>{track.title}</CardTitle>
                                                <CardSubtitle>
                                                    {track.artist ||
                                                        'Artiste inconnu'}
                                                </CardSubtitle>
                                            </CardContent>
                                        </MusicCard>
                                    ))}
                                </MusicSlider>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
