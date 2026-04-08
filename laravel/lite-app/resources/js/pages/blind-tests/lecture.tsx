import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { check } from '@/routes/favorites';

// BlindTestSessionService

type Props = {
    source: 'ephemeral';
    trackCount: number;
    playlist: {
        id: number;
        name: string;
    } | null;
    ephemeral: {
        generated_at?: string | null;
        generation?: {
            count?: number;
            counts?: {
                known_selected?: number;
                unknown_selected?: number;
            };
        } | null;
    } | null;
};

const dureeMusique = 5;
const nbReponsesQcm = 4;
const nbMusic = 10;

let nbPointsTotal = 0;
let nbPointsArtiste = 0;
let nbPointsTitre = 0;

const qcmChoices = [
    'Daft Punk — One More Time',
    'Stromae — Alors on danse',
    'The Weeknd — Blinding Lights',
    'Dua Lipa — Levitating',
];

function choixReponse(reponse: string) {
    // qcm choices = reponse + 3 autre reponse aléatoire
    qcmChoices[Math.floor(Math.random() * nbReponsesQcm)] = reponse;
    console.log('qcmChoices',qcmChoices);
    return qcmChoices;
}

function checkReponse(reponse: string) {
    // vérifier la réponse et mettre à jour les points
}

function formatTemps(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function BlindTestLecture({
    source,
    trackCount,
    playlist,
    ephemeral,
}: Props) {
    const [jeuCommence, setJeuCommence] = React.useState(false);
    const [tracks, setTracks] = React.useState<Array<{id?: number; title?: string; artist?: string; url: string}>>([]);
    const [tempsRestant, setTempsRestant] = React.useState(dureeMusique);
    const [go, setGo] = React.useState(false);
    const [showQcm, setShowQcm] = React.useState(false);
    const [showReponse, setShowReponse] = React.useState(false);
    const [showScore, setShowScore] = React.useState(false);
    const [reponseSelectionne, setReponseSelectionne] = React.useState<string | null>(null);
    const [showPointArtiste, setShowPointArtiste] = React.useState(false);
    const [showPointTitre, setShowPointTitre] = React.useState(false);
    const [musicActuelle, setMusicActuelle] = React.useState(0);
    const [showBtnIndice, setShowBtnIndice] = React.useState(true);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const audioTimeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (!go || tempsRestant <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setTempsRestant((previous) => Math.max(previous - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [go, tempsRestant]);

    React.useEffect(() => {
        if (!jeuCommence) {
            return;
        }

        if (tempsRestant === 0) {
            setGo(false);
            // stop current audio when time is up
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }
    }, [jeuCommence, tempsRestant]);

    React.useEffect(() => {
        // cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            if (audioTimeoutRef.current) {
                window.clearTimeout(audioTimeoutRef.current);
            }
        };
    }, []);

    function chargeMusiqueSession() {
        try {
            const raw = window.sessionStorage.getItem('blindTestTracks');
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.warn('Aucune musique trouvée dans sessionStorage', e);
        }
        return [];
    }

    function playTrack(index: number) {
        const t = tracks[index];
        if (!t || !t.url) return;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const audio = new Audio(t.url);
        audioRef.current = audio;
        audio.play().catch((err) => console.warn('Audio play failed', err));

        // ensure timer stops playback after dureeMusique seconds
        if (audioTimeoutRef.current) window.clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = window.setTimeout(() => {
            audio.pause();
            setGo(false);
            setShowQcm(true);
        }, dureeMusique * 1000);
    }

    const startBlindTest = () => {
        setJeuCommence(true);
        setTempsRestant(dureeMusique);
        setGo(true);
        setShowQcm(false);
        setShowScore(false);
        setReponseSelectionne(null);
        console.log('musique');
        console.log(source, trackCount, playlist, ephemeral);
        // charger les musiques depuis la session et lancer la première
        const chargement = chargeMusiqueSession();
        if (chargement.length) {
            setTracks(chargement);
            // small timeout to ensure state applied before playing
            setTimeout(() => playTrack(0), 50);
        } else {
            console.warn('Aucune musique trouvée dans sessionStorage (cle: blindTestTracks)');
        }
    };

    const progress = (tempsRestant / dureeMusique) * 100;

    const nextMusic = () => {
        if (musicActuelle < nbMusic - 1) {
            setMusicActuelle(musicActuelle + 1);
            setShowReponse(false);
            setShowQcm(false);
            setReponseSelectionne(null);
            setTempsRestant(dureeMusique);
            setGo(true);
            // lancer la musique suivante si disponible
            const nextIndex = musicActuelle + 1;
            setTimeout(() => playTrack(nextIndex), 50);
        }
        if (musicActuelle === nbMusic - 1) {
            setShowScore(true);
            setJeuCommence(false);
        }
    };

    const returnAccueil = () => {
        // rediriger vers la page d'accueil
        window.location.href = '/';
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
            {!jeuCommence ?(
                
                <section className="space-y-6 rounded-2xl border bg-card p-6">
                    <h1 className="text-3xl font-semibold">Règles du jeu</h1>
                    <p className="text-sm text-muted-foreground">
                        Tu dois reconnaître la musique avant la fin du chrono. Tu peux répondre directement, ou demander
                        un indice pour passer en mode QCM à 4 réponses mais dans ce cas vous perdez 0.5 point.
                    </p>
                    <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                        <li>Chaque manche dure {dureeMusique} secondes.</li>
                        <li>Le chrono démarre au clic sur commencer, et la musique se lance.</li>
                        <li>Si vous trouvez l'artiste / groupe vous gagnez 1 point, et 1 point pour le titre.</li>
                    </ul>
                    <Button onClick={startBlindTest} className="cursor-pointer">
                        {musicActuelle > 0 ? 'Reprendre' : 'Commencer'} le blind test
                    </Button>
                </section>
            ) : (
                <>
                    <div className="flex flex-row justify-between w-full items-center">
                        <Button className="cursor-pointer bg-primary text-primary-foreground" onClick={() => setJeuCommence(false)}>
                            Voir les règles
                        </Button>
                        <div className="rounded-full bg-muted/50 px-3 py-3 text-xs font-medium text-muted-foreground">
                            <p>{musicActuelle + 1} / {nbMusic}</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                            <div
                                className="relative flex h-64 w-64 items-center justify-center rounded-full border-6 border-primary"
                                style={{
                                    background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}% 100%)`,
                                }}
                            >
                                <div className="flex h-56 w-56 flex-col items-center justify-center rounded-full bg-background text-center">
                                    <span className="text-sm text-muted-foreground">Temps restant</span>
                                    <span className="mt-1 text-5xl font-bold">{formatTemps(tempsRestant)}</span>
                                    <span className="mt-2 text-xs text-muted-foreground">
                                        {go ? 'Lecture en cours' : 'Chrono arrêté'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            
                            
                        </div>

                        {!showQcm ? (
                            <div className="flex flex-row gap-4">
                                <span className="text-sm text-muted-foreground">Votre réponse</span>
                                <Input type="text" placeholder="Votre réponse" className="w-full" />
                                {showBtnIndice && (
                                    <Button className="cursor-pointer" variant="secondary" onClick={() => setShowQcm(true)}>
                                        Un indice ?
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3 rounded-xl border bg-card p-4">
                                <p className="text-sm text-muted-foreground">Indice activé : choisis la bonne réponse.</p>
                                {nbPointsTotal = nbPointsTotal - 0.5}
                                <div className="grid gap-2">
                                    {qcmChoices.map((choice) => (
                                        <button
                                            key={choice}
                                            type="button"
                                            onClick={() => setReponseSelectionne(choice)}
                                            className={`rounded-lg border px-4 py-3 text-left transition-colors ${
                                                reponseSelectionne === choice
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'bg-background hover:bg-muted/50'
                                            }`}
                                        >
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {/* si click sue un des deux boutons () =>setShowBtnIndice(false) pour ne plus afficher le bouton indice */}
                            <Button className="cursor-pointer" onClick={() => setShowReponse(true)}>
                                Valider et voir la réponse
                            </Button>
                            <Button className="cursor-pointer" variant="secondary" onClick={() => setShowReponse(true)}>
                                Je donne ma langue au chat
                            </Button>
                        </div>

                        <div>
                            {showReponse && (
                                <div className="space-y-3 rounded-xl border bg-card p-4">
                                    <p className="text-sm text-muted-foreground">La bonne réponse était :</p>
                                    <h2 className="text-lg font-semibold">Daft Punk — One More Time</h2>
                                    <div>
                                        {showPointArtiste && <p className="text-sm text-muted-foreground">Vous avez gagné 1 point pour l'artiste !</p>}
                                        {showPointTitre && <p className="text-sm text-muted-foreground">Vous avez gagné 1 point pour le titre !</p>}
                                        <p className="text-sm text-muted-foreground">
                                            Vous avez au total {nbPointsTotal} points dont {nbPointsArtiste} pour l'artiste et {nbPointsTitre} pour le titre.
                                        </p>
                                    </div>
                                    <Button className="cursor-pointer" variant="secondary" onClick={nextMusic}>
                                        {musicActuelle +1 === nbMusic ? 'Terminer et voir les scores' : 'Musique suivante'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div>
                            {showScore && (
                                <section className="space-y-6 rounded-2xl border bg-card p-6">
                                    <h1 className="text-3xl font-semibold">Score final</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Vous avez terminé le blind test ! Voici votre score final : {nbPointsTotal} points.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Détails : {nbPointsArtiste} points pour les artistes, {nbPointsTitre} points pour les titres.
                                    </p>
                                    <h2 className="text-xl font-semibold">Voici la liste des musiques</h2>
                                    <p className="text-sm text-muted-foreground">Vous pouvez l'ajouter à vos playlist</p>
                                    <div>
                                        <ul className="list-disc pl-5">
                                            <li>Daft Punk — One More Time</li>
                                            <li>Stromae — Alors on danse</li>
                                            <li>The Weeknd — Blinding Lights</li>
                                            <li>Dua Lipa — Levitating</li>
                                        </ul>
                                    </div>
                                    <h2 className="text-xl font-semibold">Merci d'avoir joué !</h2>
                                    <div>
                                        {/* <Button onClick={rejouer} className="cursor-pointer">
                                            Rejouer
                                        </Button>*/ }
                                        <Button onClick={returnAccueil} className="cursor-pointer">
                                            Retourner à l'accueil
                                        </Button>
                                    </div>
                                </section>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }