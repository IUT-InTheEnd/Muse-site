import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { proxyUrl } from '@/components/proxy';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type BlindTestArtistOption = {
    id: number;
    name: string;
    image?: string | null;
};

type Props = {
    selectedArtists: BlindTestArtistOption[];
    onAdd: (artist: BlindTestArtistOption) => void;
    onRemove: (artistId: number) => void;
};

export function ArtistAutocomplete({
    selectedArtists,
    onAdd,
    onRemove,
}: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<BlindTestArtistOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        const timeout = window.setTimeout(async () => {
            setLoading(true);

            try {
                const response = await fetch(`/blind-tests/artists?q=${encodeURIComponent(trimmedQuery)}`);
                if (!response.ok) {
                    return;
                }

                const payload = await response.json();
                if (!cancelled) {
                    setResults(payload.artists ?? []);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timeout);
        };
    }, [query]);

    const selectedArtistIds = new Set(selectedArtists.map((artist) => artist.id));

    return (
        <div className="space-y-3">
            <div className="relative">
                <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Rechercher un artiste"
                    className="pr-10"
                />
                <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {selectedArtists.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedArtists.map((artist) => (
                        <Badge key={artist.id} variant="secondary" className="gap-2 px-3 py-1">
                            <span>{artist.name}</span>
                            <button
                                type="button"
                                onClick={() => onRemove(artist.id)}
                                className="cursor-pointer"
                                aria-label={`Retirer ${artist.name}`}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="max-h-60 overflow-y-auto rounded-lg border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Recherche en cours...</span>
                    </div>
                ) : results.length > 0 ? (
                    results.map((artist) => (
                        <div
                            key={artist.id}
                            className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <img
                                    src={proxyUrl(artist.image) || '/images/default-artist.jpg'}
                                    alt={artist.name}
                                    className="size-10 rounded-full object-cover"
                                />
                                <span className="truncate text-sm font-medium">{artist.name}</span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={selectedArtistIds.has(artist.id)}
                                onClick={() => onAdd(artist)}
                                className="cursor-pointer"
                            >
                                {selectedArtistIds.has(artist.id) ? 'Ajouté' : 'Ajouter'}
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-6 text-sm text-muted-foreground">
                        Tapez au moins deux caractères pour lancer l’autocomplete.
                    </div>
                )}
            </div>
        </div>
    );
}
