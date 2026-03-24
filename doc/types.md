# Types and Data Representations

(pour quand on veut rendre ça propre une fois tous les high prof effectués)

## Goal

This codebase currently has multiple competing representations of the same data:

- PostgreSQL tables and columns in `database/sql/bdd.sql`
- Laravel Eloquent models in `laravel/lite-app/app/Models`
- Laravel API resources in `laravel/lite-app/app/Http/Resources`
- Inertia page props and frontend TypeScript types in `laravel/lite-app/resources/js`
- Python ETL scripts in `database/*.py`
- Python recommendation scripts in `laravel/lite-app/app/Http/Controllers/RecommendationScripts/*.py`

The target architecture is:

- the database schema is the single source of truth for persistence
- all language-level persistence types are generated from the introspected schema
- API shapes are derived from persistence types through explicit mappings
- UI types are derived from API types through local transformations only

## Canonical Layers

There are four distinct layers that must not be conflated.

### 1. Persistence layer: `Db*`

Exact representation of database tables and relations.

Examples:

- `DbTrackRow`
- `DbAlbumRow`
- `DbArtistRow`
- `DbUserRow`
- `DbPlaylistRow`

Properties:

- names come from PostgreSQL columns
- nullability comes from PostgreSQL
- scalar types come from PostgreSQL
- relation metadata comes from foreign keys and join tables

This is the only layer for which the DB is the direct source of truth.

### 2. ORM / backend model layer

Laravel Eloquent models represent persisted entities plus relations and behavior.

Examples in the repo:

- `laravel/lite-app/app/Models/Track.php`
- `laravel/lite-app/app/Models/User.php`

Properties:

- may expose relationships and helper methods
- should keep DB column names for persisted attributes
- should not invent alternative storage-level field names

This layer is allowed to add behavior, not redefine the schema.

### 3. API contract layer: `Api*`

JSON shapes sent by Laravel to React or other consumers.

Examples in the repo:

- `laravel/lite-app/app/Http/Resources/TrackResource.php`
- `laravel/lite-app/app/Http/Resources/AlbumResource.php`

Properties:

- may rename fields for API ergonomics
- may hide columns that are not public
- may flatten or nest relations
- must be explicit and centralized

This layer is not the DB schema. It is a stable transport contract derived from it.

### 4. UI / application-specific layer: `Ui*` or `View*`

Frontend-specific shapes built for components, player state, cards, lists, sorting, display, and composition.

Examples in the repo:

- `TrackData` in `laravel/lite-app/resources/js/lib/track-api.ts`
- page-local `Track`, `Album`, `Artist` types in multiple React pages
- player state in `laravel/lite-app/resources/js/contexts/music-player-context.tsx`

Properties:

- may merge API entities
- may add computed fields such as `src`, `artwork`, `viewer_reaction`
- must never be treated as persistence models

## Current Representations By Stack

### PostgreSQL / SQL

Language and type system:

- PostgreSQL DDL and relational types
- `INT`, `FLOAT`, `BOOLEAN`, `VARCHAR`, `TEXT`, `DATE`, `TIMESTAMP`
- `NOT NULL`, defaults, primary keys, foreign keys

Current role:

- real schema authority
- nullability authority
- relation authority

### PHP / Laravel Eloquent

Language and type system:

- PHP 8 typed methods and return types
- Eloquent dynamic attributes
- PHPDoc from Reliese
- Laravel `$casts`

Current role:

- persistence model
- relations
- business behavior

Current risk:

- truth is split between DB, PHPDoc, `$casts`, and resource code

### PHP / Laravel Resources

Language and type system:

- PHP arrays serialized to JSON
- loose array shapes unless documented
- Scramble may infer parts of the contract

Current role:

- API projection layer
- remapping DB names to API names

Current risk:

- remappings are manual and scattered

### TypeScript / React / Inertia

Language and type system:

- TypeScript structural typing
- optional properties
- unions such as `string | null`
- ad hoc page-local types

Current role:

- page props
- API response typing
- component state and view models

Current risk:

- duplicated entity definitions
- optional used where nullable should be explicit
- `any` and index signatures weaken the model

### Python / ETL

Files:

- `database/main.py`
- `database/peuplement.py`
- `database/user.py`
- `database/prepare_seed_data.py`

Language and type system:

- dynamic Python
- CSV rows
- SQL rows
- pandas `DataFrame`

Current role:

- seed preparation
- import pipeline
- data cleaning and enrichment

Current risk:

- schema assumptions are encoded manually in scripts

### Python / Recommendation scripts

Files:

- `laravel/lite-app/app/Http/Controllers/RecommendationScripts/*.py`

Language and type system:

- dynamic Python
- raw SQL queries
- pandas `DataFrame`
- hardcoded column names such as `track_id`, `track_title`, `artist_name`, `user_age`, `explicit_ok`

Current role:

