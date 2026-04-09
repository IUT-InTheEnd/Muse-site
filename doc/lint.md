# ESLint audit report

Date: 2026-04-09
Repository: `laravel/lite-app`
Command used: `npx eslint . -f json` (non-fix mode)
Raw report: `/tmp/eslint-report.json`

## Snapshot

- 330 issues across 34 files
- 326 errors, 4 warnings
- most impacted tree: `resources/js/pages` (212 issues), then `resources/js/components` (85), then `resources/js/contexts` (21)

Top categories:

- `@typescript-eslint/no-unsafe-member-access`: 104
- `@typescript-eslint/no-unsafe-assignment`: 87
- `@typescript-eslint/no-misused-promises`: 29
- `@typescript-eslint/no-explicit-any`: 28
- `@typescript-eslint/no-unsafe-argument`: 20
- `react-hooks/rules-of-hooks`: 10

This is not just style debt. Several findings expose likely runtime bugs (hooks rule violations, unchecked async event handlers, and untyped API payload assumptions).

## Directory: `resources/js/pages`

### File: `resources/js/pages/blind-tests/lecture.tsx` (118)

Categories:

- `no-unsafe-member-access` (60)
- `no-unsafe-assignment` (33)
- `no-explicit-any` (12)
- `no-floating-promises` (2)
- `react-hooks/immutability` (2)
- minor: `no-unused-vars`, `exhaustive-deps`, `no-unsafe-return`, `no-irregular-whitespace`

What is happening:

- The file consumes multiple API shapes as `any`, then deeply dereferences fields without runtime guards.
- This creates a high risk of `undefined`/shape mismatch bugs when endpoints drift.

Extract:

```tsx
let listeMusique: any[] = [];
...
const reponseJSON = await reponse.json();
const props = reponseJSON.props ?? {};
const playlist = props.playlist ?? props;
...
const ordre: BlindTestTrack[] = (Array.isArray(listeMusique) ? listeMusique : []).map((track: any) => {
    if (track.realisers && track.realisers.length) {
        const first = track.realisers[0];
        if (first && first.artist){
            artist = first.artist.artist_name ?? null;
        }
    }
```

Potential bugs revealed:

- inconsistent API contracts hidden by `any`
- blind trust in nested fields (`first.artist.artist_name`) without validation
- unresolved promise handling paths in game flow can leave UI in inconsistent state

### File: `resources/js/pages/search.tsx` (33)

Categories:

- `react-hooks/rules-of-hooks` (10)
- `no-unsafe-assignment` (15)
- `no-explicit-any` (4)
- `no-unsafe-member-access` (3)

What is happening:

- The React component is declared as `search` (lowercase), and hooks are called inside it.
- The React hooks plugin treats this as a non-component function.

Extract:

```tsx
export default function search({ listeMusiques, listeArtistes, langues, genres, ... }: Props) {
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
```

Potential bugs revealed:

- This can trigger subtle framework/tooling behavior issues and breaks component naming conventions used by hooks/static analysis.
- `Record<string, any>` props hide data shape drift and downstream runtime errors.

### File: `resources/js/pages/artists/artist.tsx` (13)

Categories:

- unsafe call/member access/argument cluster
- `no-explicit-any`
- `no-misused-promises`

What is happening:

- UI logic calls string functions and event handlers on values that may not be typed as strings.
- async handlers are passed directly to attributes expecting sync callbacks.

Potential bugs revealed:

- runtime exceptions on non-string values
- unhandled async errors in click/submit interactions

### File: `resources/js/pages/favoris/index.tsx` (12)

Categories:

- unsafe assignment/member access/argument cluster
- `no-misused-promises`

What is happening:

- data from fetch is used as if strongly typed (`data.url`, `data.title`, etc.) without schema validation.

Potential bugs revealed:

- broken player state when API returns partial payloads

### File: `resources/js/pages/album.tsx` (9)

Categories:

- unsafe assignment/member access/argument cluster
- `no-floating-promises`
- `no-misused-promises`

What is happening:

- favorite state is updated from untyped payload fields and promises are sometimes not awaited or explicitly ignored.

