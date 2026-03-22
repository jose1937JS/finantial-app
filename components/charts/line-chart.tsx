import type { LineChartData } from '@/types';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';


interface LineSeries {
    data: LineChartData[];
    color: string;
    label?: string;
    showArea?: boolean;
}

interface LineChartProps {
    series: LineSeries[];
    title?: string;
    height?: number;
}

export function LineChart({
    series,
    title,
    height = 200
}: LineChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80;

    // We take labels from the first series
    const primarySeries = series[0];
    if (!primarySeries || primarySeries.data.length === 0) return null;

    // GiftedLineChart supports multi-series by passing data, data2, data3, etc.
    // For simplicity and since we usually won't have many, let's map them.
    const chartData = primarySeries.data.map(item => ({
        value: item.value,
        label: item.label,
        dataPointText: item.value.toFixed(2),
    }));

    const extraSeries = series.slice(1).map(s => s.data.map(item => ({
        value: item.value,
        dataPointText: item.value.toFixed(2),
    })));

    return (
        <View className="bg-white dark:bg-dark-card rounded-3xl p-6">
            {title && (
                <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                    {title}
                </Text>
            )}

            <View className="overflow-hidden">
                <GiftedLineChart
                    data={chartData}
                    data2={extraSeries[0]}
                    data3={extraSeries[1]}
                    width={chartWidth}
                    height={height}
                    spacing={chartWidth / (primarySeries.data.length - 1 || 1)}
                    initialSpacing={0}
                    color={primarySeries.color}
                    color2={series[1]?.color}
                    color3={series[2]?.color}
                    thickness={3}
                    startFillColor={primarySeries.showArea ? `${primarySeries.color}40` : 'transparent'}
                    endFillColor={primarySeries.showArea ? `${primarySeries.color}05` : 'transparent'}
                    startFillColor2={series[1]?.showArea ? `${series[1].color}40` : 'transparent'}
                    endFillColor2={series[1]?.showArea ? `${series[1].color}05` : 'transparent'}
                    startFillColor3={series[2]?.showArea ? `${series[2].color}40` : 'transparent'}
                    endFillColor3={series[2]?.showArea ? `${series[2].color}05` : 'transparent'}
                    startOpacity={0.9}
                    endOpacity={0.1}
                    noOfSections={4}
                    yAxisColor="transparent"
                    xAxisColor="#e5e7eb"
                    rulesColor="#e5e7eb"
                    yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    hideDataPoints={false}
                    dataPointsColor={primarySeries.color}
                    dataPointsColor2={series[1]?.color}
                    dataPointsColor3={series[2]?.color}
                    dataPointsRadius={4}
                    curved
                    areaChart={series.some(s => s.showArea)}
                />
            </View>

            {/* Legend */}
            {series.length > 1 && (
                <View className="mt-4 flex-row flex-wrap justify-center gap-4">
                    {series.map((s, idx) => s.label && (
                        <View key={idx} className="flex-row items-center">
                            <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }} />
                            <Text className="text-xs text-gray-600 dark:text-gray-400">{s.label}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
