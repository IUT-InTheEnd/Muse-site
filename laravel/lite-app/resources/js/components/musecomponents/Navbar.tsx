import { Link } from '@inertiajs/react';
import { ChevronsUpDown, Menu, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import type { User } from '@/types';
import { Button } from '../ui/button';

type NavbarProps = {
    user?: User | null;
};

const Navbar = ({ user }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="gap-4 p-6 sm:p-4">
            <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <img src="/logo.svg" alt="logo" className="h-8" />
                    </Link>

                    {user && (
                        <>
                            <div className="relative hidden items-center sm:flex">
                                <form method="get" action="/search" className="w-full">
                                    <input
                                        type="text"
                                        name="q"
                                        placeholder="Rechercher..."
                                        className="w-64 rounded-full border border-gray-300 py-1 pl-3 pr-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </form>
                                <Search className="absolute top-1/2 right-1 -translate-y-1/2 p-1" />
                            </div>

                            <div className="hidden gap-4 text-sm sm:flex">
                                <a href="/" className="hover:underline">
                                    Accueil
                                </a>
                                <a href="/favoris" className="hover:underline">
                                    Favoris
                                </a>
                                <a href="/user/playlists" className="hover:underline">
                                    Playlists
                                </a>
                                <a
                                    href="/decouverte"
                                    className="hover:underline"
                                >
                                    Découvrir
                                </a>
                            </div>
                        </>
                    )}
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="hidden items-center gap-4 sm:flex">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none dark:hover:bg-muted">
                                        <UserInfo user={user} />
                                        <ChevronsUpDown className="size-4 text-gray-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 rounded-lg"
                                    align="end"
                                    side="bottom"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-4 sm:flex">
                            <a href="/register" className="hover:underline">
                                Inscription
                            </a>
                            <Button>
                                <Link href="/login" className="text-white">
                                    Connexion
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* bouton menu burger */}
                    <button
                        className="rounded-md p-2 hover:bg-gray-200 sm:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* mobile */}
            {isOpen && (
                <div className="mt-4 flex flex-col gap-4 sm:hidden">
                    {user && (
                        <>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="w-full rounded-full border border-gray-300 py-1 pr-10 pl-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <a href="/" className="hover:underline">
                                Accueil
                            </a>
                            <a href="/favoris" className="hover:underline">
                                Favoris
                            </a>
                            <a href="/user/playlists" className="hover:underline">
                                Playlists
                            </a>
                            <a href="/decouverte" className="hover:underline">
                                Découvrir
                            </a>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none dark:hover:bg-muted">
                                        <UserInfo user={user} />
                                        <ChevronsUpDown className="size-4 text-gray-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 rounded-lg"
                                    align="start"
                                    side="bottom"
                                >
                                    <UserMenuContent user={user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                    {!user && (
                        <>
                            <a href="/register" className="hover:underline">
                                Inscription
                            </a>
                            <Button>
                                <Link href="/login" className="text-white">
                                    Connexion
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
