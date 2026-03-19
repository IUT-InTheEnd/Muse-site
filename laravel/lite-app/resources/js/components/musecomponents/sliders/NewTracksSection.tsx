import {
    TrackSliderSection,
    type SliderTrack,
} from '@/components/musecomponents/sliders/TrackSliderSection';

type NewTracksSectionProps = {
    tracks: SliderTrack[];
};

export function NewTracksSection({ tracks }: NewTracksSectionProps) {
    return <TrackSliderSection title="Nouveautés" tracks={tracks} />;
}
