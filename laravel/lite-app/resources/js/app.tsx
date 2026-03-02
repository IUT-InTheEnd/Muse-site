import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { AuthenticatedMusicPlayer } from './components/authenticated-music-player';
import Footer from './components/musecomponents/Footer';
import Navbar from './components/musecomponents/Navbar';
import { MusicPlayerProvider } from './contexts/music-player-context';
import { initializeTheme } from './hooks/use-appearance';
import type { SharedData, User } from './types';

const appName = import.meta.env.VITE_APP_NAME || 'Lite';

// Wrapper qui écoute les navigations Inertia pour mettre à jour l'auth
function AppWrapper({
    children,
    initialUser,
}: {
    children: ReactNode;
    initialUser: User | null;
}) {
    const [user, setUser] = useState<User | null>(initialUser);

    useEffect(() => {
        // Écoute chaque navigation Inertia et met à jour l'user
        const removeListener = router.on('navigate', (event) => {
            const page = event.detail.page;
            const auth = (page.props as unknown as SharedData).auth;
            setUser(auth?.user ?? null);
        });

        return () => removeListener();
    }, []);

    return (
        <div className="min-h-screen">
            <MusicPlayerProvider>
                {/* Header */}
                <header className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] text-sm lg:max-w-4xl">
                        <Navbar user={user} />
                    </div>
                </header>

                {/* Page Content */}
                {children}

                {/* Footer */}
                {!user && (
                    <footer className="w-full shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                        <div className="mx-auto w-full max-w-[675px] py-6 text-sm lg:max-w-4xl">
                            <Footer />
                        </div>
                    </footer>
                )}

                {/* Player */}
                <AuthenticatedMusicPlayer initialAuth={!!user} />
            </MusicPlayerProvider>
        </div>
    );
}

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
        const initialUser = sharedData.auth?.user ?? null;

        root.render(
            <StrictMode>
                <AppWrapper initialUser={initialUser}>
                    <App {...props} />
                </AppWrapper>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
