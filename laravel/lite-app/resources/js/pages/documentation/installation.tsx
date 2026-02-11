import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';
import { Separator } from '@radix-ui/react-separator';

export default function Installation() {

    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Documentation – Installation" />

            <div className="flex flex-col items-center lg:justify-center py-10">
                <main className="flex flex-col w-full max-w-xl sm:max-w-xl lg:max-w-2xl xl:max-w-4xl items-start justify-center gap-10 px-6 py-10 ">

                    <h1 className="text-3xl font-bold mb-6"> Installation </h1>
                    <div className='flex flex-col gap-4 w-full'>
                        <h2>Sommaire</h2>
                        <Separator
                            orientation="horizontal"
                            className="h-px w-full bg-gray-300"
                        />
                        <div className="flex flex-col gap-4 items-start w-full">
                            <Link href="#preparation-du-workspace" className="link-doc">
                                <p>1. Préparation du workspace</p>
                            </Link>

                            <Link href="#installation" className="link-doc">
                                <p>2. Installation</p>
                            </Link>

                            <Link href="#tests" className="link-doc">
                                <p>3. Tests</p>
                            </Link>
                        </div>
                    </div>

                    <article id='preparation-du-workspace' className='gap-2'>
                        <h3>Préparation du workspace</h3>
                        <p>Avant de commencer l'installation, assurez-vous d'avoir un environnement de développement configuré.</p>
                    </article>

                    <article id='installation' className='gap-2'>
                        <h3>Installation</h3>
                        <p>Pour installer les dépendances, exécutez la commande suivante :</p>
                        <pre><code>npm install</code></pre>
                    </article>

                    <article id='tests' className='gap-2'>
                        <h3>Tests</h3>
                        <p>Pour exécuter les tests, utilisez la commande suivante :</p>
                        <pre><code>npm test</code></pre>
                    </article>
                </main>
            </div>
        </>
    );
}
