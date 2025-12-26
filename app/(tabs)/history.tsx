import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionItem } from '@/components/transaction-item';
import { Chip } from '@/components/ui/chip';
import { useTransactionStore } from '@/store/transaction-store';
import type { TransactionType } from '@/types';

type FilterType = 'all' | TransactionType;

export default function HistoryScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    const { transactions, setFilters, getFilteredTransactions } = useTransactionStore();

    const filteredTransactions = useMemo(() => {
        let filtered = [...transactions];

        // Apply type filter
        if (activeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === activeFilter);
        }

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(query) ||
                t.category.toLowerCase().includes(query)
            );
        }

        // Sort by date
        return filtered.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }, [transactions, activeFilter, searchQuery]);

    const filters: { label: string; value: FilterType }[] = [
        { label: 'Todos', value: 'all' },
        { label: 'Ingresos', value: 'income' },
        { label: 'Gastos', value: 'expense' },
        { label: 'Préstamos', value: 'loan' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
            {/* Header */}
            <View className="px-5 pt-4 pb-2">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Historial
                </Text>

                {/* Search Bar */}
                <View className="flex-row items-center bg-light-surface dark:bg-dark-surface rounded-2xl px-4 mb-4">
                    <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 py-4 px-3 text-base text-gray-900 dark:text-white"
                        placeholder="Buscar transacciones..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="#9ca3af" />
                        </Pressable>
                    )}
                </View>

                {/* Filter Chips */}
                <View className="flex-row gap-2 mb-2">
                    {filters.map((filter) => (
                        <Chip
                            key={filter.value}
                            label={filter.label}
                            selected={activeFilter === filter.value}
                            onPress={() => setActiveFilter(filter.value)}
                            variant={
                                filter.value === 'income' ? 'income' :
                                    filter.value === 'expense' || filter.value === 'loan' ? 'expense' :
                                        'default'
                            }
                        />
                    ))}
                </View>
            </View>

            {/* Transaction List */}
            <FlatList
                data={filteredTransactions}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TransactionItem
                        transaction={item}
                        onPress={() => {/* Navigate to detail */ }}
                    />
                )}
                ListEmptyComponent={() => (
                    <View className="items-center py-16">
                        <MaterialCommunityIcons
                            name="magnify-close"
                            size={64}
                            color="#9ca3af"
                        />
                        <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
                            No se encontraron transacciones
                        </Text>
                    </View>
                )}
                ListFooterComponent={() => (
                    <View className="h-4" />
                )}
            />
        </SafeAreaView>
    );
}
