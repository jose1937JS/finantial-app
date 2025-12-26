import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';
import { useTransactionStore } from '@/store/transaction-store';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { transactions, deleteTransaction } = useTransactionStore();
    const primaryColor = useThemeColor({}, 'tint');

    const transaction = transactions.find(t => t.id === id);

    if (!transaction) {
        return (
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg items-center justify-center p-4">
                <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#9ca3af" />
                <Text className="text-lg text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Transacción no encontrada
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-6 px-6 py-3 bg-gray-200 dark:bg-gray-800 rounded-full"
                >
                    <Text className="text-gray-900 dark:text-white font-medium">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            "Eliminar Transacción",
            "¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        deleteTransaction(id);
                        router.back();
                    }
                }
            ]
        );
    };

    const getIcon = () => {
        if (transaction.type === 'loan') return 'hand-coin';
        if (transaction.type === 'income') return 'arrow-down-circle';
        return 'arrow-up-circle';
    };

    const getColor = () => {
        if (transaction.type === 'income') return '#22c55e';
        if (transaction.type === 'expense') return '#ef4444';
        return '#f59e0b';
    };

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Detalle de Transacción',
                    headerBackTitle: 'Volver',
                    // headerTintColor: primaryColor,
                    headerStyle: { backgroundColor: 'transparent' },
                    headerTransparent: true,
                    headerBlurEffect: 'regular',
                }}
            />

            <ScrollView
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                className="mt-14"
            >
                {/* Header Card */}
                <View className="items-center mb-8">
                    <View
                        className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-sm"
                        style={{ backgroundColor: `${getColor()}15` }}
                    >
                        <MaterialCommunityIcons name={getIcon()} size={40} color={getColor()} />
                    </View>
                    <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                    <Text className="text-base text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                        {transaction.type === 'income' ? 'Ingreso' : transaction.type === 'expense' ? 'Gasto' : 'Préstamo'}
                    </Text>
                </View>

                {/* Main Details */}
                <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm mb-6">
                    <DetailItem
                        icon="calendar"
                        label="Fecha"
                        value={formatDate(transaction.date, 'long')}
                    />
                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                    <DetailItem
                        icon="tag-outline"
                        label="Categoría"
                        value={transaction.category}
                    />
                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                    <DetailItem
                        icon="text-short"
                        label="Descripción"
                        value={transaction.description || 'Sin descripción'}
                    />
                </View>

                {/* Loan Specific Details */}
                {transaction.type === 'loan' && transaction.loan && (
                    <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm mb-6">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Información del Préstamo
                        </Text>

                        <DetailItem
                            icon="account-outline"
                            label="Deudor"
                            value={`${transaction.loan.debtorName} ${transaction.loan.debtorLastName}`}
                        />
                        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

                        <DetailItem
                            icon="calendar-clock"
                            label="Fecha de Vencimiento"
                            value={formatDate(transaction.loan.dueDate, 'short')}
                            valueStyle={new Date(transaction.loan.dueDate) < new Date() && !transaction.loan.isPaid ? 'text-red-500 font-bold' : ''}
                        />
                        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

                        <DetailItem
                            icon="percent-outline"
                            label="Tasa de Interés"
                            value={`${transaction.loan.interestRate}%`}
                        />
                        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />

                        <DetailItem
                            icon="checkbox-marked-circle-outline"
                            label="Estado"
                            value={transaction.loan.isPaid ? 'Pagado' : 'Pendiente'}
                            valueStyle={transaction.loan.isPaid ? 'text-green-500 font-bold' : 'text-orange-500 font-bold'}
                        />
                    </View>
                )}

                {/* Actions */}
                <TouchableOpacity
                    onPress={handleDelete}
                    className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 active:opacity-70"
                >
                    <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                    <Text className="ml-2 text-red-500 font-semibold text-lg">Eliminar Transacción</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const DetailItem = ({
    icon,
    label,
    value,
    valueStyle = ''
}: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
    valueStyle?: string;
}) => (
    <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
                <MaterialCommunityIcons name={icon} size={20} color="#6b7280" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 font-medium">
                {label}
            </Text>
        </View>
        <Text className={`text-gray-900 dark:text-white font-semibold text-right flex-1 ml-4 ${valueStyle}`}>
            {value}
        </Text>
    </View>
);
