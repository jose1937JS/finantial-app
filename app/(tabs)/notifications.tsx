import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationService } from '@/api/services/notification.service';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/utils/format';

// Use API Notification type directly since it has the same shape
interface AppNotification {
    id: string | number;
    type: 'income' | 'expense' | 'loan' | string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadNotifications = useCallback(async (refresh = false) => {
        if (refresh) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
        try {
            const data = await NotificationService.getAll();
            setNotifications(data as AppNotification[]);
        } catch (error) {
            console.error('loadNotifications error:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('markAllAsRead error:', error);
        }
    };

    const getIconByType = (type: string) => {
        switch (type) {
            case 'loan':
                return { name: 'hand-coin' as const, color: '#f59e0b', bg: '#f59e0b20' };
            case 'expense':
                return { name: 'alert-circle' as const, color: '#ef4444', bg: '#ef444420' };
            case 'income':
                return { name: 'cash-plus' as const, color: '#22c55e', bg: '#22c55e20' };
            default:
                return { name: 'bell-ring' as const, color: '#3b82f6', bg: '#3b82f620' };
        }
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-light-bg dark:bg-dark-bg">
            {/* Header */}
            <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-700 dark:text-white">
                    Notificaciones
                </Text>
                {notifications.length > 0 && (
                    <Pressable onPress={handleMarkAllRead}>
                        <Text className="text-sm text-primary-500 font-medium">
                            Marcar como leídas
                        </Text>
                    </Pressable>
                )}
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#22c55e" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 20, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={() => loadNotifications(true)}
                            tintColor="#22c55e"
                            colors={['#22c55e']}
                        />
                    }
                    renderItem={({ item }) => {
                        const icon = getIconByType(item.type);
                        return (
                            <Pressable className="mb-4 active:opacity-80">
                                <Card
                                    className={`${!item.isRead ? 'border-l-4 border-l-primary-500' : ''} shadow-sm shadow-slate-200 dark:shadow-slate-700`}
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
                                                <Text className={`text-base font-semibold ${item.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-700 dark:text-white'}`}>
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
                                                {formatDate(item.createdAt, 'relative')}
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
            )}
        </SafeAreaView>
    );
}
