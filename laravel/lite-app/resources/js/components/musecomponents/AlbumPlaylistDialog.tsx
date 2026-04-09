import * as React from 'react';
import { Check, Loader2, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Props = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    trackIds: number[];
};

export function AlbumPlaylistDialog({ isOpen, onOpenChange, trackIds }: Props) {
    const [playlists, setPlaylists] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = React.useState(false);
    const [newPlaylistName, setNewPlaylistName] = React.useState('');
    const [selectedId, setSelectedId] = React.useState<number | null>(null);

    const fetchPlaylists = React.useCallback(() => {
        setIsLoading(true);
        fetch('/playlists/user')
            .then(res => res.json())
            .then(data => {
                setPlaylists(data.playlists);
                setIsLoading(false);
            });
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
            setIsCreatingPlaylist(false);
            setNewPlaylistName('');
            setSelectedId(null);
        }
    }, [isOpen, fetchPlaylists]);

    const handleSync = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
        await fetch('/playlists/add-tracks-batch', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
            },
            body: JSON.stringify({
                track_ids: trackIds,       
                playlist_id: selectedId    
            }),
        });
        onOpenChange(false);
    } catch (error) {
        console.error("Erreur lors de l'ajout :", error);
    } finally {
        setIsSubmitting(false);
    }
};

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/playlists/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ 
                    name: newPlaylistName,
                    track_ids: trackIds 
                }),
            });
            
            if (res.ok) {
                onOpenChange(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>
                        {isCreatingPlaylist ? 'Nouvelle playlist' : "Ajouter l'album à une playlist"}
                    </DialogTitle>
                    <DialogDescription>
                        {isCreatingPlaylist 
                            ? 'Donnez un nom à votre nouvelle playlist.' 
                            : `Choisissez une playlist pour ces ${trackIds.length} titres.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {isCreatingPlaylist ? (
                        <div className="space-y-4">
                            <Input
                                autoFocus
                                placeholder="Nom de la playlist"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreatePlaylist();
                                }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start border-dashed"
                                onClick={() => setIsCreatingPlaylist(true)}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Nouvelle playlist
                            </Button>

                            {isLoading ? (
                                <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                            ) : (
                                <div className="max-h-60 overflow-y-auto space-y-1">
                                    {playlists.map((p) => (
                                        <div 
                                            key={p.playlist_id} 
                                            className={`flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors ${selectedId === p.playlist_id ? 'bg-accent' : ''}`}
                                            onClick={() => setSelectedId(p.playlist_id)}
                                        >
                                            <Checkbox checked={selectedId === p.playlist_id} />
                                            <span className="text-sm font-medium">{p.playlist_name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex row gap-2 sm:gap-0">
                    {isCreatingPlaylist ? (
                        <>
                            <Button variant="ghost" onClick={() => setIsCreatingPlaylist(false)}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                            </Button>
                            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Créer et ajouter
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                            <Button onClick={handleSync} disabled={!selectedId || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ajouter les titres
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
