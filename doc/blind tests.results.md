# Spécification fonctionnelle V1 - Blind test

Le blind test est un mode de lecture d'une playlist.

La playlist peut être :

- une playlist persistante enregistrée en base ;
- une playlist éphémère générée puis stockée en session.

Le générateur sert à produire une sélection de morceaux.
Le lecteur blind test sert à lire cette sélection avec une UX adaptée au jeu.

## Objectifs

- permettre de jouer une playlist existante en blind test ;
- permettre de générer une playlist de blind test à partir des recommandations ;
- permettre de choisir entre une playlist enregistrée et une playlist éphémère ;
- proposer une lecture fluide, simple, sans complexité métier inutile.

## Non objectifs

- définit les blind tests comme une nouvelle entité ;
- être robuste et correct côté base à 100% dès la V1.

## Principe général

Le blind test ne change pas la nature des données musicales du site.
Il ajoute un nouveau parcours utilisateur :

- choisir ou générer une playlist ;
- lancer cette playlist en mode blind test ;
- lire les morceaux sous forme d'extraits courts avec révélation manuelle.

Le générateur choisit les morceaux.
Le lecteur blind test gère la manière de les jouer.

## Sources possibles d'un blind test

### Playlist existante

Depuis la page d'une playlist existante, l'utilisateur peut cliquer sur `Lancer en blind test`.

La lecture blind test utilise :

- les morceaux de la playlist ;
- leur ordre de playlist ;
- les paramètres de lecture choisis au moment du lancement.

### Playlist générée et enregistrée

Depuis la page de génération, l'utilisateur peut :

- choisir ses critères de génération ;
- activer `Enregistrer la playlist` ;
- générer une nouvelle playlist persistante.

Une fois créée, cette playlist peut être lue normalement ou lancée en blind test.

### Playlist générée éphémère

Depuis la page de génération, si `Enregistrer la playlist` n'est pas activé :

- le backend génère une liste ordonnée de morceaux ;
- cette liste est stockée en session ;
- l'utilisateur est redirigé vers le lecteur blind test.

La playlist éphémère disparaît à la fin de la session navigateur.

## Modèle de données

### Playlist persistante

Le blind test s'appuie sur les tables existantes de playlist.

- une colonne `position` sur `playlist_contient_track`

Cette colonne permet de garantir un ordre stable.

### Playlist éphémère

La playlist éphémère est stockée en session.

- liste ordonnée des `track_ids`

Exemple logique :

```json
{
  "track_ids": [12, 84, 91, 7]
}
```

## Parcours utilisateur

## Générateur

Route :

- `/blind-tests/new`

Le générateur demande uniquement les paramètres utiles pour sélectionner les morceaux.

Inputs :

- `Nombre de musiques`
- `Enregistrer la playlist`
- `Nom de la playlist` si l'enregistrement est activé
- filtres avancés de génération

Le générateur ne demande pas les paramètres de lecture blind test.
Ces paramètres sont demandés plus tard, au moment de jouer.

### Résultat du générateur

Si `Enregistrer la playlist` est activé :

- création d'une vraie playlist ;
- redirection vers la page playlist.

Sinon :

- stockage des morceaux en session (remplacement) ;
- redirection vers le lecteur blind test éphémère.

## Page playlist

Depuis `/playlist/{id}`, la page doit proposer deux actions distinctes :

- `Lire la playlist`
- `Lancer en blind test`

Quand l'utilisateur clique `Lancer en blind test`, il choisit les paramètres de lecture puis démarre le blind test.

## Lecteur blind test

Routes :

- `/blind-tests/play/playlist/{id}`
- `/blind-tests/play/ephemeral`

(même contrôleur derrière)

Le lecteur blind test prend comme source :

- soit une playlist persistante ;
- soit une playlist éphémère présente en session.

## Paramètres de génération

### Inputs obligatoires

- `Nombre de musiques`
  - entier ;
  - min 1 ;
  - max 50.

- `Enregistrer la playlist`
  - booléen ;
  - défaut : désactivé.

### Input conditionnel

Si `Enregistrer la playlist` est activé :

- `Nom de la playlist`
  - obligatoire.

### Génération avancée

- `Année`
  - `annee_min`
  - `annee_max`
  - priorité à `track_date_recorded`
  - fallback sur `track_date_created`

- `Genre`
  - multi-select
  - un morceau est éligible s'il appartient à au moins un genre sélectionné

- `Artiste`
  - autocomplete
  - un morceau est éligible si au moins un artiste correspond

- `Popularité`
  - `faible`
  - `moyenne`
  - `forte`
  - calculée à partir de `track_listens`

- `Type vocal`
  - `indifférent`
  - `instrumental`
  - `spoken`
  - `instrumental` = `track_instrumental = true` ou `track_echonest.instrumentalness >= 0.5`
  - `spoken` = `track_echonest.speechiness >= 0.5`

- `Langues`
  - multi-select
  - priorité à `track_chanter_en`
  - fallback sur `track_language_code`

## Règles de génération

Le générateur produit une playlist de morceaux recommandés.

La sélection mélange :

- un pool `connu`
- un pool `inconnu`

### Pool connu

Définition :

- morceaux déjà écoutés par l'utilisateur ;
- filtres avancés appliqués ;
- audio exploitable obligatoire.

Score :

- `known_score = 1 - (nb_ecoute / max_nb_ecoute_utilisateur)`

Effet :

- les morceaux connus mais peu écoutés sont favorisés.

### Pool inconnu

Définition :

