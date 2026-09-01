import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AccessoryCategory } from '@/lib/types';

const AMBER_ACCENT = '#C8860D';
const MUTED_TEXT = '#9E9E9E';

interface TabDef {
  category: AccessoryCategory;
  label: string;
}

/** The three wardrobe categories, in display order (Req 9.2). */
const TABS: readonly TabDef[] = [
  { category: 'hats', label: 'Hats' },
  { category: 'furniture', label: 'Furniture' },
  { category: 'terrain', label: 'Terrain' },
];

interface CategoryTabsProps {
  active: AccessoryCategory;
  onChange: (category: AccessoryCategory) => void;
}

/**
 * Underlined tab selector for the Wardrobe with exactly three tabs:
 * Hats, Furniture, Terrain (Req 9.2). The active tab is highlighted with an
 * amber underline and distinct text color; inactive tabs are muted with no
 * underline. The active category is controlled by the parent, which defaults
 * to 'hats' (Req 9.3).
 */
export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {TABS.map(({ category, label }) => {
        const isActive = category === active;
        return (
          <Pressable
            key={category}
            style={styles.tab}
            onPress={() => onChange(category)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
              {label}
            </Text>
            <View style={[styles.underline, isActive && styles.underlineActive]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  labelActive: {
    color: AMBER_ACCENT,
  },
  labelInactive: {
    color: MUTED_TEXT,
  },
  underline: {
    marginTop: 6,
    height: 2,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  underlineActive: {
    backgroundColor: AMBER_ACCENT,
  },
});
