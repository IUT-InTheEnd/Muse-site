import {
    allTracks,
    follow,
    show,
    unfollow,
} from '@/actions/App/Http/Controllers/ArtistController';
import { AlbumCard } from '@/components/musecomponents/cards/AlbumCard';
import {
    CardContent,
    CardCover,
    CardSubtitle,
    CardTitle,
} from '@/components/musecomponents/cards/Card';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { AlbumSlider } from '@/components/musecomponents/sliders/AlbumSlider';
import { TrackList } from '@/components/musecomponents/TrackList';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { useMusicPlayer } from '@/hooks/use-music-player';
import { fetchTrack } from '@/lib/track-api';
import { Head, Link, router } from '@inertiajs/react';

type Track = {
    id: number;
    title: string;
    duration?: number;
    listens?: number;
    favorites?: any;
    artwork?: string;
    artist?: {
        id: number;
        name: string;
    };
    [key: string]: any;
};

type Album = {
    id: number;
    title: string;
    date: string | null;
    artwork: string;
};

type Artist = {
    artist_id: number;
    artist_name: string;
    artist_image_file: string;
};

interface ArtistProps {
    artist: Artist;
    tracks: Track[];
    albums: Album[];
    isFollowing: boolean;
}

export default function Artist({
    artist,
    tracks,
    albums,
    isFollowing,
}: ArtistProps) {
    const { playTrack } = useMusicPlayer();

    const sorted_tracks = Array.isArray(tracks)
        ? [...tracks].sort((a, b) => (b.listens ?? 0) - (a.listens ?? 0))
        : [];

    const trackListItems = sorted_tracks.slice(0, 6).map((element: Track) => ({
        track: {
            track_id: element.id,
            track_title: element.title,
            track_image_file: element.artwork,
            track_duration: element.duration,
            track_favorites: element.favorites,
            track_listens: element.listens,
        },
        artist: element.artist
            ? {
                  artist_id: element.artist.id,
                  artist_name: element.artist.name,
              }
            : undefined,
    }));

    const playTracks = async (trackId: number) => {
        try {
            const track = await fetchTrack(trackId);
            playTrack(track);
        } catch (err) {
            console.error(err);
            void alert('Impossible de charger la musique.');
        }
    };

    return (
        <>
            <Head title={artist.artist_name}></Head>
            <div className="relative flex min-h-screen flex-col p-4 md:p-8 lg:p-36">
                <div className="backgroundimg-container">
                    <div className="gradient"></div>
                    <img
                        className="background-artist"
                        src={proxyUrl(artist.artist_image_file)}
                        alt="Cover"
                    />
                </div>

                <div className="relative ml-0 flex flex-col gap-6 pt-12 md:ml-8 md:gap-12 md:pt-24 lg:ml-20 lg:gap-24 lg:pt-48">
                    <div className="flex flex-col">
                        <p className="mb-4 text-4xl font-bold text-shadow-lg/20 md:text-6xl lg:text-8xl">
                            {artist.artist_name.toUpperCase()}
                        </p>
                        <div className="flex flex-row gap-2">
                            <Button
                                size="lg"
                                className="cursor-pointer"
                                onClick={() => playTracks(tracks[0]?.id)}
                            >
                                Écouter
                            </Button>
                            <Button
                                size="lg"
                                className="cursor-pointer"
                                variant="secondary"
                                onClick={async () => {
                                    try {
                                        if (isFollowing) {
                                            await router.delete(
                                                unfollow({
                                                    id: artist.artist_id,
                                                }).url,
                                            );
                                        } else {
                                            await router.post(
                                                follow({ id: artist.artist_id })
                                                    .url,
                                            );
                                        }
                                        router.visit(show(artist.artist_id));
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                            >
                                {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col flex-wrap justify-center gap-12 md:flex-row md:gap-8 lg:gap-32">
                        <div className="flex flex-col">
                            <h2 className="text-lg md:text-xl">
                                Dernière Musique
                            </h2>

                            {(() => {
                                const sorted = Array.isArray(tracks)
                                    ? [...tracks].sort(
                                          (a, b) =>
                                              parseInt(
                                                  b.date.substring(0, 4) ?? '0',
                                              ) -
                                              parseInt(
                                                  a.date.substring(0, 4) ?? '0',
                                              ),
                                      )
                                    : [];
                                return (
                                    <>
                                        <MusicCard className="size-40 overflow-visible px-0 md:size-60">
                                            <Link
                                                onClick={() =>
                                                    playTracks(sorted[0]?.id)
                                                }
                                            >
                                                <CardCover
                                                    src={proxyUrl(
                                                        sorted[0]?.artwork,
                                                    )}
                                                    alt={sorted[0]?.title}
                                                />
                                                <CardContent className="px-0">
                                                    <CardTitle className="line-clamp-2">
                                                        {sorted[0]?.title.toUpperCase()}
                                                    </CardTitle>
                                                    <CardSubtitle>
                                                        {sorted[0]?.date.substring(
                                                            0,
                                                            4,
                                                        )}
                                                    </CardSubtitle>
                                                </CardContent>
                                            </Link>
                                        </MusicCard>
                                    </>
                                );
                            })()}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg md:text-xl">
                                Dernier Album
                            </h2>
                            {(() => {
                                const sorted = Array.isArray(albums)
                                    ? [...albums].sort(
                                          (a, b) =>
                                              parseInt(
                                                  b.date?.substring(0, 4) ??
                                                      '0',
                                              ) -
                                              parseInt(
                                                  a.date?.substring(0, 4) ??
                                                      '0',
                                              ),
                                      )
                                    : [];
                                return (
                                    <>
                                        <AlbumCard className="size-40 overflow-visible px-0 md:size-60">
                                            <Link
                                                href={
                                                    '../album/' + sorted[0]?.id
                                                }
                                            >
                                                <CardCover
                                                    src={proxyUrl(
                                                        sorted[0]?.artwork,
                                                    )}
                                                    alt={sorted[0]?.title}
                                                />
                                                <CardContent className="px-0">
                                                    <CardTitle className="line-clamp-2">
                                                        {sorted[0]?.title.toUpperCase()}
                                                    </CardTitle>
                                                    {sorted[0]?.date ? (
                                                        <CardSubtitle>
                                                            {sorted[0]?.date.substring(
                                                                0,
                                                                4,
                                                            )}
                                                        </CardSubtitle>
                                                    ) : null}
                                                </CardContent>
                                            </Link>
                                        </AlbumCard>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="mt-4 ml-0 md:mt-6 md:ml-8 lg:mt-10 lg:ml-20">
                        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-baseline md:gap-0">
                            <h2 className="mb-4 text-xl font-bold md:mb-6 md:text-2xl">
                                Populaire
                            </h2>
                            <a
                                className="cursor-pointer text-sm hover:underline md:text-base"
                                onClick={() => {
                                    router.visit(allTracks(artist.artist_id));
                                }}
                            >
                                Voir tout
                            </a>
                        </div>
                        <div className="mx-auto max-w-5xl">
                            <div className="mb-4 hidden items-center gap-4 border-b border-gray-700 p-3 pb-2 text-left text-xs md:flex md:text-sm">
                                <div className="w-8">#</div>
                                <div className="flex-1">TITRE</div>
                                <div className="hidden md:block">LECTURES</div>
                                <div className="w-28 text-right">FAVORITES</div>
                                <div className="w-28 text-right">DURÉE</div>
                                <div className="flex w-20 items-center gap-1"></div>
                            </div>
                            <TrackList
                                tracks={trackListItems}
                                showIndex={true}
                            />
                        </div>
                        <div className="mt-10 ml-20">
                            <AlbumSlider title="Discographie">
                                {Array.isArray(albums)
                                    ? [...albums]
                                          .sort((a, b) => {
                                              // sécuriser les dates pour le tri
                                              const yearA = a.date
                                                  ? parseInt(
                                                        a.date.substring(0, 4),
                                                    )
                                                  : 0;
                                              const yearB = b.date
                                                  ? parseInt(
                                                        b.date.substring(0, 4),
                                                    )
                                                  : 0;
                                              return yearB - yearA;
                                          })
                                          .map((album) => {
                                              const year = album.date
                                                  ? album.date.substring(0, 4)
                                                  : 'Unknown Year';

                                              return (
                                                  <AlbumCard
                                                      key={album.id}
                                                      className="size-80 overflow-visible"
                                                  >
                                                      <Link
                                                          className="size-60"
                                                          href={
                                                              '../album/' +
                                                              album.id
                                                          }
                                                      >
                                                          <CardCover
                                                              src={proxyUrl(
                                                                  album.artwork,
                                                              )}
                                                              alt={album.title}
                                                          />
                                                          <CardContent className="px-0">
                                                              <CardTitle className="line-clamp-2">
                                                                  {album.title?.toUpperCase()}
                                                              </CardTitle>
                                                              <CardSubtitle>
                                                                  {year}
                                                              </CardSubtitle>
                                                          </CardContent>
                                                      </Link>
                                                  </AlbumCard>
                                              );
                                          })
                                    : []}
                            </AlbumSlider>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
