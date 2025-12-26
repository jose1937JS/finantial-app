import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { primaryColors, useSettingsStore } from '@/store/settings-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { preferences } = useSettingsStore();

  // Determine theme based on settings
  const effectiveTheme = preferences.theme === 'system'
    ? colorScheme
    : preferences.theme;

  // Convert hex to rgb triplet for NativeWind
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '34 197 94';
  };

  const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';
  const primaryColorRgb = hexToRgb(primaryColorHex);

  const theme = effectiveTheme === 'dark' ? { ...DarkTheme } : { ...DefaultTheme };
  theme.colors.primary = primaryColorHex;

  console.log({ primaryColorRgb, primaryColorHex, themeColors: theme.colors })

  return (
    <ThemeProvider value={theme}>
      {/* <View style={{ flex: 1 }} vars={{ '--color-primary': primaryColorRgb }}> */}
      <View style={{ flex: 1, '--color-primary': primaryColorRgb } as any}>
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
      </View>
    </ThemeProvider>
  );
}
