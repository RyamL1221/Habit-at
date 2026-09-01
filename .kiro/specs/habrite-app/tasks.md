# Implementation Plan: Habrite App

## Overview

Incremental build-out of the Habrite habit-tracking app on Expo 57 / React Native. Tasks are ordered so each step produces runnable, integrated code: dependencies → types/constants → pure logic → stores → navigation skeleton → Terrarium/Sprig → Checklist → Celebration → Wardrobe → Stats → Settings → Home assembly → polish. Property-based tests (fast-check) are co-located with the logic they validate.

---

## Tasks

- [x] 1. Install dependencies and configure testing framework
  - Install `zustand`, `@react-native-async-storage/async-storage`, `react-native-svg`, `expo-notifications`, `expo-linear-gradient`, and `fast-check` via `npx expo install` / `npm install`
  - Add Jest config (`jest.config.js`, `jest.setup.ts`) with `fc.configureGlobal({ numRuns: 100 })` and `react-native-svg` mock
  - Confirm `react-native-reanimated` (4.5.1) and `react-native-worklets` are already present in `package.json`
  - Add `expo-notifications` plugin entry to `app.json` `plugins` array
  - _Requirements: 13.1, 13.2_

- [x] 2. Define core TypeScript types and static accessory catalogue
  - [x] 2.1 Create `src/lib/types.ts` with `GrowthStage`, `DayCompletionStatus`, `Habit`, `DayRecord`, `AccessoryCategory`, `Accessory`, `AccessoryOwnership` interfaces exactly as specified in the design
    - _Requirements: 1.1, 2.1, 5.1, 9.1_
  - [x] 2.2 Create `src/constants/accessories.ts` with the static accessory catalogue — at least 3 Hats, 3 Furniture, and 3 Terrain entries, each with id, name, category, coinCost, and renderLayer
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 3. Implement pure business logic functions
  - [x] 3.1 Create `src/lib/dateUtils.ts` — implement `today()`, `isSameDay(a, b)`, and `localDateKey(date)` returning `"YYYY-MM-DD"` in local timezone
    - _Requirements: 2.5, 4.6_
  - [x] 3.2 Create `src/lib/growthStage.ts` — implement `computeGrowthStage(completedDays: number): GrowthStage` with clamp to `Math.max(0, n)` and thresholds [0–3]=seedling, [4–7]=sprout, [8–13]=bloom, [≥14]=flourishing
    - _Requirements: 5.2, 5.3, 5.7_
  - [x] 3.3 Write property tests for `growthStage.ts` in `src/lib/__tests__/growthStage.test.ts`
    - **Property 12: Growth stage mapping is monotone and correct**
    - **Validates: Requirements 5.2, 5.3, 5.7, 6.3**
  - [x] 3.4 Create `src/lib/coinLogic.ts` — implement `computeCoinDelta(action, celebrationWasTriggered, isThirdHabit): number` returning +5/-5 for normal toggle and +15/-15 for third-habit / celebration reversal; minimum clamp applied at call site
    - _Requirements: 2.6, 2.7, 3.2, 3.7, 8.4_
  - [x] 3.5 Write property tests for `coinLogic.ts` in `src/lib/__tests__/coinLogic.test.ts`
    - **Property 5: Coin delta is correct for non-celebration toggles**
    - **Property 6: Celebration coin arithmetic is correct**
    - **Property 15: Purchase deducts exact coin cost**
    - **Validates: Requirements 2.6, 2.7, 3.2, 3.7, 8.4, 9.9, 9.10**
  - [x] 3.6 Create `src/lib/streakLogic.ts` — implement `evaluateStreak(currentStreak, lastDayRecord, today): { newStreak, resetOccurred }` and `computeDayStatus(completedIds, habitIds): DayCompletionStatus`
    - _Requirements: 4.2, 4.3, 4.4_
  - [x] 3.7 Write property tests for `streakLogic.ts` in `src/lib/__tests__/streakLogic.test.ts`
    - **Property 9: Streak evaluation correctness**
    - **Property 10: Streak evaluation idempotence**
    - **Property 11: Day completion status classification**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.6**
  - [x] 3.8 Create `src/lib/statusCaption.ts` — implement `computeStatusCaption(completedCount, isWilting, growthStageJustChanged, newStage): string` returning the exact caption strings from Requirements 7.5–7.11
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11_
  - [x] 3.9 Create `src/lib/habitValidation.ts` — implement `validateHabitName(name: string): { valid: boolean; error?: string }` rejecting empty/whitespace and strings longer than 60 chars with the exact error strings from Requirements 1.4–1.5
    - _Requirements: 1.4, 1.5, 12.7_
  - [x] 3.10 Write property tests for habit validation in `src/lib/__tests__/habitValidation.test.ts`
    - **Property 1: Habit list always contains exactly three habits**
    - **Property 2: Habit name validation rejects invalid inputs**
    - **Property 3: Habit name save round-trip**
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 12.7**
  - [x] 3.11 Create `src/lib/calendarLogic.ts` — implement `computeCellStatus(record: DayRecord | undefined, dateKey: string, today: string): 'complete' | 'partial' | 'empty' | 'future'`
    - _Requirements: 10.4, 10.5, 10.6, 10.7_
  - [x] 3.12 Write property tests for `calendarLogic.ts` in `src/lib/__tests__/calendarLogic.test.ts`
    - **Property 18: Calendar cell status is a pure function of day record**
    - **Validates: Requirements 10.4, 10.5, 10.6, 10.7**

