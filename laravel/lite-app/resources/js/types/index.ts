export type * from './auth';
export type * from './navigation';
export type * from './ui';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    blindTest?: {
        has_ephemeral: boolean;
        ephemeral: {
            track_count: number;
            generated_at?: string | null;
            generation?: Record<string, unknown> | null;
        } | null;
        playback: {
            difficulty: 'facile' | 'moyen' | 'dur';
        };
    };
    sidebarOpen: boolean;
    [key: string]: unknown;
};
