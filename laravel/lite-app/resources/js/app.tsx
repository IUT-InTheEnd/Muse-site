import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { AuthenticatedMusicPlayer } from './components/authenticated-music-player';
import Footer from './components/musecomponents/Footer';
import Navbar from './components/musecomponents/Navbar';
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
        const auth = sharedData.auth;
        const initialAuth = !!auth?.user;

        root.render(
            <div className='min-h-screen'>
                <StrictMode>
                    <MusicPlayerProvider>
                        {/* Header */}
                        <header className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                            <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl text-sm">
                                <Navbar user={auth?.user} />
                            </div>
                        </header>

                        {/* Page Content */}
                        <App {...props} />

                        {/* Footer */}
                        {!auth?.user && (
                            <footer className="w-full shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                                <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl py-6 text-sm">
                                    <Footer />
                                </div>
                            </footer>
                        )}

                        {/* Player */}
                        <AuthenticatedMusicPlayer initialAuth={initialAuth} />
                    </MusicPlayerProvider>
                </StrictMode>
            </div>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
