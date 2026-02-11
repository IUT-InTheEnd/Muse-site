import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import Navbar from '@/components/musecomponents/Navbar';
import { Button } from '@/components/ui/button';
import { proxyUrl } from '@/components/proxy';
import { useMusicPlayer } from '@/contexts/music-player-context';

type Props = {
  album: Record<string, any>;
  artiste: Record<string, any>;
  nombreMusiques: number;
  listeMusiques: Array<Record<string, any>>;
};

export default function album({ album, artiste, nombreMusiques, listeMusiques }: Props) {
    const { auth } = usePage<SharedData>().props;

    const { playTrack } = useMusicPlayer();

    let total = 0;
    listeMusiques.forEach(element => {
        total += element.track_duration;
    });

    console.log(artiste.artist_id);

    const h = Math.floor(total / 3600);
    const min = Math.floor(total / 60);
    const sec = total % 60;

    return (
        <>
            <Head title={album.album_title}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center lg:justify-center">
                <header className="sticky top-0 z-50 w-full text-sm bg-neutral-100">
                    <Navbar user={auth.user} />
                </header>
                <div className="relative flex w-full bg-cover bg-center h-80 items-center" style={{ backgroundImage: `url(${proxyUrl(album.album_image_file)})` }}>
                    <div className="absolute inset-0 bg-black/70 pointer-events-none"></div>
                    <main className="relative z-10 flex flex-col gap-6 text-left px-6 py-10 ml-8">
                        <div className="flex flex-col gap-2">
                            <h1 className="!text-6xl font-bold">
                                {album.album_title}
                            </h1>
                            <h2 className="text-white text-lg font-semibold">
                                {artiste.artist_name} • {album.album_date_created.split('-')[0]} • 
                                {nombreMusiques > 0 ? ` ${nombreMusiques} titres` : '0 titre'} • 
                                {h > 0 ? ` ${h}h ` : ''} {min % 60} min { sec} sec
                            </h2>
                        </div>

                        <div className="flex gap-2 max-w-sm">
                            <Button className="flex-1" onClick={async () => {
                            try {
                                const res = await fetch(
                                    `/test-music-player?id=${encodeURIComponent(listeMusiques[0].track_id)}`,
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
                        }}>Écouter</Button>
                            <Button className="flex-2">Ajouter à ma bibliothèque</Button>
                        </div>
                    </main>
                </div>
                <div className="w-full mb-10 justify-center">
                    <table className="w-5xl border-collapse justify-center m-auto mt-10 mb-50">
                        <thead>
                            <tr className="border-b text-left text-sm">
                                <th className="py-3 w-12 text-center">#</th>
                                <th className="py-3 w-100">TITRE</th>
                                <th className="py-3 text-right">LECTURES</th>
                                <th className="py-3 w-100 text-right pr-3">DURÉE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listeMusiques.map((element, index) => (
                                <tr key={element.track_id} className="hover:bg-gray-500/20 transition hover:rounded-md" onClick={async () => {
                            try {
                                const res = await fetch(
                                    `/test-music-player?id=${encodeURIComponent(element.track_id)}`,
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
                        }}>
                                    <td className="py-3 text-center">{index + 1}</td>
                                    <td className="py-3 flex">
                                        <img className="w-12 h-12" src={proxyUrl(element.track_image_file)}></img>
                                        <div>
                                            <div className="ml-4">
                                                {element.track_title}
                                            </div>
                                            <div className="ml-4 text-sm text-gray-500">
                                                {artiste.artist_name}
                                            </div>
                                        </div>
                                  </td>
                                  <td className="py-3 text-right font-mono">
                                      {element.track_listens ? element.track_listens.toLocaleString("fr-FR") : "???"}
                                  </td>
                                  <td className="py-3 text-right font-mono pr-3">
                                      {`${Math.floor(element.track_duration / 3600) == 0 ? '' : `${Math.floor(element.track_duration / 3600)}:`}${Math.floor(element.track_duration / 60)}:${element.track_duration % 60}`}
                                  </td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}