- morceaux jamais écoutés par l'utilisateur ;
- filtres avancés appliqués ;
- morceaux issus des systèmes de recommandation existants.

Source recommandation :

- si l'utilisateur a un historique exploitable :
  - `userBased(userId, nLarge)`
  - éventuellement complété par `echoNest(userId, lastTrackId, nLarge)`
- sinon :
  - `newUser(nLarge)`

Score :

- score dérivé du rang dans la liste de recommandation.

### Répartition

Règle cible :

- `known_target = floor(n / 2)`
- `unknown_target = n - known_target`

Sélection :

- tirage pondéré par score ;
- sans doublon ;
- si un pool est insuffisant, complément depuis l'autre.

### Résultat

La génération produit une liste ordonnée de `track_ids`.

Cette liste devient :

- soit une playlist persistante ;
- soit une playlist éphémère en session.

## Paramètres de lecture blind test

Les paramètres de lecture sont demandés juste avant le lancement du blind test.

### Difficulté

- `Facile = 10 secondes`
- `Moyen = 5 secondes`
- `Difficile = 3 secondes`

La difficulté détermine `clip_duration_seconds`.

### Offset du clip

Le blind test lit un extrait à partir d'un point relatif du morceau.

Paramètre :

- `clip_offset_ratio` validé dans `[0, 1]`

Formule :

```txt
clip_start_seconds = floor(clip_offset_ratio * max(0, track_duration - clip_duration_seconds))
```

Interprétation :

- `0` = début du morceau
- `1` = dernier départ possible sans dépasser
- une valeur intermédiaire = position relative dans la fenêtre de départ valide

UI proposée :

- presets :
  - `Début (0%)`
  - `20%`
  - `40%`
  - `Personnalisé`
- si `Personnalisé` : slider de 0 à 1

Valeur par défaut proposée : `0.2`

## Fonctionnement du lecteur blind test

Le lecteur blind test utilise un composant dédié.

États :

- `idle`
- `playing`
- `revealed`
- `finished`

Cycle :

1. État initial
   - bouton `Démarrer`
   - aucune métadonnée visible

2. Lecture d'un round
   - calcul du `clip_start_seconds`
   - lecture du clip du morceau courant
   - arrêt automatique à la fin du clip

3. Après lecture
   - bouton `Rejouer`
   - bouton `Révéler`

4. Reveal
   - affichage :
     - titre
     - artiste
     - album
     - cover
   - bouton principal `Suivant`

5. Passage au morceau suivant
   - reset de l'affichage
   - lecture du morceau suivant

6. Dernier morceau
   - `Suivant` devient `Terminer`

7. Fin
   - affichage de la liste complète

## Liste complète

Le blind test doit permettre :

- d'obtenir la liste complète des morceaux ;
- d'ajouter un morceau à une playlist perso.

Comportement :

- bouton `Voir la liste du blind test`
- si la partie n'est pas terminée :
  - afficher un avertissement :
    - `Cette action révèle toutes les réponses`

La liste complète peut réutiliser les composants existants de tracks.

## Source de vérité des données

Le lecteur blind test lit les métadonnées directement depuis :

- `track`
- `artist`
- `album`
- les relations existantes

La source de vérité reste donc le modèle métier actuel.

## Écoutes et historique

Une lecture blind test ne compte pas comme une écoute normale.

Donc :

- pas d'appel à `/add-listen`
- pas de modification de `user_ecoute`

## API backend proposée

### Génération

- `POST /blind-tests/generate`
  - valide les paramètres de génération ;
  - construit la liste ordonnée de morceaux ;
  - si `save_playlist = true` :
    - crée une playlist persistante ;
    - retourne `playlist_id` ;
  - sinon :
    - stocke les `track_ids` en session ;
    - retourne un succès indiquant qu'une playlist éphémère est prête.

### Lecture sur playlist persistante

- `GET /blind-tests/play/playlist/{id}`
  - charge la playlist ;
  - vérifie les droits ;
  - retourne les données nécessaires au lecteur.

### Lecture sur playlist éphémère

- `GET /blind-tests/play/ephemeral`
  - lit la playlist éphémère stockée en session ;
  - retourne les données nécessaires au lecteur ;
  - si la session n'existe plus :
    - retourne une erreur propre ;
    - invite à régénérer.

## Frontend

### Générateur

Le générateur :

- gère uniquement la sélection des morceaux ;
- ne contient pas la logique de lecture blind test.

### Lecteur blind test

Le lecteur blind test :

- demande difficulté + `clip_offset_ratio` avant démarrage ;
- masque les métadonnées ;
- pilote la lecture round par round ;
- affiche la liste finale à la fin.

### Page playlist

La page playlist doit distinguer clairement :

- lecture normale ;
- blind test.

## Cas limites

- utilisateur sans historique :
  - génération depuis `newUser()`

- pas assez de morceaux dans `connu` :
  - compléter depuis `inconnu`

- pas assez de morceaux dans `inconnu` :
  - compléter depuis `connu`

- filtres trop restrictifs :
  - message clair

- morceau plus court que le clip :
  - `clip_start_seconds = 0`
  - lecture jusqu'à la fin du morceau

- playlist vide :
  - blocage propre

- session éphémère absente :
  - message invitant à régénérer

## Décisions retenues pour la V1

- la playlist est l'objet central ;
- le blind test est un mode de lecture ;
- le générateur choisit les morceaux ;
- les paramètres de lecture sont demandés au lancement ;
- les playlists générées non enregistrées vivent en session ;
- l'ordre de playlist doit être stabilisé par `position`.
