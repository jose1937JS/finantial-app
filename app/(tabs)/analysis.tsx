import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useTransactionStore } from '@/store/transaction-store';
import type { PieChartData } from '@/types';

type DateFilter = '7d' | '1m' | '1y';

// Mock exchange rate data
const mockExchangeRates = {
    '7d': [
        { value: 36.5, date: '2024-12-19', label: '19' },
        { value: 36.8, date: '2024-12-20', label: '20' },
        { value: 36.7, date: '2024-12-21', label: '21' },
        { value: 37.0, date: '2024-12-22', label: '22' },
        { value: 37.2, date: '2024-12-23', label: '23' },
        { value: 37.1, date: '2024-12-24', label: '24' },
        { value: 37.3, date: '2024-12-25', label: '25' },
    ],
    '1m': [
        { value: 35.0, date: '2024-11-25', label: 'Nov 25' },
        { value: 35.5, date: '2024-12-01', label: 'Dic 1' },
        { value: 36.0, date: '2024-12-08', label: 'Dic 8' },
        { value: 36.5, date: '2024-12-15', label: 'Dic 15' },
        { value: 37.3, date: '2024-12-25', label: 'Dic 25' },
    ],
    '1y': [
        { value: 28.0, date: '2024-01-01', label: 'Ene' },
        { value: 30.0, date: '2024-03-01', label: 'Mar' },
        { value: 32.0, date: '2024-06-01', label: 'Jun' },
        { value: 35.0, date: '2024-09-01', label: 'Sep' },
        { value: 37.3, date: '2024-12-01', label: 'Dic' },
    ],
};

const categoryColors: Record<string, string> = {
    'Comida': '#f97316',
    'Transporte': '#3b82f6',
    'Entretenimiento': '#ec4899',
    'Compras': '#eab308',
    'Salud': '#ef4444',
    'Servicios': '#0ea5e9',
    'Préstamo': '#f59e0b',
    'Otros': '#71717a',
};

export default function AnalysisScreen() {
    const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
    const { transactions } = useTransactionStore();

    // Calculate expense breakdown by category
    const categoryData = useMemo((): PieChartData[] => {
        const expenses = transactions.filter(t => t.type === 'expense' || t.type === 'loan');
        const categoryTotals: Record<string, number> = {};

        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

        return Object.entries(categoryTotals).map(([category, value]) => ({
            label: category,
            value,
            color: categoryColors[category] || '#71717a',
            percentage: total > 0 ? (value / total) * 100 : 0,
        }));
    }, [transactions]);

    const exchangeData = mockExchangeRates[dateFilter];

    const dateFilters: { label: string; value: DateFilter }[] = [
        { label: '7 días', value: '7d' },
        { label: '1 mes', value: '1m' },
        { label: '1 año', value: '1y' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Análisis
                </Text>

                {/* Category Breakdown */}
                <View className="mb-6">
                    {categoryData.length > 0 ? (
                        <PieChart
                            data={categoryData}
                            title="Gastos por Categoría"
                            showLegend
                        />
                    ) : (
                        <Card variant="elevated">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Gastos por Categoría
                            </Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-center py-8">
                                No hay datos de gastos para mostrar
                            </Text>
                        </Card>
                    )}
                </View>

                {/* Exchange Rate Section */}
                <View className="mb-6">
                    <Card variant="elevated">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">
                                Tipo de Cambio USD/VES
                            </Text>
                            <Text className="text-2xl font-bold text-primary-500">
                                Bs. {exchangeData[exchangeData.length - 1].value.toFixed(2)}
                            </Text>
                        </View>

                        {/* Date Filters */}
                        <View className="flex-row gap-2 mb-4">
                            {dateFilters.map((filter) => (
                                <Chip
                                    key={filter.value}
                                    label={filter.label}
                                    selected={dateFilter === filter.value}
                                    onPress={() => setDateFilter(filter.value)}
                                    size="sm"
                                />
                            ))}
                        </View>

                        {/* Line Chart */}
                        <LineChart
                            data={exchangeData}
                            color="#22c55e"
                            showArea
                        />
                    </Card>
                </View>

                {/* USDT Rate */}
                <Card variant="elevated">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                USDT/VES
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                Tasa de mercado
                            </Text>
                        </View>
                        <Text className="text-xl font-bold text-accent-blue">
                            Bs. 37.50
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
