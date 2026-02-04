import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
            <div className="flex min-h-screen flex-col items-center p-6 lg:justify-center lg:p-8">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <Navbar user={auth.user} /> 
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex flex-col max-w-[700px] items-center justify-center gap-6">
                        <div className='flex flex-col gap-2 items-center text-center'>
                            <h1>Bienvenue sur Lite !</h1>
                            <h2>La plateforme de streaming musical n°1 des Côtes d'Armor</h2>
                        </div>
                        <p>Avant de pouvoir accéder à des millions de titres pensez à vous créer un compte ou à vous connecter si vous en avez déjà un.</p>
                        <div className='grid grid-cols-2 gap-2 items-center'>
                            <Link href={register()} className='bouton-primary w-full'>Je me crée un compte</Link>
                            <Link href={login()} className='bouton-secondary w-full'>Je me connecte</Link>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
                <footer className="w-full max-w-[335px] text-sm lg:max-w-4xl">
                    <Footer />
                </footer>
            </div>
        </>
    );
}
