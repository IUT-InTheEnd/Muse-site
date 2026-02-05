import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';
import { Button } from '@/components/ui/button';

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
                <header className="m-2 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <Navbar user={auth.user} />
                </header>
                <div className="relative flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/guy2.jpg')" }}>
                    <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

                    <main className="relative z-10 flex flex-col max-w-[700px] items-center justify-center gap-6 text-center px-4">
                        <div className="flex flex-col gap-2">
                            <h1 style={{ color: 'white' }}>Bienvenue sur Lite !</h1>
                            <h2 style={{ color: 'white' }}>La plateforme de streaming musical n°1 des Côtes d'Armor</h2>
                        </div>

                        <p style={{ color: 'white' }}>
                            Avant de pouvoir accéder à des millions de titres pensez à vous créer
                            un compte ou à vous connecter si vous en avez déjà un.
                        </p>

                        <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                            <Button className='w-full'>
                                <Link href={register()}>
                                    Je me crée un compte
                                </Link>
                            </Button>
                            <Button className='w-full border-white' variant={"secondary"}>
                                <Link href={login()} className='text-white'>
                                    Je me connecte
                                </Link>
                            </Button>   
                        </div>
                    </main>
                </div>
                
                <footer className="w-full max-w-[335px] text-sm lg:max-w-4xl py-6">
                    <Footer />
                </footer>
            </div>
        </>
    );
}
