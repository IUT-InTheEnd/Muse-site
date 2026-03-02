# Audit technique du dépôt `Muse-site`

## 1. Vue d'ensemble

### But du projet

Le dépôt assemble deux sous-projets complémentaires :

- `laravel/lite-app/` : application web de streaming musical (backend Laravel + frontend React/Inertia).
- `database/` : pipeline d'initialisation et peuplement d'une base PostgreSQL à partir de jeux CSV (FMA + questionnaires utilisateurs).

Le but global est de fournir une plateforme musicale avec :

- authentification/gestion de compte,
- consultation d'albums/artistes,
- favoris,
- lecture audio,
- données enrichies (préférences utilisateur et features audio de type Echonest).

### Problème résolu

Le projet résout deux besoins :

- construire une base relationnelle cohérente à partir de datasets hétérogènes (`database/*.py`, `database/sql/*.sql`),
- exposer cette base dans une application web orientée usage utilisateur (`routes/web.php`, contrôleurs, pages React).

### Public cible

- utilisateurs finaux d'une plateforme musicale (inscription, écoute, favoris, profil),
- équipe de développement/formation qui doit charger des datasets puis démonrer l'application.

### Niveau de maturité apparent

Niveau **MVP / prototype avancé** :

- points forts : stack complète, CI, auth Fortify, base de données riche,
- limites : dette technique visible, plusieurs incohérences backend/frontend, couverture de tests faible, endpoints sensibles exposés.

## 2. Architecture

### Architecture globale

Architecture **monolithique web** centrée sur Laravel + Inertia React (pas de microservices) :

- backend MVC Laravel : `app/Http/Controllers`, `app/Models`, `routes/*.php`,
- frontend SPA Inertia : `resources/js/pages`, `resources/js/components`,
- couche données PostgreSQL alimentée par pipeline Python/SQL séparé : `database/`.

### Modules principaux et responsabilités

#### A. Application Laravel (`laravel/lite-app`)

- **Routing web** : `routes/web.php`, `routes/settings.php`.
- **Contrôleurs métier** :
  - `AlbumController`, `ArtistController`, `FavoritesController`,
  - `MusicController` (endpoint JSON de lecture),
  - `ProxyController` (proxy média externe),
  - `ImageFileController` (CRUD image locale),
  - `Settings/*` (profil, sécurité, confidentialité),
  - `UserController` (mise à jour profil étendu).
- **Auth/Sécurité** : Fortify (`app/Providers/FortifyServiceProvider.php`, `config/fortify.php`).
- **Modèles Eloquent** : nombreux modèles auto-générés Reliese (`app/Models/*`) alignés sur un schéma SQL custom.

#### B. Frontend React/Inertia

- **Entrée client/SSR** : `resources/js/app.tsx`, `resources/js/ssr.tsx`.
- **Pages** : auth, dashboard, album, favoris, settings, documentation (`resources/js/pages/*`).
- **État global lecteur audio** : `resources/js/contexts/music-player-context.tsx`.
- **UI design system** : composants `resources/js/components/ui/*` (base shadcn/radix).

#### C. Pipeline base de données (`database`)

- `main.py` : orchestration complète création schéma + import + post-traitements.
- `peuplement.py` : import et transformation des CSV vers tables d'import.
- `link_fix.py` : normalisation des URLs média FMA.
- `user.py` : génération des CSV utilisateurs nettoyés depuis `clean_answers.csv`.
- SQL :
  - `sql/bdd.sql` schéma principal,
  - `sql/table_import.sql` tables d'import,
  - `sql/import_tables.sql` transferts import -> tables métier,
  - `sql/trigger_bdd.sql` fonctions/trigger,
  - `sql/fix_sequence.sql` réalignement des séquences.

### Dépendances internes et flux

- La base PostgreSQL est remplie via `database/main.py`, puis l'app Laravel s'y connecte (configuration DB pgsql possible via `.env`).
- Les pages Inertia déclenchent routes Laravel nommées (Wayfinder côté TS), les contrôleurs accèdent aux modèles Eloquent, puis renvoient vues Inertia ou JSON.
- Le lecteur audio frontend consomme `/test-music-player` puis passe par `/proxy` pour contourner CORS.

### Points d'entrée

- Web app : `laravel/lite-app/public/index.php`.
- CLI Laravel : `laravel/lite-app/artisan`.
- Pipeline DB : `database/main.py`.
- Dev orchestration : `composer run dev` (serveur + queue + logs + Vite) dans `composer.json`.

## 3. Technologies et dépendances

### Langages

- PHP 8.2+ (`composer.json`),
- TypeScript/TSX + React (`package.json`),
- Python (pipeline DB),
- SQL PostgreSQL.

### Frameworks principaux

- Laravel 12 (`laravel/framework`),
- Inertia.js (`inertiajs/inertia-laravel`, `@inertiajs/react`),
- Laravel Fortify (auth + 2FA),
- React 19 + Vite 7,
- Tailwind CSS v4.

