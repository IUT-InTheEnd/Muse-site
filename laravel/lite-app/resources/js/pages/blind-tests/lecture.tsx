import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MusicCard } from '@/components/musecomponents/cards/MusicCard';
import { CardCover, CardContent, CardTitle, CardSubtitle } from '@/components/musecomponents/cards/Card';
import { proxyUrl } from '@/components/proxy';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { Siren, Heart } from 'lucide-react';
import { TrackRow } from '@/components/musecomponents/TrackRow';
import { useMusicPlayer } from '@/hooks/use-music-player';

const nbReponsesQcm = 4;

let nbPointsTotal = 0;
let nbPointsArtiste = 0;
let nbPointsTitre = 0;

// Fonction pour formater le temps reponsetant en mm:ss
function formatTemps(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function BlindTestLecture() {
    const [dureeMusique, setDureeMusique] = React.useState<number>(5);
    const [difficulty, setDifficulty] = React.useState<'facile'|'moyen'|'dur'>('moyen');
    const [jeuCommence, setJeuCommence] = React.useState(false);
    const [tracks, setTracks] = React.useState<Array<{id?: number; title?: string; artist?: string; url?: string; duration?: number}>>([]);
    const [tempsreponsetant, setTempsMusique] = React.useState(dureeMusique);
    const [go, setGo] = React.useState(false);
    const [showQcm, setShowQcm] = React.useState(false);
    const [qcmChoices, setQcmChoices] = React.useState<string[]>([]);
    const [showReponse, setShowReponse] = React.useState(false);
    const [showScore, setShowScore] = React.useState(false);
    const [showPointTotal, setShowPointTotal] = React.useState(false);
    const [userAnswer, setReponseUser] = React.useState('');
    const [reponseSelectionne, setReponseSelectionne] = React.useState<string | null>(null);
    const [showPointArtiste, setShowPointArtiste] = React.useState(false);
    const [showPointTitre, setShowPointTitre] = React.useState(false);
    const [musicIdActuelle, setMusicActuelle] = React.useState(0);
    const [showBtnIndice, setShowBtnIndice] = React.useState(true);
    const [favoritesMap, setFavoritesMap] = React.useState<Record<number, boolean>>({});
    const audioRef = React.useRef<HTMLAudioElement | null>(null);
    const audioTimeoutRef = React.useRef<number | null>(null);

    const nbMusic = tracks.length;

    // Gérer le timer pour la musique
    React.useEffect(() => {
        if (!go || tempsreponsetant <= 0) {
            return;
        }

        const timer = window.setInterval(() => {
            setTempsMusique((previous) => Math.max(previous - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [go, tempsreponsetant]);

    // Arrêter la musique quand le temps est écoulé
    React.useEffect(() => {
        if (!jeuCommence) {
            return;
        }

        if (tempsreponsetant === 0) {
            setGo(false);
            if (audioRef.current) {
                audioRef.current.pause();
            }
        }
    }, [jeuCommence, tempsreponsetant]);

    React.useEffect(() => {
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

    // Charger les musiques éphémèreponse au début
    React.useEffect(() => {
        async function chargerMusiqueEphemeral() {
            try {
                const reponse = await fetch('/blind-tests/ephemeral-tracks', { credentials: 'same-origin' });
                if (!reponse.ok){
                    return;
                }
                const json = await reponse.json();
                if (Array.isArray(json.tracks)) {
                    setTracks(json.tracks);
                    try {
                        window.sessionStorage.setItem('blindTestTracks', JSON.stringify(json.tracks));
                    } catch (e) {
                        console.error('Impossible de stocker les musiques éphémèreponse dans sessionStorage', e);
                    }
                }
            } catch (e) {
                console.error('Impossible de charger les musiques éphémèreponse', e);
            }
        }

        chargerMusiqueEphemeral();
    }, []);

    // Lancer la musique actuelle quand elle change
    React.useEffect(() => {
        if (!jeuCommence){
            return;
        }
        if (!tracks || nbMusic === 0){
            return;
        }
        if (musicIdActuelle < 0 || musicIdActuelle >= nbMusic){
            return;
        }

        playMusique(musicIdActuelle);
    }, [musicIdActuelle, jeuCommence, tracks]);

     // Arrêter la musique si on affiche le score final
    React.useEffect(() => {
        if (showScore) {
            try {
                stopMusique();
            } catch (e) {
                console.error('Erreur en stoppant la musique locale', e);
            }
            try {
                pause();
            } catch (e) {
                // ignore if music player not available
            }
        }
    }, [showScore]);

    // Fonction pour charger les musiques depuis sessionStorage
    function chargeMusiqueSession() {
        try {
            const musiqueStockees = window.sessionStorage.getItem('blindTestTracks');
            if (!musiqueStockees) return [];
            const parsed = JSON.parse(musiqueStockees);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.error('Impossible de charger les musiques depuis sessionStorage', e);
        }
        return [];
    }

    // Arrête l'audio en cours et annule le timeout 
    const stopMusique = () => {
        try {
            if (audioTimeoutRef.current) {
                window.clearTimeout(audioTimeoutRef.current);
                audioTimeoutRef.current = null;
            }
        } catch (e) {
           console.error('Impossible d\'arreter le timeout de la musique', e);
        }

        try {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        } catch (e) {
            console.error('Impossible de mettre en pause l\'audio', e);
        }

        setGo(false);
    };

    // Fonction pour jouer une musique à partir de son index
    function playMusique(index: number) {
        if (!tracks[index]){
            return;
        }

        if (audioRef.current) {
            try {
                audioRef.current.pause();
            } catch (e) {
                console.error("Impossible de mettre en pause l'audio", e);
            }
            audioRef.current = null;
        }

        (async () => {
            try {
                let playableUrl: string | undefined = (tracks[index] as any).url;

                if (tracks[index].id) {
                    const reponse = await fetch(`/test-music-player?id=${encodeURIComponent(tracks[index].id as number)}`);
                    if (reponse.ok) {
                        const data = await reponse.json();
                        playableUrl = data.url ?? playableUrl;
                    }
                }

                if (!playableUrl) {
                    console.warn('Aucune URL jouable trouvée pour la piste', tracks[index]);
                    return;
                }

                const audio = new Audio(proxyUrl(playableUrl) ?? playableUrl);
                audioRef.current = audio;
                await audio.play().catch((err) => console.warn('Audio play failed', err));

                setTempsMusique(dureeMusique);
                if (audioTimeoutRef.current) window.clearTimeout(audioTimeoutRef.current);
                audioTimeoutRef.current = window.setTimeout(() => {
                    try {
                        audio.pause();
                    } catch (e) {
                        console.error("Impossible de mettre en pause l'audio", e);
                    }

                    setGo(false);
                    setTempsMusique(0);
                }, dureeMusique * 1000);
            } catch (err) {
                console.error('Erreur lors du chargement de la piste pour lecture', err);
            }
        })();
    }

    // Fonction pour passer à la musique suivante
    const nextMusic = () => {
        stopMusique();
        setShowReponse(false);
        setShowQcm(false);
        setReponseSelectionne(null);

        setTempsMusique(dureeMusique);
        setGo(true);
        setMusicActuelle((prec) => {
            const derniereMusique = Math.min(nbMusic, nbMusic) - 1;
            if (prec < derniereMusique){
                return prec + 1;
            }
            setShowScore(true);
            setJeuCommence(false);
            return prec;
        });
    };

    // Fonction pour démarrer le blind test
    const startBlindTest = () => {
        const chargement = chargeMusiqueSession();
        // set duration from selected difficulty (compute locally to avoid state update race)
        const selectedDuration = difficulty === 'facile' ? 10 : difficulty === 'moyen' ? 5 : 3;
        setDureeMusique(selectedDuration);

        setJeuCommence(true);
        setShowQcm(false);
        setShowScore(false);
        setReponseSelectionne(null);
        if (chargement.length) {
            setTracks(chargement);
        }

        setMusicActuelle(0);
        setTempsMusique(selectedDuration);
        setGo(true);
    };

    // Fonction pour mélanger les choix du QCM
    function melangeChoixQCM<T>(choix: T[]) {
        for (let i = choix.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choix[i], choix[j]] = [choix[j], choix[i]];
        }
        return choix;
    }

    // Fonction pour afficher et créer les reponses du QCM
    const afficherQCM = () => {
        if (!tracks || nbMusic === 0){
            return;
        }

        const musiqueActuelle = tracks[musicIdActuelle];
        const correct = `${musiqueActuelle.artist} — ${musiqueActuelle.title}`;

        const autreReponses = tracks.map((t) => `${t.artist} — ${t.title}`).filter((str, idx) => str && str !== correct);

        const melangeAutreponseReponses = melangeChoixQCM(autreReponses.slice());
        const nbReponsesFausse = Math.max(0, nbReponsesQcm - 1);
        const fausses = melangeAutreponseReponses.slice(0, nbReponsesFausse);

        const choices = melangeChoixQCM([correct, ...fausses]);
        setQcmChoices(choices);
        setShowQcm(true);
    };

    // Fonction pour normaliser les chaînes de caractèreponse / comparaison de chaine
    function normalizeStr(chaine: string) {
        return chaine.normalize('NFD').toLowerCase().trim();
    }

    // Fonction pour valider la réponse de l'utilisateur
    const valideReponseUser = () => {
        // arrêter la lecture immédiatement
        stopMusique();

        if (!tracks || nbMusic === 0){
            return;
        }

        setShowPointArtiste(false);
        setShowPointTitre(false);
        setShowPointTotal(false);

        const musiqueActuelle = tracks[musicIdActuelle];
        const reponseCorrect = `${musiqueActuelle.artist} — ${musiqueActuelle.title}`;

        if (showQcm) {
            // si aide qcm et que c'est bon +1
            if (reponseSelectionne === reponseCorrect) {
                nbPointsTotal = nbPointsTotal + 1;
                setShowPointTotal(true);
            }
        } else {
            // sans qcm, +1 artiste, +1 titre
            const user = normalizeStr(userAnswer || '');
            const artist = normalizeStr(musiqueActuelle.artist || '');
            const title = normalizeStr(musiqueActuelle.title || '');

            const artisteCorrect = artist && user.includes(artist);
            const titreCorrect = title && user.includes(title);

            if (artisteCorrect) {
                nbPointsArtiste = nbPointsArtiste + 1;
                nbPointsTotal = nbPointsTotal + 1;
                setShowPointArtiste(true);
            }
            if (titreCorrect) {
                nbPointsTitre = nbPointsTitre + 1;
                nbPointsTotal = nbPointsTotal + 1;
                setShowPointTitre(true);
            }
        }
        setReponseUser('');
        setShowReponse(true);
    };

    // Fonction pour si l'utilisateur abandonne
    const userAbandonne = () => {
        stopMusique();
        setShowPointArtiste(false);
        setShowPointTitre(false);
        setShowPointTotal(false);
        setShowReponse(true);
    };

    const { auth } = usePage<SharedData>().props;
    const { pause } = useMusicPlayer();

    const handleToggleFavorite = async (e: React.MouseEvent, trackId?: number) => {
        e.stopPropagation();
        if (!auth?.user) {
            alert('Connectez-vous pour gérer vos favoris.');
            return;
        }
        if (!trackId) return;

        try {
            const reponse = await fetch('/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ track_id: trackId }),
            });
            if (!reponse.ok) return;
            const json = await reponse.json();
            setFavoritesMap((prev) => ({ ...prev, [trackId]: json.is_favorite }));
        } catch (err) {
            console.error('Erreur favoris:', err);
        }
    };

    // Fonction pour retourner à l'accueil à la fin
    const returnAccueil = () => {
        window.location.href = '/';
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
            {!jeuCommence && !showScore ?(
                <section className="space-y-6 rounded-2xl border bg-card p-6">
                    <h1 className="text-3xl font-semibold">Règles du jeu</h1>
                    <p className="text-md">
                        Tu dois reconnaître le titre et l'auteur de la musique avant la fin du chrono. Tu peux répondre directement, ou demander
                        un indice pour passer en mode QCM à 4 réponses.
                    </p>
                    <ul className="list-disc space-y-2 pl-5 text-md">
                        <li>Chaque manche dure {dureeMusique} secondes.</li>
                        <li>Le chronomètre démarre lorsque vous cliquez sur "Commencer", et la musique se lance.</li>
                        <li>Si vous trouvez l'artiste, vous gagnez 1 point. Si vous trouvez le titre, vous gagnez également 1 point.</li>
                    </ul>
                    <div className="flex flex-row items-start gap-2">
                        <Siren className="h-8 w-8 text-red-600" />
                        <span className="text-md text-foreground">
                            Besoin d'un coup de pouce ? Demandez un <strong>indice</strong> pour afficher un QCM — vous
                            ne pourrez alors remporter qu'un seul point pour la bonne réponse.
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="text-md">Difficulté :</label>
                        <select
                            value={difficulty}
                            onChange={(e) => {
                                const val = e.target.value as 'facile' | 'moyen' | 'dur';
                                setDifficulty(val);
                                const selectedDuration = val === 'facile' ? 10 : val === 'moyen' ? 5 : 3;
                                setDureeMusique(selectedDuration);
                            }}
                            className="rounded-md border px-2 py-1"
                        >
                            <option value="facile">Facile (10s)</option>
                            <option value="moyen">Moyen (5s)</option>
                            <option value="dur">Dur (3s)</option>
                        </select>
                    </div>

                    <Button onClick={startBlindTest} className="cursor-pointer">
                        {musicIdActuelle > 0 ? 'Reprendre' : 'Commencer'} le blind test
                    </Button>
                </section>
            ) : (
                <>
                    {!showScore && (
                    <div className="flex flex-row justify-between w-full items-center">
                        <Button className="cursor-pointer bg-primary text-primary-foreground" onClick={() => setJeuCommence(false)}>
                            Voir les règles
                        </Button>
                        <div>
                            <p>Score total : {nbPointsTotal}</p>
                        </div>
                        <div className="rounded-full bg-muted/50 px-3 py-3 text-xs font-medium  ">
                            <p>{musicIdActuelle + 1} / {nbMusic}</p>
                        </div>
                    </div>
                    )}

                    {!showScore && (
                    <div className="flex flex-col justify-center items-center gap-4">
                        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-6 border-primary">
                            <div className="flex h-56 w-56 flex-col items-center justify-center rounded-full bg-background text-center">
                                <>
                                    <span className="text-md  ">Temps restant</span>
                                    <span className="mt-1 text-5xl font-bold">{formatTemps(tempsreponsetant)}</span>
                                    <span className="mt-2 text-xs  ">{go ? 'Lecture en cours' : 'Chrono arrêté'}</span>
                                </>
                            </div>
                        </div>
                    </div>
                     )}

                    
                        {!showScore && (
                            <>
                                {!showQcm ? (
                                    <div className="flex flex-row items-center gap-4">
                                        <span className="text-md">Votre réponse</span>
                                        <Input value={userAnswer} onChange={(e: any) => setReponseUser(e.target.value)} type="text" placeholder="Votre réponse" className="w-full" />
                                        {showBtnIndice && (
                                            <Button className="cursor-pointer" variant="secondary" onClick={afficherQCM}>
                                                Un indice ?
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 rounded-xl border bg-card p-4">
                                        <p className="text-md">Indice activé : choisis la bonne réponse.</p>
                                        <div className="grid gap-2">
                                            {qcmChoices.map((choice) => {
                                                const currentCorrect = tracks && tracks[musicIdActuelle]
                                                    ? `${tracks[musicIdActuelle].artist} — ${tracks[musicIdActuelle].title}`
                                                    : '';
                                                const isCorrect = choice === currentCorrect;
                                                const isSelected = choice === reponseSelectionne;

                                                const baseClass = 'rounded-lg border px-4 py-3 text-left transition-colors';
                                                let variantClass = 'bg-background hover:bg-muted/50';

                                                if (showReponse) {
                                                    if (isCorrect) {
                                                        variantClass = 'border-green-500 bg-green-50 text-green-700';
                                                    } else if (isSelected) {
                                                        variantClass = 'border-red-500 bg-red-50 text-red-700';
                                                    } else {
                                                        variantClass = 'bg-background/50 ';
                                                    }
                                                } else {
                                                    variantClass = isSelected ? 'border-primary bg-primary/10 text-primary' : variantClass;
                                                }

                                                return (
                                                    <button
                                                        key={choice}
                                                        type="button"
                                                        onClick={() => setReponseSelectionne(choice)}
                                                        className={`${baseClass} ${variantClass}`}
                                                    >
                                                        {choice}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button className="cursor-pointer" onClick={() => valideReponseUser()}>
                                        Valider et voir la réponse
                                    </Button>
                                    <Button className="cursor-pointer" variant="secondary" onClick={() => userAbandonne()}>
                                        Je donne ma langue au chat
                                    </Button>
                                </div>

                                <div>
                                    {showReponse && (
                                        <div className="space-y-3 rounded-xl border bg-card p-4">
                                            <p className="text-md  ">La bonne réponse était :</p>
                                            <h2 className="text-lg font-semibold">
                                                {`${tracks[musicIdActuelle].artist} — ${tracks[musicIdActuelle].title}`}
                                            </h2>
                                            <div>
                                                {showPointArtiste && <p className="text-md  ">Vous avez gagné 1 point pour l'artiste !</p>}
                                                {showPointTitre && <p className="text-md  ">Vous avez gagné 1 point pour le titre !</p>}
                                                {showQcm && (
                                                    showPointTotal ? (
                                                        <p className="text-md  ">Vous avez gagné 1 point pour la bonne réponse (QCM).</p>
                                                    ) : (
                                                        <p className="text-md  ">Vous n'avez pas obtenu de point au QCM.</p>
                                                    )
                                                )}
                                                <p className="text-md  ">
                                                    Vous avez au total {nbPointsTotal} points.
                                                </p>
                                            </div>
                                            <Button className="cursor-pointer" variant="secondary" onClick={nextMusic}>
                                                {musicIdActuelle +1 === nbMusic ? 'Terminer et voir les scores' : 'Musique suivante'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            {showScore && (
                                <section className="space-y-6 rounded-2xl border bg-card p-6">
                                    <h1 className="text-3xl font-semibold">Score final</h1>
                                    <p className="text-md  ">
                                        Vous avez terminé le blind test ! Voici votre score final : {nbPointsTotal} points.
                                    </p>
                                    <p className="text-md  ">
                                        Détails : {nbPointsArtiste} points pour les artistes, {nbPointsTitre} points pour les titres, et {nbPointsTotal - nbPointsArtiste - nbPointsTitre} points pour le QCM.
                                    </p>
                                    <h2 className="text-xl font-semibold">Voici la liste des musiques</h2>
                                    <p className="text-md  ">Vous pouvez l'ajouter à vos playlist</p>
                                    <div>
                                        <div className="space-y-2">
                                            {tracks.map((t, idx) => {
                                                const id = (t.id ?? idx) as number;
                                                const trackProp = {
                                                    track_id: id,
                                                    track_title: t.title ?? '',
                                                    track_favorites: favoritesMap[id] ? 1 : ((t as any).favorites ?? 0),
                                                    track_image_file: (t as any).cover,
                                                    track_duration: (t as any).duration,
                                                    track_listens: (t as any).listens,
                                                    };
                                                const artistProp = (t as any).artist
                                                    ? { artist_id: (t as any).artist_id ?? 0, artist_name: (t as any).artist }
                                                    : undefined;

                                                return (
                                                    <TrackRow
                                                        key={id}
                                                        track={trackProp}
                                                        artist={artistProp}
                                                        isFavorite={Boolean(favoritesMap[id])}
                                                        showListens={false}
                                                        coverSize="lg"
                                                        showFavoriteCount={false}
                                                        onFavoriteChange={(trackId: number, isFav: boolean) =>
                                                            setFavoritesMap((prev) => ({ ...prev, [trackId]: isFav }))
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-semibold">Merci d'avoir joué !</h2>
                                    <div>
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