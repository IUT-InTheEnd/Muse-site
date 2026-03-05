import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    TrackList,
    type SortColumn,
    type SortDirection,
} from '@/components/musecomponents/TrackList';
import { Button } from '@/components/ui/button';

type Props = {
    listeMusiques: Array<Record<string, any>>;
};

export default function search({ listeMusiques }: Props) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [visibleCount, setVisibleCount] = useState(20);

    const { filters } = usePage().props as { filters?: { q?: string } };

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight - 200
            ) {
                setVisibleCount((prev) => prev + 20);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Transformer les donnees pour TrackList
    const trackListItems = listeMusiques.map((element) => ({
        track: {
            track_id: element.track_id,
            track_title: element.track_title,
            track_image_file: element.track_image_file,
            track_duration: element.track_duration,
            track_listens: element.track_listens,
            track_favorites: element.track_favorites,
        },
        artist: element.artist
            ? {
                  artist_id: element.artist.artist_id,
                  artist_name: element.artist.artist_name,
              }
            : undefined,
    }));

    return (
        <>
            <Head title="Recherche avancée">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center lg:justify-center">
                <form
                    method="get"
                    action="/search"
                    className="flex h-[180px] w-full items-center justify-center"
                >
                    <input
                        type="text"
                        name="q"
                        placeholder="Rechercher..."
                        className="w-100 rounded border px-4 py-2"
                        defaultValue={filters?.q || ''}
                    />
                    <Button type="submit" className="ml-2">
                        Rechercher
                    </Button>
                </form>

                {/* En-tetes de tri */}
                <div className="m-auto mt-10 w-5xl">
                    <div className="flex border-b px-3 py-3 text-left text-sm">
                        <div className="w-20"></div> {/* Espace pour index */}
                        <div className="flex-1 cursor-pointer" onClick={() => toggleSort('track_title')}>
                            TITRE
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_title' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-24 cursor-pointer text-right" onClick={() => toggleSort('track_listens')}>
                            LECTURES
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_listens' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-24 cursor-pointer text-right" onClick={() => toggleSort('track_favorites')}>
                            FAVORITES
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_favorites' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div
                            className="w-20 cursor-pointer pr-3 text-right"
                            onClick={() => toggleSort('track_duration')}
                        >
                            DURÉE
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_duration' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-24"></div> {/* Espace pour actions */}
                    </div>

                    <TrackList
                        tracks={trackListItems}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        limit={visibleCount}
                        showIndex={true}
                        className="mb-50"
                    />
                </div>
            </div>
        </>
    );
}
