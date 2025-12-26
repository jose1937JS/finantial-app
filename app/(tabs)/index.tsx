import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceHeader } from '@/components/balance-header';
import { QuickActions } from '@/components/quick-actions';
import { TransactionItem } from '@/components/transaction-item';
import { useAuthStore } from '@/store/auth-store';
import { useTransactionStore } from '@/store/transaction-store';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    getRecentTransactions,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses
  } = useTransactionStore();

  const recentTransactions = getRecentTransactions(5);
  const balance = getTotalBalance();
  const income = getTotalIncome();
  const expenses = getTotalExpenses();

  const handleAnalysis = () => {
    router.push('/analysis');
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <FlatList
        data={recentTransactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Hola, {user?.fullName?.split(' ')[0] || 'Usuario'} 👋
                </Text>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Resumen Financiero
                </Text>
              </View>
              <Pressable
                onPress={handleAnalysis}
                className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center shadow-lg"
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

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Transactions Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">
                Transacciones Recientes
              </Text>
              <Pressable onPress={() => router.push('/history')}>
                <Text className="text-sm text-primary-500 font-medium">
                  Ver todo
                </Text>
              </Pressable>
            </View>
          </>
        )}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => router.push(`/transaction/${item.id}`)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center py-12">
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
    </SafeAreaView>
  );
}
