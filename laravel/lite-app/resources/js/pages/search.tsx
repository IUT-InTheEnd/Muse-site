import type { SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import MusicPlayer from '@/components/ui/musicplayer';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { proxyUrl } from '@/components/proxy';

type Props = {
  listeMusiques: Array<Record<string, any>>;
};

export default function search({ listeMusiques }: Props) {
    const [showMusicPlayer, setShowMusicPlayer] = useState(false);

    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const [visibleCount, setVisibleCount] = useState(20);

    const { filters } = usePage().props as { filters?: { q?: string } };

    useEffect(() => {
    const handleScroll = () => {
        if (
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
        ) {
            setVisibleCount((prev) => prev + 20);
        }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
}, []);

    const toggleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const musiquesTriees = [...listeMusiques].sort((a, b) => {
        if (!sortColumn) return 0;
        
        let valueA = a[sortColumn];
        let valueB = b[sortColumn];
        
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
        
        return 0;
    });

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
                <form method="get" action="/search" className="flex w-full justify-center h-[180px] items-center">
                    <input
                        type="text"
                        name="q"
                        placeholder="Rechercher..."
                        className="px-4 py-2 border rounded w-100"
                        defaultValue={filters?.q || ''}
                    />
                    <Button type="submit" className="ml-2">Rechercher</Button>
                </form>
                <table className="w-5xl border-collapse justify-center m-auto mt-10 mb-50">
                    <thead>
                        <tr className="border-b text-left text-sm">
                            <th className="py-3 w-100 cursor-pointer" onClick={() => toggleSort("track_title")}>TITRE
                                <span className="inline-block w-4 text-center ml-1">
                                    {sortColumn === "track_title" ? (sortDirection === "asc" ? "▲" : "▼"): <span className="opacity-0"></span>}
                                </span>
                            </th>
                            <th className="py-1 text-right cursor-pointer" onClick={() => toggleSort("track_listens")}>LECTURES
                                <span className="inline-block w-4 text-center ml-1">
                                    {sortColumn === "track_listens" ? (sortDirection === "asc" ? "▲" : "▼"): <span className="opacity-0"></span>}
                                </span>
                            </th>
                            <th className="py-2 text-right cursor-pointer" onClick={() => toggleSort("track_favorites")}>FAVORITES
                                <span className="inline-block w-4 text-center ml-1">
                                    {sortColumn === "track_favorites" ? (sortDirection === "asc" ? "▲" : "▼"): <span className="opacity-0"></span>}
                                </span>
                            </th>
                            <th className="py-3 w-50 text-right pr-3 cursor-pointer" onClick={() => toggleSort("track_duration")}>DURÉE
                                <span className="inline-block w-4 text-center ml-1">
                                    {sortColumn === "track_duration" ? (sortDirection === "asc" ? "▲" : "▼"): <span className="opacity-0"></span>}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {musiquesTriees.slice(0, visibleCount).map((element, index) => (
                            <tr key={element.track_id} className="hover:bg-gray-500/20 transition hover:rounded-md" onClick={async () => {
                        try {
                            setShowMusicPlayer(true);
                            const res = await fetch(
                                `/test-music-player?id=${encodeURIComponent(element.track_id)}`,
                            );
                            if (!res.ok)
                                throw new Error(`HTTP ${res.status}`);
                            const data = await res.json();
                            const track = {
                                src: proxyUrl(data.url) ?? '',
                                title: data.title,
                                artist: data.artist,
                                artwork: proxyUrl(data.artwork),
                            };
                            window.dispatchEvent(
                                new CustomEvent('playTrack', {
                                    detail: track,
                                }),
                            );
                        } catch (err) {
                            console.error(err);
                            void alert('Impossible de charger la musique.');
                        }
                    }}>
                                <td className="py-3 flex">
                                    <img className="w-12 h-12" src={proxyUrl(element.track_image_file)} />
                                    <div>
                                        <div className="ml-4 pointer-events-none">
                                            {element.track_title}
                                        </div>
                                        <a className="ml-4 text-sm text-gray-500" href={`artiste/${element.artist.artist_id}`}>
                                            {element.artist.artist_name}
                                        </a>
                                    </div>
                              </td>
                              <td className="py-3 text-right font-mono pointer-events-none">
                                  {element.track_listens ? element.track_listens.toLocaleString("fr-FR") : "???"}
                              </td>
                              <td className="py-3 text-right font-mono pointer-events-none">
                                  {element.track_favorites ? element.track_favorites.toLocaleString("fr-FR") : 0}
                              </td>
                              <td className="py-3 text-right font-mono pr-3 pointer-events-none">
                                  {`${Math.floor(element.track_duration / 3600) == 0 ? '' : `${Math.floor(element.track_duration / 3600)}:`}${Math.floor(element.track_duration / 60)}:${element.track_duration % 60}`}
                              </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );  
}