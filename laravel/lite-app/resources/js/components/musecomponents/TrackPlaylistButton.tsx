import { Check, ListPlus, Loader2, Plus } from 'lucide-react';
import * as React from 'react';
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
import { cn } from '@/lib/utils';

export type PlaylistData = {
    playlist_id: number;
    playlist_name: string;
    playlist_image_file?: string;
    has_track?: boolean;
};

type TrackPlaylistButtonProps = {
    trackId: number;
    canUseLibrary: boolean;
    onAddToPlaylist?: (trackId: number, playlistId: number) => void;
    onCreatePlaylist?: (name: string, trackId: number) => void;
    buttonClassName?: string;
    iconClassName?: string;
    ariaLabel?: string;
    stopPropagation?: boolean;
};

export function TrackPlaylistButton({
    trackId,
    canUseLibrary,
    onAddToPlaylist,
    onCreatePlaylist,
    buttonClassName,
    iconClassName,
    ariaLabel = 'Gérer les playlists de ce titre',
    stopPropagation = false,
}: TrackPlaylistButtonProps) {
    const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] =
        React.useState(false);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoadingPlaylists, setIsLoadingPlaylists] = React.useState(false);
    const [playlistsWithStatus, setPlaylistsWithStatus] = React.useState<
        PlaylistData[]
    >([]);
    const [selectedPlaylistIds, setSelectedPlaylistIds] = React.useState<
        number[]
    >([]);
    const [initialSelectedIds, setInitialSelectedIds] = React.useState<
        number[]
    >([]);

    const fetchPlaylistsWithTrackStatus = React.useCallback(async () => {
        const response = await fetch(`/playlists/for-track?track_id=${trackId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') ?? '',
            },
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        setPlaylistsWithStatus(data.playlists);

        const selected = data.playlists
            .filter((playlist: PlaylistData) => playlist.has_track)
            .map((playlist: PlaylistData) => playlist.playlist_id);

        setSelectedPlaylistIds(selected);
        setInitialSelectedIds(selected);
    }, [trackId]);

    const handleOpenPlaylistDialog = async (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        if (stopPropagation) {
            event.stopPropagation();
        }

        if (!canUseLibrary) {
            alert('Connectez-vous pour gérer vos playlists.');
            return;
        }

        setIsPlaylistDialogOpen(true);
        setIsLoadingPlaylists(true);
        setIsCreatingPlaylist(false);

        try {
            await fetchPlaylistsWithTrackStatus();
        } catch (err) {
            console.error('Erreur chargement playlists:', err);
        } finally {
            setIsLoadingPlaylists(false);
        }
    };

    const handleTogglePlaylist = (playlistId: number) => {
        setSelectedPlaylistIds((previous) =>
            previous.includes(playlistId)
                ? previous.filter((id) => id !== playlistId)
                : [...previous, playlistId],
        );
    };

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
                    track_id: trackId,
                    playlist_ids: selectedPlaylistIds,
                }),
            });

            if (response.ok) {
                setIsPlaylistDialogOpen(false);
                selectedPlaylistIds.forEach((playlistId) => {
                    if (!initialSelectedIds.includes(playlistId)) {
                        onAddToPlaylist?.(trackId, playlistId);
                    }
                });
            }
        } catch (err) {
            console.error('Erreur sync playlists:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    track_id: trackId,
                }),
            });

            if (response.ok) {
                onCreatePlaylist?.(newPlaylistName.trim(), trackId);
                setNewPlaylistName('');
                setIsCreatingPlaylist(false);
                await fetchPlaylistsWithTrackStatus();
            }
        } catch (err) {
            console.error('Erreur creation playlist:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasChanges = React.useMemo(() => {
        if (selectedPlaylistIds.length !== initialSelectedIds.length)
            return true;
        return !selectedPlaylistIds.every((id) =>
            initialSelectedIds.includes(id),
        );
    }, [selectedPlaylistIds, initialSelectedIds]);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className={cn('h-8 w-8 cursor-pointer', buttonClassName)}
                onClick={handleOpenPlaylistDialog}
                aria-label={ariaLabel}
            >
                <ListPlus className={cn('h-4 w-4', iconClassName)} />
            </Button>

            <Dialog
                open={isPlaylistDialogOpen}
                onOpenChange={setIsPlaylistDialogOpen}
            >
                <DialogContent onClick={(event) => event.stopPropagation()}>
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
                                onChange={(event) =>
                                    setNewPlaylistName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleCreatePlaylist();
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3 py-4">
                            <Button
                                variant="outline"
                                className="w-full justify-start cursor-pointer"
                                onClick={() => setIsCreatingPlaylist(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle playlist
                            </Button>

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
                                    className="cursor-pointer"
                                >
                                    Retour
                                </Button>
                                <Button
                                    onClick={handleCreatePlaylist}
                                    disabled={
                                        !newPlaylistName.trim() || isSubmitting
                                    }
                                    className="cursor-pointer"
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
                                    className="cursor-pointer"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleSavePlaylistChanges}
                                    disabled={!hasChanges || isSubmitting}
                                    className="cursor-pointer"
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
