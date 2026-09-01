# Design Document — Habrite App

## Overview

Habrite is a habit-tracking mobile app for iOS and Android (Expo 57 / React Native 0.86). Its emotional core is a virtual creature named Sprig that lives in a terrarium and visually reflects the user's daily habit-completion consistency. The app has no backend; all state is local. It is built with Expo Router for navigation, Zustand with the built-in `persist` middleware backed by `@react-native-async-storage/async-storage` for state, `react-native-reanimated` (v4) for animations, and `react-native-svg` for the Sprig creature.

### Key research findings

- **Expo Router v3 (ships with Expo 57)** supports file-based routing with `(tabs)` group layouts, matching the three-tab Bottom_Nav requirement. ([docs.expo.dev](https://docs.expo.dev/versions/v57.0.0/))
- **Zustand `persist` middleware** accepts any async storage that implements `getItem/setItem/removeItem`; `@react-native-async-storage/async-storage` is the standard choice for React Native. ([zustand docs](https://github.com/pmndrs/zustand))
- **`expo-notifications`** supports `scheduleNotificationAsync` with a `CalendarTriggerInput` (`hour`, `minute`, `repeats: true`) for daily repeating local notifications; `cancelScheduledNotificationAsync(identifier)` cancels by the stored ID. ([expo.dev/versions/v57.0.0/sdk/notifications](https://docs.expo.dev/versions/v57.0.0/sdk/notifications/))
- **`react-native-reanimated` v4** (already in `package.json` at `4.5.1`) uses `useSharedValue` + `withTiming`/`withRepeat`/`withSequence` on the JS thread, bridging to native UI with `Animated.View`. SVG elements can be animated via `AnimatedGroup` from `react-native-svg`.
- **`fast-check`** is the standard TypeScript property-based testing library, works with Jest/Vitest, no special React Native integration needed for pure-logic tests.

---

## Architecture

```
Habrite
├── src/
│   ├── app/                      ← Expo Router pages
│   │   ├── _layout.tsx           ← Root layout (store hydration, SplashScreen)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       ← Tab navigator (Bottom_Nav)
│   │   │   ├── index.tsx         ← Home screen
│   │   │   ├── wardrobe.tsx      ← Wardrobe screen
│   │   │   └── stats.tsx         ← Stats screen
│   │   └── settings.tsx          ← Settings screen (pushed via stack)
│   ├── components/
│   │   ├── terrarium/
│   │   │   ├── Terrarium.tsx     ← Container with wood-frame border
│   │   │   ├── TerrariumScene.tsx← Layered sky/ground/accessories/Sprig
│   │   │   └── StatusCaption.tsx ← Italic line below Terrarium
│   │   ├── sprig/
│   │   │   ├── Sprig.tsx         ← Selects stage/state, owns idle animation
│   │   │   ├── SprigSeedling.tsx ← Stage 0 SVG layers
│   │   │   ├── SprigSprout.tsx   ← Stage 1 SVG layers
│   │   │   ├── SprigBloom.tsx    ← Stage 2 SVG layers
│   │   │   └── SprigFlourishing.tsx ← Stage 3 SVG layers
│   │   ├── checklist/
│   │   │   ├── Checklist.tsx     ← Three HabitRow items
│   │   │   └── HabitRow.tsx      ← Leaf checkbox + strikethrough label
│   │   ├── wardrobe/
│   │   │   ├── WardrobeShelf.tsx ← Scrollable grid of AccessoryItem rows
│   │   │   ├── AccessoryItem.tsx ← Locked / owned / equipped states
│   │   │   └── CategoryTabs.tsx  ← Hats / Furniture / Terrain underline tabs
│   │   ├── celebration/
│   │   │   ├── SparkleOverlay.tsx← Reanimated sparkles clipped to Terrarium
│   │   │   └── CelebrationToast.tsx ← Slide-in toast with coins + streak
│   │   ├── navigation/
│   │   │   └── BottomNav.tsx     ← Coin balance + tab icons
│   │   └── stats/
│   │       ├── CalendarGrid.tsx  ← Month grid, colored day cells
│   │       └── StatsSummary.tsx  ← Streak + total days summary row
│   ├── store/
│   │   ├── useHabitStore.ts      ← Habits, daily completion, coin, streak
│   │   ├── useAccessoryStore.ts  ← Owned/equipped accessories
│   │   └── slices/               ← (optional) slice helpers
│   ├── hooks/
│   │   ├── useDayCheck.ts        ← Runs streak evaluation on app open
│   │   ├── useNotifications.ts   ← Permission + schedule/cancel helpers
│   │   └── useCelebration.ts     ← Celebration state machine
│   ├── lib/
│   │   ├── growthStage.ts        ← Pure: completedDays → Growth_Stage enum
│   │   ├── coinLogic.ts          ← Pure: toggle action → Δcoins
│   │   ├── streakLogic.ts        ← Pure: day history → new streak value
│   │   ├── statusCaption.ts      ← Pure: app state → Status_Caption string
│   │   └── dateUtils.ts          ← today(), isSameDay(), localDateKey()
│   └── constants/
│       ├── accessories.ts        ← Static accessory catalogue
│       └── theme.ts              ← (existing, extended with accent color)
```

### Design decisions

| Decision | Choice | Rationale |
|---|---|---|
| State management | Zustand + persist | Minimal boilerplate; built-in async storage middleware; avoids Context re-render storms for coin/streak updates; easy to unit-test slices in isolation |
| Navigation | Expo Router `(tabs)` group | File-based, typed routes, integrates with `expo-splash-screen` hydration guard already in `_layout.tsx` |
| Animation | react-native-reanimated v4 | Already installed; JS-thread safety via worklets; `withRepeat`/`withSequence` for idle bob; SVG `AnimatedGroup` for per-layer transforms |
| SVG creature | react-native-svg | Cross-platform vector, each Growth_Stage is a set of layered `<G>` (group) elements; color props accept desaturation filter for Wilting_State |
| Persistence format | Single Zustand store serialised to AsyncStorage | One key for habits/state; second key for accessories; avoids partial-write races |
| Testing | fast-check + Jest | Works with the existing TS + Jest setup; no native bridge needed for pure-logic tests |
| Notifications | expo-notifications | Already in Expo ecosystem; `CalendarTriggerInput` with `repeats: true` maps directly to Requirement 1.6–1.9 |

---

## Components and Interfaces

### Terrarium

```tsx
// Terrarium.tsx
interface TerrariumProps {
  height: number;        // controlled by parent (≥40% screen height)
  showCelebration: boolean;
}
// Renders: wood-frame border (View + StyleSheet border), TerrariumScene inside,
// SparkleOverlay absolutely positioned on top (clipped via overflow: 'hidden')
```

### TerrariumScene

```tsx
// TerrariumScene.tsx — layered via absolute-positioned Views
// Layer order (bottom → top):
// 1. SkyGradient      (LinearGradient from expo-linear-gradient)
// 2. TerrainAccessory (equipped Terrain item SVG, if any)
// 3. GroundMound      (moss-green SVG ellipse)
// 4. FurnitureAccessory[] (equipped Furniture SVGs)
// 5. Sprig            (SVG creature, positioned on ground)
// 6. HatAccessory     (equipped Hat SVG, positioned relative to Sprig head)
```

### Sprig

```tsx
// Sprig.tsx
interface SprigProps {
  stage: GrowthStage;     // 'seedling' | 'sprout' | 'bloom' | 'flourishing'
  wilting: boolean;
  /** Hue-rotate/desaturation applied via SVG filter when wilting=true */
}

// Internal: useSprigIdle() hook manages Reanimated bob
// translateY shared value oscillates 0 → -6 → 0 over 3000 ms with withRepeat
```

Each stage component (`SprigSeedling`, etc.) is a pure SVG composition:
- A **body layer** `<G>` — main silhouette fill
- A **detail layer** `<G>` — eyes, texture, highlights
- A **leaf layer** `<G>` — grows with stage (more leaves per stage)
- All color fills are driven by props so wilting can desaturate via a `<ColorMatrix>` filter

### HabitRow

```tsx
interface HabitRowProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}
// Leaf-shaped checkbox: custom SVG path with primary accent fill when completed
// Label: strikethrough via textDecorationLine when completed
// Animated: Reanimated scale/opacity micro-bounce on toggle (100 ms target)
```

### AccessoryItem

```tsx
type AccessoryState = 'locked' | 'owned' | 'equipped';

interface AccessoryItemProps {
  accessory: Accessory;
  state: AccessoryState;
  coinBalance: number;
  onPress: () => void;
}
// locked  → grayscale filter + lock icon + price label
// owned   → normal rendering
// equipped → amber outline border
```

### CelebrationToast

```tsx
interface CelebrationToastProps {
  coinsEarned: number;   // always 25
  streak: number;
  visible: boolean;      // drives slide animation
  onDismiss: () => void;
}
// Animated.View translateY: slides in from bottom edge (+100→0), dismisses after 3 s
// driven by withTiming + withDelay(3000) → slide back out
```

### SparkleOverlay

```tsx
interface SparkleOverlayProps {
  visible: boolean;
  containerDimensions: { width: number; height: number };
}
// 12 sparkle dots positioned randomly within bounds
// Each uses withRepeat(withSequence(scale 0→1.5→0, opacity 1→0)) staggered
// Clipped to Terrarium via parent overflow: 'hidden'
// Auto-stops after 2000 ms via withDelay + callback to clear visible
```

---

## Data Models

### TypeScript types

```ts
// lib/types.ts

export type GrowthStage = 'seedling' | 'sprout' | 'bloom' | 'flourishing';

export type DayCompletionStatus = 'complete' | 'partial' | 'missed';

export interface Habit {
  id: string;              // uuid, stable across renames
  name: string;            // 1–60 chars
  reminderTime: string | null;  // "HH:MM" or null
  notificationId: string | null; // expo-notifications identifier
}

export interface DayRecord {
  dateKey: string;         // "YYYY-MM-DD" in local timezone
  completedHabitIds: string[];  // subset of the three habit IDs
  status: DayCompletionStatus;
}

export type AccessoryCategory = 'hats' | 'furniture' | 'terrain';

export interface Accessory {
  id: string;
  name: string;
  category: AccessoryCategory;
  coinCost: number;
  renderLayer: 'hat' | 'furniture' | 'terrain'; // maps to TerrariumScene layer
}

export interface AccessoryOwnership {
  accessoryId: string;
  owned: boolean;
  equipped: boolean;
}
```

### Zustand store shape

```ts
// store/useHabitStore.ts

interface HabitState {
  // Habit definitions
  habits: [Habit, Habit, Habit];

  // Completion: keyed by "YYYY-MM-DD"
  dayRecords: Record<string, DayRecord>;

  // Current-day completion (mirrored into dayRecords on each toggle)
  todayCompletedIds: string[];

  // Economy
  coinBalance: number;
  streak: number;
  cumulativeCompletedDays: number;

  // Growth
  growthStage: GrowthStage;
  isWilting: boolean;

  // Celebration
  celebrationActive: boolean;
  celebrationTriggeredToday: boolean;

  // Hydration guard
  _hasHydrated: boolean;

  // Actions
  toggleHabit: (habitId: string) => void;
  saveHabit: (index: 0 | 1 | 2, name: string, reminderTime: string | null) => void;
  evaluateDayOnOpen: (today: string) => void;
  dismissCelebration: () => void;
  setHydrated: () => void;
}

// store/useAccessoryStore.ts

interface AccessoryState {
  ownerships: Record<string, AccessoryOwnership>;  // keyed by accessoryId
  purchaseAccessory: (accessoryId: string) => void;
  equipAccessory: (accessoryId: string) => void;
}
```

### AsyncStorage keys

| Key | Content |
|-----|---------|
| `habrite-habit-store` | Serialised `HabitState` (Zustand persist auto-key) |
| `habrite-accessory-store` | Serialised `AccessoryState` (Zustand persist auto-key) |

Each store is a single JSON blob written atomically by Zustand. No manual `AsyncStorage.setItem` calls are needed in application code — the persist middleware handles reads on hydration and writes on every `set()` call.

### Persistence boot sequence

```
App launch
  └─ _layout.tsx: SplashScreen.preventAutoHideAsync()
       └─ useHabitStore: onRehydrateStorage callback fires
            ├─ success → setHydrated(true) → evaluateDayOnOpen(today)
            │              → SplashScreen.hideAsync()
            └─ timeout (5 s) → initialize defaults → show warning banner
                               → SplashScreen.hideAsync()
```

### Pure business logic functions (`lib/`)

```ts
// growthStage.ts
export function computeGrowthStage(completedDays: number): GrowthStage

// coinLogic.ts
export function computeCoinDelta(
  action: 'complete' | 'uncomplete',
  celebrationWasTriggered: boolean,
  isThirdHabit: boolean,
): number

// streakLogic.ts
export function evaluateStreak(
  currentStreak: number,
  lastDayRecord: DayRecord | undefined,
  today: string,
): { newStreak: number; resetOccurred: boolean }

// statusCaption.ts
export function computeStatusCaption(
  completedCount: number,
  isWilting: boolean,
  growthStageJustChanged: boolean,
  newStage: GrowthStage | null,
): string
```

These functions are pure — no side effects, no store access — which makes them ideal targets for property-based testing.

---

## Navigation Structure

```
Root Stack (_layout.tsx)
├── (tabs)/_layout.tsx   ← Tab.Navigator with Bottom_Nav
│   ├── index.tsx        ← "Home" tab (flame icon)
│   ├── wardrobe.tsx     ← "Shop" tab (hanger icon)
│   └── stats.tsx        ← "Stats" tab (calendar icon)
└── settings.tsx         ← Pushed screen (gear icon in Home header)
```

The `(tabs)/_layout.tsx` renders a custom `<BottomNav>` component rather than the default Expo Router tab bar, because the Bottom_Nav must display the live coin balance (Requirement 8.1). The tab navigator is configured with `tabBar` prop pointing to the custom component.

---

## Notification Management

```ts
// hooks/useNotifications.ts

// On mount, check Notifications.getPermissionsAsync()
// requestPermissions() only called when user toggles on in Settings

// scheduleHabitReminder(habit: Habit): Promise<string>
//   trigger: { type: 'calendar', hour, minute, repeats: true }
//   returns notificationId stored on the Habit record

// cancelHabitReminder(notificationId: string): Promise<void>
//   calls Notifications.cancelScheduledNotificationAsync(id)
```

Notifications are scheduled/cancelled whenever `saveHabit` is called with a changed `reminderTime`. The `notificationId` is stored on the `Habit` object inside the persisted store so it survives app restarts.

---

## Celebration State Machine

```
Normal day
  └─ user marks 3rd habit
       └─ toggleHabit() detects isThirdHabit
            ├─ award 5 + 10 coins, increment streak
            ├─ set celebrationActive = true
            ├─ check growthStage transition
            └─ SparkleOverlay + CelebrationToast mount
                 ├─ t=2 s → SparkleOverlay auto-clears
                 └─ t=3 s → CelebrationToast slides out → dismissCelebration()

user un-marks a habit after celebration
  └─ toggleHabit() detects celebrationWasTriggered=true
       └─ deduct 5 + 10 coins, decrement streak
          set celebrationActive = false, celebrationTriggeredToday = false

user re-marks that habit
  └─ celebrationTriggeredToday = false → isThirdHabit logic fires again
       └─ re-triggers Celebration_State (Requirement 3.8)
```

---

## Error Handling

| Failure scenario | Handling |
|---|---|
| AsyncStorage write fails on habit toggle | State retained in memory; non-blocking `<WarningBanner>` shown (Requirement 2.8) |
| AsyncStorage read on launch times out (>5 s) | Default values initialised; warning banner "Could not load saved data." shown (Requirement 13.3) |
| Notification permission denied | Inline message in Settings; toggle reverted to off (Requirement 12.5) |
| Coin balance would go below 0 | `Math.max(0, balance + delta)` clamp applied in `coinLogic.ts` (Requirement 8.4) |
| Accessory purchase when balance insufficient | "Not enough coins yet." message shown; no state change (Requirement 9.12) |
| GrowthStage computed from negative completedDays | `computeGrowthStage` clamps input to `Math.max(0, n)` |

---



---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Habit list always contains exactly three habits

*For any* sequence of habit-save operations, the resulting `habits` array in the store SHALL always have a length of exactly 3.

**Validates: Requirements 1.1**

---

### Property 2: Habit name validation rejects invalid inputs

*For any* string that is either empty, composed entirely of whitespace characters, or longer than 60 characters, calling `saveHabit` with that string SHALL return a validation error and leave the habit name in the store unchanged.

**Validates: Requirements 1.4, 1.5, 12.7**

---

### Property 3: Habit name save round-trip

*For any* valid habit name (non-empty, non-whitespace-only, ≤ 60 characters) and any habit index (0, 1, or 2), calling `saveHabit` with that name SHALL result in the store's habit at that index having exactly that name.

**Validates: Requirements 1.3**

---

### Property 4: Habit toggle is its own inverse

*For any* habit and any initial completion state, toggling the habit twice (complete then uncomplete, or uncomplete then complete) SHALL return `todayCompletedIds` to its original state.

**Validates: Requirements 2.2, 2.3, 2.4**

---

### Property 5: Coin delta is correct for non-celebration toggles

*For any* non-negative coin balance, toggling a habit to complete (when no celebration is triggered) SHALL increase the balance by exactly 5. Toggling a completed habit to incomplete (when no celebration was triggered) SHALL decrease the balance by exactly 5, clamped to a minimum of 0.

**Validates: Requirements 2.6, 2.7, 8.4**

---

### Property 6: Celebration coin arithmetic is correct

*For any* non-negative coin balance and streak count, when the third and final habit is marked complete: the balance SHALL increase by 15 (5 for the habit + 10 bonus) and the streak SHALL increment by 1. When a habit is subsequently unmarked after celebration was triggered: the balance SHALL decrease by 15 (clamped to 0) and the streak SHALL decrement by 1 (clamped to 0).

**Validates: Requirements 3.2, 3.7**

---

### Property 7: Third-habit completion triggers celebration

*For any* state where exactly 2 habits are already completed for today and `celebrationTriggeredToday` is false, marking the remaining uncompleted habit SHALL set `celebrationActive` to true.

**Validates: Requirements 3.1, 3.8**

---

### Property 8: Day reset on new day open

*For any* non-empty `todayCompletedIds` state, calling `evaluateDayOnOpen` with a date string that differs from the current day's date key SHALL produce an empty `todayCompletedIds`.

**Validates: Requirements 2.5**

---

### Property 9: Streak evaluation correctness

*For any* prior streak value and most-recent `DayRecord`, `evaluateStreak` SHALL return 0 if the most recent day was `partial` or `missed`, and SHALL return `currentStreak + 1` if the most recent day was `complete` and the current call is on a different date than that day.

**Validates: Requirements 4.2, 4.3**

---

### Property 10: Streak evaluation idempotence

*For any* streak state and today's date, calling `evaluateDayOnOpen` twice in a row with the same date SHALL produce the same streak value both times (no double-increment or double-reset).

**Validates: Requirements 4.6**

---

### Property 11: Day completion status classification

*For any* set of completed habit IDs from the fixed set of three habit IDs, `computeDayStatus` SHALL return `'missed'` when the set is empty, `'partial'` when the set has 1 or 2 members, and `'complete'` when the set has all 3 members.

**Validates: Requirements 4.4**

---

### Property 12: Growth stage mapping is monotone and correct

*For any* non-negative integer `n`, `computeGrowthStage(n)` SHALL return:
- `'seedling'` when `n` is in [0, 3]
- `'sprout'` when `n` is in [4, 7]
- `'bloom'` when `n` is in [8, 13]
- `'flourishing'` when `n` ≥ 14

The result is always the same regardless of any prior growth stage value (stateless mapping).

**Validates: Requirements 5.2, 5.3, 5.7, 6.3**

---

### Property 13: Wilting state activates on missed previous day

*For any* day history where the most recently recorded `DayRecord` has status `'partial'` or `'missed'`, calling `evaluateDayOnOpen` on a subsequent date SHALL set `isWilting` to true.

**Validates: Requirements 6.1**

---

### Property 14: Wilting state clears on first habit completion

*For any* state where `isWilting` is true and `todayCompletedIds` is empty, calling `toggleHabit` to mark any habit as complete SHALL set `isWilting` to false.

**Validates: Requirements 6.2**

---

### Property 15: Purchase deducts exact coin cost

*For any* coin balance ≥ accessory coin cost, purchasing an accessory SHALL reduce the coin balance by exactly the accessory's `coinCost`, mark the accessory as owned and equipped, and leave the balance at `balance - coinCost`.

**Validates: Requirements 9.9, 9.10**

---

### Property 16: Exclusive category equip (Hats and Terrain)

*For any* sequence of equip operations on accessories within the same exclusive category (Hats or Terrain), at most one accessory in that category SHALL have `equipped = true` at any time after each operation.

**Validates: Requirements 9.13, 9.15**

---

### Property 17: Furniture equip is additive

*For any* set of already-equipped Furniture accessories, equipping a new Furniture accessory SHALL leave all previously equipped Furniture accessories with `equipped = true` (no unequipping side effect).

**Validates: Requirements 9.14**

---

### Property 18: Calendar cell status is a pure function of day record

*For any* `DayRecord` and any reference date (today), `computeCellStatus(record, today)` SHALL return `'complete'` for `status = 'complete'`, `'partial'` for `status = 'partial'`, `'empty'` for `status = 'missed'` or absent records on past dates, and SHALL never return a filled state for future dates.

**Validates: Requirements 10.4, 10.5, 10.6, 10.7**

---

### Property 19: State persistence round-trip

*For any* valid `HabitState` object, serialising it to JSON (as Zustand persist does) and then deserialising it SHALL produce an object that is deeply equal to the original on all fields used at runtime (`habits`, `dayRecords`, `coinBalance`, `streak`, `cumulativeCompletedDays`, `growthStage`, `isWilting`).

**Validates: Requirements 13.1, 13.2**

---

## Testing Strategy

### Dual-layer approach

Property-based tests validate the universal correctness of pure business-logic functions. Unit and integration tests cover component rendering, async flows, and UI state. Both layers are necessary and complementary.

PBT is appropriate here because the core logic functions (`growthStage`, `coinLogic`, `streakLogic`, `statusCaption`, `dateUtils`) are pure, stateless, and have large input spaces where edge cases matter. UI rendering, OS notification calls, and AnimatedAPI behaviour are excluded from PBT.

**Property-based testing library**: [fast-check](https://fast-check.dev/) — works with Jest, no native bridge needed for pure-logic tests.

**Minimum 100 iterations per property** — configured globally via:
```ts
// jest.setup.ts
import * as fc from 'fast-check';
fc.configureGlobal({ numRuns: 100 });
```

**Tag format** — each property-based test MUST include a comment:
```
// Feature: habrite-app, Property N: <property text>
```

### Property-based test targets (`src/lib/__tests__/`)

| Test file | Properties covered |
|---|---|
| `growthStage.test.ts` | P12 |
| `coinLogic.test.ts` | P5, P6, P15 |
| `streakLogic.test.ts` | P9, P10, P11 |
| `habitValidation.test.ts` | P1, P2, P3 |
| `habitToggle.test.ts` | P4, P7, P8 |
| `wiltingLogic.test.ts` | P13, P14 |
| `accessoryLogic.test.ts` | P16, P17 |
| `calendarLogic.test.ts` | P18 |
| `persistence.test.ts` | P19 |

### Example fast-check test pattern

```ts
// Feature: habrite-app, Property 12: Growth stage mapping is monotone and correct
it('computeGrowthStage returns seedling for 0-3', () => {
  fc.assert(
    fc.property(fc.integer({ min: 0, max: 3 }), (n) => {
      expect(computeGrowthStage(n)).toBe('seedling');
    })
  );
});

it('computeGrowthStage returns flourishing for n >= 14', () => {
  fc.assert(
    fc.property(fc.integer({ min: 14, max: 10_000 }), (n) => {
      expect(computeGrowthStage(n)).toBe('flourishing');
    })
  );
});
```

### Unit / integration tests (`src/**/__tests__/`)

- **Component snapshots**: `Terrarium`, `HabitRow` (checked + unchecked), `AccessoryItem` (locked / owned / equipped), `CelebrationToast`, `SparkleOverlay`
- **useDayCheck hook**: mock `Date.now()` and Zustand store; assert streak increment, streak reset, and `isWilting` flag after `evaluateDayOnOpen`
- **useNotifications**: mock `expo-notifications` module; verify `scheduleNotificationAsync` is called with correct `CalendarTriggerInput` and `cancelScheduledNotificationAsync` is called when reminder is removed
- **Celebration flow**: drive `toggleHabit` to the third completion, assert `celebrationActive=true`, `coinBalance+=15`, `streak+=1`; then unmark and assert reverse
- **Wardrobe purchase**: mock store with insufficient and sufficient balances; verify "Not enough coins" path and successful purchase path
- **Settings save validation**: drive save with all-valid, one-empty, and one-too-long inputs; verify store update vs. error states
- **Store hydration**: mock AsyncStorage with valid data, missing data, and a 5 s timeout; verify state matches expected in each case
