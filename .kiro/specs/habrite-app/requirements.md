# Requirements Document

## Introduction

Habrite is a habit-tracking mobile web app built on Expo 57 / React Native. The emotional core is a virtual creature named Sprig that lives inside a terrarium habitat and visibly reflects the user's consistency with three daily habits. Completing habits earns coins spent in a wardrobe/accessory shop. The app persists all state locally (no account system) and targets mobile-first layout with React Native styling conventions.

## Glossary

- **App**: The Habrite React Native / Expo application.
- **Habit**: A user-defined recurring daily task with a name and optional reminder time.
- **Habit_List**: The ordered set of exactly three Habits the user has defined.
- **Checklist**: The today's-habits UI component on the Home screen.
- **Sprig**: The single virtual creature owned by the user, rendered as a layered SVG/vector illustration.
- **Terrarium**: The wood-framed habitat box that contains Sprig and decorative elements.
- **Growth_Stage**: One of four named stages (Seedling, Sprout, Bloom, Flourishing) that Sprig transitions through based on cumulative completed days.
- **Wilting_State**: A temporary visual state applied to Sprig after a missed day (0 or fewer than 3 habits completed the previous day).
- **Coin**: The in-app currency unit awarded for completing habits.
- **Streak**: The current count of consecutive fully-completed days.
- **Accessory**: A purchasable cosmetic item that decorates Sprig or the Terrarium.
- **Wardrobe**: The screen where the user browses and equips Accessories.
- **Category**: One of three Accessory groupings — Hats, Furniture, Terrain.
- **Shelf**: The grid-row layout within Wardrobe separated by thin walnut-brown divider lines.
- **Celebration_State**: A transient UI state triggered when the third habit is completed in a day, showing a toast, sparkle animation, updated streak, and coin award.
- **Store**: Persistent local storage (AsyncStorage or equivalent) holding all app state.
- **Day**: A calendar date in the user's local timezone.
- **Status_Caption**: A single italic line below the Terrarium that reflects Sprig's current state.
- **Bottom_Nav**: The minimal three-item bottom navigation bar present on all main screens.

---

## Requirements

### Requirement 1: Habit Definition and Management

**User Story:** As a user, I want to define exactly three daily habits with custom names and optional reminder times, so that the app tracks the routines most meaningful to me.

#### Acceptance Criteria

1. THE App SHALL maintain a Habit_List containing exactly three Habits at all times.
2. WHEN the App is first launched with no stored data, THE App SHALL initialize the Habit_List with three placeholder Habits named "Habit 1," "Habit 2," and "Habit 3."
3. WHEN a user edits a Habit name in Settings, THE App SHALL persist the updated name to the Store immediately and reflect it on the Checklist without requiring an app restart.
4. WHEN a user saves a Habit name that is an empty string, THE App SHALL reject the save and display an inline validation message reading "Habit name cannot be empty."
5. WHEN a user saves a Habit name longer than 60 characters, THE App SHALL reject the save and display an inline validation message reading "Habit name must be 60 characters or fewer."
6. WHEN a user sets or changes a reminder time for a Habit in Settings, THE App SHALL persist the reminder time to the Store immediately, where the reminder time is expressed as hours and minutes (HH:MM, 00:00–23:59) and repeats daily.
7. WHERE the user has enabled notifications, WHEN a Habit has a reminder time set and that time arrives on any Day the Habit has not yet been completed, THE App SHALL dispatch a local push notification with the Habit name as the notification title and a fixed body reading "Time to complete your habit!"
8. WHERE the user has enabled notifications, WHEN the user removes a reminder time from a Habit, THE App SHALL cancel any scheduled notification for that Habit.
9. IF the user attempts to set a reminder time for a Habit and notification permission has not been granted by the operating system, THEN THE App SHALL display an inline message indicating that notifications are disabled and a reminder cannot be set.

---

### Requirement 2: Daily Habit Completion

**User Story:** As a user, I want to tap a checkbox to mark each of my three habits as done for today, so that I can track my daily progress at a glance.

#### Acceptance Criteria

