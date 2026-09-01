import type { Accessory } from '../lib/types';

// ---------------------------------------------------------------------------
// Static accessory catalogue
// All IDs are stable — do NOT change them after the app ships; they are
// persisted in the user's AsyncStorage ownership records.
// ---------------------------------------------------------------------------

export const HATS: Accessory[] = [
  {
    id: 'hat-flower-crown',
    name: 'Flower Crown',
    category: 'hats',
    coinCost: 25,
    renderLayer: 'hat',
  },
  {
    id: 'hat-tiny-mushroom',
    name: 'Tiny Mushroom Cap',
    category: 'hats',
    coinCost: 35,
    renderLayer: 'hat',
  },
  {
    id: 'hat-leaf-beret',
    name: 'Leaf Beret',
    category: 'hats',
    coinCost: 45,
    renderLayer: 'hat',
  },
];

export const FURNITURE: Accessory[] = [
  {
    id: 'furn-pebble-bench',
    name: 'Pebble Bench',
    category: 'furniture',
    coinCost: 30,
    renderLayer: 'furniture',
  },
  {
    id: 'furn-lantern',
    name: 'Glow Lantern',
    category: 'furniture',
    coinCost: 55,
    renderLayer: 'furniture',
  },
  {
    id: 'furn-water-bowl',
    name: 'Dewdrop Bowl',
    category: 'furniture',
    coinCost: 70,
    renderLayer: 'furniture',
  },
];

export const TERRAIN: Accessory[] = [
  {
    id: 'terr-moss-carpet',
    name: 'Moss Carpet',
    category: 'terrain',
    coinCost: 40,
    renderLayer: 'terrain',
  },
  {
    id: 'terr-pebble-path',
    name: 'Pebble Path',
    category: 'terrain',
    coinCost: 65,
    renderLayer: 'terrain',
  },
  {
    id: 'terr-fern-grove',
    name: 'Fern Grove',
    category: 'terrain',
    coinCost: 95,
    renderLayer: 'terrain',
  },
];

export const ACCESSORIES: Accessory[] = [...HATS, ...FURNITURE, ...TERRAIN];