- [x] 4. Checkpoint — pure logic tests
  - Run `npx jest --testPathPattern="src/lib/__tests__" --passWithNoTests` and ensure all property-based tests pass. Ask the user if any failures arise.

- [x] 5. Implement Zustand stores
  - [x] 5.1 Create `src/store/useHabitStore.ts` with the full `HabitState` shape, Zustand `persist` middleware backed by `@react-native-async-storage/async-storage` (key `habrite-habit-store`), and all actions: `toggleHabit`, `saveHabit`, `evaluateDayOnOpen`, `dismissCelebration`, `setHydrated`
    - Wire `toggleHabit` to `computeCoinDelta`, `computeGrowthStage`, and celebration flag logic
    - Wire `evaluateDayOnOpen` to `evaluateStreak` and wilting state
    - Initialize defaults: three placeholder habits, 0 coins, 0 streak, seedling stage
    - _Requirements: 1.1, 1.2, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.7, 3.8, 4.2, 4.3, 4.4, 5.2, 5.7, 6.1, 6.2, 8.3, 8.4, 8.5, 13.1_
  - [x] 5.2 Write property tests for habit toggle in `src/lib/__tests__/habitToggle.test.ts` (drive store actions directly)
    - **Property 4: Habit toggle is its own inverse**
    - **Property 7: Third-habit completion triggers celebration**
    - **Property 8: Day reset on new day open**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 3.1, 3.8**
  - [x] 5.3 Write property tests for wilting logic in `src/lib/__tests__/wiltingLogic.test.ts`
    - **Property 13: Wilting state activates on missed previous day**
    - **Property 14: Wilting state clears on first habit completion**
    - **Validates: Requirements 6.1, 6.2**
  - [x] 5.4 Create `src/store/useAccessoryStore.ts` with `AccessoryState` shape, Zustand `persist` (key `habrite-accessory-store`), and actions: `purchaseAccessory`, `equipAccessory`
    - `purchaseAccessory` deducts `coinCost` from `useHabitStore.coinBalance` and marks owned+equipped
    - `equipAccessory` enforces exclusive equip for Hats and Terrain categories; Furniture is additive
    - Clamp coin balance to `Math.max(0, balance - cost)` and guard against insufficient balance
    - _Requirements: 9.9, 9.10, 9.12, 9.13, 9.14, 9.15, 13.1_
  - [x] 5.5 Write property tests for accessory logic in `src/lib/__tests__/accessoryLogic.test.ts`
    - **Property 16: Exclusive category equip (Hats and Terrain)**
    - **Property 17: Furniture equip is additive**
    - **Validates: Requirements 9.13, 9.14, 9.15**
  - [x] 5.6 Write property tests for persistence round-trip in `src/lib/__tests__/persistence.test.ts`
    - **Property 19: State persistence round-trip**
    - **Validates: Requirements 13.1, 13.2**

- [x] 6. Checkpoint — store layer
  - Run `npx jest --testPathPattern="src/lib/__tests__" --passWithNoTests` and ensure all store property-based tests pass. Ask the user if any failures arise.

