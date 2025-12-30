import { BalanceHeader } from '@/components/balance-header';
import { QuickActions } from '@/components/quick-actions';
import { TransactionItem } from '@/components/transaction-item';
import { useAuthStore } from '@/store/auth-store';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import { isAndroid } from '@/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeScreen() {
	const router = useRouter();
	const { user } = useAuthStore();
	const insets = useSafeAreaInsets();
	const scrollY = useSharedValue(0);
	const { preferences } = useSettingsStore();
	const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';
	const {
		getRecentTransactions,
		getTotalBalance,
		getTotalIncome,
		getTotalExpenses
	} = useTransactionStore();

	const recentTransactions = getRecentTransactions(10);
	const balance = getTotalBalance();
	const income = getTotalIncome();
	const expenses = getTotalExpenses();

	const handleAnalysis = () => {
		router.push('/analysis');
	};

	const scrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollY.value = event.contentOffset.y;
		},
	});

	const headerStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					translateY: scrollY.value,
				},
			],
		};
	});

	return (
		<View className="flex-1 bg-light-bg dark:bg-dark-bg">
			<Animated.FlatList
				data={recentTransactions}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				onScroll={scrollHandler}
				scrollEventThrottle={16}
				contentContainerStyle={{ flexGrow: 1 }}
				ListHeaderComponent={() => (
					<View>
						{/* Animated Fixed Header */}
						<Animated.View style={[headerStyle, { zIndex: 0 }]}>
							{/* Status Bar Background */}
							<View
								style={{
									height: insets.top,
									backgroundColor: primaryColorHex,
								}}
							/>
							{/* Header Content */}
							<View className="bg-primary-500 p-5 pb-10">
								<View className="flex-row items-center justify-between mb-6">
									<View>
										<Text className="text-sm text-white dark:text-white-400">
											Hola, {user?.fullName?.split(' ')[0] || 'Usuario'} 👋
										</Text>
										<Text className="text-xl font-bold text-white dark:text-white">
											Resumen Financiero
										</Text>
									</View>
									<Pressable
										style={{ elevation: isAndroid ? 20 : undefined }}
										onPress={handleAnalysis}
										className={`w-12 h-12 bg-primary-500 rounded-full items-center justify-center ${!isAndroid && 'shadow-lg'}`}
									>
										<MaterialCommunityIcons name="chart-pie" size={28} color="#fff" />
									</Pressable>
								</View>

								{/* Balance Card */}
								<BalanceHeader
									balance={balance}
									income={income}
									expenses={expenses}
								/>
							</View>
						</Animated.View>

						{/* List Content Container (Opaque) - Starts right after header layout space */}
						<View className="bg-light-bg dark:bg-dark-bg rounded-t-3xl pt-2 px-5 relative z-10">
							{/* Quick Actions */}
							<QuickActions />

							{/* Recent Transactions Header */}
							<View className="flex-row items-center justify-between mb-4">
								<Text className="text-lg font-semibold text-gray-800 dark:text-white">
									Transacciones Recientes
								</Text>
								<Pressable onPress={() => router.push('/history')}>
									<Text className="text-sm text-primary-500 font-semibold">
										Ver todo
									</Text>
								</Pressable>
							</View>
						</View>
					</View>
				)}
				renderItem={({ item }) => (
					<View className="bg-light-bg dark:bg-dark-bg px-5 z-10">
						<TransactionItem
							transaction={item}
							onPress={() => router.push(`/transaction/${item.id}`)}
						/>
					</View>
				)}
				ListEmptyComponent={() => (
					<View className="bg-light-bg dark:bg-dark-bg items-center py-12 z-10">
						<MaterialCommunityIcons
							name="wallet-outline"
							size={64}
							color="#9ca3af"
						/>
						<Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
							No hay transacciones aún{'\n'}
							¡Agrega tu primera operación!
						</Text>
					</View>
				)}
			/>
		</View>
	);
}
