import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { AuthenticatedMusicPlayer } from './components/authenticated-music-player';
import { MusicPlayerProvider } from './contexts/music-player-context';
import { initializeTheme } from './hooks/use-appearance';
import type { SharedData } from './types';

const appName = import.meta.env.VITE_APP_NAME || 'Lite';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const sharedData = props.initialPage.props as unknown as SharedData;
        const initialAuth = !!sharedData?.auth?.user;

        root.render(
            <StrictMode>
                <MusicPlayerProvider>
                    <App {...props} />
                    <AuthenticatedMusicPlayer initialAuth={initialAuth} />
                </MusicPlayerProvider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