1. THE Checklist SHALL display all three Habits from the Habit_List each Day.
2. WHEN a user taps an unchecked Habit row, THE Checklist SHALL mark that Habit as completed for the current Day within 100 ms: the checkbox fills with the primary accent color, the habit name displays with a strikethrough style, and the row shifts to a "done" visual treatment.
3. WHEN a user taps a completed Habit row, THE Checklist SHALL mark that Habit as incomplete for the current Day within 100 ms: the checkbox returns to its empty state, the strikethrough is removed, and the row returns to its default visual treatment.
4. WHEN a user toggles a Habit's completion status, THE App SHALL persist the updated completion status for the current Day to the Store.
5. WHEN the App is opened on a new Day, THE Checklist SHALL display all three Habits as unchecked, regardless of the previous Day's completion state.
6. WHEN a user marks a Habit as completed for the current Day, THE App SHALL award the user 5 Coins and persist the updated Coin balance to the Store.
7. WHEN a user unmarks a previously completed Habit on the current Day whose completion did not trigger the Celebration_State, THE App SHALL deduct 5 Coins from the Coin balance, to a minimum of 0, and persist the updated Coin balance to the Store.
8. IF a Store write fails when persisting a habit toggle, THEN THE App SHALL retain the toggled state in memory and display a non-blocking warning to the user.

---

### Requirement 3: Day Completion and Coin Bonus

**User Story:** As a user, I want completing all three habits in a day to feel rewarding, so that I am motivated to maintain a full daily routine.

#### Acceptance Criteria

1. WHEN a user marks the third and final unchecked Habit as completed on the current Day, THE App SHALL transition to the Celebration_State.
2. WHEN the Celebration_State is triggered, THE App SHALL award a bonus of 10 Coins (in addition to the 5-Coin per-habit award for the third habit, totalling 25 Coins for the Day), increment the Streak counter by 1, and persist both values to the Store.
3. WHEN the Celebration_State is active, THE App SHALL display a toast message showing the total coins earned for that Day (25) and the updated Streak value.
4. WHEN the Celebration_State is active, THE App SHALL display a sparkle animation overlaid near the Terrarium for a duration of 2 seconds.
5. WHEN the Celebration_State is active, THE App SHALL display a three-dot progress indicator with all three dots in the filled/active state.
6. WHEN the sparkle animation has completed (after 2 seconds) and the toast has completed (after 3 seconds), THE App SHALL automatically return to the normal Home view without requiring user interaction.
7. WHEN a user unmarks a Habit after the Celebration_State has triggered on the current Day, THE App SHALL deduct 5 Coins for that habit and the 10-Coin bonus from the Coin balance (to a minimum of 0), decrement the Streak counter by 1, and display the Checklist with that Habit unchecked and the remaining two Habits checked.
8. WHEN a user re-marks a Habit that was previously unmarked after the Celebration_State triggered on the current Day, THE App SHALL re-trigger the Celebration_State.

---

### Requirement 4: Streak Tracking

**User Story:** As a user, I want to see my current streak of fully-completed days so that I feel motivated to maintain consistency.

#### Acceptance Criteria

1. THE App SHALL display the current Streak count alongside a flame icon in the header of the Home screen.
2. WHEN the App is opened on any Day, IF the most recently recorded Day had fewer than 3 Habits completed, THEN THE App SHALL reset the Streak counter to 0 and persist the reset to the Store.
3. WHEN the App is opened on any Day, IF the most recently recorded Day had all 3 Habits completed, THEN THE App SHALL increment the Streak counter by 1 and persist the updated value to the Store.
4. THE App SHALL record each Day's completion status to the Store as one of: fully complete (3 of 3 habits done), partial (1–2 of 3 habits done), or missed (0 of 3 habits done).
5. WHEN the App is launched for the first time with no stored history, THE App SHALL initialize the Streak counter to 0.
6. WHEN the App is opened multiple times on the same Day, THE App SHALL NOT re-evaluate or modify the Streak counter beyond the first open of that Day.

---

### Requirement 5: Sprig Growth Stages

**User Story:** As a user, I want to watch Sprig grow and change appearance as I build my habit streak, so that my consistency has a visible, rewarding outcome.

#### Acceptance Criteria

1. THE App SHALL render Sprig as a layered SVG/vector illustration (not photorealistic, not pixel art) at all times.
2. THE App SHALL map Sprig's Growth_Stage to cumulative completed Days as follows: Seedling for 0–3 completed Days, Sprout for 4–7 completed Days, Bloom for 8–13 completed Days, and Flourishing for 14 or more completed Days.
3. WHEN a user's cumulative completed Days crosses a Growth_Stage threshold, THE App SHALL update Sprig's illustration to reflect the new Growth_Stage immediately upon the next screen render within the current app session.
4. WHEN a Growth_Stage transition is triggered by the Celebration_State on the same Day, THE App SHALL update Sprig's illustration within the Celebration_State view before the toast dismisses.
5. WHILE the Terrarium is visible on screen, THE App SHALL display Sprig's idle animation as a continuous loop of exactly 3000 ms per cycle with no more than 100 ms gap between consecutive cycles.
6. THE App SHALL render Sprig at the same Growth_Stage and with the same equipped Accessories in both the Home Terrarium and the Wardrobe preview Terrarium.
7. IF a user's cumulative completed Days decreases such that it falls below the lower bound of the current Growth_Stage, THEN THE App SHALL update Sprig's Growth_Stage to the stage corresponding to the new cumulative completed Days total at the next screen render within the current app session.

