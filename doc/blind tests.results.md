# Spécification fonctionnelle - Blind test

## 1. Objet

Ce document remplace la simple évaluation de l'idée par une **spécification fonctionnelle exploitable pour l'implémentation**.

Objectif :

- ajouter un mode blind test au site,
- réutiliser les playlists existantes quand c'est pertinent,
- utiliser les systèmes de recommandation pour le générateur,
- offrir un mode éphémère et un mode persistant,
- rendre le comportement suffisamment précis pour pouvoir être codé sans ambiguïté.

## 2. Contexte du site

Constats issus de `prompts/audit.result.md` et du code :

- le site est un monolithe Laravel + Inertia React ;
- il existe déjà des playlists, une page playlist, un lecteur global et des endpoints de lecture ;
- les recommandations sont déjà disponibles via `App\Services\RecommendationService` ;
- la couverture de tests est faible, donc la fonctionnalité doit être conçue de manière simple, isolée et robuste.

Points d'appui existants :

- playlists : `app/Models/Playlist.php`, `app/Http/Controllers/PlaylistController.php`, `resources/js/pages/playlist/show.tsx`
- ajout de morceaux à une playlist : `resources/js/components/musecomponents/TrackRow.tsx`
- API de lecture actuelle : `app/Http/Controllers/MusicController.php`
- proxy média actuel : `app/Http/Controllers/ProxyController.php`

## 3. Périmètre fonctionnel

La fonctionnalité comporte **deux entrées** :

1. **Générer un blind test recommandé**
   - page dédiée,
   - génération à partir des recommandations + historique utilisateur + filtres.

2. **Jouer une playlist existante en mode blind test**
   - à partir d'une playlist créée manuellement par l'utilisateur,
   - sans repasser par le générateur,
   - avec les mêmes règles de lecture blind test.

Dans les deux cas, la lecture se fait sur **une page blind test dédiée**, distincte des pages playlist classiques.

## 4. Décisions structurantes

### 4.1. Décision sur la persistance

Décision retenue :

- **toute session de blind test est persistée en base**, y compris en mode éphémère ;
- le toggle `Enregistrer la playlist` décide uniquement si la sélection générée doit aussi devenir une vraie playlist utilisateur ;
- on **ne passe pas le JSON complet du blind test au lecteur** pour piloter la session, car c'est plus fragile en cas de refresh, de retour navigateur, d'URL partagée ou d'interruption.

Conséquences :

- mode éphémère = session en base, mais pas de playlist visible dans la bibliothèque ;
- mode enregistré = session en base + playlist privée enregistrée.

Cette approche est plus robuste que de transporter le blind test côté frontend uniquement.

### 4.2. Décision sur les spoilers

Le blind test doit masquer les réponses dans l'interface standard, mais ce n'est **pas** une fonctionnalité de sécurité anti-triche avancée.

Donc :

- on masque les métadonnées dans le frontend avant `Révéler`,
- on n'utilise pas le lecteur global standard,
- on ne cherche pas à rendre impossible la triche via devtools ou inspection réseau.

Autrement dit : on évite les spoilers normaux côté UI, sans transformer le sujet en mécanisme de sécurité.

### 4.3. Décision sur `clip_offset`

Décision retenue :

- on ajoute un paramètre `clip_offset_ratio` pour éviter les intros silencieuses ou trop faibles ;
- ce paramètre représente **le point de départ relatif du clip dans le morceau** ;
- il est choisi au moment de la génération ou du lancement depuis une playlist existante ;
- sa valeur est ensuite figée dans la session.

Formule retenue :

- `clip_start_seconds = min(max(0, floor(track_duration * clip_offset_ratio)), max(0, track_duration - clip_duration_seconds))`

Interprétation :

- `0.0` = début du morceau,
- `0.2` = environ 20% du morceau,
- `0.4` = environ 40% du morceau,
- `1.0` = démarrage aussi tardif que possible tout en gardant la durée complète du clip.

Valeur par défaut proposée :

- `0.2`

