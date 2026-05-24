import { useJobs } from '@/hooks/queries/useJobQueries';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { JobSummary } from '@/types/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SalaryScreen() {
	const router = useRouter();
	const { data: jobs, isLoading, refetch } = useJobs();
	const { preferences } = useSettingsStore();
	const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

	const onRefresh = useCallback(async () => {
		await refetch();
	}, [refetch]);

	const renderJobItem = ({ item }: { item: JobSummary }) => {
		const paymentProgress = item.expected_payments > 0 ? item.payments_made / item.expected_payments : 0;
		const progressPercent = Math.min(Math.round(paymentProgress * 100), 100);

		return (
			<Pressable
				onPress={() => router.push(`/jobs/${item.id}`)}
				className="bg-white dark:bg-dark-surface p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800 shadow-sm shadow-slate-200 dark:shadow-slate-700"
			>
				<View className="flex-row items-center justify-between mb-3">
					<View className="flex-row items-center flex-1 pr-2">
						<View className="flex-1">
							<Text className="text-base font-medium text-gray-800 dark:text-white" numberOfLines={1}>
								{item.name}
							</Text>
							<Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
								{item.company}
							</Text>
						</View>
					</View>
					<View className="items-end">
						<Text className="text-base font-bold text-primary-500">
							{Number(item.salary).toLocaleString('es-VE', { maximumFractionDigits: 2 })} {item.currency}
						</Text>
						<Text className="text-[10px] text-gray-400 dark:text-gray-500">
							Salario Mensual
						</Text>
					</View>
				</View>

				{/* Progress Section */}
				<View className="mb-4">
					<View className="flex-row justify-between items-center mb-1">
						<Text className="text-xs text-gray-500 dark:text-gray-400">
							Pagos: {item.payments_made} / {item.expected_payments}
						</Text>
						<Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
							{progressPercent}%
						</Text>
					</View>
					<View className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<View
							style={{ width: `${progressPercent}%`, backgroundColor: primaryColorHex }}
							className="h-full rounded-full"
						/>
					</View>
				</View>

				{/* Footer Details */}
				<View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
					<View className="flex-row items-center">
						<MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" />
						<Text className="text-xs font-medium text-red-500 ml-1">
							Pendiente: {item.debt_usd.toLocaleString('es-VE', { maximumFractionDigits: 2 })} USD
						</Text>
					</View>
					<View className="flex-row items-center">
						<Text className="text-xs font-medium text-primary-500">
							Ver detalle
						</Text>
						<MaterialCommunityIcons name="chevron-right" size={16} color={primaryColorHex} />
					</View>
				</View>
			</Pressable>
		);
	};

	return (
		<SafeAreaView edges={['top']} className="flex-1 bg-light-bg dark:bg-dark-bg">
			<View className="flex-1 px-5 relative">
				{/* Header */}
				<View className="pb-5">
					<View className='flex-row items-center gap-3 mb-1'>
						<View className='w-10 h-10 rounded-full bg-primary-500/10 dark:bg-dark-surface items-center justify-center'>
							<MaterialCommunityIcons name='briefcase-outline' size={18} color={primaryColorHex} />
						</View>
						<Text className="text-3xl font-bold text-gray-700 dark:text-white">
							Salarios
						</Text>
					</View>
					<Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Lista de trabajos donde percibes salario
					</Text>
				</View>

				{/* Jobs List */}
				<FlatList
					data={jobs || []}
					keyExtractor={(item) => String(item.id)}
					renderItem={renderJobItem}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
					refreshControl={
						<RefreshControl
							refreshing={isLoading}
							onRefresh={onRefresh}
							colors={[primaryColorHex]}
							tintColor={primaryColorHex}
						/>
					}
					ListEmptyComponent={() => (
						<View className="flex-1 items-center justify-center py-20">
							<MaterialCommunityIcons name="briefcase-variant-outline" size={64} color="#9ca3af" />
							<Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
								No hay trabajos registrados.
							</Text>
							<Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
								Agrega tu primer trabajo usando el botón flotante.
							</Text>
						</View>
					)}
				/>

				{/* Floating Action Button */}
				<View className="absolute bottom-6 right-5 z-50">
					<Pressable
						onPress={() => router.push('/jobs/create')}
						style={{
							backgroundColor: primaryColorHex,
							shadowColor: primaryColorHex,
							shadowOffset: { width: 0, height: 4 },
							shadowOpacity: 0.3,
							shadowRadius: 6,
							elevation: 8,
						}}
						className="w-14 h-14 rounded-full items-center justify-center"
					>
						<MaterialCommunityIcons name="plus" size={28} color="#ffffff" />
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}