### File: `resources/js/pages/playlist/show.tsx` (7)

Categories:

- `no-misused-promises` (6)
- `no-floating-promises` (1)

What is happening:

- multiple async handlers are attached directly in JSX.

Extract:

```tsx
<button onClick={handleToggleVisibility} ...>
...
<Button size="lg" onClick={handleDelete} ...>
```

Potential bugs revealed:

- rejected promises in UI events can be dropped silently

### File: `resources/js/pages/auth/register.tsx` (3)

Categories:

- `react-hooks/set-state-in-effect`
- `react-hooks/exhaustive-deps`
- `no-unused-vars`

What is happening:

- derived state `isFormValid` is computed via `useEffect` and `setState` instead of derived computation.

Extract:

```tsx
useEffect(() => {
    const filled = ...;
    setIsFormValid(filled);
}, [nameValue, emailValue, passwordValue, passwordConfirmValue, termsChecked]);
```

Potential bugs revealed:

- extra renders and stale dependency risks
- this is exactly the React team anti-pattern lint is targeting

### File: `resources/js/pages/administrator.tsx` (2)

Categories:

- `react-hooks/set-state-in-effect` (2)

What is happening:

- pagination correction is done by synchronously calling `setState` in effects.

Extract:

```tsx
useEffect(() => {
    if (pageActuelle > nbPages) {
        setPageActuelle(nbPages);
    }
}, [pageActuelle, nbPages]);

useEffect(() => {
    setPageActuelle(1);
}, [recherche, identifiant, ...]);
```

Potential bugs revealed:

- cascading renders and brittle pagination behavior under rapid filter changes

### Other page files with low-count but real issues

- `resources/js/pages/playlist/index.tsx`: async handler misuse (`no-misused-promises`, `no-floating-promises`)
- `resources/js/pages/settings/security.tsx`: untyped token payload read
- `resources/js/pages/artists/all_tracks.tsx`: `any` + async handler misuse
- `resources/js/pages/auth/login.tsx`: unused variables
- `resources/js/pages/documentation/{api,index,utilisation}.tsx`: unused imports/types

## Directory: `resources/js/components`

### File: `resources/js/components/musecomponents/sliders/TrackSliderSection.tsx` (20)

Categories:

- unsafe assignment/member/argument cluster
- `no-misused-promises`

What is happening:

- JSON response is consumed without typing.
- async inline click handler returns promise in attribute expecting void.

Extract:

```tsx
onClick={async () => {
    const res = await fetch(`/test-music-player?id=${encodeURIComponent(track.id)}`);
    const data = await res.json();
    playTrack({
        src: proxyUrl(data.url) ?? '',
        title: data.title,
        artist: data.artist,
```

Potential bugs revealed:

- broken player payload when API format changes
- dropped errors in event path

### File: `resources/js/components/musecomponents/AlbumPlaylistDialog.tsx` (14)

Categories:

- unsafe member/argument usage
- `no-floating-promises`
- `no-misused-promises`
- `no-explicit-any`

What is happening:

- `playlists` state is `any[]`, then playlist fields are accessed directly.
- fetch chain does not robustly guard errors.

Extract:

```tsx
const [playlists, setPlaylists] = React.useState<any[]>([]);
...
fetch('/playlists/user')
    .then(res => res.json())
    .then(data => {
        setPlaylists(data.playlists);
```

Potential bugs revealed:

- malformed API response can crash rendering
- loading state may remain stale on rejected fetch chain

### File: `resources/js/components/musecomponents/TrackPlaylistButton.tsx` (14)

Categories:

- unsafe assignment/member/argument/call
- `no-misused-promises`
- `no-floating-promises`

What is happening:

- same untyped payload problem in playlist sync/create flow.
- async callbacks passed straight into JSX.

### File: `resources/js/components/musecomponents/TrackRow.tsx` (8)

Categories:

- `no-misused-promises` (3)
- unsafe payload use around favorites

Potential bugs revealed:

- favorite toggles can desync UI if response shape is wrong

### File: `resources/js/components/reaction-buttons.tsx` (7)

