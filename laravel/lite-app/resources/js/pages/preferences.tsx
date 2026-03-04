import StepBar from '@/components/StepBar';
import { Clock, Languages, MicVocal, Guitar, Smile, SunMoon } from 'lucide-react';
import { BriefcaseBusiness, Car, Dumbbell, Gamepad2, Sofa, BookOpen, PartyPopper,UtensilsCrossed, MoonStar, Waves, AudioLines} from 'lucide-react';
import { Cpu, Radio } from 'lucide-react';
import { Piano, Globe } from 'lucide-react';
import { Frown, Flame, Moon, Heart, Zap } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { proxyUrl } from '@/components/proxy';
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
interface Artist {
    id: number;
    artist_name: string;
    artist_image_file: string;
}


const PreferenceForm = () => {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        genres: [] as string[],
        artists: [] as number[],
        moments: [] as string[],
        preferences: '' as string,
        styles: '' as string,
        langues: [] as string[],
        duree: '' as string,
        humeurs: [] as string[]
    });

    const handleFinish = () => {
        router.post('/preferences', formData, {
            onSuccess: () => {
                alert('Tes préférences ont été enregistrées !');
            },
            onError: (errors) => {
                console.error("Erreur lors de l'enregistrement", errors);
            }
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    // --- MAPPINGS D'ICÔNES ---
    const iconMap: Record<string, any> = {
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

    const preferenceIconMap: Record<string, any> = {
        'Les paroles': <MicVocal size={18} />,
        "L'ambiance musicale": <Waves size={18} />,
        'Les deux / Sans préférence': <AudioLines size={18} />,
    };

    const styleIconMap: Record<string, any> = {
        'Plutôt acoustique / naturelle': <Guitar size={18} />,
        'Plutôt électronique / synthétique': <Cpu size={18} />,
        'Les deux / Sans préférence': <Radio size={18} />,
    };

    const langueIconMap: Record<string, any> = {
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

    const humeurIconMap: Record<string, any> = {
        'Joyeuse': <Smile size={18} />,
        'Triste': <Frown size={18} />,
        'Énergique': <Flame size={18} />,
        'Calme': <Moon size={18} />,
        'Romantique': <Heart size={18} />,
        'Motivé': <Zap size={18} />,
    };

    return (
        <div className="w-full max-w-5xl mx-auto py-12 px-4">
            <StepBar currentStep={step} />

            <div className="mt-12 min-h-[500px]">
                {/* --- STEP 1: GENRES --- */}
                {step === 1 && (
                    <section className="animate-fadeIn">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold uppercase tracking-tight">Quels sont vos genres préférés ?</h1>
                            <p className="text-gray-400 mt-2">Sélectionnez au moins 3 genres musicaux</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {genres.map((genre) => {
                                const isSelected = formData.genres.includes(genre.name);
                                return (
                                    <div 
                                        key={genre.id}
                                        onClick={() => {
                                            const newGenres = isSelected 
                                                ? formData.genres.filter(g => g !== genre.name)
                                                : [...formData.genres, genre.name];
                                            setFormData({...formData, genres: newGenres});
                                        }}
                                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${isSelected ? 'border-[#5E00FF]' : 'border-transparent hover:border-gray-600'}`}
                                    >
                                        <img src={genre.image} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110" alt={genre.name} />
                                        <div className={`absolute inset-0 ${isSelected ? 'bg-[#5E00FF]/40' : 'bg-black/40'}`} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white font-black text-2xl uppercase tracking-tighter drop-shadow-md">{genre.name}</span>
                                        </div>
                                        {isSelected && <div className="absolute top-2 right-2 bg-white text-[#5E00FF] rounded-full p-1"><Check size={16} strokeWidth={4}/></div>}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* --- STEP 2: ARTISTES --- */}
                {step === 2 && (
                    <section className="animate-fadeIn">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold uppercase tracking-tight">Vos artistes préférés</h1>
                            <div className="mt-6 max-w-md mx-auto">
                                <input 
                                    type="text" 
                                    placeholder="Rechercher..." 
                                    className="w-full bg-[#1e2530] border border-gray-700 rounded-full px-6 py-2 text-white focus:border-[#5E00FF] outline-none"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {allArtists
                                ?.filter(a => a.artist_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchQuery.toLowerCase()))
                                .slice(0, 12)
                                .map((art) => {
                                    const isSelected = formData.artists.includes(art.artist_id);
                                    return (
                                        <div 
                                            key={art.artist_id}
                                            onClick={() => {
                                                const newArt = isSelected ? formData.artists.filter(id => id !== art.artist_id) : [...formData.artists, art.artist_id];
                                                setFormData({...formData, artists: newArt});
                                            }}
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${isSelected ? 'border-[#5E00FF]' : 'border-transparent'}`}
                                        >
                                            <img src={proxyUrl(art.artist_image_file)} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                            <div className={`absolute inset-0 ${isSelected ? 'bg-[#5E00FF]/40' : 'bg-black/50'}`} />
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <p className="text-3xl font-bold text-white text-center uppercase leading-none drop-shadow-lg">{art.artist_name.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                )}

                {/* --- STEP 3: PRÉFÉRENCES --- */}
                {step === 3 && (
                    <section className="space-y-10 animate-fadeIn">
                        {/* Moments */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-800 pb-2 text-[#FDFDFF]"><SunMoon size={20}/><h3 className="font-bold">Quand écoutez-vous de la musique ?</h3></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(iconMap).map(m => (
                                    <button key={m} onClick={() => {
                                        const newM = formData.moments.includes(m) ? formData.moments.filter(i => i !== m) : [...formData.moments, m];
                                        setFormData({...formData, moments: newM});
                                    }} className={`${formData.moments.includes(m) ? 'bouton-primary' : 'bouton-secondary'} !justify-start px-4`}>
                                        <div className="shrink-0 mr-3">{iconMap[m]}</div><span className="flex-1 text-center">{m}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Paroles/Ambiance */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-800 pb-2 text-[#FDFDFF]"><MicVocal size={20}/><h3 className="font-bold">Vous préférez...</h3></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.keys(preferenceIconMap).map(p => (
                                    <button key={p} onClick={() => setFormData({...formData, preferences: p})} className={`${formData.preferences === p ? 'bouton-primary' : 'bouton-secondary'} !justify-start px-4`}>
                                        <div className="shrink-0 mr-3">{preferenceIconMap[p]}</div><span className="flex-1 text-center">{p}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Langues */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-800 pb-2 text-[#FDFDFF]"><Languages size={20}/><h3 className="font-bold">Langues préférées</h3></div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {Object.keys(langueIconMap).map(l => (
                                    <button key={l} onClick={() => {
                                        const newL = formData.langues.includes(l) ? formData.langues.filter(i => i !== l) : [...formData.langues, l];
                                        setFormData({...formData, langues: newL});
                                    }} className={`${formData.langues.includes(l) ? 'bouton-primary' : 'bouton-secondary'} text-sm !py-2`}>{l}</button>
                                ))}
                            </div>
                        </div>

                        {/* Humeurs */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-gray-800 pb-2 text-[#FDFDFF]"><Smile size={20}/><h3 className="font-bold">Humeurs musicales</h3></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(humeurIconMap).map(h => (
                                    <button key={h} onClick={() => {
                                        const newH = formData.humeurs.includes(h) ? formData.humeurs.filter(i => i !== h) : [...formData.humeurs, h];
                                        setFormData({...formData, humeurs: newH});
                                    }} className={`${formData.humeurs.includes(h) ? 'bouton-primary' : 'bouton-secondary'} !justify-start px-4`}>
                                        <div className="shrink-0 mr-3">{humeurIconMap[h]}</div><span className="flex-1 text-center">{h}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* --- STEP 4: RÉCAP --- */}
                {step === 4 && (
                    <section className="animate-fadeIn max-w-2xl mx-auto space-y-8">
                        <h1 className="text-center text-4xl font-black uppercase italic">Récapitulatif</h1>
                        <div className="bg-[#1e2530] p-8 rounded-3xl border border-gray-800 space-y-8 text-[#FDFDFF]">
                            <div className="relative border-b border-gray-700 pb-4">
                                <h3 className="text-[#5E00FF] font-bold uppercase text-xs tracking-widest mb-2">Genres</h3>
                                <p className="text-xl">{formData.genres.join(', ') || 'Aucun'}</p>
                                <button onClick={() => setStep(1)} className="absolute top-0 right-0 text-gray-500 hover:text-white"><Pencil size={18}/></button>
                            </div>
                            <div className="relative border-b border-gray-700 pb-4">
                                <h3 className="text-[#5E00FF] font-bold uppercase text-xs tracking-widest mb-2">Moments & Humeurs</h3>
                                <p className="text-lg"><strong>Quand :</strong> {formData.moments.join(', ')}</p>
                                <p className="text-lg"><strong>Humeurs :</strong> {formData.humeurs.join(', ')}</p>
                                <button onClick={() => setStep(3)} className="absolute top-0 right-0 text-gray-500 hover:text-white"><Pencil size={18}/></button>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* --- NAVIGATION GLOBALE --- */}
            <div className="flex justify-center gap-8 mt-16">
                {step > 1 && <button onClick={prevStep} className="bouton-secondary w-48">Retour</button>}
                <button 
                    onClick={step === 4 ? handleFinish : nextStep} 
                    className="bouton-primary w-40"
                >
                    {step === 4 ? 'Terminer' : 'Suivant'}
                </button>
            </div>
        </div>
    );
    
};

export default PreferenceForm;

// TODO LIST : 

// - Penser à un bouton skip, ou griser les boutons
// - Faire les genres et artistes
// - récupérer les données direct en Bdd
// - Se connecter a un compte et envoyer les données en bdd de ce compte
// - penser au format light
