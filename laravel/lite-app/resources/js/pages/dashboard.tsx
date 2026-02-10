import { Head } from '@inertiajs/react';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { useMusicPlayer } from '@/hooks/use-music-player';
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
    const { playTrack } = useMusicPlayer();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex justify-end">
                    <Button
                        onClick={async () => {
                            const id = prompt("Entrez l'id du morceau", '1');
                            if (!id) return;
                            try {
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
                                playTrack(track);
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
        </AppLayout>
    );
}