Categories:

- unsafe assignment/member access

What is happening:

- reaction payload read from unknown JSON shape with no guard.

### Other component files with lower counts

- `components/ui/musicplayer.tsx`: untyped favorite payload + async handler misuse
- `components/blind-tests/artist-autocomplete.tsx`: untyped `artists` payload + async callback misuse
- `components/musecomponents/TrackList.tsx`: explicit `any` in sorting/data handling
- `components/two-factor-recovery-codes.tsx`: async callback misuse and floating promise
- `components/two-factor-setup-modal.tsx`: same async issues
- `components/edit-user-info-dialog.tsx`, `components/user-info-card.tsx`: unsafe return/assignment patterns from unknown payloads
- `components/musecomponents/cards/Card.tsx`: async handler misuse

## Directory: `resources/js/contexts`

### File: `resources/js/contexts/music-player-context.tsx` (21)

Categories:

- unsafe assignment/member/return cluster
- `no-case-declarations` (switch-case block declarations)
- `react-hooks/exhaustive-deps`
- `react-hooks/preserve-manual-memoization`
- `no-explicit-any`

What is happening:

- persisted state is loaded via raw `JSON.parse` and trusted as `Partial<MusicPlayerState>`.
- API sync reads untyped response.
- switch case variable declarations are not block-wrapped.

Extract:

```tsx
function loadPersistedState(): Partial<MusicPlayerState> {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}
...
const data = await response.json();
...
case 'TOGGLE_FAVORITE':
    const updatedPlaylist = state.playlist.map(t => ...)
```

Potential bugs revealed:

- localStorage corruption can poison runtime state
- API drift can break central player logic shared across app

## Directory: `resources/js/lib`

### File: `resources/js/lib/constantes_icon.tsx` (5)

Categories:

- `no-explicit-any` only

What is happening:

- icon mapping/types use `any` placeholders.

Potential bugs revealed:

- mainly type-safety erosion, lower runtime risk but spreads weak typing across consumers

### File: `resources/js/lib/track-api.ts` (1)

Categories:

- `no-unsafe-assignment`

What is happening:

- response payload is consumed as unknown/any and assigned without runtime narrowing.

## Directory: `resources/js` root and hooks

### File: `resources/js/app.tsx` (3)

Categories:

- unsafe assignment/return from inertia app setup
- `no-floating-promises` on top-level `createInertiaApp(...)`

What is happening:

- generic return types from Inertia helpers are inferred too loosely (`any`) under strict lint config.

### File: `resources/js/ssr.tsx` (2)

Categories:

- same unsafe assignment/return issue as app bootstrap

### File: `resources/js/hooks/use-two-factor-auth.ts` (1)

Categories:

- `no-unsafe-return`

What is happening:

- helper returns `response.json()` without narrowing/casting through a safe parser.

Extract:

```ts
const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    ...
    return response.json();
};
```

Potential bugs revealed:

- compile-time generic gives false confidence; runtime payload may not match `T`

## Root causes across the codebase

1. API contracts are not encoded at the boundary.
2. `any` is used as a transport type, then values are dereferenced deeply.
3. Async UI events often return raw promises in JSX handlers.
4. Some React state is derived with effects instead of computing from existing state.
5. Strict ESLint TypeScript profile was enabled against legacy code without boundary adapters.

## Actionable plan to start fixing safely

### Phase 1: remove true bug risks first (high value, low refactor risk)

- Rename `search` component to `Search` in `pages/search.tsx`.
- Fix `react-hooks/set-state-in-effect` in `pages/auth/register.tsx` and `pages/administrator.tsx` by replacing effect-driven derived state with memoized/inline derivation.
- Wrap async JSX callbacks with `void` wrappers and explicit `try/catch` handlers in high-traffic files:
  - `pages/playlist/show.tsx`
  - `components/musecomponents/TrackRow.tsx`
  - `components/musecomponents/TrackPlaylistButton.tsx`
  - `components/musecomponents/AlbumPlaylistDialog.tsx`

Expected impact: remove hooks violations and most async misuse warnings quickly.

