import { router } from '@inertiajs/react';
import { Clock, Languages, MicVocal, Guitar, Smile, SunMoon, Pencil, Check } from 'lucide-react';
import { BriefcaseBusiness, Car, Dumbbell, Gamepad2, Sofa, BookOpen, PartyPopper, UtensilsCrossed, MoonStar, Waves, AudioLines } from 'lucide-react';
import { Cpu, Radio, Piano, Globe, Frown, Flame, Moon, Heart, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { proxyUrl } from '@/components/proxy';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import StepBar from '@/components/ui/stepbar';

interface Artist {
    artist_id: number;
    artist_name: string;
    artist_image_file: string;
}

interface Genre {
    id: number;
    name: string;
    color: string;
}

const PreferenceForm = ({ allArtists, genres }: { allArtists: Artist[], genres: Genre[] }) => {
    const [step, setStep] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        genres: [] as number[],
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
                
            },
            onError: (errors) => {
                console.error("Erreur lors de l'enregistrement", errors);
            }
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

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
            <div className='text-white'>
                <StepBar currentStep={step} />
            </div>

            <div className="mt-12">
                {step === 1 && (
                    <section>
                        <div className="text-center mb-10">
                            <h1>Quels sont vos genres préférés ?</h1>
                            <h3 className="!text-gray-400">Sélectionnez au moins 3 genres musicaux</h3>
                            
                            <div className="mt-8 relative max-w-md mx-auto">
                                <Input 
                                    type="text"
                                    placeholder="Rechercher un genre..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-6 py-6"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {genres && genres
                                .filter((genre) => {
                                    const query = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                    const name = genre.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                                    return name.includes(query);
                                })
                                .slice(0, 12)
                                .map((genre) => {
                                    const isSelected = formData.genres.includes(genre.id);
                                    return (
                                        <div 
                                            key={genre.id}
                                            onClick={() => {
                                                const newGenres = isSelected 
                                                    ? formData.genres.filter(id => id !== genre.id)
                                                    : [...formData.genres, genre.id];
                                                setFormData({...formData, genres: newGenres});
                                            }}
                                            style={{ backgroundColor: genre.color }}
                                            className={`relative aspect-square overflow-hidden cursor-pointer border-2 group ${
                                                isSelected ? 'border-primary' : 'border-transparent hover:border-primary'
                                            }`}
                                        >
                                            <div className={`absolute inset-0 ${isSelected ? 'bg-primary/40' : 'bg-black/0'}`} />

                                            <div className="absolute inset-0 flex items-center text-white justify-center p-2 text-center">
                                                <h2 className="uppercase">{genre.name}</h2>
                                            </div>

                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-1">
                                                    <Check size={16} strokeWidth={4}/>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                )}

                {step === 2 && (
                    <section>
                        <div className="text-center mb-10">
                            <h1>Quels sont vos artistes préférés ?</h1>
                            <h3 className="!text-gray-400 mt-2">Sélectionnez au moins 3 artistes que vous aimez</h3>
                            <div className="mt-6 max-w-md mx-auto">
                                <Input 
                                    type="text" 
                                    placeholder="Rechercher un artiste..." 
                                    className="px-6 py-6"
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {allArtists && allArtists
                                .filter(a => a.artist_name?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(searchQuery.toLowerCase()))
                                .slice(0, 12)
                                .map((art) => {
                                    const isSelected = formData.artists.includes(art.artist_id);

                                    return (
                                        <div 
                                            key={art.artist_id}
                                            onClick={() => {
                                                const newArt = isSelected 
                                                    ? formData.artists.filter(id => id !== art.artist_id) 
                                                    : [...formData.artists, art.artist_id];
                                                setFormData({...formData, artists: newArt});
                                            }}
                                            className={`relative aspect-square overflow-hidden cursor-pointer border-3 transition-all group ${isSelected ? 'border-primary' : 'border-transparent hover:border-primary'}`}
                                        >
                                            <img 
                                                src={proxyUrl(art.artist_image_file)}
                                                className="absolute inset-0 w-full h-full object-cover z-0" 
                                                alt={art.artist_name}
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://via.placeholder.com/300?text=Image+Non+Disponible";
                                                }}
                                            />
                                            
                                            <div className={`absolute inset-0 ${isSelected ? 'bg-primary/40' : 'bg-black/50'}`} />
                                            
                                            <div className="absolute inset-0 flex text-white items-center justify-center p-4">
                                                <h2>{art.artist_name}</h2>
                                            </div>
                                            
                                            {isSelected && (
                                                <div className="absolute top-2 right-2 bg-white text-primary rounded-full p-1">
                                                    <Check size={20} strokeWidth={4}/>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </section>
                )}

                {step === 3 && (
                    <section className="space-y-12">
                        <div className="text-center">
                            <h1>Personnalisez votre expérience</h1>
                            <h2 className="!text-gray-400">Aidez-nous à cerner vos envies</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <SunMoon />
                                <h2 className="font-semibold">Quand écoutez-vous de la musique ?</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(iconMap).map((m) => (
                                    <Button
                                        key={m}
                                        variant={formData.moments.includes(m) ? "default" : "secondary"}
                                        onClick={() => {
                                            const newMoments = formData.moments.includes(m)
                                                ? formData.moments.filter(i => i !== m)
                                                : [...formData.moments, m];
                                            setFormData({...formData, moments: newMoments});
                                        }}
                                        className="border-none hover:bg-primary cursor-pointer"
                                    >
                                        <div className="shrink-0">{iconMap[m]}</div>
                                        <h6 className="flex-1 text-center pr-4">{m}</h6>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <MicVocal />
                                <h2 className="font-semibold">Dans une musique, vous préférez...</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(preferenceIconMap).map((p) => (
                                    <Button
                                        key={p}
                                        variant={formData.preferences === p ? "default" : "secondary"}
                                        onClick={() => setFormData({...formData, preferences: p})}
                                        className="border-none hover:bg-primary cursor-pointer"
                                    >
                                        <div className="shrink-0">{preferenceIconMap[p]}</div>
                                        <h6 className="flex-1 text-center pr-4">{p}</h6>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <Guitar />
                                <h2 className="font-semibold">Votre style de musique est...</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(styleIconMap).map((m) => (
                                    <Button
                                        key={m}
                                        variant={formData.styles === m ? "default" : "secondary"}
                                        onClick={() => setFormData({...formData, styles: m})}
                                        className="border-none hover:bg-primary cursor-pointer"
                                    >
                                        <div className="shrink-0">{styleIconMap[m]}</div>
                                        <h6 className="flex-1 text-center pr-4">{m}</h6>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <Languages />
                                <h2 className="font-semibold">Vous écoutez des musiques en...</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.keys(langueIconMap).map((m) => (
                                    <Button
                                        key={m}
                                        variant={formData.langues.includes(m) ? "default" : "secondary"}
                                        onClick={() => {
                                            const newLangues = formData.langues.includes(m)
                                                ? formData.langues.filter(i => i !== m)
                                                : [...formData.langues, m];
                                            setFormData({ ...formData, langues: newLangues });
                                        }}
                                        className="border-none hover:bg-primary cursor-pointer"
                                    >
                                        <div className="shrink-0">{langueIconMap[m]}</div>
                                        <h6 className="flex-1 text-center pr-4">{m}</h6>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <Clock />
                                <h2 className="font-semibold">Vous préférez les morceaux qui durent...</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {['Moins d\'une minute', '1 à 3 minutes','3 à 6 minutes', 'Plus de 6 minutes'].map((d) => (
                                    <div
                                        key={d}
                                        onClick={() => setFormData({...formData, duree: d})}
                                        className={`p-2 rounded-lg cursor-pointer flex flex-col items-center justify-center  ${
                                            formData.duree === d 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'hover:border-foreground hover:bg-primary'
                                        }`}
                                    >
                                        <h6 className="text-center">{d}</h6>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="pb-2 flex items-center border-b border-foreground gap-3">
                                <Smile />
                                <h2 className="font-semibold ">Quels types de musique écoutez-vous ?</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.keys(humeurIconMap).map((h) => (
                                    <Button
                                        key={h}
                                        variant={formData.humeurs.includes(h) ? "default" : "secondary"}
                                        onClick={() => {
                                            const newHumeurs = formData.humeurs.includes(h)
                                                ? formData.humeurs.filter(i => i !== h)
                                                : [...formData.humeurs, h];
                                            setFormData({ ...formData, humeurs: newHumeurs });
                                        }}
                                        className="border-none hover:bg-primary cursor-pointer"
                                    >
                                        <div className="shrink-0">{humeurIconMap[h]}</div>
                                        <h6 className="flex-1 text-center pr-4">{h}</h6>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {step === 4 && (
                    <section className="animate-fadeIn w-full max-w-2xl mx-auto space-y-12">
                        <h1 className="text-center">Récapitulatif</h1>
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground">
                                    <h2>Genres préférés</h2>
                                    <Button variant="link" size="icon" onClick={() => setStep(1)} className="text-foreground hover:text-primary cursor-pointer">
                                        <Pencil />
                                    </Button>
                                </div>
                                <h4> 
                                    {formData.genres.length > 0 
                                        ? genres.filter(g => formData.genres.includes(g.id)).map(g => g.name).join(', ') 
                                        : 'Aucun genre sélectionné'} 
                                </h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground">
                                    <h2>Artistes préférés</h2>
                                    <Button variant="link" size="icon" onClick={() => setStep(2)} className="text-foreground hover:text-primary cursor-pointer">
                                        <Pencil />
                                    </Button>
                                </div>
                                <h4>
                                    {formData.artists.length > 0 
                                        ? allArtists
                                            .filter(art => formData.artists.includes(art.artist_id))
                                            .map(art => art.artist_name)
                                            .join(', ') 
                                        : 'Aucun artiste sélectionné'}
                                </h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground">
                                    <h2 className="">Préférences musicales</h2>
                                    <Button variant="link" size="icon" onClick={() => setStep(3)} className="text-foreground hover:text-primary cursor-pointer">
                                        <Pencil />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <h4>Moments d'écoute : {formData.moments.join(', ') || 'Non spécifié'}</h4>
                                    <h4>Préférences :{formData.preferences || 'Non spécifiée'}</h4>
                                    <h4>Styles : {formData.styles || 'Non spécifiée'}</h4>
                                    <h4>Langues :{formData.langues.join(', ') || 'Non spécifiée'}</h4>
                                    <h4>Durée : {formData.duree || 'Non spécifiée'}</h4>
                                    <h4>Humeurs : {formData.humeurs.join(', ') || 'Non spécifiée'}</h4>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
            
            <div className="flex justify-center gap-8 mt-16">
                {step > 1 && (
                    <Button 
                        variant="secondary" 
                        onClick={prevStep} 
                        className="w-48 border-foregroun py-3 cursor-pointer"
                    >
                        Retour
                    </Button>
                )}
                <Button 
                    variant="default"
                    onClick={step === 4 ? handleFinish : nextStep} 
                    disabled={(step === 1 && formData.genres.length < 3) || (step === 2 && formData.artists.length < 3)}
                    className={`w-48 py-3 cursor-pointer ${
                        (step === 1 && formData.genres.length < 3) || (step === 2 && formData.artists.length < 3)
                        ? 'opacity-50'
                        : 'bg-primary'
                    }`}
                >
                    {step === 4 ? 'Terminer' : (step === 1 && formData.genres.length < 3) || (step === 2 && formData.artists.length < 3) ? `Encore ${3 - (step === 1 ? formData.genres.length : formData.artists.length)}...` : 'Suivant'}
                </Button>
            </div>
        </div>
    );
};

export default PreferenceForm;