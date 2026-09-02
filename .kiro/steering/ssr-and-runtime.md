# SSR safety & runtime pins

## Web is statically rendered — guard browser-only APIs

`app.json` sets `web.output: "static"`, so Expo Router pre-renders every route
to HTML in a bare Node process. In that process `window`, `document`,
`localStorage`, `requestAnimationFrame`, etc. do not exist.

Rule: any store or module that uses `@react-native-async-storage/async-storage`
(or any other browser-only API) at module load, on hydration, or during render
MUST guard against the server environment:

```ts
const HAS_BROWSER_STORAGE = typeof window !== 'undefined';
// short-circuit getItem/setItem/removeItem to no-ops when false
```

Canonical pattern: `wrappedStorage` in `src/store/useHabitStore.ts` (and the
matching guard in `src/store/useAccessoryStore.ts`).

Also: a persisted-store error handler must never re-enter the persist write
path. zustand's `persist` middleware calls `setItem` on every `setState`, so a
`catch` that calls `setState` unconditionally can loop forever. Set the error
flag at most once (see `markWriteError()` in `useHabitStore.ts`).

Background: see `docs/web-oom-fix.md` for the full root-cause writeup of the
static-render OOM this rule prevents.

## Node version

Node is pinned to 22.23.2 via `.nvmrc` (run `nvm use`). This meets Expo SDK
57's minimum (`>=20.19.4`) and is an Active LTS. The bug above was never a Node
issue — it reproduced on 20/22/24 — so any supported version works; the pin is
for consistency and CI reproducibility.

## Heap flag

`npm run web`/`start`/`ios`/`android` cap Node at `--max-old-space-size=2048`
as a defensive ceiling, not a workaround. Web RSS settles around ~500 MB. If a
script starts needing more than 2 GB, treat it as a leak to investigate, not a
number to raise.
