import { Link } from '@inertiajs/react'
import React from 'react'


const Footer = () => {
    return (
        <nav className='flex gap-8 p-4 flex-col sm:flex-row sm:gap-14'>
            {/* Logo */}
            <div className='flex justify-center'>
                <Link href="/">
                    <img src="/logo.svg" alt="Logo Muse" className="w-auto h-8" />
                </Link>
            </div>

            <div className='grid grid-cols-1 gap-6
                            sm:grid-cols-2 sm:gap-8
                            md:grid-cols-3 md:gap-10
                            lg:grid-cols-4 lg:gap-12'>
                {/* legal */}
                <div className='flex flex-col gap-2 text-center sm:text-left'>
                    <a href="/mentionslegales" className="inline-flex min-h-9 items-center font-semibold hover:underline">Légal</a>
                    <div className='flex flex-col text-sm'>
                        <a href="/mentionslegales" className="inline-flex min-h-9 items-center hover:underline">Mentions légales</a>
                    </div>
                </div>

                {/* docs */}
                <div className='flex flex-col gap-2 text-center sm:text-left'>
                    <a href="/documentation" className="inline-flex min-h-9 items-center font-semibold hover:underline">Documentation</a>
                    <div className='flex flex-col text-sm'>
                        <a href="/documentation/api" className="inline-flex min-h-9 items-center hover:underline">API</a>
                        <a href="/documentation/utilisation" className="inline-flex min-h-9 items-center hover:underline">Utilisation</a>
                        <a href="https://laravel.com/docs" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center hover:underline">Laravel</a>
                    </div>
                </div>

                {/* liens */}
                <div className='flex flex-col gap-2 text-center sm:text-left'>
                    <p className="font-semibold">Liens externes</p>
                    <div className='flex flex-col text-sm'>
                        <a href="https://iut-lannion.univ-rennes.fr/" className="inline-flex min-h-9 items-center hover:underline">IUT de Lannion</a>
                    </div>
                </div>

                {/* contact */}
                <div className='flex flex-col gap-2 text-center sm:text-left'>
                    <p className="font-semibold">Contact</p>
                    <div className='flex flex-col text-sm'>
                        <p>7 Rue Édouard Branly 22300 Lannion</p>
                        <a href="/support" className="inline-flex min-h-9 items-center hover:underline">Contacter le support</a>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Footer
