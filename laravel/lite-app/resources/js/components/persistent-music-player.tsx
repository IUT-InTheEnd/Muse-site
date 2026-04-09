import MusicPlayer from '@/components/ui/musicplayer';

/**
 * Le lecteur est persistant et disponible pour tous les visiteurs.
 * Il vit au niveau racine pour survivre aux navigations Inertia.
 */
export function PersistentMusicPlayer() {
    return <MusicPlayer />;
}
