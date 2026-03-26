# Analyse de la proposition blind test

## Contexte actuel du site

Cross-reference avec `prompts/audit.result.md` et le code actuel :

- Le site est un monolithe Laravel + Inertia React.
- Il existe deja des playlists utilisateur, un lecteur global, des pages dediees (`resources/js/pages/*`) et des APIs JSON cote Laravel.
- Les recommandations existent deja, mais elles sont delegates a des scripts Python via `App\Services\RecommendationService`.
- La couverture de tests est faible et plusieurs zones du projet sont fragiles. Il faut donc privilegier une implementation simple, isolee et testable.

Points techniques directement utiles au blind test :

- Les playlists existent deja : `app/Models/Playlist.php`, `app/Http/Controllers/PlaylistController.php`, `resources/js/pages/playlist/show.tsx`.
- L'ajout de titres a une playlist existe deja cote UI, y compris titre par titre : `resources/js/components/musecomponents/TrackRow.tsx`.
- Le lecteur global et l'API actuelle de lecture exposent tout de suite les metadonnees du morceau : `resources/js/components/ui/musicplayer.tsx`, `resources/js/lib/track-api.ts`, `app/Http/Controllers/MusicController.php`.
- Le proxy actuel ne fait pas encore de decoupe d'extrait blind test ; il se contente de relayer un media distant ou un placeholder : `app/Http/Controllers/ProxyController.php`.

## Evaluation globale

### Verdict

La proposition est **faisable**, et son intuition principale est bonne :

- reutiliser la notion de playlist comme source de morceaux,
- separer la page de generation et la page de lecture,
- s'appuyer sur les recommandations pour construire une playlist blind test.

En revanche, **elle ne repond pas completement aux attendus dans son etat actuel** et elle n'est pas encore assez precise pour etre implementee de maniere robuste.

Mon avis synthese :

- **Correspondance aux attendus : partielle mais bonne base**
- **Faisabilite technique : bonne**
- **Robustesse implementation : moyenne en l'etat**
- **Robustesse UX : moyenne en l'etat**

## Est-ce que la proposition repond aux attendus ?

### Contraintes

- Utiliser les systemes de recommandation : **oui, en intention**, mais le detail de calcul du score de recommandation n'est pas defini.
- Page a part : **oui**.
- Modifier existant site/API/BD : **oui**, et ce sera necessaire.

### Attendus fonctionnels

- Demander le nombre de musiques : **oui**.
- Difficulte facile/moyen/difficile avec 10s/5s/3s : **oui**.
- Bouton "Advanced generation" : **oui**.
- Filtres annee / genre / artiste / popularite / instrumental-spoken / langues : **oui au niveau de l'idee**, mais definitions trop floues pour coder correctement.
- Bouton pour generer le blind test : **oui**.
- Bouton pour obtenir la liste des musiques du blind test : **pas vraiment couvert explicitement**.
- Possibilite d'ajouter une musique a une playlist perso : **partiellement couvert**. La proposition parle surtout d'enregistrer le blind test dans une playlist, pas clairement d'ajouter un morceau individuel depuis la liste finale.

### Conclusion sur les attendus

La proposition **repond a la structure generale attendue**, mais **il manque encore au moins trois choses pour dire qu'elle repond pleinement aux attendus** :

1. un vrai mecanisme pour afficher la liste complete du blind test,
2. une vraie action "ajouter ce morceau a une playlist perso" depuis cette liste,
3. des definitions non ambigues pour les filtres et le calcul du mix "connu / inconnu".

## Ce qui est bon dans la proposition

- Reutiliser les playlists comme source de morceaux est un bon choix fonctionnel et architectural.
- Avoir deux pages distinctes est coherent avec l'architecture actuelle du site.
- Autoriser la lecture d'une playlist existante en mode blind test est une bonne extension. C'est utile pour le manuel et cela limite la duplication de concepts.
- L'idee d'un blind test mixte "morceaux connus mais peu ecoutes" + "morceaux inconnus mais recommandes" est interessante et alignee avec l'esprit du site.
- Le cycle UX "Demarrer -> Rejouer -> Reveler -> Suivant -> Terminer" est globalement bon.

