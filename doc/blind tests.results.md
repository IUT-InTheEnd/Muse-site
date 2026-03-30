# Analyse de la proposition blind test

## Contexte actuel du site

Cross-reference avec `prompts/audit.result.md` et le code actuel :

- Le site est un monolithe Laravel + Inertia React.
- Il existe déjà des playlists utilisateur, un lecteur global, des pages dédiées (`resources/js/pages/*`) et des APIs JSON côté Laravel.
- Les recommandations existent déjà, mais elles sont déléguées à des scripts Python via `App\Services\RecommendationService`.
- La couverture de tests est faible et plusieurs zones du projet sont fragiles. Il faut donc privilégier une implémentation simple, isolée et testable.

Points techniques directement utiles au blind test :

- Les playlists existent déjà : `app/Models/Playlist.php`, `app/Http/Controllers/PlaylistController.php`, `resources/js/pages/playlist/show.tsx`.
- L'ajout de titres à une playlist existe déjà côté UI, y compris titre par titre : `resources/js/components/musecomponents/TrackRow.tsx`.
- Le lecteur global et l'API actuelle de lecture exposent tout de suite les métadonnées du morceau : `resources/js/components/ui/musicplayer.tsx`, `resources/js/lib/track-api.ts`, `app/Http/Controllers/MusicController.php`.
- Le proxy actuel ne fait pas encore de découpe d'extrait blind test ; il se contente de relayer un média distant ou un placeholder : `app/Http/Controllers/ProxyController.php`.

## Évaluation globale

### Verdict

La proposition est **faisable**, et son intuition principale est bonne :

- réutiliser la notion de playlist comme source de morceaux,
- séparer la page de génération et la page de lecture,
- s'appuyer sur les recommandations pour construire une playlist blind test.

En revanche, **elle ne répond pas complètement aux attendus dans son état actuel** et elle n'est pas encore assez précise pour être implémentée de manière robuste.

Mon avis de synthèse :

- **Correspondance aux attendus : partielle mais bonne base**
- **Faisabilité technique : bonne**
- **Robustesse implémentation : moyenne en l'état**
- **Robustesse UX : moyenne en l'état**

## Est-ce que la proposition répond aux attendus ?

### Contraintes

- Utiliser les systèmes de recommandation : **oui, en intention**, mais le détail de calcul du score de recommandation n'est pas défini.
- Page à part : **oui**.
- Modifier l'existant site/API/BD : **oui**, et ce sera nécessaire.

### Attendus fonctionnels

- Demander le nombre de musiques : **oui**.
- Difficulté facile/moyen/difficile avec 10s/5s/3s : **oui**.
- Bouton "Advanced generation" : **oui**.
- Filtres année / genre / artiste / popularité / instrumental-spoken / langues : **oui au niveau de l'idée**, mais définitions trop floues pour coder correctement.
- Bouton pour générer le blind test : **oui**.
- Bouton pour obtenir la liste des musiques du blind test : **pas vraiment couvert explicitement**.
- Possibilité d'ajouter une musique à une playlist perso : **partiellement couvert**. La proposition parle surtout d'enregistrer le blind test dans une playlist, pas clairement d'ajouter un morceau individuel depuis la liste finale.

### Conclusion sur les attendus

La proposition **répond à la structure générale attendue**, mais **il manque encore au moins trois choses pour dire qu'elle répond pleinement aux attendus** :

1. un vrai mécanisme pour afficher la liste complète du blind test,
2. une vraie action "ajouter ce morceau à une playlist perso" depuis cette liste,
3. des définitions non ambiguës pour les filtres et le calcul du mix "connu / inconnu".

## Ce qui est bon dans la proposition

- Réutiliser les playlists comme source de morceaux est un bon choix fonctionnel et architectural.
- Avoir deux pages distinctes est cohérent avec l'architecture actuelle du site.
- Autoriser la lecture d'une playlist existante en mode blind test est une bonne extension. C'est utile pour le manuel et cela limite la duplication de concepts.
- L'idée d'un blind test mixte "morceaux connus mais peu écoutés" + "morceaux inconnus mais recommandés" est intéressante et alignée avec l'esprit du site.
- Le cycle UX "Démarrer -> Rejouer -> Révéler -> Suivant -> Terminer" est globalement bon.

