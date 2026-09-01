import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { computeCellStatus } from '@/lib/calendarLogic';
import { today, localDateKey } from '@/lib/dateUtils';
import { useHabitStore } from '@/store/useHabitStore';

/** Primary accent green used for completed days (Req 10.4). */
const ACCENT = '#4CAF50';
/** 50%-opacity accent for partial days (Req 10.5). */
const ACCENT_PARTIAL = 'rgba(76,175,80,0.5)';
/** Amber outline that marks today's cell (Req 10.8). */
const TODAY_OUTLINE = '#F59E0B';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** A calendar cursor identifying the month currently on screen. */
interface MonthCursor {
  year: number;
  month: number; // 0-indexed (0 = January)
}

/**
 * Returns the number of days in the given month.
 * Day 0 of the following month is the last day of `month`.
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the weekday index (0 = Sunday) of the first day of the month,
 * used to compute the leading blank-cell offset for grid alignment.
 */
function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Steps the cursor one month backward, rolling the year over as needed. */
function previousMonth(cursor: MonthCursor): MonthCursor {
  if (cursor.month === 0) {
    return { year: cursor.year - 1, month: 11 };
  }
  return { year: cursor.year, month: cursor.month - 1 };
}

/** Steps the cursor one month forward, rolling the year over as needed. */
function nextMonth(cursor: MonthCursor): MonthCursor {
  if (cursor.month === 11) {
    return { year: cursor.year + 1, month: 0 };
  }
  return { year: cursor.year, month: cursor.month + 1 };
}

/**
 * CalendarGrid — a 7-column month grid aligned to the days of the week
 * (Sun–Sat) that colours each day cell based on its stored completion
 * status. Includes previous/next month navigation.
 *
 * Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8
 */
export function CalendarGrid() {
  const dayRecords = useHabitStore((state) => state.dayRecords);
  const todayKey = today();

  const now = new Date();
  const [cursor, setCursor] = useState<MonthCursor>({
    year: now.getFullYear(),
    month: now.getMonth(),
  });

  const { year, month } = cursor;
  const totalDays = daysInMonth(year, month);
  const leadingBlanks = firstWeekdayOfMonth(year, month);

  // Leading blank cells align day 1 under the correct weekday column.
  const leadingCells = Array.from({ length: leadingBlanks }, (_, i) => ({
    key: `blank-${i}`,
    day: null as number | null,
  }));

  const dayCells = Array.from({ length: totalDays }, (_, i) => ({
    key: `day-${i + 1}`,
    day: i + 1,
  }));

  const cells = [...leadingCells, ...dayCells];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => setCursor((c) => previousMonth(c))}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>

        <Text style={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => setCursor((c) => nextMonth(c))}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (cell.day === null) {
            return <View key={cell.key} style={styles.cell} />;
          }

          const dateKey = localDateKey(new Date(year, month, cell.day));
          const status = computeCellStatus(dayRecords[dateKey], dateKey, todayKey);
          const isToday = dateKey === todayKey;

          const fillStyle =
            status === 'complete'
              ? styles.cellComplete
              : status === 'partial'
                ? styles.cellPartial
                : undefined;

          return (
            <View
              key={cell.key}
              style={[styles.cell, fillStyle, isToday && styles.cellToday]}
            >
              <Text
                style={[
                  styles.dayText,
                  status === 'complete' && styles.dayTextOnFill,
                ]}
              >
                {cell.day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  navButtonText: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: '600',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCell: {
    flexBasis: '14.2857%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    flexBasis: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellComplete: {
    backgroundColor: ACCENT,
  },
  cellPartial: {
    backgroundColor: ACCENT_PARTIAL,
  },
  cellToday: {
    borderWidth: 2,
    borderColor: TODAY_OUTLINE,
  },
  dayText: {
    fontSize: 13,
  },
  dayTextOnFill: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default CalendarGrid;
