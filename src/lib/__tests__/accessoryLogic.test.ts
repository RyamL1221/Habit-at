import * as fc from 'fast-check';

// AsyncStorage must be mocked before the stores (which import it) are loaded.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { useAccessoryStore } from '../../store/useAccessoryStore';
import { useHabitStore } from '../../store/useHabitStore';
import {
  ACCESSORIES,
  HATS,
  FURNITURE,
  TERRAIN,
} from '../../constants/accessories';
import type { AccessoryOwnership } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds an ownerships map marking the given accessories as owned, unequipped. */
function ownedUnequipped(
  accessoryIds: string[]
): Record<string, AccessoryOwnership> {
  const map: Record<string, AccessoryOwnership> = {};
  for (const id of accessoryIds) {
    map[id] = { accessoryId: id, owned: true, equipped: false };
  }
  return map;
}

/** Counts how many accessories in the given category are currently equipped. */
function equippedCountInCategory(
  ownerships: Record<string, AccessoryOwnership>,
  category: 'hats' | 'furniture' | 'terrain'
): number {
  return ACCESSORIES.filter(
    (a) => a.category === category && ownerships[a.id]?.equipped
  ).length;
}

beforeEach(() => {
  useAccessoryStore.setState({ ownerships: {} });
});

// ---------------------------------------------------------------------------
// Property 16: Exclusive category equip (Hats and Terrain)
// Requirements: 9.13, 9.15
// ---------------------------------------------------------------------------

describe('accessory equip — exclusive categories (Property 16)', () => {
  it('at most one Hat is equipped after any sequence of Hat equips', () => {
    // Feature: habrite-app, Property 16: Exclusive category equip (Hats and Terrain)
    const hatIds = HATS.map((h) => h.id);

    fc.assert(
      fc.property(
        // Any non-empty sequence of hat equips, in any order, with repeats allowed.
        fc.array(fc.constantFrom(...hatIds), { minLength: 1, maxLength: 12 }),
        (sequence) => {
          useAccessoryStore.setState({ ownerships: ownedUnequipped(hatIds) });

          for (const id of sequence) {
            useAccessoryStore.getState().equipAccessory(id);
            const count = equippedCountInCategory(
              useAccessoryStore.getState().ownerships,
              'hats'
            );
            if (count > 1) {
              return false;
            }
          }
          return true;
        }
      )
    );
  });

  it('at most one Terrain accessory is equipped after any sequence of Terrain equips', () => {
    // Feature: habrite-app, Property 16: Exclusive category equip (Hats and Terrain)
    const terrainIds = TERRAIN.map((t) => t.id);

    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...terrainIds), { minLength: 1, maxLength: 12 }),
        (sequence) => {
          useAccessoryStore.setState({
            ownerships: ownedUnequipped(terrainIds),
          });

          for (const id of sequence) {
            useAccessoryStore.getState().equipAccessory(id);
            const count = equippedCountInCategory(
              useAccessoryStore.getState().ownerships,
              'terrain'
            );
            if (count > 1) {
              return false;
            }
          }
          return true;
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Property 17: Furniture equip is additive
// Requirements: 9.14
// ---------------------------------------------------------------------------

describe('accessory equip — additive furniture (Property 17)', () => {
  it('equipping a Furniture accessory keeps all previously equipped Furniture equipped', () => {
    // Feature: habrite-app, Property 17: Furniture equip is additive
    const furnitureIds = FURNITURE.map((f) => f.id);

    fc.assert(
      fc.property(
        // Any sequence of furniture equips, in any order.
        fc.array(fc.constantFrom(...furnitureIds), {
          minLength: 1,
          maxLength: 12,
        }),
        (sequence) => {
          useAccessoryStore.setState({
            ownerships: ownedUnequipped(furnitureIds),
          });

          const shouldBeEquipped = new Set<string>();

          for (const id of sequence) {
            useAccessoryStore.getState().equipAccessory(id);
            shouldBeEquipped.add(id);

            const ownerships = useAccessoryStore.getState().ownerships;
            // Every furniture accessory equipped so far must still be equipped.
            for (const equippedId of shouldBeEquipped) {
              if (!ownerships[equippedId]?.equipped) {
                return false;
              }
            }
          }
          return true;
        }
      )
    );
  });
});

// Reference imports to keep the module linkage explicit for the task.
void useHabitStore;
