import { ArtistLink } from '@/components/musecomponents/ArtistLink';
import {
    CardCover,
    CardSubtitle,
} from '@/components/musecomponents/cards/Card';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { MusicSlider } from '@/components/musecomponents/sliders/MusicSlider';
import { proxyUrl } from '@/components/proxy';
import { CardContent, CardTitle } from '@/components/ui/card';
import { useMusicPlayer } from '@/hooks/use-music-player';

export type SliderTrackArtist =
    | {
          artist_id: number;
          artist_name: string;
      }
    | null
    | undefined;

export type SliderTrack = {
    id: number;
    title: string;
    cover?: string | null;
    artist?: SliderTrackArtist;
};

type TrackSliderSectionProps = {
    title: string;
    tracks: SliderTrack[];
};

export function TrackSliderSection({ title, tracks }: TrackSliderSectionProps) {
    const { playTrack } = useMusicPlayer();

    if (tracks.length === 0) {
        return null;
    }

    return (
        <MusicSlider title={title}>
            {tracks.filter(Boolean).map((track) => (
                <MusicCard
                    key={track.id}
                    trackId={track.id}
                    showPlayButton={false}
                    className="cursor-pointer"
                    onClick={async () => {
                        try {
                            const res = await fetch(
                                `/test-music-player?id=${encodeURIComponent(track.id)}`,
                            );
                            if (!res.ok) {
                                throw new Error(`HTTP ${res.status}`);
                            }

                            const data = await res.json();
                            playTrack({
                                id: track.id,
                                src: proxyUrl(data.url) ?? '',
                                title: data.title,
                                artist: data.artist,
                                artistid: data.artistid,
                                artwork: proxyUrl(data.artwork),
                            });
                        } catch (err) {
                            console.error(err);
                            void alert('Impossible de charger la musique.');
                        }
                    }}
                >
                    <CardCover
                        src={proxyUrl(track.cover) || '/images/default-artist.jpg'}
                    />
                    <CardContent>
                        <CardTitle>{track.title}</CardTitle>
                        <CardSubtitle>
                            <ArtistLink artist={track.artist} />
                        </CardSubtitle>
                    </CardContent>
                </MusicCard>
            ))}
        </MusicSlider>
    );
}
