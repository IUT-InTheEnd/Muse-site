import { ReactionButtons } from '@/components/reaction-buttons';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMusicPlayer } from '@/contexts/music-player-context';
import { fetchTrack, fetchTracks } from '@/lib/track-api';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    Check,
    Heart,
    ListMusic,
    ListPlus,
    Loader2,
    Music,
    Pause,
    Play,
    Plus,
} from 'lucide-react';
import * as React from 'react';

export type TrackData = {
    track_id: number;
    track_title: string;
    track_favorites: number;
    track_likes?: number;
    track_dislikes?: number;
    track_image_file?: string;
    track_duration?: number;
    track_listens?: number;
    viewer_reaction?: 'like' | 'dislike' | null;
};

export type ArtistData = {
    artist_id: number;
    artist_name: string;
};

export type PlaylistData = {
    playlist_id: number;
    playlist_name: string;
    playlist_image_file?: string;
    has_track?: boolean;
};

type TrackRowProps = {
    track: TrackData;
    artist?: ArtistData;
    index?: number;
    showIndex?: boolean;
    isFavorite?: boolean;
    playlists?: PlaylistData[];
    className?: string;
    onFavoriteChange?: (trackId: number, isFavorite: boolean) => void;
    onAddToPlaylist?: (trackId: number, playlistId: number) => void;
    onCreatePlaylist?: (name: string, trackId: number) => void;
    // Pour jouer une liste de tracks avec le bon index
    siblingTracks?: { track: TrackData; artist?: ArtistData }[];
    trackIndexInSiblings?: number;
};