### Phase 2: add typed API boundary helpers (largest issue reducer)

- Create shared typed fetch helpers in `resources/js/lib`:
  - `fetchJsonUnknown()` returning `unknown`
  - narrowers/guards per domain (`isTrackPayload`, `isPlaylistPayload`, etc.)
- Apply first to hotspots:
  - `pages/blind-tests/lecture.tsx`
  - `components/musecomponents/sliders/TrackSliderSection.tsx`
  - `contexts/music-player-context.tsx`
  - `components/reaction-buttons.tsx`

Expected impact: major drop in `no-unsafe-*` cluster.

### Phase 3: remove `any` and normalize domain types

- Replace `Record<string, any>` and `any[]` with explicit interfaces in:
  - `pages/search.tsx`
  - `lib/constantes_icon.tsx`
  - playlist/dialog/track components
- Centralize reused types in a single domain location (`resources/js/types`), avoiding type duplication.

Expected impact: fewer regressions and clearer data contracts.

### Phase 4: tighten state persistence and infrastructure files

- Validate parsed localStorage data in `music-player-context.tsx` before merging into state.
- Resolve `app.tsx`/`ssr.tsx` unsafe return diagnostics with explicit helper typing wrappers.
- Update `hooks/use-two-factor-auth.ts` to parse unknown JSON payloads through typed guards.

## Practical working order for the first PRs

1. PR 1: hooks correctness (`search.tsx`, `auth/register.tsx`, `administrator.tsx`).
2. PR 2: async handler correctness (`playlist/show.tsx`, `TrackRow.tsx`, two-factor components, playlist buttons/dialogs).
3. PR 3: typed fetch boundary for player+playlist flows (biggest `no-unsafe-*` reduction).
4. PR 4: blind-test page hardening (`lecture.tsx`) with runtime guards and strict types.

## File-by-file issue index

- 118 `resources/js/pages/blind-tests/lecture.tsx`
- 33 `resources/js/pages/search.tsx`
- 21 `resources/js/contexts/music-player-context.tsx`
- 20 `resources/js/components/musecomponents/sliders/TrackSliderSection.tsx`
- 14 `resources/js/components/musecomponents/AlbumPlaylistDialog.tsx`
- 14 `resources/js/components/musecomponents/TrackPlaylistButton.tsx`
- 13 `resources/js/pages/artists/artist.tsx`
- 12 `resources/js/pages/favoris/index.tsx`
- 9 `resources/js/pages/album.tsx`
- 8 `resources/js/components/musecomponents/TrackRow.tsx`
- 7 `resources/js/components/reaction-buttons.tsx`
- 7 `resources/js/pages/playlist/show.tsx`
- 5 `resources/js/lib/constantes_icon.tsx`
- 4 `resources/js/components/blind-tests/artist-autocomplete.tsx`
- 4 `resources/js/components/musecomponents/TrackList.tsx`
- 4 `resources/js/components/ui/musicplayer.tsx`
- 3 `resources/js/app.tsx`
- 3 `resources/js/components/two-factor-recovery-codes.tsx`
- 3 `resources/js/pages/auth/register.tsx`
- 3 `resources/js/pages/playlist/index.tsx`
- 2 `resources/js/components/edit-user-info-dialog.tsx`
- 2 `resources/js/components/two-factor-setup-modal.tsx`
- 2 `resources/js/components/user-info-card.tsx`
- 2 `resources/js/pages/administrator.tsx`
- 2 `resources/js/pages/artists/all_tracks.tsx`
- 2 `resources/js/pages/auth/login.tsx`
- 2 `resources/js/pages/documentation/api.tsx`
- 2 `resources/js/pages/documentation/index.tsx`
- 2 `resources/js/pages/documentation/utilisation.tsx`
- 2 `resources/js/pages/settings/security.tsx`
- 2 `resources/js/ssr.tsx`
- 1 `resources/js/components/musecomponents/cards/Card.tsx`
- 1 `resources/js/hooks/use-two-factor-auth.ts`
- 1 `resources/js/lib/track-api.ts`
