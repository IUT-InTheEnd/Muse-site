import StepBar from '@/components/StepBar';
import { Clock, Languages, MicVocal, Guitar, Smile, SunMoon } from 'lucide-react';
import { BriefcaseBusiness, Car, Dumbbell, Gamepad2, Sofa, BookOpen, PartyPopper,UtensilsCrossed, MoonStar, Waves, AudioLines} from 'lucide-react';
import { Cpu, Radio } from 'lucide-react';
import { Piano, Globe } from 'lucide-react';
import { Frown, Flame, Moon, Heart, Zap } from 'lucide-react';
import { Pencil } from 'lucide-react';
import { proxyUrl } from '@/components/proxy';
import React, { useState, useEffect } from 'react';

// Interface pour typer tes artistes proprement
interface Artist {
    id: number;
    artist_name: string;
    artist_image_file: string;
}


const PreferenceForm = () => {
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        genres: [],
        artists: [],
        moments: [] as string[],
        preferences: '' as string,
        styles: '' as string,
        langues : [] as string[],
        duree: '' as string,
        humeurs: [] as string[]
    });
    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);
    const iconMap: Record<string, any>  = {
        'Sport': <Dumbbell className="mr-2" size={18} />,
        'Travail / études': <BriefcaseBusiness className="mr-2" size={18} />,
        'Détente': <Sofa className="mr-2" size={18} />,
        'Soirée entre amis': <PartyPopper className="mr-2" size={18} />,
        'Trajet': <Car className="mr-2" size={18} />,
        'Jeu vidéo': <Gamepad2 className="mr-2" size={18} />,
        'Tâche ménagère ou cuisine': <UtensilsCrossed className="mr-2" size={18} />,
        'Lecture / écriture': <BookOpen className="mr-2" size={18} />,
        'Dormir': <MoonStar className="mr-2" size={18} />,
    };
    const preferenceIconMap: Record<string, any> = {
        'Les paroles': <MicVocal className="mr-2" size={18} />,
        "L'ambiance musicale": <Waves className="mr-2" size={18} />,
        'Les deux / Sans préférence': <AudioLines className="mr-2" size={18} />,
    };
    const styleIconMap: Record<string, any> = {
        'Plutôt acoustique / naturelle': <Guitar className="mr-2" size={18} />,
        'Plutôt électronique / synthétique': <Cpu className="mr-2" size={18} />,
        'Les deux / Sans préférence': <Radio className="mr-2" size={18} />,
    };
    const langueIconMap: Record<string, any> = {
        'Français': <Languages className="mr-2" size={18} />,
        'Anglais': <Languages className="mr-2" size={18} />,
        'Japonais': <Languages className="mr-2" size={18} />,
        'Espagnol': <Languages className="mr-2" size={18} />,
        'Russe': <Languages className="mr-2" size={18} />,
        'Coréen': <Languages className="mr-2" size={18} />,
        'Latin': <Languages className="mr-2" size={18} />,
        'Allemand': <Languages className="mr-2" size={18} />,
        'Plutôt instrumental': <Piano className="mr-2" size={18} />,
        'Peu importe / Indifférent': <Globe className="mr-2" size={18} />,
    };
    const humeurIconMap: Record<string, any> = {
        'Joyeuse': <Smile className="mr-2" size={18} />,
        'Triste': <Frown className="mr-2" size={18} />,
        'Énergique': <Flame className="mr-2" size={18} />,
        'Calme': <Moon className="mr-2" size={18} />,
        'Romantique': <Heart className="mr-2" size={18} />,
        'Motivé': <Zap className="mr-2" size={18} />,
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-12">
            <StepBar currentStep={step} />
            <div className="mt-12">
                {step === 1 && (
                    <section>
                        <div className="text-center mb-10">
                            <h1 className="font-semibold">Quels sont vos genres préférés ?</h1>
                            <h2 className="!text-gray-400">Sélectionnez au moins 3 genres musicaux que vous aimez</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mx-auto">
                            <img src="https://cdn-images.dzcdn.net/images/cover/9eb5f9334e7bfed5aae9701e76265298/0x1900-000000-80-0-0.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://www.roadiemusic.com/blog/wp-content/uploads/2020/02/Is-Rock-Music-Dead.png" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://img.redbull.com/images/c_limit,w_1500,h_1000/f_auto,q_auto/redbullcom/2020/2/11/qpywyrrtn8kdmw4yq2tj/hip-hop-horrorcore-gravediggaz" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://as1.ftcdn.net/v2/jpg/01/93/43/84/1000_F_193438413_HyXCr1RQubvGSQKrKoixqqJCAw5aAReI.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbVxFCXV2TXuHp9GgzS8GLvDZ7E6wKKsT8uQ&s" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://as1.ftcdn.net/v2/jpg/01/93/43/84/1000_F_193438413_HyXCr1RQubvGSQKrKoixqqJCAw5aAReI.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Classic_music.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://cdn.britannica.com/76/181376-050-0B801EB7/codpiece-gene-simmons-KISS.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://s.abcnews.com/images/International/aespa-gty-jt-210619_1624125909765_hpMain_4x3_992.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://thumb.canalplus.pro/http/unsafe/1000x600/smart/creativemedia-image.canalplus.pro/content/0001/49/491186d51d206a8eb5593d0971e04678af4bcc47.png" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://www.radiofrance.fr/s3/cruiser-production-eu3/2025/01/f0fc566a-e3e7-446a-a943-b5c2dec5b520/1200x680_sc_kerchak-et-zaik.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                            <img src="https://c.files.bbci.co.uk/1E53/production/_104536770_bob_getty.jpg" className="w-[210px] h-[210px] object-cover object-center"></img>
                        </div>
                    </section>
                )}
                {step === 2 && (
                    <section className="animate-fadeIn">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-[#FDFDFF] uppercase tracking-tight">
                                Quels sont vos artistes préférés ?
                            </h1>
                            <h2 className="!text-gray-400 mt-2">Sélectionnez au moins 3 artistes</h2>
                            
                            {/* Barre de recherche */}
                            <div className="mt-8 relative max-w-md mx-auto">
                            </div>
                        </div>

                        {/* Grille d'artistes limitée à 12 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                

                        </div>

                        {/* Boutons de navigation */}
                        <div className="flex justify-center gap-4 mt-12">
                            <button onClick={prevStep} className="bouton-secondary w-40">
                                Retour
                            </button>
                            <button 
                                onClick={nextStep}
                                disabled={formData.artists.length < 3}
                                className={`w-40 font-bold transition-all duration-300 ${
                                    formData.artists.length >= 3 
                                    ? 'bouton-primary' 
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border-none'
                                }`}
                            >
                                {formData.artists.length < 3 ? `Encore ${3 - formData.artists.length}` : 'Suivant'}
                            </button>
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
                                    <button
                                        key={m}
                                        onClick={() => {
                                            const newMoments = formData.moments.includes(m)
                                                ? formData.moments.filter(i => i !== m)
                                                : [...formData.moments, m];
                                            setFormData({...formData, moments: newMoments});
                                        }}
                                        className={`${formData.moments.includes(m) ? 'bouton-primary' : 'bouton-secondary'} !justify-start px-4`}
                                    >
                                        <div className="shrink-0">{iconMap[m]}</div>
                                        <span className="flex-1 text-center pr-4">{m}</span>
                                    </button>
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
                                    <button
                                        key={p}
                                        onClick={() => setFormData({...formData, preferences: p})}
                                        className={`${
                                            formData.preferences.includes(p) ? 'bouton-primary' : 'bouton-secondary'
                                        } !justify-start px-4 w-full`}
                                    >
                                        <div className="shrink-0">{preferenceIconMap[p]}</div>
                                        <span className="flex-1 text-center pr-4">{p}</span>
                                    </button>
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
                                    <button
                                        key={m}
                                        onClick={() => setFormData({...formData, styles: m})}
                                        className={`${
                                            formData.styles.includes(m) ? 'bouton-primary' : 'bouton-secondary'
                                        } !justify-start px-4 w-full transition-all duration-200`}
                                    >
                                        <div className="shrink-0">{styleIconMap[m]}</div>
                                        <span className="flex-1 text-center pr-4">{m}</span>
                                    </button>
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
                                    <button
                                        key={m}
                                        onClick={() => {
                                            const newLangues = formData.langues.includes(m)
                                                ? formData.langues.filter(i => i !== m)
                                                : [...formData.langues, m];
                                            setFormData({ ...formData, langues: newLangues });
                                        }}
                                        className={`${
                                            formData.langues.includes(m) ? 'bouton-primary' : 'bouton-secondary'
                                        } !justify-start px-4 w-full transition-all duration-200`}
                                    >
                                        <div className="shrink-0">{langueIconMap[m]}</div>
                                        <span className="flex-1 text-center pr-4">{m}</span>
                                    </button>
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
                                        className={`p-2 rounded-lg cursor-pointer transition-all flex flex-col items-center justify-center  ${
                                            formData.duree === d 
                                            ? 'bg-[var(--primary)]' 
                                            : 'hover:border-foreground'
                                        }`}
                                    >
                                        <h4 className={`text-center ${formData.duree === d}`}>{d}</h4>
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
                                    <button
                                        key={h}
                                        onClick={() => {
                                            const newHumeurs = formData.humeurs.includes(h)
                                                ? formData.humeurs.filter(i => i !== h)
                                                : [...formData.humeurs, h];
                                            setFormData({ ...formData, humeurs: newHumeurs });
                                        }}
                                        className={`${
                                            formData.humeurs.includes(h) ? 'bouton-primary' : 'bouton-secondary'
                                        } !justify-start px-4 w-full transition-all duration-200`}
                                    >
                                        <div className="shrink-0">{humeurIconMap[h]}</div>
                                        <span className="flex-1 text-center pr-4">{h}</span>
                                    </button>
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
                                    <button onClick={() => setStep(1)} className="text-foreground hover:text-primary transition">
                                        <Pencil />
                                    </button>
                                </div>
                                <h4> {formData.genres.join(' ') || 'Aucun genre sélectionné'} </h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground">
                                    <h2>Artistes préférés</h2>
                                    <button onClick={() => setStep(2)} className="text-foreground hover:text-primary transition">
                                        <Pencil />
                                    </button>
                                </div>
                                <h4>{formData.artists.join(' ') || 'Aucun artiste sélectionné'}</h4>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-foreground">
                                    <h2 className="">Préférences musicales</h2>
                                    <button onClick={() => setStep(3)} className="text-foreground hover:text-primary transition">
                                        <Pencil />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <h4><span className="font-bold">Moments d'écoute :</span> {formData.moments.join(', ') || 'Non spécifié'}</h4>
                                    <h4><span className="font-bold">Préférences :</span> {formData.preferences || 'Non spécifiée'}</h4>
                                    <h4><span className="font-bold">Styles :</span> {formData.styles || 'Non spécifiée'}</h4>
                                    <h4><span className="font-bold">Langues :</span> {formData.langues.join(', ') || 'Non spécifiée'}</h4>
                                    <h4><span className="font-bold">Durée :</span> {formData.duree || 'Non spécifiée'}</h4>
                                    <h4><span className="font-bold">Humeurs :</span> {formData.humeurs.join(', ') || 'Non spécifiée'}</h4>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
            <div className="flex justify-center gap-30 mt-16">
                {step > 1 && (
                    <button onClick={prevStep} className="bouton-secondary w-40">Retour</button>
                )}
                <button onClick={step === 4 ? () => console.log(formData) : nextStep} className="bouton-primary w-40">
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
