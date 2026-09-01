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
