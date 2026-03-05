import * as React from 'react';
import { cn } from '@/lib/utils';
import {
    TrackRow,
    type ArtistData,
    type PlaylistData,
    type TrackData,
} from './TrackRow';

export type TrackListItem = {
    track: TrackData;
    artist?: ArtistData;
};

type TrackListProps = {
    /** Titre de la section (optionnel) */
    title?: string;
    /** Liste des tracks a afficher */
    tracks: TrackListItem[];
    /** Liste des playlists de l'utilisateur pour le menu "ajouter a playlist" */
    playlists?: PlaylistData[];
    /** IDs des tracks favoris */
    favoriteTrackIds?: number[];
    /** Afficher les index des tracks */
    showIndex?: boolean;
    /** Classes CSS additionnelles pour le conteneur */
    className?: string;
    /** Classes CSS additionnelles pour la liste */
    listClassName?: string;
    /** Callback lors du changement de favori */
    onFavoriteChange?: (trackId: number, isFavorite: boolean) => void;
    /** Callback lors de l'ajout a une playlist */
    onAddToPlaylist?: (trackId: number, playlistId: number) => void;
    /** Callback lors de la creation d'une playlist */
    onCreatePlaylist?: (name: string, trackId: number) => void;
    /** Composant personnalise pour le titre */
    renderTitle?: (title: string) => React.ReactNode;
    /** Limite le nombre de tracks affichees (optionnel) */
    limit?: number;
    /** Actions supplementaires a droite du titre */
    actions?: React.ReactNode;
};

export function TrackList({
    title,
    tracks,
    playlists = [],
    favoriteTrackIds = [],
    showIndex = true,
    className,
    listClassName,
    onFavoriteChange,
    onAddToPlaylist,
    onCreatePlaylist,
    renderTitle,
    limit,
    actions,
}: TrackListProps) {
    // Appliquer la limite si specifiee
    const displayedTracks = limit ? tracks.slice(0, limit) : tracks;

    // Preparer les siblingTracks pour la lecture en sequence
    const siblingTracks = React.useMemo(
        () =>
            displayedTracks.map((item) => ({
                track: item.track,
                artist: item.artist,
            })),
        [displayedTracks],
    );

    if (tracks.length === 0) {
        return null;
    }

    return (
        <section className={className}>
            {title && (
                <div className="mb-4 flex items-center justify-between">
                    {renderTitle ? (
                        renderTitle(title)
                    ) : (
                        <h2 className="text-2xl font-bold">{title}</h2>
                    )}
                    {actions}
                </div>
            )}
            <div
                className={cn(
                    'rounded-lg bg-card/50 backdrop-blur-sm',
                    listClassName,
                )}
            >
                {displayedTracks.map((item, index) => (
                    <TrackRow
                        key={item.track.track_id}
                        track={item.track}
                        artist={item.artist}
                        index={index}
                        showIndex={showIndex}
                        isFavorite={favoriteTrackIds.includes(
                            item.track.track_id,
                        )}
                        playlists={playlists}
                        siblingTracks={siblingTracks}
                        trackIndexInSiblings={index}
                        onFavoriteChange={onFavoriteChange}
                        onAddToPlaylist={onAddToPlaylist}
                        onCreatePlaylist={onCreatePlaylist}
                    />
                ))}
            </div>
        </section>
    );
}
