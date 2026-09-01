import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AccessoryOwnership } from '../lib/types';
import { ACCESSORIES } from '../constants/accessories';
import { useHabitStore } from './useHabitStore';

// ---------------------------------------------------------------------------
// Accessory store
// Tracks which accessories the user owns and which are currently equipped.
// Purchasing deducts coins from the habit store's coinBalance.
// Equip rules: Hats and Terrain are mutually exclusive within their category;
// Furniture is additive (multiple may be equipped simultaneously).
// Persisted under key `habrite-accessory-store`.
// _Requirements: 9.9, 9.10, 9.12, 9.13, 9.14, 9.15, 13.1_
// ---------------------------------------------------------------------------

export interface AccessoryState {
  ownerships: Record<string, AccessoryOwnership>;
  purchaseAccessory: (accessoryId: string) => void;
  equipAccessory: (accessoryId: string) => void;
}

export const useAccessoryStore = create<AccessoryState>()(
  persist(
    (set, get) => ({
      ownerships: {},

      purchaseAccessory: (accessoryId: string) => {
        const accessory = ACCESSORIES.find((a) => a.id === accessoryId);
        if (!accessory) {
          return;
        }

        // Guard: already owned — nothing to purchase.
        if (get().ownerships[accessoryId]?.owned) {
          return;
        }

        const currentBalance = useHabitStore.getState().coinBalance;

        // Guard: insufficient funds (Requirement 9.12).
        if (currentBalance < accessory.coinCost) {
          return;
        }

        // Deduct coins, clamped to a minimum of 0 (Requirements 9.10, 8.4).
        useHabitStore.setState({
          coinBalance: Math.max(0, currentBalance - accessory.coinCost),
        });

        // Mark as owned + equipped, enforcing exclusive-equip rules
        // for the accessory's category (Requirements 9.10, 9.13, 9.15).
        set((state) => {
          const ownerships = enforceEquip(state.ownerships, accessoryId);
          ownerships[accessoryId] = {
            accessoryId,
            owned: true,
            equipped: true,
          };
          return { ownerships };
        });
      },

      equipAccessory: (accessoryId: string) => {
        const accessory = ACCESSORIES.find((a) => a.id === accessoryId);
        if (!accessory) {
          return;
        }

        // Guard: can only equip owned accessories.
        if (!get().ownerships[accessoryId]?.owned) {
          return;
        }

        set((state) => {
          const ownerships = enforceEquip(state.ownerships, accessoryId);
          const existing = ownerships[accessoryId];
          ownerships[accessoryId] = {
            accessoryId,
            owned: existing?.owned ?? true,
            equipped: true,
          };
          return { ownerships };
        });
      },
    }),
    {
      name: 'habrite-accessory-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns a new ownerships map with any conflicting equipped accessory in the
 * same exclusive category (Hats or Terrain) unequipped. Furniture is additive,
 * so no unequip happens for it. The target accessory itself is not modified
 * here — the caller sets its equipped state.
 */
function enforceEquip(
  ownerships: Record<string, AccessoryOwnership>,
  accessoryId: string
): Record<string, AccessoryOwnership> {
  const accessory = ACCESSORIES.find((a) => a.id === accessoryId);
  const next: Record<string, AccessoryOwnership> = { ...ownerships };

  if (!accessory) {
    return next;
  }

  // Furniture is additive — no exclusivity enforcement (Requirement 9.14).
  if (accessory.category === 'furniture') {
    return next;
  }

  // Hats and Terrain are mutually exclusive within their category
  // (Requirements 9.13, 9.15). Unequip any other equipped item in the
  // same category.
  for (const other of ACCESSORIES) {
    if (
      other.id !== accessoryId &&
      other.category === accessory.category &&
      next[other.id]?.equipped
    ) {
      next[other.id] = { ...next[other.id], equipped: false };
    }
  }

  return next;
}