- [x] 7. Navigation skeleton and root layout
  - [x] 7.1 Restructure `src/app/` to the design layout: create `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx` (Home stub), `src/app/(tabs)/wardrobe.tsx` (stub), `src/app/(tabs)/stats.tsx` (stub), and `src/app/settings.tsx` (stub pushed screen)
    - Remove or replace the existing `src/app/explore.tsx`
    - _Requirements: 11.1, 11.4_
  - [x] 7.2 Rewrite `src/app/_layout.tsx` to implement the boot sequence: `SplashScreen.preventAutoHideAsync()`, hydration guard via `useHabitStore._hasHydrated`, call `evaluateDayOnOpen(today())` on first hydration, `SplashScreen.hideAsync()` on success or after 5 s timeout with warning banner
    - _Requirements: 13.2, 13.3_
  - [x] 7.3 Create `src/components/navigation/BottomNav.tsx` — three tab items (Home / flame icon, Wardrobe / hanger icon, Stats / calendar icon) with active-state styling, coin balance display next to coin icon, reads live from `useHabitStore.coinBalance`
    - Wire the custom tab bar into `(tabs)/_layout.tsx` via the `tabBar` prop
    - _Requirements: 8.1, 8.2, 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 8. Terrarium and Sprig SVG components
  - [x] 8.1 Create `src/components/sprig/SprigSeedling.tsx`, `SprigSprout.tsx`, `SprigBloom.tsx`, `SprigFlourishing.tsx` — each is a layered SVG composition with `<G>` body, detail, and leaf layers; accept `wilting: boolean` prop; apply `<ColorMatrix>` desaturation filter when `wilting=true`
    - _Requirements: 5.1, 6.1_
  - [x] 8.2 Create `src/components/sprig/Sprig.tsx` — selects the correct stage component from `stage` prop, passes `wilting` prop, owns idle bob animation via `useSharedValue` + `withRepeat(withSequence(...), -1)` over 3000 ms on `translateY` (0 → -6 → 0)
    - _Requirements: 5.1, 5.5, 6.1_
  - [x] 8.3 Create `src/components/terrarium/TerrariumScene.tsx` — layered absolute-positioned Views in order: SkyGradient (`expo-linear-gradient`), TerrainAccessory slot, GroundMound (SVG ellipse), FurnitureAccessory slots, Sprig, HatAccessory slot; reads equipped accessories from `useAccessoryStore`
    - _Requirements: 7.3, 7.4, 7.12_
  - [x] 8.4 Create `src/components/terrarium/Terrarium.tsx` — wraps `TerrariumScene` with wood-frame border (rounded corners, styled border), `overflow: 'hidden'` for sparkle clipping; accepts `height` and `showCelebration` props
    - _Requirements: 7.1, 7.2, 14.1_
  - [x] 8.5 Create `src/components/terrarium/StatusCaption.tsx` — renders a single italic `<Text>` line; derives text from `computeStatusCaption` fed by live store values
    - _Requirements: 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 14.2_

- [x] 9. Checklist and HabitRow
  - [x] 9.1 Create `src/components/checklist/HabitRow.tsx` — leaf-shaped SVG checkbox (filled with primary accent when completed), label with `textDecorationLine: 'line-through'` when completed, Reanimated micro-bounce on toggle (scale + opacity, 100 ms); accepts `habit`, `completed`, `onToggle` props
    - _Requirements: 2.2, 2.3_
  - [x] 9.2 Create `src/components/checklist/Checklist.tsx` — renders three `HabitRow` items driven by `useHabitStore`; calls `toggleHabit` on each row's `onToggle`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 10. Celebration components
  - [x] 10.1 Create `src/components/celebration/SparkleOverlay.tsx` — 12 sparkle dots randomly positioned within `containerDimensions`; each uses `withRepeat(withSequence(scale 0→1.5→0, opacity 1→0))` with stagger; auto-stops after 2000 ms via `withDelay` callback; clipped by parent `overflow: 'hidden'`
    - _Requirements: 3.4, 15.1, 15.3_
  - [x] 10.2 Create `src/components/celebration/CelebrationToast.tsx` — `Animated.View` slides in from bottom (`translateY +100→0`) on `visible=true`; shows coins earned (25) and streak; auto-slides out after 3 s via `withDelay`; calls `onDismiss`
    - _Requirements: 3.3, 3.6, 15.2, 15.4_
  - [x] 10.3 Create `src/hooks/useCelebration.ts` — celebration state machine: exposes `active`, `trigger()`, and `dismiss()` driven by `useHabitStore.celebrationActive`; wires `dismissCelebration` store action
    - _Requirements: 3.1, 3.5, 3.6, 3.8, 15.5_

- [x] 11. Checkpoint — UI layer
  - Run `npx jest --testPathPattern="src/(components|hooks)" --passWithNoTests` and confirm component unit tests pass. Ask the user if any failures arise.

- [x] 12. Wardrobe screen
  - [x] 12.1 Create `src/components/wardrobe/CategoryTabs.tsx` — three underline tabs (Hats, Furniture, Terrain); active tab underlined; default active = Hats
    - _Requirements: 9.2, 9.3_
  - [x] 12.2 Create `src/components/wardrobe/AccessoryItem.tsx` — renders locked (grayscale + lock icon + price), owned, or equipped (amber outline) states based on `AccessoryState` prop; accepts `accessory`, `state`, `coinBalance`, `onPress`
    - _Requirements: 9.6, 9.7, 9.8_
  - [x] 12.3 Create `src/components/wardrobe/WardrobeShelf.tsx` — scrollable list of `AccessoryItem` rows for the active category, separated by thin walnut-brown divider lines; reads `useAccessoryStore` ownerships and `useHabitStore.coinBalance`; handles tap → purchase confirmation prompt or equip action
    - _Requirements: 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12_
  - [x] 12.4 Assemble `src/app/(tabs)/wardrobe.tsx` — mini Terrarium preview at top (same Terrarium + Sprig components), `CategoryTabs`, `WardrobeShelf`; purchase confirmation uses a `Modal` or `Alert` showing accessory name and cost
    - _Requirements: 9.1, 9.9, 9.10, 9.11_

