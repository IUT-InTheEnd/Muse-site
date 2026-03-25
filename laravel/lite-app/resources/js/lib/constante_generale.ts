export const SIDEBAR_COOKIE_NAME = "sidebar_state" as const;
export const SIDEBAR_COOKIE_MAX_AGE = 604800 as const; 
export const SIDEBAR_WIDTH = "16rem" as const;
export const SIDEBAR_WIDTH_MOBILE = "18rem" as const;
export const SIDEBAR_WIDTH_ICON = "3rem" as const;
export const SIDEBAR_KEYBOARD_SHORTCUT = "b" as const;

export const LONGUEUR_MDP = 14 as const;
export const MAJUSCULE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const;
export const MINUSCULE = 'abcdefghijklmnopqrstuvwxyz' as const;
export const NOMBRE = '0123456789' as const;
export const SYMBOLE = '!@#$%^&*()_+?' as const;

export const STEPS = [
    { id: 1, label: 'Genres' },
    { id: 2, label: 'Artistes' },
    { id: 3, label: 'Préférences' },
    { id: 4, label: 'Récap' },
  ] as const;

export const TYPEIMAGE = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
] as const;