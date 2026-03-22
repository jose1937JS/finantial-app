import type { PieChartData } from '@/types';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { PieChart as GiftedPieChart } from 'react-native-gifted-charts';

interface PieChartProps {
    data: PieChartData[];
    title?: string;
    showLegend?: boolean;
}

export function PieChart({ data, title, showLegend = true }: PieChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const chartRadius = (screenWidth - 80) / 3;

    const pieData = data.map((item) => ({
        value: item.value,
        color: item.color,
        text: `${item.percentage.toFixed(0)}%`,
        focused: false,
    }));

    return (
        <View className="bg-white dark:bg-dark-card rounded-3xl p-6">
            {title && (
                <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                    {title}
                </Text>
            )}

            <View className="items-center">
                <GiftedPieChart
                    data={pieData}
                    donut
                    radius={chartRadius}
                    innerRadius={chartRadius * 0.6}
                    innerCircleColor="#fff"
                    centerLabelComponent={() => (
                        <View className="items-center">
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                Total
                            </Text>
                            <Text className="text-xl font-bold text-gray-700 dark:text-white">
                                100%
                            </Text>
                        </View>
                    )}
                />
            </View>

            {showLegend && (
                <View className="mt-4 flex-row flex-wrap justify-center gap-4">
                    {data.map((item, index) => (
                        <View key={index} className="flex-row items-center">
                            <View
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: item.color }}
                            />
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                {item.label} ({item.percentage.toFixed(0)}%)
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}
