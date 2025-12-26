import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettingsStore } from '@/store/settings-store';
import { Category } from '@/types';

export default function CategoriesScreen() {
    const router = useRouter();
    const { categories, deleteCategory } = useSettingsStore();

    const handleAdd = () => {
        router.push('/categories/form');
    };

    const handleEdit = (id: string) => {
        router.push(`/categories/form?id=${id}`);
    };

    const handleDetail = (id: string) => {
        router.push(`/categories/${id}`);
    };

    const renderItem = ({ item }: { item: Category }) => (
        <Pressable
            onPress={() => handleDetail(item.id)}
            className="flex-row items-center p-4 bg-white dark:bg-dark-card mb-4 rounded-xl mx-4  border border-gray-200 dark:border-gray-500"
        >
            <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: item.customImage ? 'transparent' : item.color }}
            >
                {item.customImage ? (
                    <Image
                        source={{ uri: item.customImage }}
                        className="w-12 h-12 rounded-full"
                        resizeMode="cover"
                    />
                ) : (
                    <MaterialCommunityIcons name={item.icon as any} size={24} color="#fff" />
                )}
            </View>
            <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {item.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {item.type === 'both' ? 'Ingreso / Gasto' : item.type === 'income' ? 'Ingreso' : 'Gasto'}
                </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['top']}>
            <View className="flex-row items-center justify-between px-4 py-4">
                <Pressable onPress={() => router.back()} className="p-2">
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" className="dark:text-white" />
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    Categorías
                </Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 100 }}
            />

            <View className="absolute bottom-8 right-6">
                <Pressable
                    onPress={handleAdd}
                    className="w-14 h-14 bg-primary-500 rounded-full items-center justify-center shadow-lg"
                >
                    <MaterialCommunityIcons name="plus" size={30} color="#fff" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
