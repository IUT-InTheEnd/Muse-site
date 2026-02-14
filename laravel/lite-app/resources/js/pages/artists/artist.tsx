import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { proxyUrl } from '@/components/proxy';
import { Link, router } from '@inertiajs/react';
import { allTracks } from '@/actions/App/Http/Controllers/ArtistController';
import { AlbumSlider } from '@/components/musecomponents/sliders/AlbumSlider';
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { CardContent, CardCover, CardSubtitle, CardTitle } from '@/components/musecomponents/cards/Card';
import { useMusicPlayer } from '@/hooks/use-music-player';

export default function Artist({ artist, tracks, albums }: any) {
    const { playTrack } = useMusicPlayer();


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

    return (
        <AppLayout>
        <div className="flex flex-col relative min-h-screen p-36">
            <div className="backgroundimg-container">
                <div className="gradient"></div>
                <img className="background-artist" src={proxyUrl(artist.artist_image_file)} alt="Cover"/>
                </div>
                

            <div className="flex flex-col ml-20 gap-24 pt-48 relative">
                <div className="flex flex-col">
                    <p className="text-8xl font-bold mb-4 text-shadow-lg/20">{artist.artist_name.toUpperCase()}</p>
                    <div className="flex flex-row gap-2">
                        <Button size="lg">
                            Écouter
                        </Button>
                        <Button size="lg" variant="secondary">
                            Suivre
                        </Button>
                    </div>
                </div>

                <div className="flex flex-row flex-wrap justify-center gap-32">
                    <div className="flex flex-col">
                        <h2>Dernière Musique</h2>
                        
                        {(() => {
                                const sorted = Array.isArray(tracks)
                                    ? [...tracks].sort((a, b) => (b.date.substring(0,4) ?? 0) - (a.date.substring(0,4)?? 0))
                                    : [];
                            return (
                                <>
                                    <img 
                                        className="size-60 cursor-pointer"
                                        src={proxyUrl(sorted[0]?.artwork)}
                                        onClick={() => playTracks(sorted[0]?.id)}
                                    />
                                <h3 className='line-clamp-2 w-3xs'>{sorted[0]?.title.toUpperCase()}</h3>
                                <div className="flex">
                                        <div>{sorted[0]?.type}</div>
                                        <div>{sorted[0]?.date.substring(0,4)}</div>
                                </div>
                              </>
                            );
                        })()}
                    </div>
                    <div className="flex flex-col">
                        <h2>Dernier Album</h2>
                        {(() => {
                                const sorted = Array.isArray(albums)
                                    ? [...albums].sort((a, b) => (b.date.substring(0,4) ?? 0) - (a.date.substring(0,4)?? 0))
                                    : [];
                            return (
                                <>
                                    <MusicCard className='size-60'>
                                        <Link href="/albums/12">
                                            <CardCover src="/images/Crevecoeur.jpg" alt="Les étoiles vagabondes" />
                                            <CardContent>
                                                <CardTitle><p>jifezojfoieziofezj</p></CardTitle>
                                                <CardSubtitle>Nekfeu</CardSubtitle>
                                            </CardContent>
                                        </Link>
                                        </MusicCard> 
                              </>
                            );
                        })()}
                    </div>
                </div>

                    <div className="ml-20 mt-10">
                        <div className='flex items-baseline justify-between'>
                    <h2 className="text-2xl font-bold mb-6">Populaire</h2>
                        <a className="cursor-pointer hover:underline"onClick={() => {
                            router.visit(allTracks(artist.artist_id));
                            }}>Voir tout</a>
                    </div>
                    <table className="w-full text-left">
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
                                return sorted.slice(0,6);
                            })().map((track: any, index: number) => (
                                <tr 
                                    key={track.id} 
                                    className="hover:bg-white/10 cursor-pointer transition group"
                                    onClick={() => playTracks(track.id)}
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
                </div>
                <div className="ml-20 mt-10">
                        <div className="flex flex-row flex-wrap gap-4 mt-6">
                            <AlbumSlider title="Discographie">
                            {(() => {
                                const sorted = Array.isArray(albums)
                                    ? [...albums].sort((a, b) => (b.date.substring(0, 4) ?? 0) - (a.date.substring(0, 4) ?? 0))
                                    : [];
                                return sorted
                            })().map((album: any, index: number) => (
                                (
                                    <AlbumCard  className='size-60'>
                                        <Link href={"../album/"+album.id}>
                                            <CardCover src={proxyUrl(album.artwork)} alt="Les étoiles vagabondes" />
                                            <CardContent>
                                            <CardTitle>{album.title.toUpperCase()}</CardTitle>
                                            <CardSubtitle>Nekfeu</CardSubtitle>
                                            </CardContent>
                                        </Link>
                                        </AlbumCard> 
                                )
                            ))}     
                        </AlbumSlider>
                    </div>
                </div>
            </div>
            </div>
            </AppLayout>
    );
}