Justification :

- cela évite beaucoup de silences d'intro,
- cela reste simple à comprendre,
- cela laisse un contrôle explicite à l'utilisateur.

## 5. Modèle de données

### 5.1. Évolution de `playlist_contient_track`

Ajouter une colonne :

- `position INT NOT NULL`

Usage :

- ordre stable d'une playlist,
- ordre stable d'un blind test lancé depuis une playlist,
- ordre stable pour les playlists générées puis enregistrées.

Migration de schéma :

- il faut une migration de schéma SQL, pas une migration Laravel ;
- pour les playlists existantes, initialiser `position` avec l'ordre actuel des `track_id` ou l'ordre de lecture constaté au moment de la migration.

### 5.2. Nouvelle table `blind_test_session`

Créer une table `blind_test_session` :

- `blind_test_session_id`
- `user_id`
- `source_type` : `generated` ou `playlist`
- `source_playlist_id` nullable
- `saved_playlist_id` nullable
- `mode` : `ephemeral` ou `saved`
- `name` nullable
- `clip_duration_seconds`
- `clip_offset_ratio`
- `total_tracks`
- `generation_params_json` nullable
- `status` : `ready`, `playing`, `finished`, `expired`
- `expires_at` nullable
- `created_at`
- `updated_at`

Sens des colonnes :

- `source_playlist_id` = playlist d'origine si on lance un blind test à partir d'une playlist existante ;
- `saved_playlist_id` = playlist créée si l'utilisateur a choisi `Enregistrer la playlist` dans le générateur ;
- `generation_params_json` = snapshot des paramètres utilisés pour générer le blind test ;
- `mode` distingue un blind test éphémère d'un blind test enregistré.

### 5.3. Nouvelle table `blind_test_session_track`

Créer une table `blind_test_session_track` :

- `blind_test_session_id`
- `round_index`
- `track_id`
- `clip_start_seconds`
- `clip_duration_seconds`
- `track_title_snapshot`
- `artist_name_snapshot`
- `album_title_snapshot` nullable
- `artwork_snapshot` nullable
- `audio_url_snapshot`

Clé logique :

- `(blind_test_session_id, round_index)`

Usage :

- figer l'ordre de lecture ;
- figer le point de départ exact de chaque clip ;
- figer les données de reveal ;
- permettre au blind test de survivre à un refresh même en mode éphémère ;
- éviter qu'une playlist source modifiée en cours de route change la session déjà commencée.

### 5.4. Comment la table persistante est utilisée

Cas 1 : blind test généré, non enregistré

- on crée une ligne `blind_test_session` avec `mode = ephemeral` ;
- on remplit `blind_test_session_track` avec la sélection générée ;
- aucune playlist n'est créée ;
- le lecteur blind test travaille uniquement à partir de cette session.

Cas 2 : blind test généré, enregistré

- on crée une ligne `blind_test_session` avec `mode = saved` ;
- on crée une playlist privée ;
- on copie les morceaux dans `playlist` + `playlist_contient_track.position` ;
- on remplit aussi `blind_test_session_track` ;
- `saved_playlist_id` référence la playlist créée.

Cas 3 : blind test lancé depuis une playlist manuelle existante

- on crée une ligne `blind_test_session` avec `source_type = playlist` ;
- `source_playlist_id` référence la playlist manuelle ;
- on copie l'ordre courant de la playlist dans `blind_test_session_track` ;
- on calcule et stocke `clip_start_seconds` pour chaque morceau ;
- la lecture blind test se fait **sur la session**, pas directement sur la playlist source.

Conclusion :

- la session persistante est le contrat de lecture ;
- la playlist, quand elle existe, est un contrat de bibliothèque et de réutilisation.

## 6. Pages et parcours utilisateur

### 6.1. Page générateur

Route :

- `/blind-tests/new`

Contenu :

- champ `Nombre de musiques`
- choix `Difficulté`
- toggle `Enregistrer la playlist`
- si toggle activé : champ `Nom de la playlist`
- volet `Génération avancée`
- bouton `Générer le blind test`