## Problemes et limitations apparentes

### 1. Fuite de metadonnees si on reutilise l'API et le lecteur actuels

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

alors le blind test est "spoilerable" immediatement via l'UI, l'etat React ou les requetes reseau.

La proposition ne traite pas assez ce sujet. Pour un blind test robuste, il faut un **mode de lecture masque**, avec une API dediee qui ne livre pas les reponses avant le clic sur "Reveler".

### 2. Le proxy actuel ne suffit pas encore pour servir un extrait blind test

La proposition mentionne une reimplementation des ranges du proxy, mais aujourd'hui ce n'est pas fait.

Le blind test a besoin d'un vrai mecanisme de clip :

- soit par support HTTP Range si la source le permet,
- soit par un endpoint applicatif qui sert un extrait borne,
- soit par un token de session cote serveur qui masque l'URL originale.

Sans cela, la difficulte 3s/5s/10s ne sera pas robuste.

### 3. L'ordre de playlist n'est pas formalise correctement

Le blind test depend d'un ordre de passage stable.

Or :

- la table pivot `playlist_contient_track` n'a pas de colonne de position dans `database/sql/bdd.sql`,
- la page playlist tente d'appeler `/playlists/reorder`,
- mais cette route / logique n'existe pas dans le backend.

Donc aujourd'hui, l'ordre d'une playlist n'est pas un contrat fiable. Pour un blind test, c'est un vrai probleme.

### 4. La proposition est encore ambigue sur la persistance

On ne sait pas clairement :

- si un blind test genere cree toujours une playlist,
- s'il cree juste une session temporaire,
- ou si la sauvegarde dans une playlist est optionnelle.

Il faut trancher ce comportement avant implementation.

### 5. Le calcul "taux de recommendation" n'est pas defini de maniere exploitable

Le code actuel de recommandations renvoie surtout des **listes ordonnees d'IDs**, pas des scores normalises et comparables.

Donc la phrase :

- "degre = taux de recommendation"

est bonne conceptuellement, mais pas assez precise pour etre codee telle quelle.

Il faut definir si :

- on utilise le rang dans la liste comme score,
- on modifie les scripts Python pour retourner un score explicite,
- ou on calcule un score applicatif supplementaire.

### 6. Les filtres avances ne sont pas assez precis

Plusieurs champs sont ambigus :

- **Annee** : annee d'enregistrement, de creation, ou intervalle ?
- **Popularite** : `track_listens`, `track_interest`, `track_hottness`, ou autre ?
- **Instrumental / Spoken** : seuils exacts ? champ bool + champ echonest ? cas mixtes ?
- **Langues** : `track_language_code` ou table relationnelle `track_chanter_en` ?
- **Artiste** : un seul artiste, plusieurs, autocomplete par nom ou ID ?

Sans definition stricte, l'implementation risque d'etre incoherente ou frustrante cote UX.

### 7. Le blind test peut polluer l'historique d'ecoute et les recommandations

Le lecteur actuel incremente les ecoutes a 50% du morceau dans `music-player-context.tsx`.

Si un blind test sert des clips courts comme de "vrais morceaux", il peut :

- incrementer artificiellement les ecoutes,
- fausser le pool "connu / inconnu",
- modifier les futures recommandations.

Il faut decider explicitement : **une ecoute blind test ne compte pas comme une ecoute normale**.

### 8. UX : la liste finale et l'ajout a une playlist perso ne sont pas assez explicites

Les attendus demandent :

- un bouton pour obtenir la liste des musiques,
- la possibilite d'ajouter une musique a une playlist perso.

La proposition parle surtout de jouer une playlist ou d'en creer une.
Il manque une UX claire de type :

