import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const router = useRouter();
	const tintColor = useThemeColor({}, 'tint');

	const getTabIcon = (name: IconName, color: string, size: number = 26) => (
		<MaterialCommunityIcons name={name} size={size} color={color} />
	);

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: tintColor,
				tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: {
					backgroundColor: colorScheme === 'dark' ? '#0f0f0f' : '#ffffff',
					borderTopColor: colorScheme === 'dark' ? '#2a2a2a' : '#e2e8f0',
					paddingTop: 8,
					height: 85,
				},
				tabBarLabelStyle: {
					fontSize: 11,
					fontWeight: '600',
					marginTop: 4,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Inicio',
					tabBarIcon: ({ color }) => getTabIcon('home', color),
				}}
			/>
			<Tabs.Screen
				name="history"
				options={{
					title: 'Historial',
					tabBarIcon: ({ color }) => getTabIcon('history', color),
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					title: '',
					tabBarIcon: ({ color }) => (
						<View
							style={{
								top: -20,
								width: 60,
								height: 60,
								borderRadius: 30,
								backgroundColor: tintColor,
								justifyContent: 'center',
								alignItems: 'center',
								shadowColor: '#000',
								shadowOffset: { width: 0, height: 4 },
								shadowOpacity: 0.3,
								shadowRadius: 4,
								elevation: 5,
							}}
						>
							<MaterialCommunityIcons name="plus" size={32} color="#fff" />
						</View>
					),
					tabBarLabel: () => null,
				}}
				listeners={() => ({
					tabPress: (e) => {
						e.preventDefault();
						router.push('/modal');
					},
				})}
			/>
			<Tabs.Screen
				name="notifications"
				options={{
					title: 'Alertas',
					tabBarIcon: ({ color }) => getTabIcon('bell-outline', color),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: 'Ajustes',
					tabBarIcon: ({ color }) => getTabIcon('cog-outline', color),
				}}
			/>

			{/* Hidden tabs */}
			<Tabs.Screen
				name="analysis"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					href: null,
				}}
			/>
		</Tabs>
	);
}