---

### Requirement 6: Wilting State

**User Story:** As a user, I want Sprig to gently reflect when I've missed a day without losing any progress, so that I feel a soft sense of accountability without punishment.

#### Acceptance Criteria

1. WHEN the App is opened on a Day on which the most recently recorded Day had fewer than 3 Habits completed, THE App SHALL render Sprig in the Wilting_State: drooping leaf posture and desaturated color palette.
2. WHILE the App is in the Wilting_State, WHEN the user completes at least 1 Habit on the current Day, THE App SHALL transition Sprig out of the Wilting_State and back to the normal Growth_Stage appearance.
3. THE App SHALL NOT demote Sprig's Growth_Stage due to a missed Day.
4. THE App SHALL NOT remove any owned or equipped Accessories due to a missed Day.
5. WHILE the Wilting_State is active and 0 Habits have been completed on the current Day, THE App SHALL display the Status_Caption "Sprig is looking a little droopy."
6. IF no previously recorded Day exists in the Store, THEN THE App SHALL render Sprig in the normal Growth_Stage appearance without activating the Wilting_State.

---

### Requirement 7: Terrarium Habitat Display

**User Story:** As a user, I want the terrarium to feel like a persistent physical object at the top of my screen so that Sprig's home feels real and worth decorating.

#### Acceptance Criteria

1. THE Terrarium SHALL be rendered as the topmost element on the Home screen, occupying the top portion of the viewport with greater height than any other individual UI element.
2. THE Terrarium SHALL display a wood-framed border with rounded corners styled to resemble glass.
3. THE Terrarium SHALL render a layered scene containing: a sky gradient background, a moss-green ground mound, and Sprig positioned on the ground mound.
4. THE Terrarium SHALL display any Accessories in the Furniture and Terrain categories that are currently equipped by the user, rendered within the layered scene in their designated rendering layer.
5. THE Status_Caption SHALL be displayed as a single italic line immediately below the Terrarium.
6. WHILE no Habits have been completed on the current Day and the Wilting_State is not active, THE Status_Caption SHALL read "Sprig is basking in the morning light."
7. WHILE 1 or 2 Habits have been completed on the current Day and the Wilting_State is not active, THE Status_Caption SHALL read "Keep going — Sprig is cheering you on."
8. WHEN all 3 Habits have been completed on the current Day and no Growth_Stage transition occurred during that completion, THE Status_Caption SHALL read "All three rituals done. Sprig grew a new leaf."
9. WHEN all 3 Habits have been completed on the current Day and a Growth_Stage transition to Sprout occurred, THE Status_Caption SHALL read "Sprig has sprouted! A new chapter begins."
10. WHEN all 3 Habits have been completed on the current Day and a Growth_Stage transition to Bloom occurred, THE Status_Caption SHALL read "Sprig is blooming. Something beautiful is growing."
11. WHEN all 3 Habits have been completed on the current Day and a Growth_Stage transition to Flourishing occurred, THE Status_Caption SHALL read "Sprig is flourishing. You've built something real."
12. WHERE the user has equipped Furniture or Terrain category Accessories, THE Terrarium SHALL render those Accessory elements within the layered scene, composited above the sky gradient and ground mound layers.

---

### Requirement 8: Coin Balance Display

**User Story:** As a user, I want to see my current coin balance at all times so that I always know how close I am to my next purchase.

#### Acceptance Criteria

1. WHILE the App is open, THE Bottom_Nav SHALL display the current Coin balance as a non-negative integer next to a coin icon.
2. WHEN the Coin balance changes for any reason, THE Bottom_Nav SHALL update the displayed count without requiring user navigation or manual refresh.
3. WHEN the Coin balance changes for any reason, THE App SHALL persist the updated Coin balance to the Store.
4. IF the computed Coin balance would fall below 0, THEN THE App SHALL clamp the Coin balance to 0.
5. WHEN the App is launched and no persisted Coin balance exists in the Store, THE App SHALL initialize the Coin balance to 0.

---

### Requirement 9: Wardrobe Screen

**User Story:** As a user, I want to browse and purchase accessories for Sprig and the terrarium using coins I've earned, so that there is a tangible reward for building my habits.

