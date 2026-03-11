import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { TrackList, type SortColumn, type SortDirection} from '@/components/musecomponents/TrackList';
import { Button } from '@/components/ui/button';
import { ArtistSlider } from '@/components/musecomponents/sliders/ArtistSlider';
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard';
import { CardCover, CardTitle } from '@/components/musecomponents/cards/Card';
import { proxyUrl } from '@/components/proxy';

type Props = {
    listeMusiques: Array<Record<string, any>>;
    listeArtistes: Array<Record<string, any>>;
    langues: Array<Record<string, any>>;
    genres: Array<Record<string, any>>;
    testLangues: Array<string>;
    testGenres: Array<string>;
};

export default function search({ listeMusiques, listeArtistes, langues, genres, testLangues, testGenres }: Props) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const [showFilters, setShowFilters] = useState(false);

    const [selectedGenres, setSelectedGenres] = useState<string[]>(() => (testGenres || []).map(String));
    const [selectedLangues, setSelectedLangues] = useState<string[]>(() => (testLangues || []).map(String));

    useEffect(() => {
        setSelectedGenres((testGenres || []).map(String));
    }, [testGenres]);

    useEffect(() => {
        setSelectedLangues((testLangues || []).map(String));
    }, [testLangues]);

    const handleGenreChange = (genreId: string) => {
        setSelectedGenres((prev) => {
            const next = prev.includes(genreId) ? prev.filter((g) => g !== genreId) : [...prev, genreId];
            return next;
        });
    };
    const handleLangueChange = (langueId: string) => {
        setSelectedLangues((prev) => {
            const next = prev.includes(langueId) ? prev.filter((l) => l !== langueId) : [...prev, langueId];
            return next;
        });
    };

    console.log(testLangues)

    console.log(testGenres)

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
            <Head title="Recherche"></Head>
            <div className="flex min-h-screen flex-col items-center lg:justify-center">
                <form method="get" action="/search" className="w-full flex flex-col items-center mt-20">
                    {/* Ligne principale : icône + champ + bouton */}
                    <div className="flex items-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" onClick={() => setShowFilters(!showFilters)} className="dark:fill-white light:fill-dark mr-3 cursor-pointer lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>
                        <input type="text" name="q" placeholder="ex : Linkin Park" className="w-100 rounded border px-4 py-2 dark:border-white" defaultValue={filters?.q || ''} />
                        <Button type="submit" className="ml-2">Rechercher</Button>
                    </div>

                    {/* Bloc filtres, sous la ligne principale */}
                    {showFilters && (
                        <div className="border rounded p-4 w-250 light:bg-gray-50 dark:bg-gray-800 grid grid-cols-5 gap-2 dark:border-white">
                        {genres.map((genre) => (
                            <label key={genre.genre_id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="genres[]"
                                    value={genre.genre_id}                                // envoie l'id
                                    checked={selectedGenres.includes(String(genre.genre_id))} // compare par id
                                    onChange={() => handleGenreChange(String(genre.genre_id))}
                                />
                                {genre.genre_title}
                           </label>
                        ))}
                        </div>
                    )}
                    {showFilters && (
                        <div className="border rounded p-4 w-250 dark:bg-gray-800 dark:border-white grid grid-cols-5 gap-2">
                        {langues.map((langue) => (
                            <label key={langue.language_id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="langues[]"
                                    value={langue.language_id}
                                    checked={selectedLangues.includes(String(langue.language_id))}
                                    onChange={() => handleLangueChange(String(langue.language_id))}
                                />
                                {langue.language_label}
                            </label>
                        ))}
                        </div>
                    )}
                </form>
                <ArtistSlider>
                    {listeArtistes.map((artist) => (
                        <ArtistCard key={artist.artist_id} className="w-40">
                            <Link href={`/artiste/${artist.artist_id}`}>
                                <CardCover src={proxyUrl(artist.artist_image_file)} rounded onError={(e) => {e.currentTarget.src = "/images/default-artist.jpg";}} />
                                <CardTitle>{artist.artist_name}</CardTitle>
                            </Link>
                        </ArtistCard>
                    ))}
                </ArtistSlider>

                {/* En-tetes de tri */}
                <div className="m-auto mt-10 w-5xl">
                    <div className="flex border-b px-3 py-3 text-left text-sm">
                        <div className="w-10"></div> {/* Espace pour index */}
                        <div className="ml-15 w-[400px] cursor-pointer" onClick={() => toggleSort('track_title')}>
                            TITRE
                            <span className="ml-1 inline-block text-center">
                                {sortColumn === 'track_title' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-[120px] cursor-pointer text-right" onClick={() => toggleSort('track_listens')}>
                            LECTURES
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_listens' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-[130px] cursor-pointer text-right" onClick={() => toggleSort('track_favorites')}>
                            FAVORITES
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_favorites' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-[140px] cursor-pointer pr-3 text-right" onClick={() => toggleSort('track_duration')}>
                            DURÉE
                            <span className="ml-1 inline-block w-4 text-center">
                                {sortColumn === 'track_duration' ? (sortDirection === 'asc' ? ('▲') : ('▼')) : ( <span className="opacity-0">▲</span> )}
                            </span>
                        </div>
                        <div className="w-20 cursor-pointer pr-3 text-right" onClick={() => toggleSort('track_duration')}></div>
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
