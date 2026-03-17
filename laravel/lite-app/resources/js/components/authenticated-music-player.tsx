import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MusicPlayer from '@/components/ui/musicplayer';
import type { SharedData } from '@/types';

/**
 * Un composant wrapper qui affiche le MusicPlayer uniquement pour les utilisateurs authentifiés.
 * Il est au root de l'appli, en dehors du rendu des pages Inertia, pour la persistence.
 * Comme on est en dehors de <App>, on ne peut pas utiliser usePage().
 * DU coup, on écoute les événements de navigation d'Inertia pour détecter les changements d'authentification.
 */
export function AuthenticatedMusicPlayer({
    initialAuth,
}: {
    initialAuth: boolean;
}) {
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

    useEffect(() => {
        // Listen to Inertia navigation events to update auth state
        const removeListener = router.on('navigate', (event) => {
            const props = event.detail.page.props as unknown as SharedData;
            setIsAuthenticated(!!props?.auth?.user);
        });

        return () => {
            removeListener();
        };
    }, []);

    //if (!isAuthenticated) {
    //    return null;
    //}

    return <MusicPlayer />;
}
