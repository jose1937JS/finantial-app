import type { Transaction } from '@/types';
import { formatCurrency, formatDate, formatTime } from '@/utils/format';
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

    const mainText = transaction.description || transaction.category;
    const title = mainText.length > 20 ? mainText.substring(0, 20) + '...' : mainText;
    const hasLongDescription = transaction.description && transaction.description.length > 20;
    const subtitle = hasLongDescription
        ? '...' + transaction.description.substring(20, 70) + (transaction.description.length > 70 ? '...' : '')
        : null;

    return (
        <Pressable
            onPress={handlePress}
            className="flex-row items-center py-4 px-4 bg-white dark:bg-dark-card rounded-2xl mb-3 active:opacity-70 shadow-sm shadow-slate-200 dark:shadow-slate-700"
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
                <View className="flex-row items-center mb-0.5">
                    <Text className="text-base font-semibold text-gray-700 dark:text-white mr-2">
                        {title}
                    </Text>
                    {transaction.type === 'loan' && transaction.loan && (
                        <View className={`px-2 py-0.5 rounded-md ${transaction.loan.isPaid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                            <Text className={`text-[8px] font-semibold ${transaction.loan.isPaid ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                                {transaction.loan.isPaid ? 'Pagado' : 'Pendiente'}
                            </Text>
                        </View>
                    )}
                </View>

                {subtitle && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 italic">
                        {subtitle}
                    </Text>
                )}

                <Text className="text-[11px] text-gray-400 dark:text-gray-500">
                    {transaction.category} • {formatDate(transaction.date)} {transaction.created_at ? formatTime(transaction.created_at) : formatTime(transaction.date)}
                </Text>
            </View>

            {/* Amount */}
            <Text className={`text-base font-bold ${getAmountColor()}`}>
                {getAmountPrefix()}{formatCurrency(transaction.amount, transaction.currency)}
            </Text>
        </Pressable>
    );
}
