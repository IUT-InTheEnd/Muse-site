# Spécification fonctionnelle V1 - Blind test

## 1. Objet

Cette V1 simplifie volontairement le modèle.

Le blind test n'est **pas** un objet métier autonome.  
Le blind test est **un mode spécial de lecture d'une playlist**.

Conséquence :

- la **playlist** reste l'objet central ;
- le **générateur** sert à produire une playlist ;
- la **lecture blind test** est une manière particulière de lire cette playlist ;
- il n'y a **pas** de table `blind_test_session` ;
- il n'y a **pas** de table `blind_test_session_track`.

L'objectif de cette V1 est :

- la fonctionnalité,
- la fluidité UX,
- un modèle simple à implémenter et à raisonner.

## 2. Principes de conception

### 2.1. Le blind test est un mode de lecture

Un blind test correspond à :

- une playlist persistante existante, ou
- une playlist éphémère stockée en session,

lue avec des règles UI différentes :

- métadonnées masquées avant reveal,
- lecture d'un extrait court,
- reveal manuel,
- passage au morceau suivant.

### 2.2. Le générateur ne configure pas la lecture

Le générateur ne demande que les paramètres nécessaires pour **choisir les morceaux**.

Il ne demande pas :

- la difficulté,
- l'offset du clip,
- les options de lecture blind test.

Ces paramètres sont demandés **au moment où l'utilisateur lance la lecture blind test**.

### 2.3. Éphémère = session navigateur

Si l'utilisateur ne souhaite pas enregistrer la playlist générée :

- la playlist générée est stockée en **session** ;
- elle n'est pas enregistrée en base comme playlist utilisateur ;
- elle devient invalide à la fin de la session navigateur.

Cette V1 assume donc :

- pas d'historique des blind tests éphémères,
- pas de reprise cross-device,
- pas de persistance longue durée pour les générés non sauvegardés.

## 3. Cas d'usage

### 3.1. Jouer une playlist existante en blind test

L'utilisateur possède déjà une playlist créée manuellement ou enregistrée précédemment.

Depuis la page playlist :

- il clique sur `Lancer en blind test`
- il choisit les paramètres de lecture blind test
- il démarre la lecture blind test de cette playlist

### 3.2. Générer un blind test et l'enregistrer

L'utilisateur ouvre la page de génération :

- choisit les paramètres de génération
- active `Enregistrer la playlist`
- génère la playlist

Le backend :

- crée une vraie playlist en base
- y ajoute les morceaux

Ensuite :

- l'utilisateur est redirigé vers la playlist créée
- puis peut cliquer `Lancer en blind test`

### 3.3. Générer un blind test éphémère

L'utilisateur ouvre la page de génération :

- choisit les paramètres de génération
- laisse `Enregistrer la playlist` désactivé
- génère la playlist

Le backend :

- calcule la liste des morceaux
- stocke cette liste en session

Ensuite :

- l'utilisateur est redirigé vers une page de lecture blind test de la playlist éphémère
- les paramètres de lecture sont demandés avant de démarrer

## 4. Modèle de données

### 4.1. Playlist persistante

La playlist persistante repose sur les structures existantes :

- `playlist`
- `playlist_contient_track`

Ajout requis :

- une colonne `position` sur `playlist_contient_track`

Cette colonne est nécessaire pour :

- garantir un ordre stable,
- permettre de relire une playlist dans un ordre maîtrisé,
- faire du blind test sur une playlist manuelle sans ambiguïté.

### 4.2. Playlist éphémère

La playlist éphémère n'est pas stockée en base comme une vraie playlist.

Elle est stockée en session sous une structure logique du type :

```json
{
  "track_ids": [12, 84, 91, 7],
  "created_at": "...",
  "generation_params": {
    "count": 10,
    "year_min": 1990,
    "year_max": 2010
  }
}
```

Le strict minimum nécessaire est :

- l'ordre des `track_ids`

Les autres champs sont optionnels et utiles seulement pour debug ou UX.

### 4.3. Pas de table dédiée blind test

La V1 **ne crée pas** :

- `blind_test_session`
- `blind_test_session_track`

Le blind test est calculé à la volée à partir :

- de la playlist persistante, ou
- de la playlist éphémère stockée en session.

## 5. Parcours utilisateur

