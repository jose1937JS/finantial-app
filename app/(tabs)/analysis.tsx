import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChartService } from '@/api/services/chart.service';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { useThemeColor } from '@/hooks/use-theme-color';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import type { PieChartData } from '@/types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
    const { exchangeRates, fetchRates } = useSettingsStore();
    const primaryColor = useThemeColor({}, 'tint');

    // Chart data from API
    const [incomeExpenseData, setIncomeExpenseData] = useState<{ incomeSeries: any[]; expenseSeries: any[] } | null>(null);
    const [categoryChartData, setCategoryChartData] = useState<PieChartData[] | null>(null);
    const [timelineData, setTimelineData] = useState<any>(null);
    const [isLoadingCharts, setIsLoadingCharts] = useState(false);

    const { preferences } = useSettingsStore();
    const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

    const loadCharts = useCallback(async () => {
        setIsLoadingCharts(true);
        try {
            const [ieData, catData] = await Promise.all([
                ChartService.getIncomeExpense(),
                ChartService.getExpensesByCategory(),
            ]);
            // Map income/expense response to series format
            if (Array.isArray(ieData)) {
                const incomeSeries = ieData.map((d: any) => ({ value: Number(d.income ?? 0), date: d.date, label: d.label ?? d.date }));
                const expenseSeries = ieData.map((d: any) => ({ value: Number(d.expense ?? d.expenses ?? 0), date: d.date, label: d.label ?? d.date }));
                setIncomeExpenseData({ incomeSeries, expenseSeries });
            }
            // Map category response to PieChartData
            if (Array.isArray(catData)) {
                const total = catData.reduce((a: number, c: any) => a + Number(c.total ?? c.amount ?? 0), 0);
                const mapped: PieChartData[] = catData.map((c: any) => ({
                    label: c.category ?? c.name ?? 'Otros',
                    value: Number(c.total ?? c.amount ?? 0),
                    color: categoryColors[c.category ?? c.name] ?? '#71717a',
                    percentage: total > 0 ? (Number(c.total ?? c.amount ?? 0) / total) * 100 : 0,
                }));
                setCategoryChartData(mapped);
            }
        } catch (error) {
            console.error('Chart data error:', error);
        } finally {
            setIsLoadingCharts(false);
        }
    }, []);

    const loadTimeline = useCallback(async () => {
        try {
            const data = await ChartService.getTimeline(dateFilter);
            setTimelineData(data);
        } catch (err) {
            console.error('Timeline error:', err);
        }
    }, [dateFilter]);

    useEffect(() => {
        loadCharts();
    }, [loadCharts]);

    useEffect(() => {
        loadTimeline();
    }, [loadTimeline]);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const start = Date.now();
        await Promise.all([
            loadCharts(),
            loadTimeline(),
            fetchRates(),
        ]);
        const elapsed = Date.now() - start;
        if (elapsed < 1000) {
            await new Promise(res => setTimeout(res, 1000 - elapsed));
        }
        setRefreshing(false);
    }, [loadCharts, loadTimeline, fetchRates]);

    // Fallback: compute locally from transactions if API returns no data
    const localComparisonData = useMemo(() => {
        const incomeMap: Record<string, number> = {};
        const expenseMap: Record<string, number> = {};
        const labels: string[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            labels.push(d.getDate().toString());
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
        return {
            incomeSeries: dates.map((d, i) => ({ value: incomeMap[d], date: d, label: labels[i] })),
            expenseSeries: dates.map((d, i) => ({ value: expenseMap[d], date: d, label: labels[i] })),
        };
    }, [transactions]);

    const localCategoryData = useMemo((): PieChartData[] => {
        const expenses = transactions.filter(t => t.type === 'expense' || t.type === 'loan');
        const categoryTotals: Record<string, number> = {};
        expenses.forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount; });
        const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
        return Object.entries(categoryTotals).map(([category, value]) => ({
            label: category,
            value,
            color: categoryColors[category] || '#71717a',
            percentage: total > 0 ? (value / total) * 100 : 0,
        }));
    }, [transactions]);

    const comparisonData = incomeExpenseData ?? localComparisonData;
    const categoryData = categoryChartData ?? localCategoryData;


    const dateFilters: { label: string; value: DateFilter }[] = [
        { label: '7 días', value: '7d' },
        { label: '1 mes', value: '1m' },
        { label: '1 año', value: '1y' },
    ];

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-light-bg dark:bg-dark-bg">
            {/* Header */}
            <View className="px-5">
                <View className='flex-row items-center gap-3 mb-1'>
                    <View className='w-10 h-10 rounded-full bg-primary-500/10 dark:bg-dark-surface items-center justify-center'>
                        <MaterialCommunityIcons name='chart-line' size={18} color={currentPrimaryColor} />
                    </View>
                    <Text className="text-3xl font-bold text-gray-700 dark:text-white">
                        Análisis
                    </Text>
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Aquí puedes analizar tus transacciones!
                </Text>
            </View>
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[primaryColor]}
                        tintColor={primaryColor}
                    />
                }
            >
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
                        <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                            <Text className="text-lg font-bold text-gray-700 dark:text-white mb-2">
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
                    <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-gray-700 dark:text-white">
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
                    <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                        Tasas de Cambio Actuales
                    </Text>

                    <Card className="mb-3 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-700 dark:text-white">BCV USD</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">Oficial (Dólar)</Text>
                            </View>
                            <Text className="text-lg font-bold text-primary-500">Bs. {exchangeRates.BCV_USD.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card className="mb-3 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-700 dark:text-white">BCV EUR</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">Oficial (Euro)</Text>
                            </View>
                            <Text className="text-lg font-bold text-blue-500">Bs. {exchangeRates.BCV_EUR.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card className="mb-3 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-700 dark:text-white">Binance P2P</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">Mercado Paralelo</Text>
                            </View>
                            <Text className="text-lg font-bold text-orange-500">Bs. {exchangeRates.Binance.toFixed(2)}</Text>
                        </View>
                    </Card>

                    <Card className="mb-3 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-700 dark:text-white">USDT/VES</Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">Equivalente Digital</Text>
                            </View>
                            <Text className="text-lg font-bold text-accent-blue">Bs. {(exchangeRates.Binance * 1.02).toFixed(2)}</Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
