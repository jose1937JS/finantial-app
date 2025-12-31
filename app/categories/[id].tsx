import { useAlert } from '@/hooks/alert-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { categories, deleteCategory } = useSettingsStore();
    const { transactions } = useTransactionStore();

    const primaryColor = useThemeColor({}, 'tint');
    const { showAlert } = useAlert();
    const category = categories.find((c) => c.id === id);

    if (!category) {
        return (
            <View className="flex-1 items-center justify-center bg-light-bg dark:bg-dark-bg">
                <Text className="text-gray-500">Categoría no encontrada</Text>
            </View>
        );
    }

    // Calculate usage stats
    const usageCount = transactions.filter(t => t.category === category.name).length;
    const totalAmount = transactions
        .filter(t => t.category === category.name)
        .reduce((acc, t) => acc + t.amount, 0);

    const handleDelete = () => {
        if (category.isDefault) {
            showAlert({ title: 'No permitido', message: 'Las categorías por defecto no pueden eliminarse.', icon: 'block-helper', iconColor: '#ef4444' });
            return;
        }

        if (usageCount > 0) {
            showAlert({ title: 'Atención', message: 'Esta categoría tiene transacciones asociadas. Elimínelas primero o edite la categoría.', icon: 'alert', iconColor: '#f59e0b' });
            return;
        }

        showAlert({
            title: 'Eliminar Categoría',
            message: '¿Estás seguro de que deseas eliminar esta categoría?',
            icon: 'trash-can-outline',
            iconColor: '#ef4444',
            buttons: [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        deleteCategory(category.id);
                        router.back();
                    }
                }
            ]
        });
    };

    const handleEdit = () => {
        router.push(`/categories/form?id=${category.id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" className="dark:text-white" />
                </Pressable>
                <View className="flex-row gap-2">
                    <Pressable onPress={handleEdit} className="p-2">
                        <MaterialCommunityIcons name="pencil" size={24} color={primaryColor} />
                    </Pressable>
                    {!category.isDefault && (
                        <Pressable onPress={handleDelete} className="p-2">
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                        </Pressable>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                <View className="items-center mb-8">
                    <View
                        className="w-32 h-32 rounded-full items-center justify-center mb-4 shadow-lg"
                        style={{ backgroundColor: category.customImage ? 'transparent' : category.color }}
                    >
                        {category.customImage ? (
                            <Image
                                source={{ uri: category.customImage }}
                                className="w-32 h-32 rounded-full border-4 border-white"
                                resizeMode="cover"
                            />
                        ) : (
                            <MaterialCommunityIcons name={category.icon as any} size={64} color="#fff" />
                        )}
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{category.name}</Text>
                    <View className={`px-3 py-1 rounded-full ${category.type === 'income' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <Text className={`font-medium ${category.type === 'income' ? 'text-green-700' : 'text-orange-700'}`}>
                            {category.type === 'both' ? 'Ingreso / Gasto' : category.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Text>
                    </View>
                </View>

                <View className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm mb-6">
                    <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Estadísticas</Text>

                    <View className="flex-row justify-between mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                        <Text className="text-gray-500">Transacciones</Text>
                        <Text className="font-bold text-gray-900 dark:text-white">{usageCount}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-gray-500">Total Movido</Text>
                        <Text className="font-bold text-gray-900 dark:text-white">${totalAmount.toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
