import { View, Text, Pressable, StyleSheet } from 'react-native';

/**
 * Props for {@link WarningBanner}.
 */
export interface WarningBannerProps {
  /** The warning message to display. */
  message: string;
  /** Whether the banner is currently visible. */
  visible: boolean;
  /** Called when the user taps the dismiss control. */
  onDismiss: () => void;
}

/**
 * A non-blocking, dismissible warning banner.
 *
 * Renders a thin horizontal bar pinned to the top of its container (amber
 * background with dark text) showing a message and a dismiss button. It does
 * not overlay the whole screen — it is just a bar. When `visible` is false it
 * renders nothing.
 *
 * This is a generic, reusable presentational component. Store wiring (reading
 * the `storeWriteError` flag) lives elsewhere.
 *
 * Requirements: 2.8, 13.3
 */
export function WarningBanner({ message, visible, onDismiss }: WarningBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss warning"
        hitSlop={8}
        style={styles.dismissButton}
      >
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FDE68A',
    gap: 12,
  },
  message: {
    flex: 1,
    color: '#5C3A1E',
    fontSize: 14,
    fontWeight: '500',
  },
  dismissButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dismissText: {
    color: '#5C3A1E',
    fontSize: 14,
    fontWeight: '700',
  },
});
