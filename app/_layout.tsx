import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/settings-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { preferences } = useSettingsStore();

  // Determine theme based on settings
  const effectiveTheme = preferences.theme === 'system'
    ? colorScheme
    : preferences.theme;

  const theme = effectiveTheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
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
        <Stack.Screen
          name="profile-edit"
          options={{
            presentation: 'modal',
            title: 'Editar Perfil',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="add-dynamic"
          options={{
            presentation: 'modal',
            title: 'Asistente IA',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style={effectiveTheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
