import { formatCurrency } from '@/utils/format';
import React from 'react';
import { Text, View } from 'react-native';

interface BalanceHeaderProps {
    balance: number;
    income: number;
    expenses: number;
    currency?: string;
}

export function BalanceHeader({
    balance,
    income,
    expenses,
    currency = 'USD'
}: BalanceHeaderProps) {
    return (
        <View className="bg-primary-500 dark:bg-dark-card rounded-3xl p-6 mb-6 shadow-lg">
            {/* Total Balance */}
            <View className="items-center mb-6">
                <Text className="text-base text-white/80 dark:text-gray-400 mb-2">
                    Balance Total
                </Text>
                <Text className="text-4xl font-bold text-white dark:text-white">
                    {formatCurrency(balance, currency)}
                </Text>
            </View>

            {/* Income & Expenses */}
            <View className="flex-row justify-between">
                {/* Income */}
                <View className="flex-1 flex-row items-center bg-white/20 dark:bg-dark-surface rounded-2xl p-4 mr-2">
                    <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center mr-3">
                        <Text className="text-lg">↓</Text>
                    </View>
                    <View>
                        <Text className="text-xs text-white/80 dark:text-gray-400">
                            Ingresos
                        </Text>
                        <Text className="text-base font-bold text-white dark:text-income">
                            +{formatCurrency(income, currency)}
                        </Text>
                    </View>
                </View>

                {/* Expenses */}
                <View className="flex-1 flex-row items-center bg-white/20 dark:bg-dark-surface rounded-2xl p-4 ml-2">
                    <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center mr-3">
                        <Text className="text-lg">↑</Text>
                    </View>
                    <View>
                        <Text className="text-xs text-white/80 dark:text-gray-400">
                            Gastos
                        </Text>
                        <Text className="text-base font-bold text-white dark:text-expense">
                            -{formatCurrency(expenses, currency)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