### 5.1. Page générateur

Route proposée :

- `/blind-tests/new`

Cette page demande uniquement :

- `Nombre de musiques`
- paramètres avancés de génération
- `Enregistrer la playlist`
- `Nom de la playlist` si l'enregistrement est activé

Elle ne demande pas :

- difficulté
- offset de clip

### 5.2. Page playlist

Depuis `/playlist/{id}`, la page playlist doit afficher :

- le bouton de lecture playlist classique
- le bouton `Lancer en blind test`

Quand l'utilisateur clique `Lancer en blind test` :

- on lui demande les paramètres de lecture blind test
- puis on ouvre le lecteur blind test pour cette playlist

### 5.3. Page lecteur blind test

Routes proposées :

- `/blind-tests/play/playlist/{id}` pour une playlist persistante
- `/blind-tests/play/ephemeral` pour une playlist éphémère présente en session

Le lecteur blind test prend donc comme source :

- soit une playlist en base,
- soit la playlist éphémère de session.

## 6. Inputs de génération

### 6.1. Inputs obligatoires

- `Nombre de musiques`
  - entier
  - min 1
  - max 50

- `Enregistrer la playlist`
  - booléen
  - défaut : `off`

### 6.2. Inputs conditionnels

Si `Enregistrer la playlist = on` :

- `Nom de la playlist`
  - obligatoire

### 6.3. Volet "Génération avancée"

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

## 7. Génération de playlist recommandée

### 7.1. Principe

Le générateur produit une **playlist de morceaux**.

Il ne produit pas encore une "session de blind test".

Le but est de mélanger :

- un pool `connu`
- un pool `inconnu`

### 7.2. Pool `connu`

Définition :

- morceaux déjà écoutés par l'utilisateur
- filtres avancés appliqués
- audio exploitable obligatoire

Score :

- `known_score = 1 - (nb_ecoute / max_nb_ecoute_utilisateur)`

But :

- favoriser les morceaux connus mais peu écoutés

### 7.3. Pool `inconnu`

Définition :

- morceaux jamais écoutés par l'utilisateur
- filtres avancés appliqués
- issus des systèmes de recommandation existants

Source recommandation :

- si l'utilisateur a un historique exploitable :
  - `userBased(userId, nLarge)`
  - éventuellement complété par `echoNest(userId, lastTrackId, nLarge)`
- sinon :
  - `newUser(nLarge)`

Score :

- V1 : score dérivé du rang dans la liste de recommandation

### 7.4. Répartition

Règle cible :

- `known_target = floor(n / 2)`
- `unknown_target = n - known_target`

Sélection :

- tirage pondéré par score
- sans doublon
- si un pool est insuffisant, complément depuis l'autre

### 7.5. Résultat de la génération

La génération produit une liste ordonnée de `track_ids`.

Cette liste est :

- soit enregistrée en base comme playlist,
- soit stockée en session comme playlist éphémère.

## 8. Paramètres de lecture blind test

Ces paramètres sont demandés **juste avant la lecture**, pas dans le générateur.

### 8.1. Difficulté

- `Facile = 10 secondes`
- `Moyen = 5 secondes`
- `Difficile = 3 secondes`

Cette difficulté détermine :

- `clip_duration_seconds`

### 8.2. Offset du clip

Le blind test ne lit pas forcément depuis le début du morceau.

Le but est d'éviter :

- les intros silencieuses,
- les intros trop longues,
- les cas où le jeu devient mauvais juste à cause du début du fichier.

Paramètre :

- `clip_offset_ratio` validé dans `[0, 1]`

Formule :

```txt
clip_start_seconds = floor(clip_offset_ratio * max(0, track_duration - clip_duration_seconds))
```

Interprétation :

- `0` = début du morceau
- `1` = dernier départ possible sans dépasser la fin
- valeur intermédiaire = position relative dans la zone de départ valide

UI proposée :

- presets :
  - `Début (0%)`
  - `20%`
  - `40%`
  - `Personnalisé`
- si `Personnalisé` : slider de 0 à 1

Valeur par défaut proposée :

- `0.2`

## 9. Règles de lecture blind test

Le lecteur blind test n'utilise pas le lecteur global standard.

Il utilise un composant dédié.

### 9.1. États

