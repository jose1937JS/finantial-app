import { isAndroid } from '@/utils';
import { formatCurrency } from '@/utils/format';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface BalanceHeaderProps {
    balance: number;
    income: number;
    expenses: number;
    currency?: string;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export function BalanceHeader({
    balance,
    income,
    expenses,
    currency = 'USD',
    onRefresh,
    isRefreshing = false
}: BalanceHeaderProps) {
    return (
        <Pressable
            className={`bg-white/15 dark:bg-dark-card rounded-3xl p-6 mb-6 ${!isAndroid && 'shadow-lg'} relative min-h-[200px]`}
            onPress={onRefresh}
            disabled={!onRefresh || isRefreshing}
        >
            {isRefreshing && (
                <View className="absolute z-10 dark:bg-black/30 rounded-3xl items-center justify-center" style={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <ActivityIndicator size="large" color="#ffffff" />
                </View>
            )}

            {!isRefreshing && <View className="flex-1">
                {/* Total Balance */}
                <View className="items-center mb-6">
                    <Text className="text-base text-white dark:text-gray-400 mb-2">
                        Balance Total
                    </Text>
                    <Text className="text-4xl font-bold text-white dark:text-white">
                        {formatCurrency(balance, currency)}
                    </Text>
                </View>

                {/* Income & Expenses */}
                <View className="flex-row justify-between">
                    {/* Income */}
                    <View className="flex-1 flex-row items-center bg-white/5 dark:bg-dark-surface rounded-2xl p-4 mr-2">
                        <View className="w-8 h-8 rounded-full bg-white/30 items-center justify-center mr-3">
                            <Icon name="arrow-down" size={22} color="white" />
                        </View>
                        <View>
                            <Text className="text-xs text-white dark:text-gray-400">
                                Ingresos
                            </Text>
                            <Text className="text-sm font-bold text-white dark:text-income">
                                +{formatCurrency(income, currency)}
                            </Text>
                        </View>
                    </View>

                    {/* Expenses */}
                    <View className="flex-1 flex-row items-center bg-white/5 dark:bg-dark-surface rounded-2xl p-4 ml-2">
                        <View className="w-8 h-8 rounded-full bg-white/30 items-center justify-center mr-3">
                            <Icon name="arrow-up" size={22} color="white" />
                        </View>
                        <View>
                            <Text className="text-xs text-white dark:text-gray-400">
                                Gastos
                            </Text>
                            <Text className="text-sm font-bold text-white dark:text-expense">
                                -{formatCurrency(expenses, currency)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>}
        </Pressable>
    );
}
