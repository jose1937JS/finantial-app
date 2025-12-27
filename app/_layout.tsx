import { useColorScheme } from '@/hooks/use-color-scheme';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { hexToRgb } from '@/utils/colors';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutContent />
    </SafeAreaProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { preferences } = useSettingsStore();

  // Determine theme based on settings
  const effectiveTheme = preferences.theme === 'system'
    ? colorScheme
    : preferences.theme;

  const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#2ba654';
  const primaryColorRgb = hexToRgb(primaryColorHex);

  const theme = effectiveTheme === 'dark' ? { ...DarkTheme } : { ...DefaultTheme };
  theme.colors.primary = primaryColorHex;

  const themeVars = vars({
    "--color-primary": primaryColorRgb,
    "--color-primary-500": primaryColorRgb,

    // Generar el resto de tonalidades en caso de ser necesarias en formato rgb (50, 100, 200, 300, 400, 600, 700, 800, 900)
    // "--color-primary-50": primaryColorRgb,
    // "--color-primary-100": primaryColorRgb,
    // "--color-primary-200": primaryColorRgb,
    // "--color-primary-300": primaryColorRgb,
    // "--color-primary-400": primaryColorRgb,
    // "--color-primary-600": primaryColorRgb,
    // "--color-primary-700": primaryColorRgb,
    // "--color-primary-800": primaryColorRgb,
    // "--color-primary-900": primaryColorRgb
  });

  return (
    <ThemeProvider value={theme}>
      <View style={[themeVars, { flex: 1 }]}>
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
          <Stack.Screen
            name="transaction/[id]"
            options={{
              presentation: 'modal',
              title: 'Detalle de Transacción',
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar
          style={effectiveTheme === 'dark' ? 'light' : 'dark'}
          backgroundColor="transparent"
          translucent={true}
        />
      </View>
    </ThemeProvider>
  );
}
