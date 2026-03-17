# Repository Guidelines

## Project Structure & Module Organization

This repository has three main areas:

- `laravel/lite-app/`: the application code. Backend PHP lives in `app/`, routes in `routes/`, React/TypeScript pages and components in `resources/js/`, and tests in `tests/`.
- `database/`: SQL schema, import scripts, seed preparation, and dataset documentation. Use this for PostgreSQL structure and bulk data workflows.
- `scripts/`: helper scripts for local development, including `scripts/psql` for connecting to the configured PostgreSQL instance.

Static images and placeholders are under `laravel/lite-app/public/`.

## Build, Test, and Development Commands

Run commands from `laravel/lite-app/` unless noted otherwise.

- `composer install && npm install`: install PHP and frontend dependencies.
- `composer dev`: start Laravel server, queue worker, logs, and Vite in parallel.
- `npm run dev`: run the frontend dev server only.
- `npm run build`: build production assets.
- `composer test`: run Pint checks and PHPUnit/Laravel tests.
- `npm run lint`: auto-fix ESLint issues in the frontend.
- `npm run format`: format `resources/` with Prettier.
- `python3 main.py` from `database/`: rebuild prepared CSVs (if --rebuild is specified, but unnecessary unless missing or source data has changed) and import them into PostgreSQL. For running python, there is a virtual environment in .venv in the project root directory.
- `./scripts/psql` from repo root: open a `psql` session using project `.env` settings.

## Coding Style & Naming Conventions

Use 4 spaces in PHP and the existing TypeScript formatting in `resources/js/`. Follow Laravel conventions for controllers, services, and models (`ArtistController`, `RecommendationService`). React components use PascalCase file names; route pages are organized by feature, for example `resources/js/pages/artists/artist.tsx`.

Format PHP with `composer lint` (`pint`) and frontend code with `npm run format` and `npm run lint`. Prefer descriptive branchless fixes over broad refactors.

- Avoid code duplication.
- Avoid multiple source of truths.
- Avoid encoding assumptions that can drift (code rot).
- Only cache successful responses.

## Testing Guidelines

PHP tests use Laravel’s test runner with PHPUnit. Add feature tests in `laravel/lite-app/tests/Feature/` and name them `*Test.php`. Run `composer test` before committing.

When changing database behavior, verify both code and data paths. Example: check the schema in `database/sql/` and validate with `./scripts/psql`.

## Commit Guidelines

Recent history favors short, direct commit messages such as `fix images` or `fixed following issues`. Keep commits focused and imperative. Prefer messages like `fix artist follow link on profile`.

The commit description should include

- a short problem/solution summary
- affected paths or features
- screenshots for UI changes
- notes on DB changes, migrations, or manual SQL applied
- test or verification steps performed

## Security & Configuration Tips

Do not commit secrets or modified `.env` files. Database access is configured through `laravel/lite-app/.env`. Treat `database/dataset/` as source input and `prepared_seed_data/` as generated output.
