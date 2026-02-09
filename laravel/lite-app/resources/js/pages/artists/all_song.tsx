import Navbar from "@/components/musecomponents/Navbar";
import { Button } from '@/components/ui/button';
import MusicPlayer from '@/components/ui/musicplayer';


export default function All_Song({ artist, tracks,albums }: any) {
    return (
        <div className="relative min-h-screen">
            <Navbar /> 
            <div className="backgroundimg-container">
                <div className="gradient"></div>
                <img className="background-image" src="/img/images.jpg" alt="Cover"/>
            </div>

            <div className="flex flex-col ml-20 gap-24 pt-48 relative">
                <div className="flex flex-col">
                    <p className="text-8xl font-bold text-white mb-4">{artist.artist_name.toUpperCase()}</p>
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
                        <div className="size-60 bg-black"></div>
                        {(() => {
                                const sorted = Array.isArray(tracks)
                                    ? [...tracks].sort((a, b) => (b.date.substring(0,4) ?? 0) - (a.date.substring(0,4)?? 0))
                                    : [];
                            return (
                              <>
                                <div>{sorted[0]?.title}</div>
                                    <div>{sorted[0]?.type}</div>
                                    <div>{sorted[0]?.date.substring(0,4)}</div>
                              </>
                            );
                        })()}
                    </div>
                    <div className="flex flex-col">
                        <h2>Dernier Album</h2>
                        <div className="size-60 bg-black"></div>
                        {(() => {
                                const sorted = Array.isArray(albums)
                                    ? [...albums].sort((a, b) => (b.date.substring(0,4) ?? 0) - (a.date.substring(0,4)?? 0))
                                    : [];
                            return (
                              <>
                                <div>{sorted[0]?.title}</div>
                                    <div>{sorted[0]?.type}</div>
                                    <div>{sorted[0]?.date.substring(0,4)}</div>
                              </>
                            );
                        })()}
                    </div>
                </div>

                <div className="ml-20 mt-10">
                    <h2 className="text-2xl font-bold mb-6">Populaire</h2>
                
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
                                >
                                    <td className="p-3 rounded-l-lg">{index + 1}</td>
                                    <td className="p-3 flex items-center gap-3">
                                        <img src={track.artwork} className="w-10 h-10 rounded object-cover bg-gray-800" />
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
                    <h2 className="text-2xl font-bold">Discographie</h2>
                    <div className="flex flex-row flex-wrap gap-4 mt-6">
                        {albums.map(album => (
                            <div className="flex flex-col">
                                <div className="size-80 bg-black"></div>
                                <div>{album.title}</div>
                                <div className="flex gap-2">
                                    <div>{album.type}</div>
                                    <div>{album.date.substring(0,4)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <MusicPlayer
                        />
        </div>
    );
}