- "Voir la liste du blind test"
- puis, sur chaque ligne, "Ajouter a une playlist"

### 9. Cas limites non traites

Exemples :

- utilisateur sans historique d'ecoute,
- historique trop petit pour remplir la moitie "connu",
- filtres trop restrictifs,
- morceaux sans fichier audio exploitable,
- morceaux sans donnees echonest,
- playlists vides ou tres courtes.

Ces cas doivent etre geres des le design, pas apres coup.

## Evaluation de robustesse

### Robustesse implementation

**Moyenne en l'etat.**

La direction est bonne, mais il faut la durcir autour de quelques decisions structurantes :

- ne pas reutiliser tel quel le lecteur global,
- ne pas reutiliser tel quel l'API de lecture standard,
- formaliser l'ordre de playlist,
- definir exactement le scoring et les filtres,
- isoler les sessions blind test du comptage d'ecoute classique.

### Robustesse UX

**Moyenne en l'etat, potentiellement bonne apres clarification.**

Les ecrans principaux sont bien identifies, mais plusieurs details UX sont decisifs :

- ne pas spoiler avant "Reveler",
- eviter les metadonnees visibles dans le lecteur global,
- rendre le flux de jeu tres clair,
- permettre une sortie lisible vers la liste finale,
- gerer proprement les cas ou la generation trouve peu de candidats.

## Reformulation claire et non ambigue : plan d'implementation

Ci-dessous, une version reformulee, precise et directement implementable de la proposition.

### 1. Perimetre fonctionnel

La fonctionnalite comporte **deux entrees** :

1. **Generer un blind test recommande**
   - page dediee,
   - generation a partir des recommandations + historique utilisateur + filtres.

2. **Jouer une playlist existante en mode blind test**
   - depuis une playlist existante,
   - ouverture sur une page dediee de lecture blind test,
   - sans repasser par la generation.

Dans les deux cas, la lecture se fait sur **une page blind test dediee**, distincte des pages playlist classiques.

### 2. Pages et routes a creer

Creer les pages suivantes :

- `/blind-tests/new`
  - page de generation du blind test.
- `/blind-tests/play/{sessionId}`
  - page de lecture blind test.
- `/playlist/{id}/blind-test`
  - point d'entree depuis une playlist existante ; cette route cree une session puis redirige vers `/blind-tests/play/{sessionId}`.

Ajouter sur la page playlist existante un bouton :

- `Lancer en blind test`

### 3. Contrat de donnees a ajouter / modifier

#### Base de donnees

Modifier la structure des donnees pour introduire :

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

Cette table sert a stocker la configuration d'un run blind test sans polluer la notion generale de playlist.

#### Regle de persistance

Regle claire :

- un blind test **genere** cree une **playlist privee** possedee par l'utilisateur, puis cree une `blind_test_session` qui pointe dessus ;
- un blind test **depuis playlist existante** ne duplique pas la playlist, il cree seulement une `blind_test_session` pointant vers cette playlist.

Ainsi :

- on reutilise bien l'architecture playlist,
- on garde une page separee,
- on peut retrouver la liste complete des morceaux,
- on peut ajouter un morceau a une autre playlist perso depuis la liste finale.

### 4. Definitions non ambigues des inputs de generation

La page `/blind-tests/new` contient :

- `Nombre de musiques`
  - entier, min 1, max 50
- `Difficulte`
  - `Facile = 10 secondes`
  - `Moyen = 5 secondes`
  - `Difficile = 3 secondes`
- un bouton ou volet `Advanced generation`

Le volet avance contient :

- `Annee`
  - deux champs `annee_min` et `annee_max`
  - applique sur `track_date_recorded`
  - fallback sur `track_date_created` si `track_date_recorded` est nul
- `Genre`
  - multi-select de genres
  - un morceau est eligible s'il appartient a au moins un genre selectionne
- `Artiste`
  - select/autocomplete sur l'artiste
  - si renseigne, le morceau doit avoir au moins un artiste correspondant
