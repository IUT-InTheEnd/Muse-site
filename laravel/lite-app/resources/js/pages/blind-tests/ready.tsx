import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Disc3, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    source: 'ephemeral' | 'playlist';
    trackCount: number;
    playlist: {
        id: number;
        name: string;
    } | null;
    ephemeral: {
        generated_at?: string | null;
        generation?: {
            count?: number;
            counts?: {
                known_selected?: number;
                unknown_selected?: number;
            };
        } | null;
    } | null;
};

export default function BlindTestReady({
    source,
    trackCount,
    playlist,
    ephemeral,
}: Props) {
    const title = source === 'ephemeral' ? 'Session blind test prête' : 'Playlist blind test prête';

    return (
        <>
            <Head title={title} />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16">
                <section className="rounded-3xl border bg-card p-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Disc3 className="size-8" />
                    </div>
                    <h1 className="mt-6 text-3xl font-semibold">{title}</h1>
                    <p className="mt-4 text-sm text-muted-foreground">
                        La sélection est prête. Cette page confirme que la source de lecture blind test est correctement
                        résolue, mais le lecteur round par round n’est pas encore branché.
                    </p>
                </section>

                <section className="rounded-3xl border bg-card p-8">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <ListMusic className="size-4" />
                        <span>État prêt pour lecture</span>
                    </div>

                    <dl className="mt-6 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-muted-foreground">Source</dt>
                            <dd>{source === 'ephemeral' ? 'Session navigateur éphémère' : 'Playlist persistée'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <dt className="text-muted-foreground">Nombre de morceaux</dt>
                            <dd>{trackCount}</dd>
                        </div>
                        {playlist && (
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-muted-foreground">Playlist</dt>
                                <dd>{playlist.name}</dd>
                            </div>
                        )}
                        {ephemeral?.generation?.counts && (
                            <>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Connus sélectionnés</dt>
                                    <dd>{ephemeral.generation.counts.known_selected ?? 0}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-muted-foreground">Inconnus sélectionnés</dt>
                                    <dd>{ephemeral.generation.counts.unknown_selected ?? 0}</dd>
                                </div>
                            </>
                        )}
                    </dl>
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild className="cursor-pointer">
                        <Link href="/blind-tests/new">
                            Régénérer une sélection
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                    {playlist && (
                        <Button asChild variant="outline" className="cursor-pointer">
                            <Link href={`/playlist/${playlist.id}`}>Voir la playlist</Link>
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}
