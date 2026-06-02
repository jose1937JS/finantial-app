import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AlertProvider } from '@/hooks/alert-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { hexToRgb } from '@/utils/colors';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { vars } from 'nativewind';
import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { LogBox, View } from 'react-native';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

LogBox.ignoreLogs([
	"SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context' instead.",
]);
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const getToastConfig = (theme: 'light' | 'dark') => {
	const isDark = theme === 'dark';
	const bgColor = isDark ? '#212121' : '#ffffff';
	const textColor = isDark ? '#ffffff' : '#1f2937';
	const subTextColor = isDark ? '#a1a1aa' : '#4b5563';
	const borderColor = isDark ? '#2a2a2a' : '#e2e8f0';

	return {
		success: (props: any) => (
			<BaseToast
				{...props}
				style={{
					borderLeftColor: '#22c55e',
					backgroundColor: bgColor,
					borderColor: borderColor,
					borderWidth: isDark ? 1 : 0,
					borderRadius: 16,
					height: 60,
				}}
				contentContainerStyle={{ paddingHorizontal: 15 }}
				text1Style={{
					fontSize: 15,
					fontWeight: 'bold',
					color: textColor,
				}}
				text2Style={{
					fontSize: 13,
					color: subTextColor,
				}}
			/>
		),
		error: (props: any) => (
			<ErrorToast
				{...props}
				style={{
					borderLeftColor: '#ef4444',
					backgroundColor: bgColor,
					borderColor: borderColor,
					borderWidth: isDark ? 1 : 0,
					borderRadius: 16,
					height: 60,
				}}
				contentContainerStyle={{ paddingHorizontal: 15 }}
				text1Style={{
					fontSize: 15,
					fontWeight: 'bold',
					color: textColor,
				}}
				text2Style={{
					fontSize: 13,
					color: subTextColor,
				}}
			/>
		)
	};
};

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
	const { colorScheme, setColorScheme } = useColorScheme();
	const deviceColorScheme = useDeviceColorScheme();
	const { preferences } = useSettingsStore();

	// Determine effective theme and apply it to NativeWind
	const effectiveTheme = preferences.theme === 'system'
		? (deviceColorScheme ?? 'light')
		: preferences.theme;

	useEffect(() => {
		setColorScheme(effectiveTheme as 'light' | 'dark');
	}, [effectiveTheme]);

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
						<Stack.Screen
							name="jobs/create"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="jobs/[id]"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="jobs/[id]/payments"
							options={{
								presentation: 'card',
								headerShown: false,
							}}
						/>
					</Stack>
					<Toast config={getToastConfig(effectiveTheme as 'light' | 'dark')} />
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
