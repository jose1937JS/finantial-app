import { isAndroid } from '@/utils';
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
            router.push('/transaction/add-transaction?type=income');
        }
    };

    const handleAddExpense = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onAddExpense) {
            onAddExpense();
        } else {
            router.push('/transaction/add-transaction?type=expense');
        }
    };

    return (
        <View className="flex-row justify-center gap-4 mb-6 -mt-[40px]">
            {/* Add Income */}
            <Pressable
                style={{ elevation: isAndroid ? 2 : undefined }}
                onPress={handleAddIncome}
                className={
                    `flex-1 flex-row items-center justify-center bg-white rounded-2xl py-4 px-6 active:opacity-80 ${!isAndroid && 'shadow-sm shadow-slate-300'}`
                }
            >
                <View className="w-10 h-10 rounded-full bg-income items-center justify-center mr-3">
                    <MaterialCommunityIcons
                        name="plus"
                        size={24}
                        color="#fff"
                    />
                </View>
                <View>
                    <Text className="text-md font-semibold text-income">
                        Ingreso
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-white-400">
                        Agregar
                    </Text>
                </View>
            </Pressable>

            {/* Add Expense */}
            <Pressable
                style={{ elevation: isAndroid ? 2 : undefined }}
                onPress={handleAddExpense}
                className={
                    `flex-1 flex-row items-center justify-center bg-white rounded-2xl py-4 px-6 active:opacity-80 ${!isAndroid && 'shadow-sm shadow-slate-300'}`
                }
            >
                <View className="w-10 h-10 rounded-full bg-expense items-center justify-center mr-3">
                    <MaterialCommunityIcons
                        name="minus"
                        size={24}
                        color="#fff"
                    />
                </View>
                <View>
                    <Text className="text-md font-semibold text-expense">
                        Gasto
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-white-400">
                        Agregar
                    </Text>
                </View>
            </Pressable>
        </View>
    );
}
