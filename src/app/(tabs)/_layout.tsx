import { Tabs } from 'expo-router';

import BottomNav from '@/components/navigation/BottomNav';

// Custom bottom tab bar (BottomNav) wires the live coin balance and themed
// icons into the three-tab navigator (Req 8.1, 8.2, 11.1–11.5, task 7.3).
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
    </Tabs>
  );
}
