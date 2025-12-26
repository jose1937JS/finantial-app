import type { LineChartData } from '@/types';
import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';

interface LineChartProps {
    data: LineChartData[];
    title?: string;
    color?: string;
    showArea?: boolean;
}

export function LineChart({
    data,
    title,
    color = '#22c55e',
    showArea = true
}: LineChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - 80;

    const lineData = data.map((item) => ({
        value: item.value,
        label: item.label,
        dataPointText: item.value.toFixed(2),
    }));

    return (
        <View className="bg-white dark:bg-dark-card rounded-3xl p-6">
            {title && (
                <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                </Text>
            )}

            <View className="overflow-hidden">
                <GiftedLineChart
                    data={lineData}
                    width={chartWidth}
                    height={200}
                    spacing={chartWidth / (data.length - 1 || 1)}
                    initialSpacing={0}
                    color={color}
                    thickness={3}
                    startFillColor={showArea ? `${color}40` : 'transparent'}
                    endFillColor={showArea ? `${color}05` : 'transparent'}
                    startOpacity={0.9}
                    endOpacity={0.1}
                    noOfSections={4}
                    yAxisColor="transparent"
                    xAxisColor="#e5e7eb"
                    rulesColor="#e5e7eb"
                    yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 10 }}
                    hideDataPoints={false}
                    dataPointsColor={color}
                    dataPointsRadius={4}
                    curved
                    areaChart={showArea}
                />
            </View>
        </View>
    );
}
