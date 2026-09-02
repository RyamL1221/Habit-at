# Web static-render OOM / hang — root cause and fix

## Symptom

`npm run web` (`expo start --web`) started Metro, bundled successfully, then
hung during static route rendering. Under Node 24 the process climbed to the
`--max-old-space-size=8192` ceiling and died with
`FATAL ERROR: Ineffective mark-compacts near heap limit — JavaScript heap out
of memory`. Under Node 20 it did not crash but spun at ~100% CPU indefinitely
and never served a page. `curl http://localhost:8081/` timed out.

## Root cause

An infinite persist-error loop in `src/store/useHabitStore.ts`, triggered only
during static web rendering.

`app.json` sets `web.output: "static"`, so Expo Router pre-renders every route
to HTML in a bare Node process. In Node there is no `window`. The
`@react-native-async-storage/async-storage` web implementation dereferences
`window`, so the store's first persist write threw
`ReferenceError: window is not defined`.

The store's `wrappedStorage.setItem` catch handler then called
`useHabitStore.setState({ storeWriteError: true })`. Although `storeWriteError`
is excluded from `partialize`, zustand's `persist` middleware calls `setItem`
on *every* `setState`. So: write → throw → catch → `setState` → write → throw →
… an infinite loop. Each iteration serialized a growing error/stack string,
which is what drove memory to the heap ceiling (OOM on Node 24) or pinned the
CPU (hang on Node 20). The loop was first entered from the
`onRehydrateStorage` / `setHydrated` callback on boot.

Because the store is imported by the root layout and every screen, the loop
fired for every route, which made it look like "the whole app hangs."

## Fix

Two layers, in `src/store/useHabitStore.ts` (and the same SSR guard in
`src/store/useAccessoryStore.ts`, which persisted via raw AsyncStorage):

1. **SSR storage guard (root cause).** `const HAS_BROWSER_STORAGE = typeof
   window !== 'undefined'`. When `window` is absent, the storage adapter's
   `getItem`/`setItem`/`removeItem` short-circuit to no-ops, so AsyncStorage is
   never touched during static render and cannot throw. Real browsers and
   native runtimes have `window`, so persistence there is unchanged.

2. **Re-entry guard (defense in depth).** A `markWriteError()` helper sets
   `storeWriteError` only if it is not already set, so a failed write can
   trigger at most one further `setState`/write instead of looping forever.

## Red herrings

- **Node version.** Not the cause. The bug reproduces on Node 20, 22, and 24;
  Node 24's GC just couldn't keep up with the runaway allocation, turning the
  hang into a hard OOM. (Caveat, now moot: the Node 20.17.0 used during
  investigation was itself below Expo 57's CLI floor of `>=20.19.4`.)
- **iCloud path / Watchman.** The project lives on an iCloud Drive path and
  Watchman is not installed, but Metro bundling always completed in seconds —
  the failure was entirely in the render phase, not file watching.

## Decisions

- **Node pinned to 22.23.2** via `.nvmrc` (Active LTS; satisfies Expo 57's
  `>=20.19.4` floor). Global nvm default left untouched.
- **Heap flag reduced.** With the leak fixed, web RSS settles at ~500 MB. The
  `--max-old-space-size` flag in the `start`/`web`/`ios`/`android` scripts was
  reduced from `8192` to `2048` — a sane defensive cap that fails fast on a
  future regression rather than a crutch masking a real leak.

## Verification

- `expo export -p web`: completes, writes HTML for all routes, zero
  `window is not defined` errors.
- `npm run web` (Node 22.23.2): serves all routes with HTTP 200; RSS flat at
  ~500 MB, no climb.
- `jest`: 82 tests across 10 suites pass.
