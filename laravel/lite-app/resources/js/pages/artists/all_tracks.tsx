import {  useState } from 'react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import MusicPlayer from '@/components/ui/musicplayer';
import { proxyUrl } from '@/components/proxy';
import {PlayIcon,PauseIcon} from "lucide-react";
import React from 'react';
import { router } from '@inertiajs/react';
import { show } from '@/actions/App/Http/Controllers/ArtistController';

export default function AllTracks({ artist, tracks, albums }: any) {
    const [playing, setPlaying] = React.useState(false);
    const [showMusicPlayer, setShowMusicPlayer] = useState(false);

    const playTrack = async (trackId: number) => {
        try {
            setShowMusicPlayer(true);
            const res = await fetch(
                `/test-music-player?id=${encodeURIComponent(trackId)}`,
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
            alert('Impossible de charger la musique.');
        }
    };
    return (
        <AppHeaderLayout>
            <div className="relative min-h-screen p-10">
                <h1 onClick={()=>router.visit(show(artist.artist_id))} className="hover:underline cursor-pointer text-4xl font-bold mb-6">{artist.artist_name}</h1>
            {(() => {
                const sorted = Array.isArray(albums)
                    ? [...albums].sort((a, b) => (b.date.substring(0, 4) ?? 0) - (a.date.substring(0, 4) ?? 0))
                    : [];
                return sorted
            })().map((album: any, index: number) => (
                (
                    <>
                    <div className="flex mb-8">
                        <img className="size-60 mr-8"  src={proxyUrl(album.artwork)} />
                        <div>
                            <h3 className='line-clamp-2 w-3xs'>{album.title.toUpperCase()}</h3>
                            <div className="flex gap-2">
                                <div>{album.type}</div>
                                <div>{album.date.substring(0, 4)}</div>
                                </div>
                                <button className="w-14 h-14 mt-8 flex items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black"
                                onClick={() => playTrack(14)}
                                >
                                    {playing ? <PauseIcon size={28} /> : <PlayIcon size={28} />}
                                </button>
                            </div>
                    </div>
                    <table className="w-full text-left mb-20">
                    <thead>
                        <tr className="text-gray-400 border-b border-gray-700">
                            <th className="pb-2">#</th>
                            <th className="pb-2">TITRE</th>
                            <th className="pb-2">LECTURES</th>
                            <th className="pb-2 text-right">DURÉE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const sorted = Array.isArray(tracks)
                                ? [...tracks].sort((a, b) => (b.listens ?? 0) - (a.listens ?? 0))
                                : [];
                            return sorted;
                        })().map((track: any, index: number) => (
                            <tr
                                key={track.id}
                                className="hover:bg-white/10 cursor-pointer transition group"
                                onClick={() => playTrack(track.id)}
                            >
                                <td className="p-3 rounded-l-lg">{index + 1}</td>
                                <td className="p-3 flex items-center gap-3">
                                    <img src={proxyUrl(track.artwork)} className="w-10 h-10 rounded object-cover bg-gray-800" />
                                    <span className="font-medium group-hover:text-primary transition">
                                        {track.title}
                                    </span>
                                </td>
                                <td className="p-3 rounded-l-lg">{track.listens}</td>
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
                        </>
                )
            ))}
                <MusicPlayer
                    visible={showMusicPlayer}
                    onClose={() => setShowMusicPlayer(false)}
                />
                </div>
        </AppHeaderLayout>
        
    );
}