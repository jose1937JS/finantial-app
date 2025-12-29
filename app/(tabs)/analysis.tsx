import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import type { PieChartData } from '@/types';

type DateFilter = '7d' | '1m' | '1y';

// Mock exchange rate data
const mockExchangeRates = {
    BCV_USD: {
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
    },
    BCV_EUR: {
        '7d': [
            { value: 39.5, date: '2024-12-19', label: '19' },
            { value: 39.8, date: '2024-12-20', label: '20' },
            { value: 39.7, date: '2024-12-21', label: '21' },
            { value: 40.0, date: '2024-12-22', label: '22' },
            { value: 40.2, date: '2024-12-23', label: '23' },
            { value: 40.1, date: '2024-12-24', label: '24' },
            { value: 40.3, date: '2024-12-25', label: '25' },
        ],
        '1m': [
            { value: 38.0, date: '2024-11-25', label: 'Nov 25' },
            { value: 38.5, date: '2024-12-01', label: 'Dic 1' },
            { value: 39.0, date: '2024-12-08', label: 'Dic 8' },
            { value: 39.5, date: '2024-12-15', label: 'Dic 15' },
            { value: 40.3, date: '2024-12-25', label: 'Dic 25' },
        ],
        '1y': [
            { value: 30.0, date: '2024-01-01', label: 'Ene' },
            { value: 32.0, date: '2024-03-01', label: 'Mar' },
            { value: 34.0, date: '2024-06-01', label: 'Jun' },
            { value: 37.0, date: '2024-09-01', label: 'Sep' },
            { value: 40.3, date: '2024-12-01', label: 'Dic' },
        ],
    },
    Binance: {
        '7d': [
            { value: 42.5, date: '2024-12-19', label: '19' },
            { value: 42.8, date: '2024-12-20', label: '20' },
            { value: 42.7, date: '2024-12-21', label: '21' },
            { value: 43.0, date: '2024-12-22', label: '22' },
            { value: 43.2, date: '2024-12-23', label: '23' },
            { value: 43.1, date: '2024-12-24', label: '24' },
            { value: 43.3, date: '2024-12-25', label: '25' },
        ],
        '1m': [
            { value: 41.0, date: '2024-11-25', label: 'Nov 25' },
            { value: 41.5, date: '2024-12-01', label: 'Dic 1' },
            { value: 42.0, date: '2024-12-08', label: 'Dic 8' },
            { value: 42.5, date: '2024-12-15', label: 'Dic 15' },
            { value: 43.3, date: '2024-12-25', label: 'Dic 25' },
        ],
        '1y': [
            { value: 33.0, date: '2024-01-01', label: 'Ene' },
            { value: 35.0, date: '2024-03-01', label: 'Mar' },
            { value: 37.0, date: '2024-06-01', label: 'Jun' },
            { value: 40.0, date: '2024-09-01', label: 'Sep' },
            { value: 43.3, date: '2024-12-01', label: 'Dic' },
        ],
    },
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
    const { exchangeRates } = useSettingsStore();
    const primaryColor = useThemeColor({}, 'tint');

    // Calculate income vs expenses for comparison chart
    const comparisonData = useMemo(() => {
        // Aggregate by date
        const incomeMap: Record<string, number> = {};
        const expenseMap: Record<string, number> = {};
        const labels: string[] = [];

        // For the sake of this mock/period, let's get last 7 days keys
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const label = d.getDate().toString();
            labels.push(label);
            incomeMap[dateStr] = 0;
            expenseMap[dateStr] = 0;
        }

        transactions.forEach(t => {
            const dateStr = t.date.split('T')[0];
            if (incomeMap[dateStr] !== undefined) {
                if (t.type === 'income') incomeMap[dateStr] += t.amount;
                else expenseMap[dateStr] += t.amount;
            }
        });

        const dates = Object.keys(incomeMap).sort();
        const incomeSeries = dates.map((d, i) => ({ value: incomeMap[d], date: d, label: labels[i] }));
        const expenseSeries = dates.map((d, i) => ({ value: expenseMap[d], date: d, label: labels[i] }));

        return { incomeSeries, expenseSeries };
    }, [transactions]);

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

                {/* Income vs Expenses Chart */}
                <View className="mb-6">
                    <LineChart
                        title="Ingresos vs Gastos (7d)"
                        series={[
                            { data: comparisonData.incomeSeries, color: '#22c55e', label: 'Ingresos', showArea: true },
                            { data: comparisonData.expenseSeries, color: '#ef4444', label: 'Gastos', showArea: true }
                        ]}
                    />
                </View>

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
                                Comparativa Tasas USD/VES
                            </Text>
                            <View>
                                <Text className="text-xs text-right text-gray-500">Última Ref. BCV</Text>
                                <Text className="text-xl font-bold text-primary-500">
                                    Bs. {exchangeRates.BCV_USD.toFixed(2)}
                                </Text>
                            </View>
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

                        {/* Line Chart Comparison */}
                        <LineChart
                            series={[
                                { data: mockExchangeRates.BCV_USD[dateFilter as DateFilter], color: primaryColor, label: 'BCV USD', showArea: false },
                                { data: mockExchangeRates.BCV_EUR[dateFilter as DateFilter], color: '#3b82f6', label: 'BCV EUR', showArea: false },
                                { data: mockExchangeRates.Binance[dateFilter as DateFilter], color: '#f59e0b', label: 'Binance', showArea: false }
                            ]}
                        />
                    </Card>
                </View>

                {/* Detailed Rates List */}
                <View className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Tasas de Cambio Actuales
                    </Text>

                    <Card variant="elevated" className="mb-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">BCV USD</Text>
                                <Text className="text-xs text-gray-500">Oficial (Dólar)</Text>
                            </View>
                            <Text className="text-lg font-bold text-primary-500">Bs. {exchangeRates.BCV_USD.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card variant="elevated" className="mb-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">BCV EUR</Text>
                                <Text className="text-xs text-gray-500">Oficial (Euro)</Text>
                            </View>
                            <Text className="text-lg font-bold text-blue-500">Bs. {exchangeRates.BCV_EUR.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card variant="elevated" className="mb-3">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">Binance P2P</Text>
                                <Text className="text-xs text-gray-500">Mercado Paralelo</Text>
                            </View>
                            <Text className="text-lg font-bold text-orange-500">Bs. {exchangeRates.Binance.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card variant="elevated">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900 dark:text-white">USDT/VES</Text>
                                <Text className="text-xs text-gray-500">Equivalente Digital</Text>
                            </View>
                            <Text className="text-lg font-bold text-accent-blue">Bs. {(exchangeRates.Binance * 1.02).toFixed(2)}</Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