#### Acceptance Criteria

1. THE Wardrobe SHALL be accessible via the Bottom_Nav and SHALL display a mini Terrarium preview at the top showing Sprig with currently equipped Accessories.
2. THE Wardrobe SHALL render Accessory categories using an underlined tab selector with exactly three tabs: Hats, Furniture, and Terrain.
3. WHEN the Wardrobe is first opened in a session, THE Wardrobe SHALL display the Hats category tab as the active tab and show only Hats-category Accessories in the Shelf.
4. WHEN a user taps a category tab, THE Wardrobe SHALL display only the Accessories belonging to that Category in the Shelf below the tab selector.
5. THE Shelf SHALL render Accessories in rows separated by a thin walnut-brown divider line rather than individual rounded cards.
6. WHEN an Accessory is in the "equipped" state, THE Wardrobe SHALL render that Accessory item with an amber outline highlight; tapping an already-equipped Accessory SHALL produce no state change.
7. WHEN an Accessory is in the "owned but not equipped" state, THE Wardrobe SHALL render that Accessory item without a highlight, and tapping it SHALL equip the Accessory and update both the Wardrobe preview Terrarium and the Home Terrarium.
8. WHEN an Accessory is in the "locked" state, THE Wardrobe SHALL render that Accessory item in grayscale with a lock icon and its Coin cost displayed.
9. WHEN a user taps a locked Accessory whose Coin cost is less than or equal to the user's current Coin balance, THE Wardrobe SHALL display a purchase confirmation prompt showing the Accessory name and Coin cost.
10. WHEN the user confirms a purchase, THE Wardrobe SHALL deduct the Accessory's Coin cost from the Coin balance and persist the updated Coin balance to the Store, mark the Accessory as owned and equipped and persist that state to the Store, and update both the Wardrobe preview Terrarium and the Home Terrarium.
11. WHEN the user dismisses or cancels a purchase confirmation prompt, THE Wardrobe SHALL close the prompt and make no changes to the Coin balance or Accessory state.
12. WHEN a user taps a locked Accessory whose Coin cost exceeds the user's current Coin balance, THE Wardrobe SHALL display a message reading "Not enough coins yet."
13. WHEN a user equips a Hat Accessory and another Hat is already equipped, THE Wardrobe SHALL unequip the previously equipped Hat and equip the new one.
14. WHEN a user equips a Furniture Accessory, THE Wardrobe SHALL allow multiple Furniture Accessories to be equipped simultaneously without limit.
15. WHEN a user equips a Terrain Accessory and another Terrain Accessory is already equipped, THE Wardrobe SHALL unequip the previously equipped Terrain Accessory and equip the new one.

---

### Requirement 10: Stats Screen

**User Story:** As a user, I want to see a calendar history of my completed days so that I can review my long-term consistency.

#### Acceptance Criteria

1. THE Stats_Screen SHALL be accessible via the Bottom_Nav as the third navigation destination.
2. THE Stats_Screen SHALL display a calendar-style view showing each Day in the currently displayed month, organized in a 7-column grid aligned to the days of the week.
3. THE Stats_Screen SHALL display navigation controls (previous month, next month) allowing the user to view calendar data for months other than the current month.
4. WHEN a Day has a "fully complete" record in the Store, THE Stats_Screen SHALL render that Day's cell with a solid filled background in the primary accent color.
5. WHEN a Day has a "partial" record in the Store, THE Stats_Screen SHALL render that Day's cell with a 50% opacity fill in the primary accent color, visually distinct from both the fully-complete and missed states.
6. WHEN a Day has a "missed" record or no record in the Store and that Day is in the past, THE Stats_Screen SHALL render that Day's cell in the default (empty) state with no fill.
7. WHEN a Day is in the future relative to the current Day, THE Stats_Screen SHALL render that Day's cell in the default (empty) state and SHALL NOT mark it as missed.
8. THE Stats_Screen SHALL render the current Day's cell with a distinct outline or indicator to identify it as today.
9. THE Stats_Screen SHALL display the current Streak count and the total cumulative completed Days count in a summary area above or below the calendar.

---

### Requirement 11: Navigation

**User Story:** As a user, I want simple, minimal navigation so that I can move between the habit checklist, wardrobe, and stats without distraction.

#### Acceptance Criteria

