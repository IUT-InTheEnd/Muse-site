import { Link } from '@inertiajs/react';
import { ChevronsUpDown, Menu, Search, Settings, X } from 'lucide-react';
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
                        <img src="/logo.svg" alt="Logo Muse" className="h-8" />
                    </Link>

                    <div className="relative hidden items-center sm:flex">
                        <form method="get" action="/search" className="w-full">
                            <input
                                type="text"
                                name="q"
                                placeholder="Rechercher..."
                                className="w-64 rounded-full border border-gray-300 py-1 pr-3 pl-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </form>
                        <Search
                            className="absolute top-1/2 right-1 -translate-y-1/2 p-1"
                            aria-hidden="true"
                        />
                    </div>
                    {user && (
                        <>
                            <div className="hidden gap-4 text-sm sm:flex">
                                <a href="/" className="hover:underline">
                                    Accueil
                                </a>
                                <a
                                    href="/favorites"
                                    className="hover:underline"
                                >
                                    Favoris
                                </a>
                                <a
                                    href="/user/playlists"
                                    className="hover:underline"
                                >
                                    Playlists
                                </a>
                                <a
                                    href="/page-recommandations"
                                    className="hover:underline"
                                >
                                    Mes recommandations
                                </a>
                                <a
                                    href="/blind-tests/new"
                                    className="hover:underline"
                                >
                                    Blind test
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
                                    <button className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none dark:hover:bg-muted">
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
                            <Link
                                href="/register"
                                className="inline-flex min-h-9 items-center py-1 hover:underline"
                            >
                                Inscription
                            </Link>
                            <Button asChild>
                                <Link href="/login" className="min-h-9 cursor-pointer">
                                    Connexion
                                </Link>
                            </Button>
                            <Link
                                href="/settings"
                                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-muted"
                                aria-label="Paramètres"
                            >
                                <Settings className="size-5" />
                            </Link>
                        </div>
                    )}

                    {/* bouton menu burger */}
                    <button
                        type="button"
                        className="rounded-md p-2 hover:bg-gray-200 sm:hidden cursor-pointer"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                        aria-expanded={isOpen}
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
                            <a href="/favorites" className="hover:underline">
                                Favoris
                            </a>
                            <a
                                href="/user/playlists"
                                className="hover:underline"
                            >
                                Playlists
                            </a>
                            <a
                                href="/page-recommandations"
                                className="hover:underline"
                            >
                                Mes recommandations
                            </a>
                            <a href="/blind-tests/new" className="hover:underline">
                                Blind test
                            </a>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-100 focus:outline-none dark:hover:bg-muted">
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
                            <Link
                                href="/register"
                                className="inline-flex min-h-9 items-center py-1 hover:underline cursor-pointer"
                            >
                                Inscription
                            </Link>
                            <Button asChild>
                                <Link href="/login" className="min-h-9 cursor-pointer text-primary-foreground">
                                    Connexion
                                </Link>
                            </Button>
                            <Link
                                href="/settings"
                                className="flex items-center gap-2 hover:underline"
                            >
                                <Settings className="size-4" />
                                Paramètres
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
