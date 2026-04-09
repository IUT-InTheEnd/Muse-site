import MusicPlayer from '@/components/ui/musicplayer';

/**
 * Le lecteur est persistant et disponible pour tous les visiteurs.
 * Il vit au niveau racine pour survivre aux navigations Inertia.
 */
type PersistentMusicPlayerProps = {
    canUseLibrary: boolean;
};

export function PersistentMusicPlayer({
    canUseLibrary,
}: PersistentMusicPlayerProps) {
    return <MusicPlayer canUseLibrary={canUseLibrary} />;
}
