import { proxyUrl } from '@/components/proxy';

// Structurally matches Track from music-player-context (TypeScript structural typing)
export type TrackData = {
    id?: number;
    src: string;
    title?: string;
    artist?: string;
    artwork?: string;
};

type RawTrackData = {
    id: number;
    url: string;
    title: string;
    artist: string;
    artwork: string;
};

function mapRawTrack(d: RawTrackData): TrackData {
    return {
        id: d.id,
        src: proxyUrl(d.url) ?? '',
        title: d.title,
        artist: d.artist,
        artwork: proxyUrl(d.artwork),
    };
}

/**
 * Fetch one or more tracks in a single HTTP request.
 * Returns an array matching the order of the resolved IDs.
 */
export async function fetchTracks(ids: number[]): Promise<TrackData[]> {
    if (ids.length === 0) return [];
    const res = await fetch(`/tracks?ids=${ids.join(',')}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: RawTrackData[] = await res.json();
    return data.map(mapRawTrack);
}

/**
 * Fetch a single track. Convenience wrapper around fetchTracks.
 */
export async function fetchTrack(id: number): Promise<TrackData> {
    const tracks = await fetchTracks([id]);
    if (tracks.length === 0) throw new Error(`Track ${id} not found`);
    return tracks[0];
}
