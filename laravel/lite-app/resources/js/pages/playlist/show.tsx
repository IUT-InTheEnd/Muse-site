import { Head, router } from '@inertiajs/react';
import {
    CameraIcon,
    GlobeIcon,
    LockIcon,
    MusicIcon,
    PencilIcon,
    PlayIcon,
    TrashIcon,
    XIcon,
} from 'lucide-react';
import { useRef, useState } from 'react';
import {
    TrackList,
    type TrackListItem,
} from '@/components/musecomponents/TrackList';
import {
    type ArtistData,
    type TrackData,
} from '@/components/musecomponents/TrackRow';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/contexts/music-player-context';
import { fetchTracks } from '@/lib/track-api';

type Track = {
    track_id: number;
    track_title: string;
    track_image_file?: string;
    track_duration?: number;
    track_listens?: number;
    realisers?: {
        artist: {
            artist_id: number;
            artist_name: string;
        };
    }[];
};

type Playlist = {
    playlist_id: number;
    playlist_name: string;
    playlist_description: string | null;
    playlist_image_file: string | null;
    playlist_date_created: string;
    playlist_date_updated: string;
    playlist_public: boolean;
    playlist_deletable: boolean;
    user_id: number;
    user?: {
        id: number;
        name: string;
        username: string;
    };
    tracks: Track[];
};

type Props = {
    playlist: Playlist;
};

