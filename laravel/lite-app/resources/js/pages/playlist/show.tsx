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
import { useRef, useState, useEffect } from 'react';
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

    const [localTracks, setLocalTracks] = useState<TrackListItem[]>([]);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        const items: TrackListItem[] = playlist.tracks.map((track) => {
            const artist = track.realisers?.[0]?.artist;
            return {
                track: {
                    track_id: track.track_id,
                    track_title: track.track_title,
                    track_image_file: track.track_image_file,
                    track_duration: track.track_duration,
                    track_listens: track.track_listens,
                } as TrackData,
                artist: artist ? ({
                    artist_id: artist.artist_id,
                    artist_name: artist.artist_name,
                } as ArtistData) : undefined,
            };
        });
        setLocalTracks(items);
    }, [playlist.tracks]);

    const isEditable = playlist.playlist_deletable;
    const isFavorites = !playlist.playlist_deletable;

    // --- LOGIQUE DRAG & DROP ---
    const handleDragStart = (index: number) => {
        if (!isEditable) return;
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const items = [...localTracks];
        const draggedItem = items[draggedItemIndex];
        items.splice(draggedItemIndex, 1);
        items.splice(index, 0, draggedItem);
        
        setDraggedItemIndex(index);
        setLocalTracks(items);
    };

    const handleDragEnd = async () => {
        setDraggedItemIndex(null);
        if (!isEditable) return;

        try {
            await fetch('/playlists/reorder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    playlist_id: playlist.playlist_id,
                    track_ids: localTracks.map(item => item.track.track_id)
                }),
            });
        } catch (error) {
            console.error("Erreur lors de la sauvegarde de l'ordre:", error);
        }
    };

    const getPlaylistImage = () => {
        if (playlist.playlist_image_file) return `/image/${playlist.playlist_image_file}`;
        return isFavorites ? '/images/default-fav-image.jpg' : null;
    };
    const playlistImage = getPlaylistImage();

    const totalDuration = playlist.tracks.reduce((acc, track) => acc + (track.track_duration || 0), 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);

    const handlePlayAll = async () => {
        if (localTracks.length === 0) return;
        try {
            const allTracks = await fetchTracks(localTracks.map((t) => t.track.track_id));
            setPlayerPlaylist(allTracks, 0);
        } catch (err) { console.error(err); }
    };

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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ playlist_id: playlist.playlist_id, name: editedName }),
            });
            if (response.ok) router.reload();
        } catch (error) { console.error(error); } finally { setIsUpdating(false); setIsEditingName(false); }
    };

    const handleToggleVisibility = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch('/playlists/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ playlist_id: playlist.playlist_id, public: !playlist.playlist_public }),
            });
            if (response.ok) router.reload();
        } catch (error) { console.error(error); } finally { setIsUpdating(false); }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '' },
                body: formData,
            });
            if (response.ok) router.reload();
        } catch (error) { console.error(error); } finally { setIsUpdating(false); }
    };

    const handleDelete = async () => {
        if (!confirm('Supprimer cette playlist ?')) return;
        setIsDeleting(true);
        try {
            const response = await fetch('/playlists/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ playlist_id: playlist.playlist_id }),
            });
            if (response.ok) router.visit('/user/playlists');
        } catch (error) { console.error(error); } finally { setIsDeleting(false); }
    };

    return (
        <>
            <Head title={playlist.playlist_name} />
            <div className="flex min-h-screen flex-col items-center">
                <div
                    className="relative flex h-80 w-full items-end bg-cover bg-center"
                    style={{ backgroundImage: playlistImage ? `url(${playlistImage})` : undefined }}
                >
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />
                    
                    {isEditable && (
                        <>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUpdating}
                                className="absolute cursor-pointer top-4 right-4 z-20 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 disabled:opacity-50"
                            >
                                <CameraIcon size={20} />
                            </button>
                        </>
                    )}

                    {!playlistImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <MusicIcon size={96} className="text-muted-foreground/50" />
                        </div>
                    )}

                    <div className="relative z-10 w-full p-8">
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-2 flex items-center gap-2">
                                {isFavorites ? (
                                    <span className="rounded-full bg-primary/20 px-3 py-1 text-sm text-primary">Favoris</span>
                                ) : (
                                    <button
                                        onClick={handleToggleVisibility}
                                        disabled={isUpdating}
                                        className="flex cursor-pointer items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20 disabled:opacity-50"
                                    >
                                        {playlist.playlist_public ? <><GlobeIcon size={14} /> Publique</> : <><LockIcon size={14} /> Privee</>}
                                    </button>
                                )}
                            </div>

                            {isEditingName ? (
                                <div className="mb-4 flex items-center gap-2">
                                    <input
                                        type="text" value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="border-b-2 border-white bg-transparent text-4xl font-bold text-white outline-none"
                                        autoFocus
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); if (e.key === 'Escape') { setEditedName(playlist.playlist_name); setIsEditingName(false); }}}
                                    />
                                    <Button size="sm" onClick={handleUpdateName} disabled={isUpdating} className="cursor-pointer">OK</Button>
                                    <Button size="sm" variant="ghost" onClick={() => { setEditedName(playlist.playlist_name); setIsEditingName(false); }} className="cursor-pointer"><XIcon size={16} /></Button>
                                </div>
                            ) : (
                                <div className="mb-4 flex items-center gap-3">
                                    <h1 className="text-4xl font-bold text-white">{playlist.playlist_name}</h1>
                                    {isEditable && (
                                        <button onClick={() => setIsEditingName(true)} className="rounded-full cursor-pointer p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
                                            <PencilIcon size={18} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <p className="mb-6 text-white/70">
                                {playlist.user?.name && `Par ${playlist.user.name} • `}
                                {localTracks.length} {localTracks.length > 1 ? 'titres' : 'titre'}
                                {totalDuration > 0 && <> • {hours > 0 && `${hours}h `}{minutes} min</>}
                            </p>

                            <div className="flex items-center gap-3">
                                <Button size="lg" onClick={handlePlayAll} disabled={localTracks.length === 0} className="gap-2 cursor-pointer">
                                    <PlayIcon size={20} /> Lecture
                                </Button>
                                {isEditable && (
                                    <Button size="lg" variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2 cursor-pointer">
                                        <TrashIcon size={18} /> Supprimer
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full px-6 py-8">
                    <div className="mx-auto max-w-5xl">
                        {localTracks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
                                <MusicIcon size={48} />
                                <p>Cette playlist est vide</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {localTracks.map((item, index) => (
                                    <div
                                        key={item.track.track_id}
                                        draggable={isEditable}
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                        className={`transition-all duration-150 first:rounded-t-lg last:rounded-b-lg overflow-hidden ${isEditable ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedItemIndex === index ? 'opacity-40 bg-white/5' : 'opacity-100 hover:bg-white/5'}`}
                                    >
                                        <TrackList
                                            tracks={[item]}
                                            showIndex={true}
                                            indexOffset={index}
                                            listClassName="rounded-none bg-card/50"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}