### 6.2. Lancement depuis une playlist existante

Depuis `/playlist/{id}`, ajouter un bouton :

- `Lancer en blind test`

Au clic :

- ouvrir une modale ou une petite page intermédiaire ;
- demander :
  - difficulté,
  - `clip_offset`,
  - éventuellement `Nom de session` si utile ;
- créer la session blind test ;
- rediriger vers le lecteur.

### 6.3. Page lecteur blind test

Route :

- `/blind-tests/play/{sessionId}`

Contenu :

- état initial avec bouton `Démarrer`
- lecture du clip
- bouton `Rejouer`
- bouton `Révéler`
- bouton `Suivant`
- bouton `Terminer`
- bouton `Voir la liste du blind test`

### 6.4. Liste finale

La liste finale est affichable :

- après clic volontaire sur `Voir la liste du blind test`, ou
- automatiquement après `Terminer`.

Cette liste doit permettre :

- de voir tous les morceaux du blind test,
- d'ajouter chaque morceau à une playlist perso,
- si le blind test est éphémère, de proposer ensuite `Enregistrer cette sélection comme playlist`.

## 7. Inputs du générateur

### 7.1. Inputs obligatoires

- `Nombre de musiques`
  - entier
  - min 1
  - max 50

- `Difficulté`
  - `Facile = 10 secondes`
  - `Moyen = 5 secondes`
  - `Difficile = 3 secondes`

- `Enregistrer la playlist`
  - toggle booléen
  - défaut proposé : `off`

### 7.2. Inputs conditionnels

Si `Enregistrer la playlist = on` :

- champ `Nom de la playlist`
  - obligatoire

### 7.3. Volet "Génération avancée"

- `Année`
  - `annee_min`
  - `annee_max`
  - priorité à `track_date_recorded`
  - fallback sur `track_date_created`

- `Genre`
  - multi-select
  - match si le morceau appartient à au moins un genre sélectionné

- `Artiste`
  - autocomplete
  - match si au moins un artiste du morceau correspond

- `Popularité`
  - valeurs : `faible`, `moyenne`, `forte`
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

- `Offset du clip`
  - presets proposés :
    - `Début (0%)`
    - `20%`
    - `40%`
    - `Personnalisé`
  - si `Personnalisé` : slider 0.0 -> 1.0
  - défaut proposé : `20%`

## 8. Génération d'un blind test recommandé

### 8.1. Principe

Le générateur crée un blind test de `n` morceaux mélangeant :

- un pool `connu`,
- un pool `inconnu`.

L'objectif est d'obtenir un blind test mixte :

- morceaux que l'utilisateur a déjà croisés mais pas trop souvent,
- morceaux nouveaux mais cohérents avec ses goûts.

### 8.2. Pool `connu`

Définition :

- morceaux déjà écoutés par l'utilisateur ;
- filtres avancés appliqués ;
- exclus si audio inutilisable.

Score :

- `known_score = 1 - (nb_ecoute / max_nb_ecoute_utilisateur)`

Effet :

- les morceaux rarement écoutés sont favorisés.

### 8.3. Pool `inconnu`

Définition :

- morceaux jamais écoutés par l'utilisateur ;
- filtres avancés appliqués ;
- issus des systèmes de recommandation existants.

Source recommandation :

- si l'utilisateur a un historique exploitable :
  - `userBased(userId, nLarge)` pour une base générale
  - `echoNest(userId, lastTrackId, nLarge)` si un dernier morceau écouté existe
  - fusion des deux listes
- sinon :
  - `newUser(nLarge)`

Score :

- dans la v1, utiliser le rang comme score normalisé ;
- si plus tard les scripts Python renvoient un vrai score, le remplacer sans changer le contrat fonctionnel.

### 8.4. Répartition

Règle :

- `known_target = floor(n / 2)`
- `unknown_target = n - known_target`

Sélection :