### Bibliothèques critiques

- UI : Radix UI, lucide-react, headlessui.
- Backend : Fortify, Wayfinder, Reliese (génération de modèles).
- Pipeline data : `psycopg2-binary`, `pandas`, `langcodes`, `bcrypt`.

### Build / dépendances

- PHP : Composer (`composer.json`).
- Frontend : npm (`package.json`, `vite.config.ts`).
- Python : `requirements.txt`.

### Services externes intégrés

- PostgreSQL en conteneur (`database/docker-compose.yml`).
- Ressources média externes FMA proxifiées (`ProxyController` domaines `freemusicarchive.org`, `files.freemusicarchive.org`).
- Pas d'intégration cloud active obligatoire observée (AWS/SES présents en config Laravel standard mais non exploités explicitement).

## 4. Flux applicatifs

### Flux principal d'authentification

- Routes Fortify + vues Inertia configurées dans `FortifyServiceProvider`.
- Création utilisateur via `CreateNewUser` (création profil + user).
- Sécurité : throttling login/2FA (5/min), email verification, reset password, 2FA activables (`config/fortify.php`).

### Flux "lecture musique"

1. UI appelle `/test-music-player?id=...` (`MusicController@playMusic`).
2. Backend récupère `Track` + artistes liés et renvoie URL média + méta JSON.
3. Front utilise `proxyUrl()` puis lit via contexte `music-player-context.tsx`.
4. Requête média passe par `/proxy?url=...` (auth requise).

### Flux album

- Route `/album/{id}` -> `AlbumController@view`.
- Chargement album + relations `realiser` + `track` + `artist`.
- Rendu Inertia page `resources/js/pages/album.tsx`.

### Flux favoris

- Route `/favoris` (auth) -> `FavoritesController@index`.
- Lecture table `ajoute_favori`, projection vers cartes frontend.

### Flux profil/settings

- Profil : nom/email, image, suppression compte (`settings/profile`).
- Sécurité : changement mot de passe + 2FA (`settings/security`).
- Confidentialité : bascule `public_profile_visibility` (`settings/privacy`).

### AuthN/AuthZ et état

- AuthN session Laravel (guard `web`, provider Eloquent `App\Models\User`).
- AuthZ essentiellement middleware `auth` / `verified` au niveau routes.
- État frontend : Inertia props partagées (`HandleInertiaRequests`) + contexte React pour lecteur audio + localStorage/cookies pour thème et lecteur.

## 5. Données

### Modèle de données

Le schéma principal est défini en SQL custom (`database/sql/bdd.sql`) avec entités :

- cœur média : `track`, `album`, `artist`, `genre`, `license`, `track_echonest`,
- utilisateur : `user`, `user_profile`, `user_preference_echonest`,
- relations : `realiser`, `ajoute_favori`, `user_prefere_artiste`, `user_ajoute_album_favoris`, `user_parle`, `contient_genres`, etc.

### Type de base

- PostgreSQL 16 (`database/docker-compose.yml`).

### Migrations

- Migrations Laravel présentes (`laravel/lite-app/database/migrations/*`) mais majoritairement standard starter-kit (`users`, `cache`, `jobs`).
- Le modèle réel métier semble piloté par SQL custom `database/sql/bdd.sql` (table `"user"`, etc.).

### Transformations/validation des données

- ETL CSV -> tables import -> tables finales (`peuplement.py` + `import_tables.sql`).
- Normalisation des liens médias (`link_fix.py`).
- Génération de données utilisateurs synthétiques + hash bcrypt (`user.py`).
- Triggers SQL :
  - recalcul préférences echonest après favoris,
  - incrément écoutes artistes/albums/tracks après écoute (`trigger_bdd.sql`).

## 6. DevOps et pipelines

### CI/CD

- GitHub Actions dans `laravel/lite-app/.github/workflows/` :
  - `lint.yml` : Pint + Prettier + ESLint,
  - `tests.yml` : matrix PHP 8.4/8.5, build assets, phpunit.

### Build et exécution

- `composer run dev` lance server + queue + logs + vite en parallèle.
- `npm run build` et `npm run build:ssr` pour bundles.
- `database/main.py` pour bootstrap DB côté datasets.

### Docker / orchestration

- Docker Compose uniquement pour PostgreSQL (`database/docker-compose.yml`).
- Pas de Kubernetes ni orchestration multi-services observée.

### Variables d'environnement

- `.env.example` Laravel standard (DB sqlite par défaut, pgsql configurable).
- Pipeline DB Python utilise des credentials codés en dur dans les scripts (`main.py`, `peuplement.py`).

## 7. Qualité et maintenabilité

### Organisation du code

- Structure propre côté Laravel/React, séparation claire backend/frontend.
- Beaucoup de modèles générés automatiquement (Reliese), facilitant mapping DB mais augmentant bruit et maintenance.

### Tests

- Très faible couverture effective :
  - `tests/Feature/DashboardTest.php` (2 cas simples),
  - `tests/Unit/ExampleTest.php` trivial.
