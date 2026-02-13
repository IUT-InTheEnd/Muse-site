export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    user_image_file?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    // User profile information
    user_age?: number | null;
    user_job?: string | null;
    user_plays_music?: string | null;
    user_gender?: string | null;
    user_instruments?: string | null;
    user_music_contexts?: string | null;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