- tirage pondéré par score ;
- sans doublon ;
- si un pool est insuffisant, complément depuis l'autre pool ;
- si l'équilibre 50/50 n'a pas pu être respecté, afficher un message non bloquant.

### 8.5. Construction de la session générée

Étapes :

1. valider les inputs ;
2. déterminer `clip_duration_seconds` à partir de la difficulté ;
3. calculer les pools `connu` et `inconnu` ;
4. sélectionner `n` morceaux ;
5. mélanger l'ordre final ;
6. calculer `clip_start_seconds` pour chaque morceau à partir de `clip_offset_ratio` ;
7. créer la session ;
8. écrire `blind_test_session_track` ;
9. si toggle `Enregistrer la playlist = on`, créer aussi une playlist privée.

## 9. Lecture d'une playlist existante en mode blind test

### 9.1. Précondition

La playlist doit être accessible à l'utilisateur :

- playlist possédée par lui, ou
- playlist publique si le produit autorise plus tard ce cas d'usage.

### 9.2. Comportement

Quand l'utilisateur clique sur `Lancer en blind test` depuis une playlist manuelle :

1. l'application charge la playlist dans l'ordre `position` ;
2. l'utilisateur choisit difficulté et `clip_offset` ;
3. le backend crée une `blind_test_session` ;
4. le backend copie la playlist dans `blind_test_session_track` ;
5. chaque item reçoit un `round_index` et un `clip_start_seconds` ;
6. le lecteur blind test lit la session créée.

### 9.3. Pourquoi on ne lit pas directement la playlist

On ne lit pas directement la playlist source pendant la session, car il faut :

- figer l'ordre,
- figer le `clip_offset`,
- figer le reveal,
- éviter qu'une modification de la playlist en parallèle change la partie en cours.

## 10. Règles de lecture blind test

Le lecteur blind test n'utilise pas le lecteur global standard.

États :

- `idle`
- `playing`
- `revealed`
- `finished`

Cycle :

1. **Idle**
   - bouton `Démarrer`
   - aucune métadonnée visible

2. **Playing**
   - lecture du clip du round courant
   - à la fin du clip : arrêt automatique
   - affichage de `Rejouer` et `Révéler`

3. **Reveal**
   - au clic sur `Révéler`
   - affichage de :
     - titre
     - artiste
     - album
     - cover
   - le bouton principal devient `Suivant`

4. **Round suivant**
   - au clic sur `Suivant`
   - reset du masque
   - lecture du clip suivant

5. **Fin**
   - au dernier morceau, `Suivant` devient `Terminer`
   - après `Terminer`, afficher la liste complète

## 11. Gestion de la liste complète

Le bouton `Voir la liste du blind test` doit exister.

Comportement :

- si la session n'est pas terminée, afficher un message d'avertissement :
  - `Cette action révèle toutes les réponses`
- si l'utilisateur confirme, afficher la liste complète

La liste complète doit :

- réutiliser les composants de tracks existants si possible ;
- permettre l'ajout à une playlist perso morceau par morceau ;
- permettre, pour une session éphémère, d'enregistrer la sélection comme playlist a posteriori.

## 12. Règles sur les écoutes et l'historique

Décision explicite :

- une lecture blind test **ne compte pas** comme une écoute normale.

Donc :

- le lecteur blind test ne doit pas appeler `/add-listen` ;
- `user_ecoute` n'est pas modifié par une session blind test ;
- les futures recommandations ne doivent pas être polluées par cette lecture de jeu.

## 13. API backend

Endpoints proposés :

- `POST /blind-tests/generate`
  - crée une session blind test générée
  - crée éventuellement une playlist si `save_playlist = true`
  - retourne `session_id`

- `POST /blind-tests/session-from-playlist`
  - prend `playlist_id`, `difficulty`, `clip_offset_ratio`
  - crée la session blind test à partir d'une playlist manuelle
  - retourne `session_id`

- `GET /blind-tests/{sessionId}`
  - retourne l'état global de la session
  - nom, mode, statut, round courant, total de rounds

