export const GENDER_OPTIONS = [
    'Homme',
    'Femme',
    'Non-binaire',
    'Autre',
] as const;

export const JOB_OPTIONS = [
    'Collégien(ne) / lycéen(ne)',
    'Etudiant(e)',
    'Etudiant(e) en alternance',
    'Employé(e) à plein temps',
    'Employé(e) à mi-temps',
    'Travailleur indépendant',
    'Sans emploi',
    'Retraité(e)',
    'Je préfère ne pas répondre',
] as const;

export const PLAYS_MUSIC_OPTIONS = [
    { value: '1', label: 'Oui' },
    { value: '0', label: 'Non' },
] as const;

export const INSTRUMENT_OPTIONS = [
    'Guitare / Basse / Banjo',
    'Piano / Clavier',
    'Batterie / Percussions',
    'Violon / Alto / Violoncelle',
    'Instruments à vent',
    'Chant',
    'Autre',
] as const;

export const MUSIC_CONTEXT_OPTIONS = [
    'Travail / études',
    'Trajet',
    'Détente',
    'Sport',
    'Jeu vidéo',
    'Cuisine',
    'Fête',
    'Autre',
] as const;
