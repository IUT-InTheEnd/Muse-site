import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { proxyUrl } from '@/components/proxy';
import { router } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ArtistController';
import {PlayIcon, PauseIcon} from 'lucide-react';
import { useMusicPlayer } from '@/hooks/use-music-player';

export default function AllTracks({ artist, tracks, albums,test }: any) {
    const { playTrack } = useMusicPlayer();
    
    console.log(test)

    const playTracks = async (trackId: number) => {
        try {
            const res = await fetch(`/test-music-player?id=${encodeURIComponent(trackId)}`,);
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
    };
    
    const groupTracksByAlbum = () => {
        const grouped: { [key: string]: any } = {};
        
        albums.forEach((album: any) => {
            grouped[album.id] = {
                album,
                tracks: []
            };
        });

        tracks.forEach((track: any) => {
            Object.keys(grouped).forEach(albumId => {
                if (grouped[albumId].album.id) {
                    grouped[albumId].tracks.push(track);
                }
            });
        });

        return Object.values(grouped).filter((g: any) => g.tracks.length > 0);
    };

    const groupedData = groupTracksByAlbum();

    console.log(groupedData)

    return (
        <AppHeaderLayout>        
            <div className="relative min-h-screen p-10">
                <h1 
                    onClick={() => router.visit(show(artist.artist_id))} 
                    className="hover:underline cursor-pointer text-4xl font-bold mb-6"
                >
                    {artist.artist_name}
                </h1>

                {groupedData.map((group: any, index: number) => (
                    <div key={group.album.id} className="mb-20">
                        <div className="flex mb-8">
                            <img 
                                className="size-60 mr-8 rounded-lg object-cover" 
                                src={proxyUrl(group.album.artwork)} 
                                alt={group.album.title}
                            />
                            <div>
                                <h2 href={()=>"../album/"+group.album.id} className="hover:underline cursor-pointer text-3xl font-bold mb-2">
                                    {group.album.title.toUpperCase()}
                                </h2>
                                <div className="flex gap-4 mb-4">
                                    <span className="text-gray-400">{group.album.type}</span>
                                    <span className="text-gray-400">{group.album.date.substring(0, 4)}</span>
                                </div>
                                <button 
                                    className="w-14 h-14 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-110 transition"
                                    onClick={() => playTracks(group.tracks[0]?.id)}
                                >
                                </button>
                            </div>
                        </div>

                        <table className="w-full text-left mb-8">
                            <thead>
                                <tr className="text-gray-400 border-b border-gray-700">
                                    <th className="pb-2">#</th>
                                    <th className="pb-2">TITRE</th>
                                    <th className="pb-2">LECTURES</th>
                                    <th className="pb-2 text-right">DURÉE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {group.tracks
                                    .sort((a: any, b: any) => (b.listens ?? 0) - (a.listens ?? 0))
                                    .map((track: any, trackIndex: number) => (
                                        <tr
                                            key={track.id}
                                            className="hover:bg-white/10 cursor-pointer transition group"
                                            onClick={() => playTracks(track.id)}
                                        >
                                            <td className="p-3 rounded-l-lg">{trackIndex + 1}</td>
                                            <td className="p-3 flex items-center gap-3">
                                                <img 
                                                    src={proxyUrl(track.artwork)} 
                                                    className="w-10 h-10 rounded object-cover bg-gray-800" 
                                                    alt={track.title}
                                                />
                                                <span className="font-medium group-hover:text-primary transition">
                                                    {track.title}
                                                </span>
                                            </td>
                                            <td className="p-3">{track.listens}</td>
                                            <td className="p-3 text-right rounded-r-lg font-mono text-sm">
                                                {track.duration
                                                    ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
                                                    : '-'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ))}

            </div>
        </AppHeaderLayout>
    );
}