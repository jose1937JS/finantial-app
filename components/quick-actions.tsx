import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface QuickActionsProps {
    onAddIncome?: () => void;
    onAddExpense?: () => void;
}

export function QuickActions({ onAddIncome, onAddExpense }: QuickActionsProps) {
    const router = useRouter();

    const handleAddIncome = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onAddIncome) {
            onAddIncome();
        } else {
            router.push('/add-transaction?type=income');
        }
    };

    const handleAddExpense = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onAddExpense) {
            onAddExpense();
        } else {
            router.push('/add-transaction?type=expense');
        }
    };

    return (
        <View className="flex-row justify-center gap-4 mb-6">
            {/* Add Income */}
            <Pressable
                onPress={handleAddIncome}
                className="flex-1 flex-row items-center justify-center bg-income/15 rounded-2xl py-4 px-6 active:opacity-80"
            >
                <View className="w-10 h-10 rounded-full bg-income items-center justify-center mr-3">
                    <MaterialCommunityIcons
                        name="plus"
                        size={24}
                        color="#fff"
                    />
                </View>
                <View>
                    <Text className="text-sm font-semibold text-income">
                        Ingreso
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Agregar
                    </Text>
                </View>
            </Pressable>

            {/* Add Expense */}
            <Pressable
                onPress={handleAddExpense}
                className="flex-1 flex-row items-center justify-center bg-expense/15 rounded-2xl py-4 px-6 active:opacity-80"
            >
                <View className="w-10 h-10 rounded-full bg-expense items-center justify-center mr-3">
                    <MaterialCommunityIcons
                        name="minus"
                        size={24}
                        color="#fff"
                    />
                </View>
                <View>
                    <Text className="text-sm font-semibold text-expense">
                        Gasto
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                        Agregar
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}
