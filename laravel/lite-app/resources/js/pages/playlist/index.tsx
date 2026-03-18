import { Head, Link, router } from '@inertiajs/react';
import { MusicIcon, PlusIcon, TrashIcon, LockIcon } from 'lucide-react';
import { useState } from 'react';
import {
    CardContent,
    CardCover,
    CardSubtitle,
    CardTitle,
} from '@/components/musecomponents/cards/Card';
import { PlaylistCard } from '@/components/musecomponents/cards/PlaylistCard';
import { Button } from '@/components/ui/button';

type Playlist = {
    playlist_id: number;
    playlist_name: string;
    playlist_description: string | null;
    playlist_image_file: string | null;
    playlist_date_created: string;
    playlist_date_updated: string;
    playlist_public: boolean;
    playlist_deletable: boolean;
    tracks_count: number;
    tracks?: { track_id: number }[];
};

type PlaylistsPageProps = {
    playlists: Playlist[];
};

export default function PlaylistsPage({ playlists }: PlaylistsPageProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        try {
            const response = await fetch('/playlists/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ name: newPlaylistName }),
            });

            if (response.ok) {
                setNewPlaylistName('');
                setIsCreating(false);
                router.reload();
            }
        } catch (error) {
            console.error('Erreur lors de la creation de la playlist:', error);
        }
    };

    const handleDeletePlaylist = async (playlistId: number) => {
        if (!confirm('Supprimer cette playlist ?')) return;

        setDeletingId(playlistId);
        try {
            const response = await fetch('/playlists/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ playlist_id: playlistId }),
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <Head title="Mes playlists" />
            <div className="flex flex-col items-center justify-center">
                <div className="flex w-full max-w-xl flex-col gap-6 px-6 py-10 sm:max-w-2xl lg:max-w-4xl lg:justify-center">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Mes playlists</h1>
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <PlusIcon size={18} />
                            Nouvelle playlist
                        </Button>
                    </div>

                    {isCreating && (
                        <div className="flex gap-2 rounded-lg bg-card p-4">
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) =>
                                    setNewPlaylistName(e.target.value)
                                }
                                placeholder="Nom de la playlist"
                                className="flex-1 rounded-md border bg-background px-3 py-2"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                        handleCreatePlaylist();
                                    if (e.key === 'Escape')
                                        setIsCreating(false);
                                }}
                            />
                            <Button onClick={handleCreatePlaylist} className="cursor-pointer">
                                Creer
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCreating(false)} 
                                className="cursor-pointer"
                            >
                                Annuler
                            </Button>
                        </div>
                    )}

                    {playlists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                            <MusicIcon size={48} />
                            <p>Vous n'avez pas encore de playlist</p>
                            <Button
                                onClick={() => setIsCreating(true)}
                                variant="outline"
                                className="cursor-pointer"
                            >
                                Creer ma premiere playlist
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.playlist_id}
                                    className="group relative"
                                >
                                    <PlaylistCard
                                        trackIds={playlist.tracks?.map(
                                            (t) => t.track_id,
                                        )}
                                    >
                                        <Link
                                            href={`/playlist/${playlist.playlist_id}`}
                                        >
                                            {playlist.playlist_image_file ? (
                                                <CardCover
                                                    src={`/image/${playlist.playlist_image_file}`}
                                                    alt={playlist.playlist_name}
                                                />
                                            ) : !playlist.playlist_deletable ? (
                                                <CardCover
                                                    src="/images/default-fav-image.jpg"
                                                    alt={playlist.playlist_name}
                                                />
                                            ) : (
                                                <div className="flex aspect-square w-full items-center justify-center bg-muted">
                                                    <MusicIcon
                                                        size={48}
                                                        className="text-muted-foreground"
                                                    />
                                                </div>
                                            )}
                                            <CardContent>
                                                <CardTitle>
                                                    {playlist.playlist_name}
                                                </CardTitle>
                                                <CardSubtitle>
                                                    {playlist.tracks_count}{' '}
                                                    {playlist.tracks_count > 1
                                                        ? 'titres'
                                                        : 'titre'}
                                                </CardSubtitle>
                                            </CardContent>
                                        </Link>
                                    </PlaylistCard>
                                    {!playlist.playlist_public && (
                                        <div className="absolute top-2 left-2 rounded-full bg-black/10 px-3 py-1 text-sm text-white transition hover:bg-black/20 disabled:opacity-50">
                                            <LockIcon size={16} />
                                        </div>
                                    )}                  
                                    {playlist.playlist_deletable && (
                                        <button
                                            onClick={() =>
                                                handleDeletePlaylist(
                                                    playlist.playlist_id,
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                playlist.playlist_id
                                            }
                                            className="absolute top-2 right-2 rounded-full bg-destructive p-2 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/90 disabled:opacity-50 cursor-pointer"
                                            aria-label="Supprimer la playlist"
                                        >
                                            <TrashIcon size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
