import { Link } from '@inertiajs/react';

type ArtistLinkProps = {
    artist?: {
        artist_id: number;
        artist_name: string;
    } | null;
};

export function ArtistLink({ artist }: ArtistLinkProps) {
    if (!artist) {
        return '—';
    }

    return (
        <Link href={`/artiste/${artist.artist_id}`}>
            {artist.artist_name}
        </Link>
    );
}