- `idle`
- `playing`
- `revealed`
- `finished`

### 9.2. Cycle

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

5. Passage au suivant
   - reset du masque
   - lecture du morceau suivant

6. Dernier morceau
   - `Suivant` devient `Terminer`

7. Fin
   - affichage de la liste complète

## 10. Source de vérité des données

Le lecteur blind test ne snapshotte rien.

Il lit les métadonnées directement depuis :

- `track`
- `artist`
- `album`
- leurs relations existantes

Conséquences :

- pas de duplication de données ;
- pas de snapshots redondants ;
- pas de table dédiée.

## 11. Liste complète du blind test

Le blind test doit permettre :

- de voir la liste complète des morceaux ;
- d'ajouter un morceau à une playlist perso.

Comportement :

- bouton `Voir la liste du blind test`
- si la partie n'est pas terminée :
  - message d'avertissement
  - `Cette action révèle toutes les réponses`

La liste complète peut réutiliser les composants existants de tracks.

## 12. Écoutes et historique

Décision explicite :

- une lecture blind test ne compte pas comme une écoute normale.

Donc :

- pas d'appel à `/add-listen`
- pas de modification de `user_ecoute`

## 13. API backend proposée

### 13.1. Génération

- `POST /blind-tests/generate`
  - valide les paramètres de génération
  - construit la liste ordonnée de morceaux
  - si `save_playlist = true` :
    - crée une playlist persistante
    - retourne `playlist_id`
  - sinon :
    - stocke les `track_ids` en session
    - retourne un succès indiquant qu'une playlist éphémère est prête

### 13.2. Lecture blind test sur playlist persistante

- `GET /blind-tests/play/playlist/{id}`
  - charge la playlist
  - vérifie les droits
  - retourne les données nécessaires au lecteur

### 13.3. Lecture blind test sur playlist éphémère

- `GET /blind-tests/play/ephemeral`
  - lit la playlist éphémère stockée en session
  - retourne les données nécessaires au lecteur
  - si la session n'existe plus :
    - retourne une erreur propre
    - invite à régénérer

### 13.4. Reveal / détails

Deux options possibles en V1 :

1. soit charger toutes les métadonnées nécessaires au reveal dès l'ouverture du lecteur, mais les masquer dans l'UI ;
2. soit charger les détails du morceau au moment du reveal.

Proposition V1 :

- charger les données utiles dès l'ouverture de la page ;
- les masquer côté UI ;
- ne pas complexifier le backend inutilement.

## 14. Frontend

### 14.1. Générateur

Le générateur :

- ne contient que la logique de choix des morceaux ;
- ne contient pas les paramètres de lecture blind test.

### 14.2. Lecteur blind test

Le lecteur blind test :

- demande difficulté + `clip_offset_ratio` avant démarrage ;
- masque les métadonnées ;
- pilote la lecture round par round ;
- affiche la liste finale à la fin.

### 14.3. Playlist classique

La page playlist doit distinguer clairement :

- `Lire la playlist`
- `Lancer en blind test`

## 15. Cas limites

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

- session éphémère expirée ou absente :
  - message invitant à régénérer

## 16. Questions ouvertes

### 16.1. Stockage session

À préciser lors de l'implémentation :

- session Laravel serveur classique,
- ou autre stockage navigateur si besoin.

Proposition :

- utiliser la session Laravel existante.

### 16.2. Mélange de l'ordre

À trancher :

- conserver l'ordre de la playlist,
- ou proposer un shuffle blind test à l'entrée du lecteur.

Proposition V1 :

- conserver l'ordre de la playlist générée ;
- conserver `position` pour les playlists persistantes ;
- ne pas ajouter de shuffle supplémentaire dans la V1.

## 17. Synthèse

Le modèle retenu pour la V1 est :

- **playlist persistante** ou **playlist éphémère en session**
- **blind test = mode de lecture**
- **pas de table dédiée blind test**
- **générateur = sélection de morceaux uniquement**
- **paramètres de lecture demandés au lancement**
- **offset calculé à la volée**

Cette version est moins robuste qu'un système de sessions blind test persistées, mais elle est :

- plus simple,
- plus cohérente avec l'architecture actuelle,
- plus rapide à implémenter,
- et mieux alignée avec l'objectif de V1.
