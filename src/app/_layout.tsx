import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

import { today } from '@/lib/dateUtils';
import { useHabitStore } from '@/store/useHabitStore';

// Keep the native splash screen visible until the store has hydrated
// (or the 5-second timeout elapses). Called in global scope, not awaited,
// per the expo-splash-screen guidance.
SplashScreen.preventAutoHideAsync();

// Store read on launch must resolve (or fall back) within 5 seconds (Req 13.3).
const HYDRATION_TIMEOUT_MS = 5000;

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const hasHydrated = useHabitStore((s) => s._hasHydrated);
  const evaluateDayOnOpen = useHabitStore((s) => s.evaluateDayOnOpen);

  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // On successful hydration: run the once-per-open day evaluation and hide
  // the splash screen (Req 13.2).
  useEffect(() => {
    if (hasHydrated) {
      evaluateDayOnOpen(today());
      SplashScreen.hideAsync();
    }
  }, [hasHydrated, evaluateDayOnOpen]);

  // Fallback: if hydration has not completed within 5 seconds, reveal the app
  // with default values and surface a non-blocking warning banner (Req 13.3).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useHabitStore.getState()._hasHydrated) {
        setLoadTimedOut(true);
        SplashScreen.hideAsync();
      }
    }, HYDRATION_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  // Hold the splash screen (render nothing) until either hydration completes
  // or the timeout fires.
  if (!hasHydrated && !loadTimedOut) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {loadTimedOut && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>Could not load saved data.</Text>
        </View>
      )}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  warningText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 13,
  },
});