export default function PlaylistShow({ playlist }: Props) {
    const { setPlaylist: setPlayerPlaylist } = useMusicPlayer();
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(playlist.playlist_name);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEditable = playlist.playlist_deletable;
    const isFavorites = !playlist.playlist_deletable;

    // Image de la playlist
    const getPlaylistImage = () => {
        if (playlist.playlist_image_file) {
            return `/image/${playlist.playlist_image_file}`;
        }
        if (isFavorites) {
            return '/images/default-fav-image.jpg';
        }
        return null;
    };
    const playlistImage = getPlaylistImage();

    // Calculer la durée totale
    const totalDuration = playlist.tracks.reduce(
        (acc, track) => acc + (track.track_duration || 0),
        0,
    );
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    // Jouer toutes les tracks
    const handlePlayAll = async () => {
        if (playlist.tracks.length === 0) return;

        try {
            const allTracks = await fetchTracks(
                playlist.tracks.map((t) => t.track_id),
            );
            setPlayerPlaylist(allTracks, 0);
        } catch (err) {
            console.error(err);
        }
    };

    // Mettre à jour le nom
    const handleUpdateName = async () => {
        if (!editedName.trim() || editedName === playlist.playlist_name) {
            setIsEditingName(false);
            return;
        }

        setIsUpdating(true);
        try {
            const response = await fetch('/playlists/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    playlist_id: playlist.playlist_id,
                    name: editedName,
                }),
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Erreur lors de la mise a jour:', error);
        } finally {
            setIsUpdating(false);
            setIsEditingName(false);
        }
    };

    // Mettre à jour la visibilité
    const handleToggleVisibility = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('/playlists/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    playlist_id: playlist.playlist_id,
                    public: !playlist.playlist_public,
                }),
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Erreur lors de la mise a jour:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Mettre à jour l'image
    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('formData', file);
            formData.append('table', 'playlist');
            formData.append('playlist_id', String(playlist.playlist_id));

            const response = await fetch('/image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: formData,
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error("Erreur lors de l'upload:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Supprimer la playlist
    const handleDelete = async () => {
        if (!confirm('Supprimer cette playlist ?')) return;

        setIsDeleting(true);
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
                body: JSON.stringify({ playlist_id: playlist.playlist_id }),
            });

            if (response.ok) {
                router.visit('/user/playlists');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Retirer un track de la playlist
    const handleRemoveTrack = async (trackId: number) => {
        try {
            const response = await fetch('/playlists/remove-track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    playlist_id: playlist.playlist_id,
                    track_id: trackId,
                }),
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Erreur lors du retrait:', error);
        }
    };

    // Préparer les tracks pour le TrackList
    const trackListItems: TrackListItem[] = playlist.tracks.map((track) => {
        const artist = track.realisers?.[0]?.artist;
        return {
            track: {
                track_id: track.track_id,
                track_title: track.track_title,
                track_image_file: track.track_image_file,
                track_duration: track.track_duration,
                track_listens: track.track_listens,
            } as TrackData,
            artist: artist
                ? ({
                      artist_id: artist.artist_id,
                      artist_name: artist.artist_name,
                  } as ArtistData)
                : undefined,
        };
    });

    return (
        <>
            <Head title={playlist.playlist_name} />
            <div className="flex min-h-screen flex-col items-center">
                {/* Header avec image et infos */}
                <div
                    className="relative flex h-80 w-full items-end bg-cover bg-center"
                    style={{
                        backgroundImage: playlistImage
                            ? `url(${playlistImage})`
                            : undefined,
                    }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

                    {/* Bouton pour changer l'image */}
                    {isEditable && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 disabled:opacity-50"
                                aria-label="Changer l'image"
                            >
                                <CameraIcon size={20} />
                            </button>
                        </>
                    )}

                    {/* Image placeholder si pas d'image */}
                    {!playlistImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <MusicIcon
                                size={96}
                                className="text-muted-foreground/50"
                            />
                        </div>
                    )}

                    <div className="relative z-10 w-full p-8">
                        <div className="mx-auto max-w-5xl">
                            {/* Badge favoris ou visibilité */}
                            <div className="mb-2 flex items-center gap-2">
                                {isFavorites ? (
                                    <span className="rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">
                                        Favoris
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleToggleVisibility}
                                        disabled={isUpdating}
                                        className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20 disabled:opacity-50"
                                    >
                                        {playlist.playlist_public ? (
                                            <>
                                                <GlobeIcon size={14} />
                                                Publique
                                            </>
                                        ) : (
                                            <>
                                                <LockIcon size={14} />
                                                Privee
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Nom de la playlist */}
                            {isEditingName ? (
                                <div className="mb-4 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) =>
                                            setEditedName(e.target.value)
                                        }
                                        className="border-b-2 border-white bg-transparent text-4xl font-bold text-white outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter')
                                                handleUpdateName();
                                            if (e.key === 'Escape') {
                                                setEditedName(
                                                    playlist.playlist_name,
                                                );
                                                setIsEditingName(false);
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleUpdateName}
                                        disabled={isUpdating}
                                    >
                                        OK
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            setEditedName(
                                                playlist.playlist_name,
                                            );
                                            setIsEditingName(false);
                                        }}
                                    >
                                        <XIcon size={16} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="mb-4 flex items-center gap-3">
                                    <h1 className="text-4xl font-bold text-white">
                                        {playlist.playlist_name}
                                    </h1>
                                    {isEditable && (
                                        <button
                                            onClick={() =>
                                                setIsEditingName(true)
                                            }
                                            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <PencilIcon size={18} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Infos */}
                            <p className="mb-6 text-white/70">
                                {playlist.user?.name &&
                                    `Par ${playlist.user.name} • `}
                                {playlist.tracks.length}{' '}
                                {playlist.tracks.length > 1
                                    ? 'titres'
                                    : 'titre'}
                                {totalDuration > 0 && (
                                    <>
                                        {' '}
                                        • {hours > 0 && `${hours}h `}
                                        {minutes} min
                                    </>
                                )}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Button
                                    size="lg"
                                    onClick={handlePlayAll}
                                    disabled={playlist.tracks.length === 0}
                                    className="gap-2"
                                >
                                    <PlayIcon size={20} />
                                    Lecture
                                </Button>

                                {isEditable && (
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="gap-2"
                                    >
                                        <TrashIcon size={18} />
                                        Supprimer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des tracks */}
                <div className="w-full px-6 py-8">
                    <div className="mx-auto max-w-5xl">
                        {playlist.tracks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                                <MusicIcon size={48} />
                                <p>Cette playlist est vide</p>
                                <p className="text-sm">
                                    Ajoutez des titres depuis la page d'un album
                                    ou d'un artiste
                                </p>
                            </div>
                        ) : (
                            <TrackList
                                tracks={trackListItems}
                                showIndex={true}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
