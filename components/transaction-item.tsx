import type { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface TransactionItemProps {
    transaction: Transaction;
    onPress?: () => void;
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const getIcon = (): keyof typeof MaterialCommunityIcons.glyphMap => {
        if (transaction.type === 'loan') return 'hand-coin';
        if (transaction.type === 'income') return 'arrow-down-circle';
        return 'arrow-up-circle';
    };

    const getIconColor = () => {
        if (transaction.type === 'income') return '#22c55e';
        if (transaction.type === 'loan') return '#fcd525';
        return '#ef4444';
    };

    const getAmountColor = () => {
        if (transaction.type === 'income') return 'text-income';
        if (transaction.type === 'loan') return 'text-loan';
        return 'text-expense';
    };

    const getAmountPrefix = () => {
        return transaction.type === 'income' ? '+' : '-';
    };

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center py-4 px-4 bg-white dark:bg-dark-card rounded-2xl mb-3 active:opacity-80 shadow-sm shadow-slate-200"
        >
            {/* Icon */}
            <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${getIconColor()}15` }}
            >
                <MaterialCommunityIcons
                    name={getIcon()}
                    size={24}
                    color={getIconColor()}
                />
            </View>

            {/* Details */}
            <View className="flex-1">
                <Text className="text-base text-gray-900 dark:text-white mb-1">
                    {transaction.description || transaction.category}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category} • {formatDate(transaction.date, 'relative')}
                </Text>
            </View>

            {/* Amount */}
            <Text className={`text-base font-bold ${getAmountColor()}`}>
                {getAmountPrefix()}{formatCurrency(transaction.amount, transaction.currency)}
            </Text>
        </Pressable>
    );
}
