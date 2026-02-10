import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';
import { Button } from '@/components/ui/button';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { CardCover, CardTitle, CardContent, CardSubtitle} from '@/components/musecomponents/cards/Card';
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center lg:justify-center">
                <header className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl text-sm">
                        <Navbar user={auth.user} />
                    </div>
                </header>
                <div className="relative flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/guy2.jpg')" }}>
                    <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>

                    <main className="relative z-10 flex flex-col max-w-md sm:max-w-lg lg:max-w-xl items-center justify-center gap-6 text-center px-6 py-10">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-white text-2xl sm:text-3xl font-bold">
                                Bienvenue sur Lite !
                            </h1>
                            <h2 className="text-white text-lg sm:text-xl font-semibold">
                                La plateforme de streaming musical n°1 des Côtes d'Armor
                            </h2>
                        </div>

                        <p className="text-white text-sm sm:text-base max-w-md">
                            Avant de pouvoir accéder à des millions de titres pensez à vous créer un compte ou à vous connecter si vous en avez déjà un.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                            <Button className="w-full">
                                <Link href={register()}>
                                    Je me crée un compte
                                </Link>
                            </Button>
                            <Button className="w-full border-white" variant={"secondary"}>
                                <Link href={login()} className="text-white">
                                    Je me connecte
                                </Link>
                            </Button>
                        </div> 
                    </main>
                </div>

                <footer className="w-full shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl py-6 text-sm">
                        <Footer />
                    </div>
                </footer>
            </div>
        </>
    );
}