- `Popularite`
  - filtre sur `track_listens`
  - trois niveaux : `faible`, `moyenne`, `forte`
  - la classification se fait par percentiles sur l'ensemble candidat apres filtres de base
- `Type vocal`
  - valeurs : `indifferent`, `instrumental`, `spoken`
  - `instrumental` = `track_instrumental = true` OU `track_echonest.instrumentalness >= 0.5`
  - `spoken` = `track_echonest.speechiness >= 0.5`
- `Langues`
  - multi-select
  - priorite a la relation `track_chanter_en`
  - fallback sur `track_language_code` si la relation manque

### 5. Regles precises de generation recommandee

La generation produit une playlist de `n` morceaux.

#### 5.1. Construction des deux pools

Pool A : `connu`

- morceaux deja ecoutes par l'utilisateur,
- filtres avances appliques,
- score = rarete d'ecoute,
- formule : `known_score = 1 - (nb_ecoute / max_nb_ecoute_utilisateur)` si `max_nb_ecoute_utilisateur > 0`, sinon `0`.

Pool B : `inconnu`

- morceaux jamais ecoutes par l'utilisateur,
- filtres avances appliques,
- issus des systemes de recommandation existants,
- score = score de recommandation normalise.

#### 5.2. Source de recommandation pour le pool inconnu

Regle claire :

- si l'utilisateur a un historique exploitable :
  - utiliser en priorite `userBased(userId, nLarge)` pour une base generale,
  - completer par `echoNest(userId, lastTrackId, nLarge)` si un dernier morceau ecoute existe,
  - fusionner les resultats.
- si l'utilisateur n'a pas d'historique :
  - utiliser `newUser(nLarge)`.

#### 5.3. Score de recommandation

Version implementable sans changer immediatement tous les scripts Python :

- les scripts actuels renvoient des listes ordonnees ;
- on transforme le rang en score normalise ;
- exemple : premier = score 1.0, dernier = score proche de 0.

Amelioration ulterieure possible :

- faire retourner un vrai score par les scripts Python.

#### 5.4. Repartition connu / inconnu

Regle claire :

- `known_target = floor(n / 2)`
- `unknown_target = n - known_target`

Selection :

- tirer les morceaux dans chaque pool de maniere ponderee par leur score,
- sans doublon,
- si un pool n'a pas assez de candidats, completer avec l'autre pool,
- afficher un message non bloquant si la repartition 50/50 n'a pas pu etre respectee.

#### 5.5. Ordre final

Une fois les morceaux selectionnes :

- melanger l'ordre final,
- enregistrer cet ordre dans `playlist_contient_track.position`,
- ne plus recalculer ni remelanger pendant la session.

### 6. API backend dediee blind test

Creer des endpoints dedies. Ne pas reutiliser tel quel `/tracks` ou `/test-music-player`.

Endpoints proposes :

- `POST /blind-tests/generate`
  - valide les inputs,
  - genere la playlist privee,
  - cree la session,
  - retourne `session_id`.

- `POST /blind-tests/session-from-playlist`
  - prend `playlist_id` + `difficulty`,
  - cree une session blind test pour cette playlist,
  - retourne `session_id`.

- `GET /blind-tests/{sessionId}`
  - retourne l'etat global de la session,
  - nombre de rounds, difficulte, index courant, etc.

- `GET /blind-tests/{sessionId}/round/{index}/clip`
  - retourne uniquement l'audio du round,
  - sans titre, artiste ni cover,
  - avec URL opaque ou token serveur.

- `GET /blind-tests/{sessionId}/round/{index}/reveal`
  - retourne titre + artiste + album + cover pour le round courant,
  - appele seulement au clic sur `Reveler`.

- `GET /blind-tests/{sessionId}/tracks`
  - retourne la liste complete des morceaux,
  - utilisee uniquement quand l'utilisateur clique sur `Voir la liste du blind test`.

### 7. Regles de lecture blind test

