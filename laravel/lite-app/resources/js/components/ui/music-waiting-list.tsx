import { ChevronDownIcon, GripHorizontal } from 'lucide-react';
import * as React from 'react';
import { useMusicPlayer } from '@/hooks/use-music-player';

export default function MusicWaitingList() {
    const { playlist, currentIndex, waitingList, setPlaylist, dispatch } = useMusicPlayer();

    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

    const onDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        setDraggingIndex(index);
    };

    const ondragend = () => {
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const onDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const onDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        const commence = Number(e.dataTransfer.getData('text/plain'));
        let fin = index;
        if (Number.isNaN(commence)) {
            return ondragend();
        }
        if (commence === fin) {
            return ondragend();
        }

        if (currentIndex >= 0 && fin <= currentIndex) {
            fin = currentIndex + 1;
        }

        const newList = [...playlist];
        const [bouge] = newList.splice(commence, 1);

        let replace = fin;
        if (commence < fin) replace = fin - 1;
        replace = Math.max(0, Math.min(replace, newList.length));

        newList.splice(replace, 0, bouge);

        // Mettre à jour la playlist et recalculer l'index courant
        dispatch({ type: 'SET_PLAYLIST', payload: newList });
        const currentTrack = playlist[currentIndex];
        if (currentTrack) {
            const newIndex = newList.findIndex((t) =>
                t.id !== undefined && currentTrack.id !== undefined
                    ? t.id === currentTrack.id
                    : t === currentTrack,
            );
            if (newIndex !== -1) dispatch({ type: 'SET_INDEX', payload: newIndex });
        }

        ondragend();
    };

    return (
        <aside className="flex h-120 w-90 flex-col overflow-hidden rounded-tl-2xl border border-border bg-popover px-6 py-4 text-popover-foreground shadow-2xl">
            <div className="relative">
                <h4 className="mb-4 text-xl font-semibold">File d'attente</h4>
                <button
                    onClick={waitingList}
                    className="absolute top-2 right-2 cursor-pointer rounded-full p-1 transition-all duration-200 hover:bg-accent"
                    aria-label="Minimiser la file d'attente"
                >
                    <ChevronDownIcon size={20} className="text-muted-foreground" />
                </button>
            </div>

            <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
                {playlist.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aucune piste dans la file d'attente.
                    </p>
                ) : (
                    playlist.map((item, index) => {
                        if (index < currentIndex){
                            return null;
                        } 

                        const isCurrent = index === currentIndex;
                        const isDragging = draggingIndex === index;
                        const isDragOver = dragOverIndex === index;

                        return (
                            <div
                                key={`${item.id ?? 'track'}-${index}`}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragEnd={ondragend}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDrop={(e) => onDrop(e, index)}
                                onDragEnter={() => setDragOverIndex(index)}
                                onClick={() => setPlaylist(playlist, index)}
                                className={`rounded-md p-3 border ${
                                    isCurrent
                                        ? 'border-purple-500 bg-purple-500/10'
                                        : 'border-border'
                                } ${isDragging ? 'opacity-60' : ''} ${isDragOver ? 'ring-2 ring-accent' : ''}`}
                            >
                                {isCurrent ? (
                                    <p className="text-purple-500 dark:text-purple-400">En cours</p>
                                ) : null}
                                <div className="flex flex-direction-row items-center">
                                    <div className="flex-1">
                                        <p className="font-medium truncate">
                                            {item.title || 'Titre inconnu'}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.artist || 'Artiste inconnu'}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <GripHorizontal />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </aside>
    );
}
