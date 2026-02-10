import { useEffect, useState } from 'react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import TrackList from '@/components/ui/track-list';
import { proxyUrl } from '@/components/proxy';

export default function AllTracks({ artistId }: { artistId: string }) {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch(`/api/artists/${artistId}/tracks`);
                const data = await response.json();
                setTracks(data.tracks);
            } catch (error) {
                console.error('Error fetching tracks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [artistId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AppHeaderLayout>
            <div className="relative min-h-screen p-10">
                <h1 className="text-4xl font-bold mb-6">All Tracks</h1>
                <TrackList tracks={tracks} />
            </div>
        </AppHeaderLayout>
    );
}