## Problèmes et limitations apparentes

### 1. Fuite de métadonnées si on réutilise l'API et le lecteur actuels

C'est le point le plus important.

Aujourd'hui, l'API de lecture renvoie directement :

- le titre,
- l'artiste,
- la cover,
- l'URL audio.

Le lecteur global affiche ensuite ces informations en permanence.

Donc :

- si on branche le blind test sur `fetchTrack()` / `fetchTracks()`,
- ou sur le `music-player-context`,

alors le blind test est "spoilerable" immédiatement via l'UI, l'état React ou les requêtes réseau.

La proposition ne traite pas assez ce sujet. Pour un blind test robuste, il faut un **mode de lecture masqué**, avec une API dédiée qui ne livre pas les réponses avant le clic sur "Révéler".

> Solution: cacher uniquement les métadonneés du front (pas de hiding côté réseau, ce n'est pas un hackathon)

### 2. Le proxy actuel ne suffit pas encore pour servir un extrait blind test

La proposition mentionne une réimplémentation des ranges du proxy, mais aujourd'hui ce n'est pas fait.

Le blind test a besoin d'un vrai mécanisme de clip :

- soit par support HTTP Range si la source le permet,
- soit par un endpoint applicatif qui sert un extrait borné,
- soit par un token de session côté serveur qui masque l'URL originale.

Sans cela, la difficulté 3s/5s/10s ne sera pas robuste.

### 3. L'ordre de playlist n'est pas formalisé correctement

Le blind test dépend d'un ordre de passage stable.

Or :

- la table pivot `playlist_contient_track` n'a pas de colonne de position dans `database/sql/bdd.sql`,
- la page playlist tente d'appeler `/playlists/reorder`,
- mais cette route / logique n'existe pas dans le backend.

Donc aujourd'hui, l'ordre d'une playlist n'est pas un contrat fiable. Pour un blind test, c'est un vrai problème.

> Il faut faire une migration (de schéma, pas laravel)

### 4. La proposition est encore ambiguë sur la persistance

On ne sait pas clairement :

- si un blind test généré crée toujours une playlist,
- s'il crée juste une session temporaire,
- ou si la sauvegarde dans une playlist est optionnelle.

Il faut trancher ce comportement avant implémentation.

### 5. Le calcul "taux de recommendation" n'est pas défini de manière exploitable

Le code actuel de recommandations renvoie surtout des **listes ordonnées d'IDs**, pas des scores normalisés et comparables.

Donc la phrase :

- "degré = taux de recommendation"

est bonne conceptuellement, mais pas assez précise pour être codée telle quelle.

Il faut définir si :

- on utilise le rang dans la liste comme score,
- on modifie les scripts Python pour retourner un score explicite,
- ou on calcule un score applicatif supplémentaire.

### 6. Les filtres avancés ne sont pas assez précis

Plusieurs champs sont ambigus :

- **Année** : année d'enregistrement, de création, ou intervalle ?
- **Popularité** : `track_listens`, `track_interest`, `track_hottness`, ou autre ?
- **Instrumental / Spoken** : seuils exacts ? champ bool + champ echonest ? cas mixtes ?
- **Langues** : `track_language_code` ou table relationnelle `track_chanter_en` ?
- **Artiste** : un seul artiste, plusieurs, autocomplete par nom ou ID ?

Sans définition stricte, l'implémentation risque d'être incohérente ou frustrante côté UX.

### 7. Le blind test peut polluer l'historique d'écoute et les recommandations

Le lecteur actuel incrémente les écoutes à 50% du morceau dans `music-player-context.tsx`.

Si un blind test sert des clips courts comme de "vrais morceaux", il peut :

- incrémenter artificiellement les écoutes,
- fausser le pool "connu / inconnu",
- modifier les futures recommandations.

Il faut décider explicitement : **une écoute blind test ne compte pas comme une écoute normale**.

### 8. UX : la liste finale et l'ajout à une playlist perso ne sont pas assez explicites

Les attendus demandent :

- un bouton pour obtenir la liste des musiques,
- la possibilité d'ajouter une musique à une playlist perso.

La proposition parle surtout de jouer une playlist ou d'en créer une.
Il manque une UX claire de type :

- "Voir la liste du blind test"
- puis, sur chaque ligne, "Ajouter à une playlist"

### 9. Cas limites non traités

Exemples :

- utilisateur sans historique d'écoute,
- historique trop petit pour remplir la moitié "connu",
- filtres trop restrictifs,
- morceaux sans fichier audio exploitable,
- morceaux sans données echonest,
- playlists vides ou très courtes.

Ces cas doivent être gérés dès le design, pas après coup.

## Évaluation de robustesse

### Robustesse implémentation

**Moyenne en l'état.**

La direction est bonne, mais il faut la durcir autour de quelques décisions structurantes :

- ne pas réutiliser tel quel le lecteur global,
- ne pas réutiliser tel quel l'API de lecture standard,
- formaliser l'ordre de playlist,
- définir exactement le scoring et les filtres,
- isoler les sessions blind test du comptage d'écoute classique.

### Robustesse UX

**Moyenne en l'état, potentiellement bonne après clarification.**

Les écrans principaux sont bien identifiés, mais plusieurs détails UX sont décisifs :

- ne pas spoiler avant "Révéler",
- éviter les métadonnées visibles dans le lecteur global,
- rendre le flux de jeu très clair,
- permettre une sortie lisible vers la liste finale,
- gérer proprement les cas où la génération trouve peu de candidats.

## Reformulation claire et non ambiguë : plan d'implémentation

Ci-dessous, une version reformulée, précise et directement implémentable de la proposition.

### 1. Périmètre fonctionnel

La fonctionnalité comporte **deux entrées** :

1. **Générer un blind test recommandé**
   - page dédiée,
   - génération à partir des recommandations + historique utilisateur + filtres.

2. **Jouer une playlist existante en mode blind test**
   - depuis une playlist existante,
   - ouverture sur une page dédiée de lecture blind test,
   - sans repasser par la génération.

Dans les deux cas, la lecture se fait sur **une page blind test dédiée**, distincte des pages playlist classiques.

### 2. Pages et routes à créer

Créer les pages suivantes :

- `/blind-tests/new`
  - page de génération du blind test.
- `/blind-tests/play/{sessionId}`
  - page de lecture blind test.
- `/playlist/{id}/blind-test`
  - point d'entrée depuis une playlist existante ; cette route crée une session puis redirige vers `/blind-tests/play/{sessionId}`.

Ajouter sur la page playlist existante un bouton :

- `Lancer en blind test`

### 3. Contrat de données à ajouter / modifier

#### Base de données

Modifier la structure des données pour introduire :

1. une colonne `position` sur `playlist_contient_track`
   - obligatoire pour garantir l'ordre de lecture.

2. une table `blind_test_session`
   - `blind_test_session_id`
   - `user_id`
   - `playlist_id`
   - `clip_duration_seconds`
   - `source_type` (`generated` ou `playlist`)
   - `generation_params_json` nullable
   - `status` (`ready`, `finished`)
   - timestamps simples

Cette table sert à stocker la configuration d'un run blind test sans polluer la notion générale de playlist.

#### Règle de persistance

Règle claire :

- un blind test **généré** crée une **playlist privée** possédée par l'utilisateur, puis crée une `blind_test_session` qui pointe dessus ;
- un blind test **depuis playlist existante** ne duplique pas la playlist, il crée seulement une `blind_test_session` pointant vers cette playlist.

Ainsi :

- on réutilise bien l'architecture playlist,
- on garde une page séparée,
- on peut retrouver la liste complète des morceaux,
- on peut ajouter un morceau à une autre playlist perso depuis la liste finale.

### 4. Définitions non ambiguës des inputs de génération

La page `/blind-tests/new` contient :

- `Nombre de musiques`
  - entier, min 1, max 50
- `Difficulté`
  - `Facile = 10 secondes`
  - `Moyen = 5 secondes`
  - `Difficile = 3 secondes`
- un bouton ou volet `Advanced generation`

Le volet avancé contient :

- `Année`
  - deux champs `annee_min` et `annee_max`
  - appliqué sur `track_date_recorded`
  - fallback sur `track_date_created` si `track_date_recorded` est nul
- `Genre`
  - multi-select de genres
  - un morceau est éligible s'il appartient à au moins un genre sélectionné
- `Artiste`
  - select/autocomplete sur l'artiste
  - si renseigné, le morceau doit avoir au moins un artiste correspondant
- `Popularité`
  - filtre sur `track_listens`
  - trois niveaux : `faible`, `moyenne`, `forte`
  - la classification se fait par percentiles sur l'ensemble candidat après filtres de base
- `Type vocal`
  - valeurs : `indifférent`, `instrumental`, `spoken`
  - `instrumental` = `track_instrumental = true` OU `track_echonest.instrumentalness >= 0.5`
  - `spoken` = `track_echonest.speechiness >= 0.5`
- `Langues`
  - multi-select
  - priorité à la relation `track_chanter_en`
  - fallback sur `track_language_code` si la relation manque

### 5. Règles précises de génération recommandée

La génération produit une playlist de `n` morceaux.

#### 5.1. Construction des deux pools

Pool A : `connu`

- morceaux déjà écoutés par l'utilisateur,
- filtres avancés appliqués,
- score = rareté d'écoute,
- formule : `known_score = 1 - (nb_ecoute / max_nb_ecoute_utilisateur)` si `max_nb_ecoute_utilisateur > 0`, sinon `0`.

Pool B : `inconnu`

- morceaux jamais écoutés par l'utilisateur,
- filtres avancés appliqués,
- issus des systèmes de recommandation existants,
- score = score de recommandation normalisé.

#### 5.2. Source de recommandation pour le pool inconnu

Règle claire :

- si l'utilisateur a un historique exploitable :
  - utiliser en priorité `userBased(userId, nLarge)` pour une base générale,
  - compléter par `echoNest(userId, lastTrackId, nLarge)` si un dernier morceau écouté existe,
  - fusionner les résultats.
- si l'utilisateur n'a pas d'historique :
  - utiliser `newUser(nLarge)`.

#### 5.3. Score de recommandation

Version implémentable sans changer immédiatement tous les scripts Python :

- les scripts actuels renvoient des listes ordonnées ;
- on transforme le rang en score normalisé ;
- exemple : premier = score 1.0, dernier = score proche de 0.

Amélioration ultérieure possible :

- faire retourner un vrai score par les scripts Python.

#### 5.4. Répartition connu / inconnu

Règle claire :

- `known_target = floor(n / 2)`
- `unknown_target = n - known_target`

Sélection :

- tirer les morceaux dans chaque pool de manière pondérée par leur score,
- sans doublon,
- si un pool n'a pas assez de candidats, compléter avec l'autre pool,
- afficher un message non bloquant si la répartition 50/50 n'a pas pu être respectée.

#### 5.5. Ordre final

Une fois les morceaux sélectionnés :

- mélanger l'ordre final,
- enregistrer cet ordre dans `playlist_contient_track.position`,
- ne plus recalculer ni remélanger pendant la session.

### 6. API backend dédiée blind test

Créer des endpoints dédiés. Ne pas réutiliser tel quel `/tracks` ou `/test-music-player`.

Endpoints proposés :

- `POST /blind-tests/generate`
  - valide les inputs,
  - génère la playlist privée,
  - crée la session,
  - retourne `session_id`.

- `POST /blind-tests/session-from-playlist`
  - prend `playlist_id` + `difficulty`,
  - crée une session blind test pour cette playlist,
  - retourne `session_id`.

- `GET /blind-tests/{sessionId}`
  - retourne l'état global de la session,
  - nombre de rounds, difficulté, index courant, etc.

- `GET /blind-tests/{sessionId}/round/{index}/clip`
  - retourne uniquement l'audio du round,
  - sans titre, artiste ni cover,
  - avec URL opaque ou token serveur.

- `GET /blind-tests/{sessionId}/round/{index}/reveal`
  - retourne titre + artiste + album + cover pour le round courant,
  - appelé seulement au clic sur `Révéler`.

- `GET /blind-tests/{sessionId}/tracks`
  - retourne la liste complète des morceaux,
  - utilisée uniquement quand l'utilisateur clique sur `Voir la liste du blind test`.

### 7. Règles de lecture blind test

La page `/blind-tests/play/{sessionId}` n'utilise pas le lecteur global classique.

Elle utilise un composant local dédié blind test avec l'état suivant :

- `idle`
- `playing`
- `revealed`
- `finished`

Cycle exact :

1. État initial :
   - bouton `Démarrer`
   - aucune métadata affichée

2. Au clic sur `Démarrer` :
   - lecture du clip du premier morceau
   - à la fin du clip, arrêt automatique
   - bouton `Rejouer` visible
   - bouton `Révéler` visible

3. Au clic sur `Rejouer` :
   - rejoue le même clip depuis le début

4. Au clic sur `Révéler` :
   - affiche au centre la carte complète : titre + artiste + album + cover
   - remplace l'action principale par `Suivant`

5. Au clic sur `Suivant` :
   - passe au morceau suivant
   - masque de nouveau les métadonnées
   - lance la lecture du clip suivant

6. Au dernier morceau :
   - `Suivant` devient `Terminer`

7. Au clic sur `Terminer` :
   - session marquée `finished`
   - retour à l'état initial de la page avec accès à la liste finale

### 8. Règles anti-spoiler

Pour que le blind test soit robuste :

- ne jamais charger dans le frontend toutes les réponses avant reveal,
- ne jamais afficher le lecteur global classique pendant la session blind test,
- ne jamais exposer l'URL média originale côté client si elle peut contenir des indices,
- ne pas afficher la liste complète sans action explicite de l'utilisateur.

Le bouton `Voir la liste du blind test` :

- doit être visible,
- mais doit ouvrir un dialogue de confirmation du type `Cette action révèle toutes les réponses`.

### 9. Liste finale et ajout à une playlist perso

Une fois la liste révélée explicitement ou la session terminée :

- afficher la liste complète des morceaux du blind test,
- réutiliser les composants de liste de tracks existants,
- sur chaque ligne, conserver l'action existante `Ajouter à une playlist`.

Ainsi, l'attendu :

- `obtenir la liste des musiques du blind test`
- et `ajouter une musique à une playlist perso`

est couvert explicitement.

### 10. Règles sur les écoutes et la recommandation

Décision explicite :

- une lecture blind test **ne compte pas** comme une écoute normale.

Donc :

- pas d'appel à `/add-listen` depuis le player blind test,
- pas de pollution de `user_ecoute`,
- pas de biais induit sur les futures recommandations.

### 11. Cas limites à implémenter explicitement

- utilisateur sans historique : génération uniquement depuis `newUser()`
- pas assez de morceaux dans le pool `connu` : complément depuis `inconnu`
- pas assez de morceaux dans le pool `inconnu` : complément depuis `connu`
- filtres trop restrictifs : message clair + proposition d'assouplir les filtres
- playlist vide : blocage propre avec message
- morceaux sans audio utilisable : exclus de la génération
- morceaux sans echonest : exclus seulement si le filtre en dépend

### 12. Vérification et tests à prévoir

Vu l'état du projet décrit dans `prompts/audit.result.md`, il faut au minimum :

- tests feature Laravel pour la génération et les endpoints blind test,
- tests sur les droits d'accès aux sessions et playlists privées,
- tests sur le non-comptage des écoutes blind test,
- test de la logique de répartition connu / inconnu,
- test du fallback quand un pool est insuffisant.

## Conclusion

La proposition est **bonne sur le fond**, mais **insuffisamment précise et insuffisamment robuste en l'état** pour être codée directement sans risque de contresens.

Le point clé est le suivant :

- **oui**, il faut réutiliser les playlists comme source de morceaux,
- **non**, il ne faut pas réutiliser tel quel le lecteur et l'API de lecture actuels pour la session blind test.

Si on applique le plan ci-dessus, la fonctionnalité devient :

- conforme aux attendus,
- cohérente avec l'architecture actuelle,
- plus solide côté UX,
- et nettement plus simple à implémenter proprement.
