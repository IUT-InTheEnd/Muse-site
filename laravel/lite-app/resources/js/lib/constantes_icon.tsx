import { AudioLines, BookOpen, BriefcaseBusiness, Car, Cpu, Dumbbell, Flame, Frown, Gamepad2, Globe, Guitar, Heart, Languages, MicVocal, Moon, MoonStar, PartyPopper, Piano, Radio, Smile, Sofa, UtensilsCrossed, Waves, Zap } from "lucide-react";

export const CONTEXTE_ICON: Record<string, any> = {
    'Sport': <Dumbbell size={18} />,
    'Travail / études': <BriefcaseBusiness size={18} />,
    'Détente': <Sofa size={18} />,
    'Soirée entre amis': <PartyPopper size={18} />,
    'Trajet': <Car size={18} />,
    'Jeu vidéo': <Gamepad2 size={18} />,
    'Tâche ménagère ou cuisine': <UtensilsCrossed size={18} />,
    'Lecture / écriture': <BookOpen size={18} />,
    'Dormir': <MoonStar size={18} />,
};

export const PREFERENCE_ICON: Record<string, any> = {
    'Les paroles': <MicVocal size={18} />,
    "L'ambiance musicale": <Waves size={18} />,
    'Les deux / Sans préférence': <AudioLines size={18} />,
};

export const STYLE_ICON: Record<string, any> = {
    'Plutôt acoustique / naturelle': <Guitar size={18} />,
    'Plutôt électronique / synthétique': <Cpu size={18} />,
    'Les deux / Sans préférence': <Radio size={18} />,
};

export const LANGUE_ICON: Record<string, any> = {
    'Français': <Languages size={18} />,
    'Anglais': <Languages size={18} />,
    'Japonais': <Languages size={18} />,
    'Espagnol': <Languages size={18} />,
    'Russe': <Languages size={18} />,
    'Coréen': <Languages size={18} />,
    'Latin': <Languages size={18} />,
    'Allemand': <Languages size={18} />,
    'Plutôt instrumental': <Piano size={18} />,
    'Peu importe / Indifférent': <Globe size={18} />,
};

export const HUMEUR_ICON: Record<string, any> = {
    'Joyeuse': <Smile size={18} />,
    'Triste': <Frown size={18} />,
    'Énergique': <Flame size={18} />,
    'Calme': <Moon size={18} />,
    'Romantique': <Heart size={18} />,
    'Motivé': <Zap size={18} />,
};