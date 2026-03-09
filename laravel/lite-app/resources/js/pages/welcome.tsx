import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { login, register } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome"></Head>
            <div className="flex flex-col items-center lg:justify-center">
                <div className="relative flex w-full min-h-[calc(100vh-5rem-11rem)] items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/guy2.jpg')" }}>
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
                                    Créer un compte
                                </Link>
                            </Button>
                            <Button className="w-full border-white" variant={"secondary"}>
                                <Link href={login()} className="text-white">
                                    Se connecter
                                </Link>
                            </Button>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

