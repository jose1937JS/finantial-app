import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { useTransactionStore } from '@/store/transaction-store';
import type { Notification } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

// Mock notifications based on loans due
export default function NotificationsScreen() {
    const { getLoansDue, transactions } = useTransactionStore();

    const loansDue = getLoansDue();

    // Create notifications from loans due
    const notifications: Notification[] = loansDue.map((loan) => ({
        id: `loan-${loan.id}`,
        type: 'loan_due',
        title: 'Préstamo por vencer',
        message: `El préstamo a ${loan.loan?.debtorName} ${loan.loan?.debtorLastName} de ${formatCurrency(loan.amount, loan.currency)} vence ${formatDate(loan.loan?.dueDate || '', 'relative')}`,
        date: loan.loan?.dueDate || '',
        isRead: false,
        relatedId: loan.id,
    }));

    // Add mock budget notification
    const mockNotifications: Notification[] = [
        ...notifications,
        {
            id: 'budget-1',
            type: 'budget_limit',
            title: 'Límite de presupuesto',
            message: 'Has alcanzado el 80% de tu presupuesto mensual en Entretenimiento',
            date: new Date().toISOString(),
            isRead: true,
            relatedId: undefined,
        },
        {
            id: 'reminder-1',
            type: 'reminder',
            title: 'Recordatorio',
            message: 'No olvides registrar tus gastos del día',
            date: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
            relatedId: undefined,
        },
    ];

    const getIconByType = (type: Notification['type']) => {
        switch (type) {
            case 'loan_due':
                return { name: 'hand-coin' as const, color: '#f59e0b', bg: '#f59e0b20' };
            case 'budget_limit':
                return { name: 'alert-circle' as const, color: '#ef4444', bg: '#ef444420' };
            case 'reminder':
                return { name: 'bell-ring' as const, color: '#3b82f6', bg: '#3b82f620' };
            default:
                return { name: 'information' as const, color: '#6b7280', bg: '#6b728020' };
        }
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-light-bg dark:bg-dark-bg">
            {/* Header */}
            <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    Notificaciones
                </Text>
                {mockNotifications.length > 0 && (
                    <Pressable>
                        <Text className="text-sm text-primary-500 font-medium">
                            Marcar como leídas
                        </Text>
                    </Pressable>
                )}
            </View>

            <FlatList
                data={mockNotifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const icon = getIconByType(item.type);
                    return (
                        <Pressable className="mb-3 active:opacity-80">
                            <Card
                                variant={item.isRead ? 'default' : 'elevated'}
                                className={`${!item.isRead ? 'border-l-4 border-l-primary-500' : ''}`}
                            >
                                <View className="flex-row">
                                    {/* Icon */}
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                        style={{ backgroundColor: icon.bg }}
                                    >
                                        <MaterialCommunityIcons
                                            name={icon.name}
                                            size={24}
                                            color={icon.color}
                                        />
                                    </View>

                                    {/* Content */}
                                    <View className="flex-1">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className={`text-base font-semibold ${item.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                                {item.title}
                                            </Text>
                                            {!item.isRead && (
                                                <View className="w-2 h-2 rounded-full bg-primary-500" />
                                            )}
                                        </View>
                                        <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            {item.message}
                                        </Text>
                                        <Text className="text-xs text-gray-400 dark:text-gray-500">
                                            {formatDate(item.date, 'relative')}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        </Pressable>
                    );
                }}
                ListEmptyComponent={() => (
                    <View className="items-center py-16">
                        <MaterialCommunityIcons
                            name="bell-check-outline"
                            size={64}
                            color="#9ca3af"
                        />
                        <Text className="text-base text-gray-500 dark:text-gray-400 mt-4 text-center">
                            No tienes notificaciones
                        </Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
