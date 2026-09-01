import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNotifications } from '@/hooks/useNotifications';
import { validateHabitName } from '@/lib/habitValidation';
import { useHabitStore } from '@/store/useHabitStore';

/**
 * Settings screen — pushed stack route.
 *
 * Lets the user rename the three habits and toggle local push notifications.
 *
 * Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.8, 1.9,
 *            12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7
 */
export default function SettingsScreen() {
  const router = useRouter();
  const habits = useHabitStore((s) => s.habits);
  const saveHabit = useHabitStore((s) => s.saveHabit);
  const { requestPermissions } = useNotifications();

  // Local editable copies of the three habit names (Req 12.2).
  const [names, setNames] = useState<[string, string, string]>([
    habits[0].name,
    habits[1].name,
    habits[2].name,
  ]);

  // Per-field validation errors (Req 12.7, 1.4, 1.5).
  const [errors, setErrors] = useState<[string | null, string | null, string | null]>([
    null,
    null,
    null,
  ]);

  // Notifications toggle state (Req 12.3).
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);

  const setNameAt = (index: 0 | 1 | 2, value: string) => {
    setNames((prev) => {
      const next = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  };

  // Req 12.4 / 12.5 / 1.9: request permission when toggling on; revert on denial.
  const onToggleNotifications = async (value: boolean) => {
    if (!value) {
      setNotificationsEnabled(false);
      setPermissionMessage(null);
      return;
    }

    // Optimistically flip on while we ask the OS.
    setNotificationsEnabled(true);
    setPermissionMessage(null);

    const granted = await requestPermissions();
    if (!granted) {
      // Denied → revert and explain (Req 12.5).
      setNotificationsEnabled(false);
      setPermissionMessage(
        'Notifications require permission in device settings.',
      );
    }
  };

  const onSave = () => {
    // Validate every field first (Req 12.6, 12.7).
    const nextErrors = names.map((name) => {
      const result = validateHabitName(name);
      return result.valid ? null : (result.error ?? null);
    }) as [string | null, string | null, string | null];

    setErrors(nextErrors);

    const hasError = nextErrors.some((e) => e !== null);
    if (hasError) {
      // Retain values, stay on screen (Req 12.7).
      return;
    }

    // All valid → persist each habit, preserving existing reminderTime (Req 1.3, 1.6).
    (([0, 1, 2] as const)).forEach((index) => {
      saveHabit(index, names[index], habits[index].reminderTime);
    });

    // Navigate back to Home (Req 12.6).
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionLabel}>Habit names</Text>
        {(([0, 1, 2] as const)).map((index) => (
          <View key={habits[index].id} style={styles.field}>
            <Text style={styles.fieldLabel}>{`Habit ${index + 1}`}</Text>
            <TextInput
              style={[styles.input, errors[index] ? styles.inputError : null]}
              value={names[index]}
              onChangeText={(text) => setNameAt(index, text)}
              maxLength={60}
              placeholder={`Habit ${index + 1}`}
              autoCorrect={false}
            />
            {errors[index] ? (
              <Text style={styles.errorText}>{errors[index]}</Text>
            ) : null}
          </View>
        ))}

        <View style={styles.toggleRow}>
          <Text style={styles.fieldLabel}>Enable notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
        </View>
        {permissionMessage ? (
          <Text style={styles.errorText}>{permissionMessage}</Text>
        ) : null}

        <Pressable
          style={styles.saveButton}
          onPress={onSave}
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#D7263D',
  },
  errorText: {
    color: '#D7263D',
    fontSize: 13,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