La page `/blind-tests/play/{sessionId}` n'utilise pas le lecteur global classique.

Elle utilise un composant local dedie blind test avec l'etat suivant :

- `idle`
- `playing`
- `revealed`
- `finished`

Cycle exact :

1. Etat initial :
   - bouton `Demarrer`
   - aucune metadata affichee

2. Au clic sur `Demarrer` :
   - lecture du clip du premier morceau
   - a la fin du clip, arret automatique
   - bouton `Rejouer` visible
   - bouton `Reveler` visible

3. Au clic sur `Rejouer` :
   - rejoue le meme clip depuis le debut

4. Au clic sur `Reveler` :
   - affiche au centre la carte complete : titre + artiste + album + cover
   - remplace l'action principale par `Suivant`

5. Au clic sur `Suivant` :
   - passe au morceau suivant
   - masque de nouveau les metadonnees
   - lance la lecture du clip suivant

6. Au dernier morceau :
   - `Suivant` devient `Terminer`

7. Au clic sur `Terminer` :
   - session marquee `finished`
   - retour a l'etat initial de la page avec acces a la liste finale

### 8. Regles anti-spoiler

Pour que le blind test soit robuste :

- ne jamais charger dans le frontend toutes les reponses avant reveal,
- ne jamais afficher le lecteur global classique pendant la session blind test,
- ne jamais exposer l'URL media originale cote client si elle peut contenir des indices,
- ne pas afficher la liste complete sans action explicite de l'utilisateur.

Le bouton `Voir la liste du blind test` :

- doit etre visible,
- mais doit ouvrir un dialogue de confirmation du type `Cette action revele toutes les reponses`.

### 9. Liste finale et ajout a une playlist perso

Une fois la liste revelee explicitement ou la session terminee :

- afficher la liste complete des morceaux du blind test,
- reutiliser les composants de liste de tracks existants,
- sur chaque ligne, conserver l'action existante `Ajouter a une playlist`.

Ainsi, l'attendu :

- `obtenir la liste des musiques du blind test`
- et `ajouter une musique a une playlist perso`

est couvert explicitement.

### 10. Regles sur les ecoutes et la recommandation

Decision explicite :

- une lecture blind test **ne compte pas** comme une ecoute normale.

Donc :

- pas d'appel a `/add-listen` depuis le player blind test,
- pas de pollution de `user_ecoute`,
- pas de biais induit sur les futures recommandations.

### 11. Cas limites a implementer explicitement

- utilisateur sans historique : generation uniquement depuis `newUser()`
- pas assez de morceaux dans le pool `connu` : complement depuis `inconnu`
- pas assez de morceaux dans le pool `inconnu` : complement depuis `connu`
- filtres trop restrictifs : message clair + proposition d'assouplir les filtres
- playlist vide : blocage propre avec message
- morceaux sans audio utilisable : exclus de la generation
- morceaux sans echonest : exclus seulement si le filtre en depend

### 12. Verification et tests a prevoir

Vu l'etat du projet decrit dans `prompts/audit.result.md`, il faut au minimum :

- tests feature Laravel pour la generation et les endpoints blind test,
- tests sur les droits d'acces aux sessions et playlists privees,
- tests sur le non-comptage des ecoutes blind test,
- test de la logique de repartition connu / inconnu,
- test du fallback quand un pool est insuffisant.

## Conclusion

La proposition est **bonne sur le fond**, mais **insuffisamment precise et insuffisamment robuste en l'etat** pour etre codee directement sans risque de contresens.

Le point cle est le suivant :

- **oui**, il faut reutiliser les playlists comme source de morceaux,
- **non**, il ne faut pas reutiliser tel quel le lecteur et l'API de lecture actuels pour la session blind test.

Si on applique le plan ci-dessus, la fonctionnalite devient :

- conforme aux attendus,
- coherente avec l'architecture actuelle,
- plus solide cote UX,
- et nettement plus simple a implementer proprement.
