import { AlertProvider } from '@/hooks/alert-context';
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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<RootLayoutContent />
			</SafeAreaProvider>
		</QueryClientProvider>
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
				<AlertProvider>
					<Stack screenOptions={{ headerShown: false, headerBackTitle: '' }}>
						<Stack.Screen name="index" />
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="(tabs)" />
						<Stack.Screen
							name="modal"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="transaction/add-transaction"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="profile-edit"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="transaction/add-dynamic"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="transaction/[id]"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
					</Stack>
				</AlertProvider>
				<StatusBar
					style={effectiveTheme === 'dark' ? 'light' : 'dark'}
					backgroundColor="transparent"
					translucent={true}
				/>
			</View>
		</ThemeProvider>
	);
}
