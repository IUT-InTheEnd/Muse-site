import { Head, Link, usePage } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import { ExternalLink } from 'lucide-react';
import type { SharedData } from '@/types';

interface Props {
    links: {
        installation: string;
        api: string;
        utilisation: string;
    };
}

export default function Index({ links }: Props) {

    return (
        <>
            <Head title="Documentation" />

            <div className="flex py-12 flex-col items-center lg:justify-center">
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

                        <Link href="https://laravel.com/docs" className="link-doc">
                            <div className='flex justify-between items-center'>
                                <p className='bold'>Laravel</p>
                                <ExternalLink className='h-4 w-4'/>
                            </div>
                        </Link>
                    </div>
                </main>
            </div>
        </>
    );
}
