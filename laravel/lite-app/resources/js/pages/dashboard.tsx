import { Head } from '@inertiajs/react';
import { Music } from 'lucide-react';
import { useState } from 'react';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import MusicPlayer from '@/components/ui/musicplayer';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const [showMusicPlayer, setShowMusicPlayer] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <Button
                        variant={showMusicPlayer ? 'default' : 'outline'}
                        onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                    >
                        <Music className="mr-2 h-4 w-4" />
                        Music Player
                    </Button>
                    <Button
                        className="ml-2"
                        onClick={async () => {
                            const id = prompt("Entrez l'id du morceau", '1');
                            if (!id) return;
                            try {
                                setShowMusicPlayer(true);
                                const res = await fetch(
                                    `/test-music-player?id=${encodeURIComponent(id)}`,
                                );
                                if (!res.ok)
                                    throw new Error(`HTTP ${res.status}`);
                                const data = await res.json();
                                const track = {
                                    src: proxyUrl(data.url) ?? '',
                                    title: data.title,
                                    artist: data.artist,
                                    artwork: proxyUrl(data.artwork),
                                };
                                window.dispatchEvent(
                                    new CustomEvent('playTrack', {
                                        detail: track,
                                    }),
                                );
                            } catch (err) {
                                console.error(err);
                                void alert('Impossible de charger la musique.');
                            }
                        }}
                    >
                        Play Test Music
                    </Button>
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-screen flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
            <MusicPlayer
                visible={showMusicPlayer}
                onClose={() => setShowMusicPlayer(false)}
            />
        </AppLayout>
    );
}
