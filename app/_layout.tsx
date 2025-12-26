import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { preferences } = useSettingsStore();
  const segments = useSegments();
  const router = useRouter();

  // Determine theme based on settings
  const effectiveTheme = preferences.theme === 'system'
    ? colorScheme
    : preferences.theme;

  const theme = effectiveTheme === 'dark' ? DarkTheme : DefaultTheme;

  // Handle authentication-based navigation
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated and not in auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated and in auth group, redirect to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Agregar Operación',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            presentation: 'modal',
            title: 'Nueva Transacción',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
