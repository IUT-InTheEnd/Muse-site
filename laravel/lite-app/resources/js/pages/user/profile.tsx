import { Head, Link } from '@inertiajs/react';
import { ListMusic, Lock, Music, Users } from 'lucide-react';
import { ArtistCard } from '@/components/musecomponents/cards/ArtistCard';
import {
    CardContent,
    CardCover,
    CardSubtitle,
    CardTitle,
} from '@/components/musecomponents/cards/Card';
import { PlaylistCard } from '@/components/musecomponents/cards/PlaylistCard';
import {
    TrackList,
    type TrackListItem,
} from '@/components/musecomponents/TrackList';
import { type PlaylistData } from '@/components/musecomponents/TrackRow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';

type Playlist = {
    playlist_id: number;
    playlist_name: string;
    playlist_cover?: string;
    playlist_image_file?: string;
    playlist_public: boolean;
    playlist_deletable: boolean;
    tracks_count?: number;
};

type Artist = {
    artist_id: number;
    artist_name: string;
    artist_image?: string;
};

type Track = {
    track_id: number;
    track_title: string;
    track_image_file?: string;
    track_duration?: number;
    track_listens?: number;
};

type Realiser = {
    artist: Artist;
};

type UserEcoute = {
    user_id: number;
    track_id: number;
    nb_ecoute: number | null;
    last_listen: string;
    track: Track & {
        realisers: Realiser[];
    };
};

type ProfilePageProps = {
    user: User;
    playlists: Playlist[];
    recent_tracks: UserEcoute[];
    followed_artists: Artist[];
    user_playlists?: PlaylistData[];
    favorite_track_ids?: number[];
    is_owner: boolean;
};

export default function Profile({
    user,
    playlists,
    recent_tracks,
    followed_artists,
    user_playlists = [],
    favorite_track_ids = [],
    is_owner,
}: ProfilePageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Profil', href: '#' },
        { title: user.name, href: '#' },
    ];

    const imageSrc = `/image/${user.user_image_file}`;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${user.name} - Profil`} />

            <div className="flex flex-col gap-6 pb-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

                    <div className="relative flex flex-col items-center gap-6 px-6 py-12 md:flex-row md:items-end md:gap-8 md:px-8 md:py-16">
                        <Avatar className="h-40 w-40 shadow-2xl ring-4 ring-background md:h-56 md:w-56">
                            <AvatarImage
                                src={imageSrc || user.avatar}
                                alt={user.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/20 text-4xl font-bold md:text-6xl">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
                            <span className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
                                Profil
                            </span>
                            <h1 className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
                                {user.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                {playlists.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        <ListMusic className="h-4 w-4" />
                                        {playlists.length} playlist
                                        {playlists.length > 1 ? 's' : ''}
                                        {!is_owner && (
                                            <>
                                                {' '}
                                                publique
                                                {playlists.length > 1
                                                    ? 's'
                                                    : ''}
                                            </>
                                        )}
                                    </span>
                                )}
                                {followed_artists.length > 0 && (
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {followed_artists.length} artiste
                                        {followed_artists.length > 1
                                            ? 's'
                                            : ''}{' '}
                                        suivi
                                        {followed_artists.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8 px-4 md:px-8">
                    {recent_tracks.length > 0 && (
                        <TrackList
                            title="Titres récents"
                            tracks={recent_tracks
                                .filter((ecoute) => ecoute.track)
                                .map((ecoute): TrackListItem => {
                                    const track = ecoute.track;
                                    const artist =
                                        track?.realisers?.[0]?.artist;
                                    return {
                                        track: {
                                            track_id: track.track_id,
                                            track_title: track.track_title,
                                            track_image_file:
                                                track.track_image_file,
                                            track_duration:
                                                track.track_duration,
                                            track_listens: track.track_listens,
                                            track_favorites: 0,
                                        },
                                        artist: artist
                                            ? {
                                                  artist_id: artist.artist_id,
                                                  artist_name:
                                                      artist.artist_name,
                                              }
                                            : undefined,
                                    };
                                })}
                            playlists={user_playlists}
                            favoriteTrackIds={favorite_track_ids}
                        />
                    )}

                    {playlists.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    {is_owner
                                        ? 'Mes playlists'
                                        : 'Playlists publiques'}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {playlists.map((playlist) => {
                                    const playlistImage =
                                        playlist.playlist_image_file
                                            ? `/image/${playlist.playlist_image_file}`
                                            : playlist.playlist_cover
                                              ? playlist.playlist_cover
                                              : !playlist.playlist_deletable
                                                ? '/images/default-fav-image.jpg'
                                                : '/images/default-playlist.jpg';

                                    return (
                                        <PlaylistCard
                                            key={playlist.playlist_id}
                                            className="p-3 transition-colors hover:bg-accent/50"
                                        >
                                            <Link
                                                href={`/playlist/${playlist.playlist_id}`}
                                            >
                                                <div className="relative">
                                                    <CardCover
                                                        src={playlistImage}
                                                        alt={
                                                            playlist.playlist_name
                                                        }
                                                        className="rounded-md shadow-lg"
                                                    />
                                                    {is_owner &&
                                                        !playlist.playlist_public && (
                                                            <div className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5">
                                                                <Lock className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                </div>
                                                <CardContent className="mt-3 px-0">
                                                    <CardTitle className="line-clamp-1 text-sm">
                                                        {playlist.playlist_name}
                                                    </CardTitle>
                                                    {playlist.tracks_count !==
                                                        undefined && (
                                                        <CardSubtitle className="text-muted-foreground">
                                                            {
                                                                playlist.tracks_count
                                                            }{' '}
                                                            titre
                                                            {playlist.tracks_count >
                                                            1
                                                                ? 's'
                                                                : ''}
                                                        </CardSubtitle>
                                                    )}
                                                </CardContent>
                                            </Link>
                                        </PlaylistCard>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {followed_artists.length > 0 && (
                        <section>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Artistes suivis
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {followed_artists.map((artist) => (
                                    <ArtistCard
                                        key={artist.artist_id}
                                        className="p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <Link
                                            href={`/artists/${artist.artist_id}`}
                                            className="flex flex-col items-center"
                                        >
                                            <CardCover
                                                src={
                                                    artist.artist_image ||
                                                    '/images/default-artist.jpg'
                                                }
                                                alt={artist.artist_name}
                                                rounded
                                                className="shadow-lg"
                                            />
                                            <CardContent className="mt-3 px-0 text-center">
                                                <CardTitle className="line-clamp-1 text-sm">
                                                    {artist.artist_name}
                                                </CardTitle>
                                                <CardSubtitle className="text-muted-foreground">
                                                    Artiste
                                                </CardSubtitle>
                                            </CardContent>
                                        </Link>
                                    </ArtistCard>
                                ))}
                            </div>
                        </section>
                    )}

                    {playlists.length === 0 &&
                        recent_tracks.length === 0 &&
                        followed_artists.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Music className="mb-4 h-16 w-16 text-muted-foreground/50" />
                                <h3 className="text-xl font-semibold">
                                    Aucune activité publique
                                </h3>
                                <p className="mt-2 text-muted-foreground">
                                    Cet utilisateur n'a pas encore de contenu
                                    public à afficher.
                                </p>
                            </div>
                        )}
                </div>
            </div>
        </AppLayout>
    );
}
