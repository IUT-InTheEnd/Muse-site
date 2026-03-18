import type { ReactNode } from 'react';
import {
    TrackSliderSection,
    type SliderTrackArtist,
    type SliderTrack,
} from '@/components/musecomponents/sliders/TrackSliderSection';

type NewTracksSectionProps = {
    tracks: SliderTrack[];
    renderArtist?: (artist?: SliderTrackArtist) => ReactNode;
};

export function NewTracksSection({
    tracks,
    renderArtist,
}: NewTracksSectionProps) {
    return (
        <TrackSliderSection
            title="Nouveautés"
            tracks={tracks}
            renderArtist={renderArtist}
        />
    );
}