- [x] 13. Stats screen
  - [x] 13.1 Create `src/components/stats/CalendarGrid.tsx` — 7-column month grid; uses `computeCellStatus` for each day cell; colors: solid accent = complete, 50% opacity = partial, empty = missed/no-record, distinct outline = today, no fill = future; prev/next month navigation controls
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
  - [x] 13.2 Create `src/components/stats/StatsSummary.tsx` — summary row with current streak and cumulative completed days from `useHabitStore`
    - _Requirements: 10.9_
  - [x] 13.3 Assemble `src/app/(tabs)/stats.tsx` — `CalendarGrid` and `StatsSummary`; accessible via Bottom_Nav as the third tab
    - _Requirements: 10.1_

- [x] 14. Settings screen and notifications hook
  - [x] 14.1 Create `src/hooks/useNotifications.ts` — `checkPermissions()`, `requestPermissions()`, `scheduleHabitReminder(habit): Promise<string>` using `expo-notifications` with `CalendarTriggerInput { hour, minute, repeats: true }`, `cancelHabitReminder(notificationId)`
    - _Requirements: 1.6, 1.7, 1.8, 1.9, 12.3, 12.4, 12.5_
  - [x] 14.2 Assemble `src/app/settings.tsx` — three editable text fields (60-char max) for habit names, notifications toggle (calls `requestPermissions` when turned on, shows inline message on denial), Save button wired to `validateHabitName` + `saveHabit`; inline validation errors per Requirements 1.4, 1.5, 12.7
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.8, 1.9, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 15. Home screen assembly
  - [x] 15.1 Assemble `src/app/(tabs)/index.tsx` — fixed header row with settings icon (navigates to `settings`) and streak indicator (flame icon + streak count); Terrarium occupying ≥40% screen height fixed at top; `StatusCaption` immediately below; scrollable area containing `Checklist`; `SparkleOverlay` and `CelebrationToast` mounted conditionally on `celebrationActive`; wire `useDayCheck` on mount
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 15.1, 15.2, 15.5, 15.6_
  - [x] 15.2 Create `src/hooks/useDayCheck.ts` — calls `evaluateDayOnOpen(today())` on app focus/mount; guards against duplicate evaluation on the same day using `localDateKey`
    - _Requirements: 2.5, 4.6, 13.2_

- [x] 16. Error handling and warning banner
  - [x] 16.1 Create `src/components/WarningBanner.tsx` — non-blocking dismissible banner; shown by `useHabitStore` when a Store write fails (Requirement 2.8) or on timeout during hydration (Requirement 13.3)
    - _Requirements: 2.8, 13.3_
  - [x] 16.2 Add AsyncStorage write-failure handler in `useHabitStore` — catch errors from persist middleware and set a `storeWriteError` flag that triggers `WarningBanner` display
    - _Requirements: 2.8_

- [x] 17. Final checkpoint — integration
  - Run `npx jest --passWithNoTests` to execute the full test suite. Ensure all property-based tests (P1–P19) and unit tests pass. Ask the user if any failures arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation; do not skip them
- Property tests validate universal correctness of pure business logic; unit tests cover component rendering, async flows, and UI state
- All PBT files MUST include the comment `// Feature: habrite-app, Property N: <property text>` above each `fc.assert` call
- The `fast-check` global config (`numRuns: 100`) is set in `jest.setup.ts` once during Task 1
- `react-native-svg` SVG elements are NOT wrapped in Reanimated directly; use `AnimatedGroup` (re-exported from `react-native-svg`) for animated SVG layers
- Do not add `expo-notifications` plugin to `app.json` without also handling the iOS `NSUserNotifications` permission description

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.4", "3.6", "3.8", "3.9", "3.11"] },
    { "id": 2, "tasks": ["3.3", "3.5", "3.7", "3.10", "3.12"] },
    { "id": 3, "tasks": ["5.1", "5.4"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.5", "5.6"] },
    { "id": 5, "tasks": ["7.1", "7.2"] },
    { "id": 6, "tasks": ["7.3"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2"] },
    { "id": 9, "tasks": ["8.3", "8.5", "9.1"] },
    { "id": 10, "tasks": ["8.4", "9.2", "10.1", "10.2", "10.3"] },
    { "id": 11, "tasks": ["12.1", "12.2", "13.1", "13.2", "14.1", "15.2", "16.1"] },
    { "id": 12, "tasks": ["12.3", "13.3", "14.2", "16.2"] },
    { "id": 13, "tasks": ["12.4", "15.1"] }
  ]
}
```