1. THE Bottom_Nav SHALL contain exactly three navigation items: Home, Wardrobe, and Stats, each with a distinct icon and label no longer than 10 characters.
2. WHEN a user taps a Bottom_Nav item that corresponds to a screen other than the currently active screen, THE App SHALL navigate to the corresponding screen within 300 milliseconds.
3. THE Bottom_Nav SHALL visually indicate the currently active screen by rendering the active item's icon and label in a distinct style that differs from inactive items at all times.
4. THE Bottom_Nav SHALL remain visible at a fixed position at the bottom of the viewport on all three main screens (Home, Wardrobe, Stats).
5. IF a user taps a Bottom_Nav item that corresponds to the currently active screen, THEN THE App SHALL perform no navigation and the current screen state SHALL remain unchanged.

---

### Requirement 12: Settings Screen

**User Story:** As a user, I want to edit my habit names and manage notification preferences in a simple settings area so that the app stays relevant to my current routines.

#### Acceptance Criteria

1. WHEN a user taps the settings icon in the Home screen header, THE App SHALL navigate to the Settings_Screen.
2. THE Settings_Screen SHALL display an editable text field for each of the three Habit names, each accepting up to 40 characters.
3. THE Settings_Screen SHALL display a toggle control for enabling or disabling local push notifications.
4. WHEN a user toggles notifications on and the operating system notification permission status is not yet determined, THE App SHALL request local notification permissions from the operating system.
5. IF the operating system denies notification permissions, THEN THE App SHALL display a message explaining that notifications require permission to be granted in device settings and SHALL revert the toggle to the off state.
6. WHEN a user taps the Save action and all three Habit name fields contain non-empty, non-whitespace-only values, THE App SHALL persist all changes to the Store and navigate back to the Home screen.
7. WHEN a user taps the Save action and one or more Habit name fields contain an empty or whitespace-only value, THE App SHALL display an inline error indicator on each invalid field, retain all field values without persisting, and remain on the Settings_Screen.

---

### Requirement 13: Local State Persistence

**User Story:** As a user, I want the app to remember all my habits, progress, coins, and accessories between sessions so that I never lose my data by closing the app.

#### Acceptance Criteria

1. THE Store SHALL persist the following data across app sessions: Habit_List definitions, per-Day habit completion records, Coin balance, Streak counter, cumulative completed Days count, Growth_Stage, Wilting_State flag, and owned/equipped Accessories.
2. WHEN the App is closed and reopened, THE App SHALL restore all persisted state from the Store before rendering any screen.
3. IF the Store read on launch does not return a result within 5 seconds, THEN THE App SHALL initialize with default values (empty Habit_List placeholders, 0 Coins, 0 Streak, Seedling Growth_Stage, no owned Accessories) and display a non-blocking warning banner reading "Could not load saved data."
4. THE App SHALL NOT require user account creation or network connectivity to function.

---

### Requirement 14: Home Screen Layout

**User Story:** As a user, I want the home screen to put the terrarium front-and-center so that Sprig always feels like the emotional heart of the experience.

#### Acceptance Criteria

1. THE Home_Screen SHALL render the Terrarium as the topmost element, occupying no less than 40% of the device screen height.
2. THE Home_Screen SHALL render the Status_Caption immediately below the Terrarium.
3. THE Home_Screen SHALL render the Checklist below the Status_Caption.
4. THE Home_Screen SHALL render a streak indicator displaying a flame icon followed by the Streak count as an integer, positioned in a fixed header row above the Terrarium.
5. THE Home_Screen SHALL render the Bottom_Nav at the bottom of the screen, including the Coin balance displayed as an integer next to a coin icon.
6. WHEN the combined height of the Terrarium, Status_Caption, Checklist, and header exceeds the available viewport height, THE Home_Screen SHALL allow the area below the Terrarium to scroll while keeping the Terrarium and header fixed at the top.

---

### Requirement 15: Celebration Animation

**User Story:** As a user, I want a satisfying celebration when I complete all three habits so that the moment of full completion feels meaningful.

#### Acceptance Criteria

1. WHEN the Celebration_State is triggered, THE App SHALL render a sparkle animation covering the full bounds of the Terrarium without extending outside the Terrarium boundary.
2. WHEN the Celebration_State is triggered, THE App SHALL simultaneously start the sparkle animation and display a slide-in toast showing the coins earned from the current completion (25 Coins) and the updated Streak count.
3. THE sparkle animation SHALL play for exactly 2 seconds and then automatically dismiss without user interaction.
4. THE toast SHALL remain visible for exactly 3 seconds and then automatically slide out toward the bottom edge of the screen without user interaction.
5. THE Celebration_State SHALL NOT navigate the user away from the Home screen.
6. WHILE the Celebration_State is active, THE App SHALL continue rendering Sprig's idle animation underneath the sparkle overlay without pausing or resetting the animation cycle.