- recommendation data loading
- similarity and ranking logic
- ad hoc feature extraction from SQL result sets

Current risk:

- the recommendation layer duplicates persistence assumptions outside the ETL
- SQL query result schemas are implicit and unversioned
- joins and aliases can drift from the DB schema or Laravel expectations

This recommendation code must be treated as part of the Python persistence-consumer surface.

## Naming Policy

### DB names

DB column names stay canonical for persistence.

Examples:

- `track.track_id`
- `track.track_title`
- `album.album_title`
- `artist.artist_name`
- `user.user_image_file`

These names must remain the source names for generated `Db*` types.

### API names

API names may be cleaner than DB names, but they must come from a single shared mapping rule.

Default convention:

- if a column starts with the table prefix, the API alias may drop it
- `track_id -> id`
- `track_title -> title`
- `track_duration -> duration`
- `album_title -> title`
- `artist_name -> name`

Exceptions must be explicit, not invented locally in each stack.

Examples:

- `track_image_file -> image_file`
- `user_image_file -> image_file` or `avatar`, depending on the chosen API contract

### UI names

UI types may further transform API data, but only after the API layer.

Examples:

- `url -> src`
- `image_file -> artwork`
- derived `displayTitle`
- merged `artistNames`

These are local view concerns, not persistence concerns.

## Recommended Generated Artifacts

The schema regenerated during seed should produce a canonical intermediate artifact, for example `generated/schema.json`.

From that artifact, generate:

- TypeScript persistence types
- PHP persistence metadata and DTO helpers
- Python persistence types

Suggested outputs:

- `generated/ts/db-types.ts`
- `generated/php/Db/*`
- `generated/python/db_types.py`

Suggested families:

- `DbTrackRow`, `DbAlbumRow`, `DbArtistRow`, `DbUserRow`, `DbPlaylistRow`
- relation metadata for join tables and foreign keys
- optional generated query-result types for known reusable SQL projections

## What Should Be Centralized

### Centralized and generated

- table names
- column names
- scalar types
- nullability
- primary keys
- foreign keys
- join-table metadata
- default API aliases derived from naming rules

### Centralized but handwritten

- public API field selection
- resource composition and nesting
- sensitive field hiding
- UI-specific transformations
- recommendation feature engineering

## What Each Stack Should Consume

### Laravel models

Consume:

- generated persistence schema metadata
- DB-native names for persisted attributes

Do not:

- rename columns at the model attribute level
- duplicate nullability decisions by hand unless required by framework casts

### Laravel resources

Consume:

- Eloquent models
- generated alias mapping
- generated API DTO definitions if introduced later

Do:

- define the official DB-to-API projection once

### Frontend TypeScript

Consume:

- generated `Api*` types or OpenAPI-generated types
- local `Ui*` types only for display-specific transformations

Do not:

- redefine entity types inline per page
- depend directly on DB names except in admin/debug tools

### ETL Python

Consume:

- generated `Db*` Python types
- generated schema metadata

Do not:

- hardcode column sets when a reusable generated definition exists

### Recommendation Python

Consume:

- generated `Db*` Python types
- shared query projection definitions for common joins
- shared schema metadata for validation

Do not:

- rely on implicit `SELECT *` result shapes for core entities
- copy column names ad hoc across multiple scripts

## Concrete Entity Families In This Repo

The first entities that should be normalized end to end are:

- `user`
- `user_profile`
- `track`
- `track_echonest`
- `album`
- `artist`
- `playlist`
- `genre`

The first relation and projection families that should be centralized are:

- `realiser`
- `playlist_contient_track`
- `ajoute_favori`
- user-with-profile projections
- track-with-artist projections
- track-with-echonest projections
- track-with-genre projections

These already appear both in ETL and in recommendation scripts, so centralizing them will reduce drift fastest.

## Migration Strategy

### Phase 1

- introspect the seeded DB
- generate canonical `schema.json`
- generate `Db*` types for TS, PHP, Python

### Phase 2

- replace ad hoc persistence-like TypeScript types for `track`, `album`, `artist`, `user`, `playlist`
- replace Python hardcoded row schemas in ETL and recommendation loaders where feasible

### Phase 3

- centralize DB-to-API alias rules
- make Laravel resources the only official place where persistence becomes API

### Phase 4

- generate or validate API contracts through Scramble / OpenAPI
- make frontend consume generated API types instead of handwritten page-local entity types

## Rules

- The database schema is the only source of truth for persistence types.
- Eloquent models may add behavior and relations, but must not redefine storage names.
- Resources may rename fields, but mappings must be centralized and deterministic.
- Frontend code must consume API types, not infer persistence types ad hoc.
- ETL and recommendation Python code are both schema consumers and must be included in the typing strategy.
- `NULL` in PostgreSQL must become explicit nullability in generated types, not accidental optionality.
- No new entity type should be handwritten in more than one stack if it maps to a real table.