- `GET /blind-tests/{sessionId}/round/{index}`
  - retourne les infos de lecture non spoiler :
    - `clip_url`
    - `clip_duration_seconds`
    - `round_index`
    - `total_rounds`

- `GET /blind-tests/{sessionId}/round/{index}/reveal`
  - retourne les infos reveal :
    - titre
    - artiste
    - album
    - cover

- `GET /blind-tests/{sessionId}/tracks`
  - retourne la liste complète du blind test

- `POST /blind-tests/{sessionId}/save-playlist`
  - disponible seulement si la session est éphémère
  - crée une vraie playlist à partir de la session
  - renseigne `saved_playlist_id`

## 14. Frontend

### 14.1. Générateur

Le générateur doit :

- afficher clairement le toggle `Enregistrer la playlist` ;
- ne demander le nom de playlist que si le toggle est activé ;
- afficher `Offset du clip` comme vrai paramètre du jeu, pas comme détail technique caché.

### 14.2. Lecteur blind test

Le lecteur blind test doit :

- être un composant dédié ;
- ne pas dépendre du `music-player-context` global ;
- ne pas afficher les métadonnées avant reveal ;
- gérer correctement `Rejouer`, `Révéler`, `Suivant`, `Terminer`.

### 14.3. Playlist classique

La page playlist doit :

- afficher un bouton `Lancer en blind test` ;
- conserver la lecture playlist classique séparée du blind test.

## 15. Cas limites

À gérer explicitement :

- utilisateur sans historique : génération depuis `newUser()`
- pas assez de morceaux dans `connu` : complément depuis `inconnu`
- pas assez de morceaux dans `inconnu` : complément depuis `connu`
- filtres trop restrictifs : message clair
- morceau plus court que le clip :
  - `clip_start_seconds = 0`
  - lecture du morceau jusqu'à sa fin
- playlist vide : blocage propre
- morceau sans audio exploitable : exclu
- morceau sans données echonest :
  - autorisé sauf si le filtre courant dépend d'un champ echonest

## 16. Tests à prévoir

Minimum :

- tests feature Laravel sur la création de session générée
- tests feature Laravel sur la création de session depuis playlist
- tests sur la persistance `ephemeral` vs `saved`
- tests sur `save-playlist` a posteriori
- tests sur le non-comptage des écoutes
- tests sur le calcul de `clip_start_seconds`
- tests sur la stabilité de l'ordre de session

## 17. Questions restantes à élucider

Questions encore ouvertes, mais non bloquantes pour démarrer :

1. Faut-il proposer uniquement des presets de `clip_offset` (`0%`, `20%`, `40%`) ou aussi un slider libre dans la v1 ?
   - Proposition actuelle : presets + slider si `Personnalisé`.

2. Faut-il autoriser le lancement en blind test d'une playlist publique appartenant à un autre utilisateur ?
   - Proposition actuelle : v1 limitée aux playlists de l'utilisateur.

3. Veut-on afficher automatiquement la liste complète à la fin, ou seulement un bouton `Voir la liste` même après `Terminer` ?
   - Proposition actuelle : affichage automatique après `Terminer`.

## 18. Synthèse des propositions concrètes

Pour les problèmes soulevés, les réponses retenues sont :

- **Persistance** : session toujours en base ; playlist optionnelle.
- **Mode éphémère** : `blind_test_session` + `blind_test_session_track`, sans création de playlist.
- **Mode enregistré** : même session + création d'une playlist privée.
- **Playlist manuelle en blind test** : création d'une session snapshotée à partir de la playlist, sans lire la playlist en direct.
- **Ordre** : ajout obligatoire de `position` sur `playlist_contient_track`.
- **Clip silence / intro** : ajout de `clip_offset_ratio`, défaut `0.2`.
- **Lecteur** : composant blind test dédié, indépendant du lecteur global.
- **Liste finale** : bouton explicite + ajout morceau par morceau à une playlist perso.
- **Écoutes** : blind test exclu du tracking d'écoute normal.
