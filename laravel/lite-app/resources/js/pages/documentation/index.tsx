import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';
import { Separator } from '@radix-ui/react-separator';
import { ExternalLink } from 'lucide-react';

interface Props {
    links: {
        installation: string;
        api: string;
        utilisation: string;
    };
}

export default function Index({ links }: Props) {
    
    const { auth } = usePage<SharedData>().props;
    
    return (
        <>
            <Head title="Documentation" />

            {!auth.user && (
                <header className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl text-sm">
                        <Navbar user={auth.user} />
                    </div>
                </header>
            )}
            
            <div className="flex flex-col items-center lg:justify-center py-10">
                <main className="flex flex-col w-full max-w-xl sm:max-w-xl lg:max-w-2xl xl:max-w-4xl items-start justify-center gap-6 px-10 py-10 ">

                    <h1 className="text-3xl font-bold mb-6"> Documentations </h1>
                    <p>Vous trouverez ci-dessous plusieurs documentations relatives au site.</p>
                    <Separator
                        orientation="horizontal"
                        className="h-px w-full bg-gray-300"
                    />
                    <div className="flex flex-col gap-4 items-start w-full">
                        <Link href={links.installation} className="link-doc">
                            <div className='flex justify-between items-center w-full'>
                                <p className='bold'>Installation</p>
                                <ExternalLink className='h-4 w-4'/>
                            </div>
                        </Link>

                        <Link href={links.api} className="link-doc">
                            <div className='flex justify-between items-center'>
                                <p className='bold'>API</p>
                                <ExternalLink className='h-4 w-4'/>
                            </div>
                        </Link>

                        <Link href={links.utilisation} className="link-doc">
                            <div className='flex justify-between items-center'>
                                <p className='bold'>Utilisation</p>
                                <ExternalLink className='h-4 w-4'/>
                            </div>
                        </Link>

                        <Link href="https://laravel.com/docs/12.x" className="link-doc">
                            <div className='flex justify-between items-center'>
                                <p className='bold'>Laravel</p>
                                <ExternalLink className='h-4 w-4'/>
                            </div>
                        </Link>
                    </div>
                </main>
            </div>

            {!auth.user && (
                <footer className="w-full shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl py-6 text-sm">
                        <Footer />
                    </div>
                </footer>
            )}
        </>
    );
}
