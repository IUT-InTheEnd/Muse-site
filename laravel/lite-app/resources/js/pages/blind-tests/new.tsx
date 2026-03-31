import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, Save, Sparkles } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { ArtistAutocomplete, type BlindTestArtistOption } from '@/components/blind-tests/artist-autocomplete';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SharedData } from '@/types';

type GenreOption = {
    id: number;
    title: string;
    parent_id: number | null;
    top_level: boolean;
};

type LanguageOption = {
    id: number;
    label: string;
    code?: string | null;
};

type GenerationConfigOption = {
    value: string;
    label: string;
};

type Props = {
    genres: GenreOption[];
    languages: LanguageOption[];
    generationConfig: {
        popularities: GenerationConfigOption[];
        vocalTypes: GenerationConfigOption[];
    };
};

type BlindTestFormData = {
    count: string;
    save_playlist: boolean;
    playlist_name: string;
    filters: {
        year_min: string;
        year_max: string;
        genre_ids: number[];
        artist_ids: number[];
        popularity: string;
        vocal_type: string;
        language_ids: number[];
    };
};

function toggleNumericSelection(values: number[], value: number): number[] {
    return values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value];
}

export default function BlindTestNew({
    genres,
    languages,
    generationConfig,
}: Props) {
    const { blindTest, errors } = usePage<SharedData>().props;
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [genreSearch, setGenreSearch] = useState('');
    const [languageSearch, setLanguageSearch] = useState('');
    const [selectedArtists, setSelectedArtists] = useState<BlindTestArtistOption[]>([]);

    const { data, setData, post, processing } = useForm<BlindTestFormData>({
        count: '10',
        save_playlist: false,
        playlist_name: '',
        filters: {
            year_min: '',
            year_max: '',
            genre_ids: [],
            artist_ids: [],
            popularity: '',
            vocal_type: 'indifferent',
            language_ids: [],
        },
    });

    const filteredGenres = useMemo(() => {
        const query = genreSearch.trim().toLowerCase();
        if (query === '') {
            return genres;
        }

        return genres.filter((genre) => genre.title.toLowerCase().includes(query));
    }, [genreSearch, genres]);

    const filteredLanguages = useMemo(() => {
        const query = languageSearch.trim().toLowerCase();
        if (query === '') {
            return languages;
        }

        return languages.filter((language) => language.label.toLowerCase().includes(query));
    }, [languageSearch, languages]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/blind-tests/generate', {
            preserveScroll: true,
            transform: (currentData) => ({
                ...currentData,
                count: Number.parseInt(currentData.count, 10),
                playlist_name: currentData.playlist_name.trim(),
                filters: {
                    year_min: currentData.filters.year_min ? Number.parseInt(currentData.filters.year_min, 10) : null,
                    year_max: currentData.filters.year_max ? Number.parseInt(currentData.filters.year_max, 10) : null,
                    genre_ids: currentData.filters.genre_ids,
                    artist_ids: selectedArtists.map((artist) => artist.id),
                    popularity: currentData.filters.popularity || null,
                    vocal_type: currentData.filters.vocal_type,
                    language_ids: currentData.filters.language_ids,
                },
            }),
        });
    };

    return (
        <>
            <Head title="Générer un blind test" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
                <section className="grid gap-8 rounded-3xl border bg-card p-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm text-primary">
                            <Sparkles className="size-4" />
                            <span>Génération blind test</span>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Préparer une sélection prête pour la future lecture blind test
                            </h1>
                            <p className="max-w-2xl text-sm text-muted-foreground">
                                Cette page ne gère que la génération des morceaux. La lecture blind test sera branchée sur
                                la session navigateur éphémère ou sur la playlist persistée.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-5">
                        <h2 className="text-sm font-semibold">Session navigateur</h2>
                        {blindTest?.has_ephemeral && blindTest.ephemeral ? (
                            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <p>{blindTest.ephemeral.track_count} morceaux déjà prêts dans la session du navigateur.</p>
                                <p>Nouvelle génération sans enregistrement : la session sera remplacée.</p>
                                <Button asChild className="mt-2 cursor-pointer">
                                    <a href="/blind-tests/play/ephemeral">Ouvrir l’état prêt pour lecture</a>
                                </Button>
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-muted-foreground">
                                Aucune session blind test éphémère active dans ce navigateur.
                            </p>
                        )}
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="space-y-6 rounded-3xl border bg-card p-8">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="count">Nombre de musiques</Label>
                                <Input
                                    id="count"
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={data.count}
                                    onChange={(event) => setData('count', event.target.value)}
                                />
                                {errors.count && <p className="text-sm text-destructive">{errors.count}</p>}
                            </div>

                            <div className="space-y-2 rounded-2xl border bg-background p-4">
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        id="save_playlist"
                                        checked={data.save_playlist}
                                        onCheckedChange={(checked) => setData('save_playlist', checked === true)}
                                    />
                                    <div className="space-y-1">
                                        <Label htmlFor="save_playlist" className="cursor-pointer">
                                            Enregistrer la playlist
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Sinon, la sélection sera stockée en session navigateur.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {data.save_playlist && (
                            <div className="space-y-2">
                                <Label htmlFor="playlist_name">Nom de la playlist</Label>
                                <Input
                                    id="playlist_name"
                                    value={data.playlist_name}
                                    onChange={(event) => setData('playlist_name', event.target.value)}
                                    placeholder="Blind test du soir"
                                />
                                {errors.playlist_name && <p className="text-sm text-destructive">{errors.playlist_name}</p>}
                            </div>
                        )}

                        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-2xl border bg-background px-5 py-4 text-left"
                                >
                                    <div>
                                        <h2 className="font-semibold">Génération avancée</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Année, genres, artistes, popularité, type vocal et langues.
                                        </p>
                                    </div>
                                    <ChevronDown
                                        className={`size-5 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-8 pt-6">
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="year_min">Année minimale</Label>
                                        <Input
                                            id="year_min"
                                            type="number"
                                            value={data.filters.year_min}
                                            onChange={(event) =>
                                                setData('filters', { ...data.filters, year_min: event.target.value })
                                            }
                                            placeholder="1990"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year_max">Année maximale</Label>
                                        <Input
                                            id="year_max"
                                            type="number"
                                            value={data.filters.year_max}
                                            onChange={(event) =>
                                                setData('filters', { ...data.filters, year_max: event.target.value })
                                            }
                                            placeholder="2020"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-2">
                                    <div className="space-y-3">
                                        <Label htmlFor="genre-search">Genres</Label>
                                        <Input
                                            id="genre-search"
                                            value={genreSearch}
                                            onChange={(event) => setGenreSearch(event.target.value)}
                                            placeholder="Filtrer les genres"
                                        />
                                        <div className="grid max-h-72 gap-2 overflow-y-auto rounded-2xl border bg-background p-4">
                                            {filteredGenres.map((genre) => (
                                                <label key={genre.id} className="flex items-center gap-3 text-sm">
                                                    <Checkbox
                                                        checked={data.filters.genre_ids.includes(genre.id)}
                                                        onCheckedChange={() =>
                                                            setData('filters', {
                                                                ...data.filters,
                                                                genre_ids: toggleNumericSelection(data.filters.genre_ids, genre.id),
                                                            })
                                                        }
                                                    />
                                                    <span>{genre.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="language-search">Langues</Label>
                                        <Input
                                            id="language-search"
                                            value={languageSearch}
                                            onChange={(event) => setLanguageSearch(event.target.value)}
                                            placeholder="Filtrer les langues"
                                        />
                                        <div className="grid max-h-72 gap-2 overflow-y-auto rounded-2xl border bg-background p-4">
                                            {filteredLanguages.map((language) => (
                                                <label key={language.id} className="flex items-center gap-3 text-sm">
                                                    <Checkbox
                                                        checked={data.filters.language_ids.includes(language.id)}
                                                        onCheckedChange={() =>
                                                            setData('filters', {
                                                                ...data.filters,
                                                                language_ids: toggleNumericSelection(
                                                                    data.filters.language_ids,
                                                                    language.id,
                                                                ),
                                                            })
                                                        }
                                                    />
                                                    <span>{language.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Artistes</Label>
                                    <ArtistAutocomplete
                                        selectedArtists={selectedArtists}
                                        onAdd={(artist) => {
                                            const nextArtists = [...selectedArtists.filter((item) => item.id !== artist.id), artist];
                                            setSelectedArtists(nextArtists);
                                            setData('filters', {
                                                ...data.filters,
                                                artist_ids: nextArtists.map((item) => item.id),
                                            });
                                        }}
                                        onRemove={(artistId) => {
                                            const nextArtists = selectedArtists.filter((artist) => artist.id !== artistId);
                                            setSelectedArtists(nextArtists);
                                            setData('filters', {
                                                ...data.filters,
                                                artist_ids: nextArtists.map((artist) => artist.id),
                                            });
                                        }}
                                    />
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Popularité</Label>
                                        <Select
                                            value={data.filters.popularity || 'all'}
                                            onValueChange={(value) =>
                                                setData('filters', {
                                                    ...data.filters,
                                                    popularity: value === 'all' ? '' : value,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Toutes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Toutes</SelectItem>
                                                {generationConfig.popularities.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Type vocal</Label>
                                        <Select
                                            value={data.filters.vocal_type}
                                            onValueChange={(value) =>
                                                setData('filters', { ...data.filters, vocal_type: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {generationConfig.vocalTypes.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    </section>

                    <aside className="space-y-6 rounded-3xl border bg-card p-8">
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold">Résultat attendu</h2>
                            <p className="text-sm text-muted-foreground">
                                La génération compose une sélection mixte entre morceaux connus et inconnus, puis :
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>si l’enregistrement est activé, une playlist classique ordonnée est créée</li>
                                <li>sinon, la sélection remplace la session blind test éphémère du navigateur</li>
                                <li>la lecture blind test sera branchée ensuite sur cette source unique</li>
                            </ul>
                        </div>

                        {errors.blind_test && (
                            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                                {errors.blind_test}
                            </div>
                        )}

                        <div className="rounded-2xl border bg-background p-5">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Save className="size-4" />
                                <span>Résumé de la demande</span>
                            </div>
                            <dl className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Nombre de titres</dt>
                                    <dd>{data.count || '0'}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Mode de sortie</dt>
                                    <dd>{data.save_playlist ? 'Playlist persistée' : 'Session navigateur'}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Genres</dt>
                                    <dd>{data.filters.genre_ids.length}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Artistes</dt>
                                    <dd>{selectedArtists.length}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Langues</dt>
                                    <dd>{data.filters.language_ids.length}</dd>
                                </div>
                            </dl>
                        </div>

                        <Button type="submit" disabled={processing} className="w-full cursor-pointer">
                            {processing ? 'Génération...' : 'Générer le blind test'}
                        </Button>
                    </aside>
                </form>
            </div>
        </>
    );
}