export function TrackRow({
    track,
    artist,
    index,
    showIndex = true,
    isFavorite = false,
    playlists = [],
    className,
    onFavoriteChange,
    onAddToPlaylist,
    onCreatePlaylist,
    siblingTracks,
    trackIndexInSiblings,
}: TrackRowProps) {
    const { auth } = usePage<SharedData>().props;
    const {
        track: currentTrack,
        playing,
        playTrack,
        togglePlay,
        addToQueue,
        setPlaylist,
    } = useMusicPlayer();

    const [isAddingFavorite, setIsAddingFavorite] = React.useState(false);
    const [localIsFavorite, setLocalIsFavorite] = React.useState(isFavorite);
    const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = React.useState(false);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = React.useState(false);
    const [playlistsWithStatus, setPlaylistsWithStatus] = React.useState<PlaylistData[]>([]);
    const [selectedPlaylistIds, setSelectedPlaylistIds] = React.useState<number[]>([]);
    const [initialSelectedIds, setInitialSelectedIds] = React.useState<number[]>([]);
    const canUseLibrary = Boolean(auth?.user);
    const canPlayTrack = Boolean(auth?.user);

    // Determiner si cette piste est en cours de lecture
    const isCurrentTrack = currentTrack?.title === track.track_title;
    const isPlaying = isCurrentTrack && playing;

    // Formater la duree
    const formatDuration = (seconds?: number) => {
        if (!seconds) return '--:--';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Jouer ou mettre en pause la piste
    const handlePlayPause = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!canPlayTrack) {
            alert('Connectez-vous pour écouter cette musique.');
            return;
        }

        if (isCurrentTrack) {
            togglePlay();
        } else {
            try {
                // Si on a des tracks environnantes, charger toutes les tracks en batch et utiliser setPlaylist
                if (
                    siblingTracks &&
                    siblingTracks.length > 0 &&
                    trackIndexInSiblings !== undefined
                ) {
                    const allTracksData = await fetchTracks(
                        siblingTracks.map((s) => s.track.track_id),
                    );
                    setPlaylist(allTracksData, trackIndexInSiblings);
                } else {
                    // Comportement original: jouer une seule piste
                    const trackData = await fetchTrack(track.track_id);
                    playTrack(trackData);
                }
            } catch (err) {
                console.error(err);
                alert('Impossible de charger la musique.');
            }
        }
    };

    // Toggle favoris
    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!canUseLibrary) {
            alert('Connectez-vous pour gérer vos favoris.');
            return;
        }

        setIsAddingFavorite(true);

        try {
            const response = await fetch('/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ track_id: track.track_id }),
            });

            if (response.ok) {
                const data = await response.json();
                setLocalIsFavorite(data.is_favorite);
                onFavoriteChange?.(track.track_id, data.is_favorite);
            }
        } catch (err) {
            console.error('Erreur favoris:', err);
        } finally {
            setIsAddingFavorite(false);
        }
    };

    // Ouvrir le dialog et charger les playlists avec leur statut
    const handleOpenPlaylistDialog = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!canUseLibrary) {
            alert('Connectez-vous pour gérer vos playlists.');
            return;
        }

        setIsPlaylistDialogOpen(true);
        setIsLoadingPlaylists(true);
        setIsCreatingPlaylist(false);

        try {
            const response = await fetch(
                `/playlists/for-track?track_id=${track.track_id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') ?? '',
                    },
                },
            );

            if (response.ok) {
                const data = await response.json();
                setPlaylistsWithStatus(data.playlists);
                const selected = data.playlists
                    .filter((p: PlaylistData) => p.has_track)
                    .map((p: PlaylistData) => p.playlist_id);
                setSelectedPlaylistIds(selected);
                setInitialSelectedIds(selected);
            }
        } catch (err) {
            console.error('Erreur chargement playlists:', err);
        } finally {
            setIsLoadingPlaylists(false);
        }
    };

    // Toggle une playlist dans la selection
    const handleTogglePlaylist = (playlistId: number) => {
        setSelectedPlaylistIds((prev) =>
            prev.includes(playlistId)
                ? prev.filter((id) => id !== playlistId)
                : [...prev, playlistId],
        );
    };

    // Sauvegarder les changements de playlists
    const handleSavePlaylistChanges = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/playlists/sync-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    track_id: track.track_id,
                    playlist_ids: selectedPlaylistIds,
                }),
            });

            if (response.ok) {
                setIsPlaylistDialogOpen(false);
                // Notifier les changements
                selectedPlaylistIds.forEach((playlistId) => {
                    if (!initialSelectedIds.includes(playlistId)) {
                        onAddToPlaylist?.(track.track_id, playlistId);
                    }
                });
            }
        } catch (err) {
            console.error('Erreur sync playlists:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Verifier si des changements ont ete faits
    const hasChanges = React.useMemo(() => {
        if (selectedPlaylistIds.length !== initialSelectedIds.length)
            return true;
        return !selectedPlaylistIds.every((id) =>
            initialSelectedIds.includes(id),
        );
    }, [selectedPlaylistIds, initialSelectedIds]);

    // Creer une nouvelle playlist et y ajouter la piste
    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;

        setIsSubmitting(true);
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
                body: JSON.stringify({
                    name: newPlaylistName.trim(),
                    track_id: track.track_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                onCreatePlaylist?.(newPlaylistName.trim(), track.track_id);
                setNewPlaylistName('');
                setIsCreatingPlaylist(false);

                // Recharger les playlists pour afficher la nouvelle
                const playlistsResponse = await fetch(
                    `/playlists/for-track?track_id=${track.track_id}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') ?? '',
                        },
                    },
                );
                if (playlistsResponse.ok) {
                    const playlistsData = await playlistsResponse.json();
                    setPlaylistsWithStatus(playlistsData.playlists);
                    const selected = playlistsData.playlists
                        .filter((p: PlaylistData) => p.has_track)
                        .map((p: PlaylistData) => p.playlist_id);
                    setSelectedPlaylistIds(selected);
                    setInitialSelectedIds(selected);
                }
            }
        } catch (err) {
            console.error('Erreur creation playlist:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div
                className={cn(
                    'group flex cursor-pointer items-center gap-4 rounded-md p-3 transition-colors hover:bg-accent/50',
                    isCurrentTrack && 'bg-accent/30',
                    className,
                )}
                onClick={handlePlayPause}
            >
                {/* Play-Pause */}
                <div className="flex w-8 items-center justify-center">
                    {showIndex && !isCurrentTrack && (
                        <span className="text-sm text-muted-foreground group-hover:hidden">
                            {index !== undefined ? index + 1 : ''}
                        </span>
                    )}
                    {isPlaying ? (
                        <Pause
                            className={cn(
                                'h-4 w-4 text-primary',
                                !isCurrentTrack && 'hidden group-hover:block',
                            )}
                        />
                    ) : (
                        <Play
                            className={cn(
                                'h-4 w-4',
                                isCurrentTrack
                                    ? 'text-primary'
                                    : 'hidden group-hover:block',
                            )}
                        />
                    )}
                </div>

                {/* Cover */}
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
                    {track.track_image_file ? (
                        <img
                            src={proxyUrl(track.track_image_file)}
                            alt={track.track_title}
                            className="h-full w-full object-cover"
                            onError={(e) => {e.currentTarget.src = "/images/default-artist.jpg";}}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Music className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    {/* Indicateur de lecture */}
                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="flex gap-0.5">
                                <span
                                    className="h-3 w-1 animate-pulse bg-primary"
                                    style={{ animationDelay: '0ms' }}
                                />
                                <span
                                    className="h-4 w-1 animate-pulse bg-primary"
                                    style={{ animationDelay: '150ms' }}
                                />
                                <span
                                    className="h-2 w-1 animate-pulse bg-primary"
                                    style={{ animationDelay: '300ms' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Titre et Artiste */}
                <div className="min-w-0 w-[400px] flex-col">
                    <span
                        className={cn(
                            'line-clamp-1 font-medium',
                            isCurrentTrack && 'text-primary',
                        )}
                    >
                        {track.track_title}
                    </span>
                    {artist && (
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                            <a href={`/artiste/${artist.artist_id}`} className="hover:underline">{artist.artist_name}</a>
                        </span>
                    )}
                </div>

                {/* Nombre de lectures */}
                {track.track_listens !== undefined && (
                    <span className="hidden font-mono text-sm text-muted-foreground md:block w-30 text-right">
                        {track.track_listens.toLocaleString('fr-FR')}
                    </span>
                )}

                {track.track_favorites !== undefined && (
                    <span className="hidden font-mono text-sm text-muted-foreground md:block w-30 text-right">
                        {track.track_favorites?.toLocaleString('fr-FR')}
                    </span>
                )}

                {/* Duree */}
                <span className="text-right font-mono text-sm text-muted-foreground w-30 text-right">
                    {formatDuration(track.track_duration)}
                </span>

                <div className="flex w-34 justify-end">
                    <ReactionButtons
                        resource="tracks"
                        resourceId={track.track_id}
                        initialReaction={track.viewer_reaction ?? null}
                        initialLikes={track.track_likes ?? 0}
                        initialDislikes={track.track_dislikes ?? 0}
                        className="ml-auto"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    {/* Bouton Favoris */}
                    {canUseLibrary && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleToggleFavorite}
                            disabled={isAddingFavorite}
                        >
                            {isAddingFavorite ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Heart
                                    className={cn(
                                        'h-4 w-4',
                                        localIsFavorite &&
                                            'fill-purple-500 text-purple-500',
                                    )}
                                />
                            )}
                        </Button>
                    )}

                    {/* Bouton Mettre en file d'attente */}
                    {canPlayTrack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    const trackData = await fetchTrack(
                                        track.track_id,
                                    );
                                    addToQueue(trackData);
                                } catch (err) {
                                    console.error(err);
                                }
                            }}
                        >
                            <ListMusic className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Menu Playlist */}
                    {canUseLibrary && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleOpenPlaylistDialog}
                        >
                            <ListPlus className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Dialog Gestion Playlists */}
            <Dialog
                open={isPlaylistDialogOpen}
                onOpenChange={setIsPlaylistDialogOpen}
            >
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>
                            {isCreatingPlaylist
                                ? 'Nouvelle playlist'
                                : 'Gérer les playlists'}
                        </DialogTitle>
                        <DialogDescription>
                            {isCreatingPlaylist
                                ? 'Créez une nouvelle playlist et ajoutez-y ce titre.'
                                : 'Cochez les playlists où vous souhaitez ajouter ce titre.'}
                        </DialogDescription>
                    </DialogHeader>

                    {isCreatingPlaylist ? (
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Nom de la playlist"
                                value={newPlaylistName}
                                onChange={(e) =>
                                    setNewPlaylistName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter')
                                        handleCreatePlaylist();
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 py-4">
                            {/* Bouton Nouvelle playlist */}
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setIsCreatingPlaylist(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle playlist
                            </Button>

                            {/* Liste des playlists avec checkboxes */}
                            {isLoadingPlaylists ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : playlistsWithStatus.length > 0 ? (
                                <div className="max-h-64 space-y-1 overflow-y-auto">
                                    {playlistsWithStatus.map((playlist) => (
                                        <div
                                            key={playlist.playlist_id}
                                            className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent/50"
                                            onClick={() =>
                                                handleTogglePlaylist(
                                                    playlist.playlist_id,
                                                )
                                            }
                                        >
                                            <Checkbox
                                                id={`playlist-${playlist.playlist_id}`}
                                                checked={selectedPlaylistIds.includes(
                                                    playlist.playlist_id,
                                                )}
                                                onCheckedChange={() =>
                                                    handleTogglePlaylist(
                                                        playlist.playlist_id,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor={`playlist-${playlist.playlist_id}`}
                                                className="flex-1 cursor-pointer text-sm font-medium"
                                            >
                                                {playlist.playlist_name}
                                            </label>
                                            {selectedPlaylistIds.includes(
                                                playlist.playlist_id,
                                            ) &&
                                                !initialSelectedIds.includes(
                                                    playlist.playlist_id,
                                                ) && (
                                                    <span className="text-xs text-green-500">
                                                        + Ajouté
                                                    </span>
                                                )}
                                            {!selectedPlaylistIds.includes(
                                                playlist.playlist_id,
                                            ) &&
                                                initialSelectedIds.includes(
                                                    playlist.playlist_id,
                                                ) && (
                                                    <span className="text-xs text-red-500">
                                                        - Retiré
                                                    </span>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    Aucune playlist. Créez-en une !
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {isCreatingPlaylist ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreatingPlaylist(false);
                                        setNewPlaylistName('');
                                    }}
                                >
                                    Retour
                                </Button>
                                <Button
                                    onClick={handleCreatePlaylist}
                                    disabled={
                                        !newPlaylistName.trim() || isSubmitting
                                    }
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Créer
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setIsPlaylistDialogOpen(false)
                                    }
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleSavePlaylistChanges}
                                    disabled={!hasChanges || isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-2 h-4 w-4" />
                                    )}
                                    Enregistrer
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