- Aucun test ciblé sur contrôleurs métier (albums, favoris, proxy, images, settings avancés).

### Couverture approximative

- Couverture faible sur logique métier et sécurité.

### Gestion des erreurs / logging

- Quelques validations backend (`$request->validate`, FormRequest).
- Gestion d'erreurs côté lecteur audio et proxy partiellement présente.
- Logging principalement configuration Laravel standard (`config/logging.php`), peu d'usage métier explicite.

### Fragilités et dette technique observables

1. **Endpoint critique de reset mots de passe exposé publiquement**

- `routes/web.php` expose `/genpassword` sans middleware.
- `resources/views/genpassword.blade.php` réécrit tous les mots de passe et affiche les nouveaux mots de passe en clair.

2. **Réinitialisation mot de passe non hashée**

- `app/Actions/Fortify/ResetUserPassword.php` assigne `password => $input['password']` sans bcrypt/Hash.

3. **Incohérence modèle utilisateur / migrations**

- Modèle `App\Models\User` pointe sur table `user` (singulier, custom), alors que migrations créent `users` (pluriel).
- Risque élevé de casse tests/migrations locales sans schéma SQL custom.

4. **Factory utilisateur potentiellement inutilisable**

- `UserFactory` utilisé dans tests mais `User` n'embarque pas le trait `HasFactory`.

5. **Bug logique probable dans `UserController@getUserPageInformation`**

- condition `if ($user & $user->public_profile_visibility)` utilise `&` bit-à-bit.
- appel à relation `possede_playlists()` non définie dans `User`.

6. **Incohérences de typage sur `user_plays_music`**

- DB SQL: champ texte, frontend: options textuelles, import Python: 0/1.

7. **Routes/actions frontend générées non versionnées**

- imports `@/routes/*` et `@/actions/*` partout en TS,
- mais dossiers ignorés dans `.gitignore` (`/resources/js/routes`, `/resources/js/actions`), non présents dans le repo.
- onboarding fragile sans étape explicite de génération.

8. **Contradictions / composants partiellement legacy**

- coexistence layout sidebar starter-kit + navbar custom.
- vues Blade legacy (`artisteprofile.blade.php`) en parallèle d'Inertia.

9. **Trigger SQL `calc_echonest_favoris`**

- trigger configuré `AFTER INSERT OR DELETE`, mais fonction lit `NEW.user_id` sans traitement du cas `DELETE` (où `OLD` est attendu).

10. **Qualité docs interne hétérogène**

- pages `documentation/*.tsx` majoritairement placeholders dupliqués.

### Vérification outillée possible/non possible dans cet audit

- `php artisan test` non exécutable ici (`php: command not found`).
- `npm run types` non exécutable ici (`npm: command not found`).

## 8. Documentation

### README

- `README.md` racine : présent, court, donne installation de base Laravel + DB.
- `database/readme.md` : procédure spécifique datasets/LFS + lancement pipeline.

### Documentation technique/fonctionnelle

- Documentation interne dans app via pages Inertia (`/documentation/*`) mais contenu encore générique.

### Commentaires dans le code

- Présence de commentaires utiles par endroits (proxy, lecteur audio, ETL).
- Plusieurs zones sans documentation métier formelle (flux recommandation, conventions de données).

### Instructions d'installation/exécution

- Fournies mais incomplètes sur les prérequis exacts et sur la génération des fichiers Wayfinder (`resources/js/routes`, `resources/js/actions`).

## 9. Synthèse finale

### Ce que fait réellement le projet

Le projet met en place une plateforme musicale full-stack :

- ingestion et normalisation d'un corpus musical + données questionnaire,
- stockage relationnel PostgreSQL riche,
- interface web Laravel/Inertia permettant auth, profils, favoris, consultation album/artiste et lecture audio proxifiée.

### Complexité globale

Complexité **moyenne à élevée** :

- riche modèle relationnel,
- stack multi-langage (PHP/TS/Python/SQL),
- nombreux composants UI et modèles Eloquent,
- pipeline de données non trivial.

### Forces principales

- architecture monolithique claire et standard Laravel,
- séparation frontend/backend nette avec Inertia,
- modèle de données détaillé,
- pipeline d'import structuré,
- CI lint/tests en place.

### Faiblesses principales

- incohérences critiques sécurité/auth (reset password non hashé, route `genpassword`),
- divergence migrations Laravel vs schéma SQL réel,
- couverture de tests insuffisante,
- dépendance à fichiers générés non versionnés,
- documentation applicative encore partielle.

### Évaluation globale de la qualité

Qualité **prometteuse mais instable en l'état** : bonne base technique et volume de travail substantiel, avec plusieurs risques bloquants pour un usage production. Le dépôt est bien positionné pour un MVP académique/expérimental, mais nécessite un durcissement sécurité, une consolidation des conventions de données et une stratégie de tests/installation plus robuste avant industrialisation.
