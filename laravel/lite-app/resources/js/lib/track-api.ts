import { proxyUrl } from '@/components/proxy';

// Structure de données d'une piste telle que renvoyée par l'API. (api interne hein)
export type TrackData = {
    id?: number;
    src: string;
    title?: string;
    artist?: string;
    artistid?: number;
    artwork?: string;
    likes?: number;
    dislikes?: number;
    reaction?: 'like' | 'dislike' | null;
};

type RawTrackData = {
    id: number;
    url: string;
    title: string;
    artist: string;
    artistid: number;
    artwork: string;
    likes?: number;
    dislikes?: number;
    reaction?: 'like' | 'dislike' | null;
};

function mapRawTrack(d: RawTrackData): TrackData {
    return {
        id: d.id,
        src: proxyUrl(d.url) ?? '',
        title: d.title,
        artist: d.artist,
        artistid: d.artistid,
        artwork: proxyUrl(d.artwork),
        likes: d.likes ?? 0,
        dislikes: d.dislikes ?? 0,
        reaction: d.reaction ?? null,
    };
}

// Fetch plusieurs pistes par leurs IDs. Renvoie un tableau de TrackData.
export async function fetchTracks(ids: number[]): Promise<TrackData[]> {
    if (ids.length === 0) return [];
    const res = await fetch(`/tracks?ids=${ids.join(',')}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: RawTrackData[] = await res.json();
    return data.map(mapRawTrack);
}

// Fetch une piste par son ID. Renvoie une TrackData ou lance une erreur si la piste n'existe pas.
export async function fetchTrack(id: number): Promise<TrackData> {
    const tracks = await fetchTracks([id]);
    if (tracks.length === 0) throw new Error(`Track ${id} not found`);
    return tracks[0];
}
