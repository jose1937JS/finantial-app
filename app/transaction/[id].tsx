import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { CustomHeader } from '@/components/ui/custom-header';
import { DatePickerModal, DatePickerTrigger } from '@/components/ui/date-picker-modal';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import { Currency, ExchangeRateSource } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { transactions, deleteTransaction, addLoanPayment, updateTransaction } = useTransactionStore();
    const { exchangeRates } = useSettingsStore();
    const primaryColor = useThemeColor({}, 'tint');
    const { showAlert } = useAlert();
    // Payment Form State
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [paymentAmount, setPaymentAmount] = React.useState('');
    const [paymentCurrency, setPaymentCurrency] = React.useState<Currency>('USD');
    const [rateSource, setRateSource] = React.useState<ExchangeRateSource>('BCV_USD');
    const [customRate, setCustomRate] = React.useState('');
    const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = React.useState(false);

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
                    <Text className="text-gray-700 dark:text-white font-medium">Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleDelete = () => {
        showAlert({
            title: 'Eliminar Transacción',
            message: '¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.',
            icon: 'trash-can-outline',
            iconColor: '#ef4444',
            buttons: [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        deleteTransaction(id);
                        router.back();
                    }
                }
            ]
        });
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

    // Interest Calculation
    const calculateInterest = (principal: number, rate: number) => principal * (rate / 100);
    const interestAmount = transaction.loan ? calculateInterest(transaction.amount, transaction.loan.interestRate) : 0;
    const totalAmount = transaction.amount + interestAmount;

    // VES Calculation (if applicable)
    const isVES = (transaction.amountInVES || 0) > 0;
    const amountVES = transaction.amountInVES || 0;
    const interestAmountVES = transaction.loan ? calculateInterest(amountVES, transaction.loan.interestRate) : 0;
    const totalAmountVES = amountVES + interestAmountVES;

    // Repayment Logic
    const payments = transaction.loan?.payments || [];
    const totalPaidUSD = payments.reduce((acc, p) => acc + p.amount, 0);
    const remainingBalanceUSD = totalAmount - totalPaidUSD;
    const isFullyPaid = totalPaidUSD >= totalAmount - 0.01;

    // Repayment Logic VES
    const totalPaidVES = payments.reduce((acc, p) => acc + (p.currency === 'VES' ? (p.amount * (p.rate || 1)) : 0), 0);
    // Note: We don't really have a strict remainingBalanceVES if the debt is pegged to USD,
    // but we can estimate it based on the current rate if original was VES.
    const currentRate = exchangeRates.BCV_USD;
    const estimatedRemainingVES = remainingBalanceUSD * (transaction.rate || currentRate);

    // Modal Rates Calculation
    const effectiveRate = paymentCurrency === 'USD'
        ? 1
        : (rateSource === 'Custom' ? parseFloat(customRate) || 0 : exchangeRates[rateSource as keyof typeof exchangeRates] || 0);

    const calculatedUSD = (paymentCurrency === 'VES' && effectiveRate > 0)
        ? (parseFloat(paymentAmount) / effectiveRate).toFixed(2)
        : paymentAmount;

    const handleAddPayment = () => {
        const amountVAL = paymentCurrency === 'VES' ? parseFloat(calculatedUSD) : parseFloat(paymentAmount);

        if (isNaN(amountVAL) || amountVAL <= 0) {
            showAlert({ title: 'Error', message: 'Por favor ingresa un monto válido', icon: 'alert-circle', iconColor: '#ef4444' });
            return;
        }

        if (amountVAL > remainingBalanceUSD + 0.01) {
            showAlert({ title: 'Error', message: `El pago excede la deuda restante (${formatCurrency(remainingBalanceUSD, 'USD')})`, icon: 'alert-circle', iconColor: '#ef4444' });
            return;
        }

        addLoanPayment(transaction.id, {
            id: Date.now().toString(),
            amount: amountVAL,
            currency: paymentCurrency,
            rate: paymentCurrency === 'VES' ? effectiveRate : undefined,
            date: (() => {
                const d = new Date(paymentDate);
                d.setHours(12, 0, 0, 0);
                return d.toISOString();
            })()
        });

        // Reset form
        setPaymentAmount('');
        setCustomRate('');
        setShowPaymentModal(false);
    };

    const handleMarkAsPaid = () => {
        if (!isFullyPaid) {
            showAlert({ title: 'Aviso', message: 'El préstamo aún no ha sido pagado en su totalidad', icon: 'information' });
            return;
        }
        updateTransaction(transaction.id, {
            loan: {
                ...transaction.loan!,
                isPaid: true
            }
        });
    };

    return (
        <>
            <CustomHeader title="Detalle de Transacción" />
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>

                <ScrollView
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Card */}
                    <View className="items-center mb-8">
                        <View
                            className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-sm"
                            style={{ backgroundColor: `${getColor()}15` }}
                        >
                            <MaterialCommunityIcons name={getIcon()} size={40} color={getColor()} />
                        </View>
                        <Text className="text-3xl font-bold text-gray-700 dark:text-white mb-1">
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
                            <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
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

                    {/* Financial Details (Interest & Totals) */}
                    {transaction.type === 'loan' && transaction.loan && (
                        <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm mb-6">
                            <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                                Desglose Financiero ({isVES ? 'VES & USD' : 'USD'})
                            </Text>

                            {/* USD Calculations */}
                            <DetailItem
                                icon="cash"
                                label="Monto Prestado (USD)"
                                value={formatCurrency(transaction.amount, 'USD')}
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="trending-up"
                                label={`Interés (${transaction.loan.interestRate}%)`}
                                value={formatCurrency(interestAmount, 'USD')}
                                valueStyle="text-expense font-medium"
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="sigma"
                                label="Total a Pagar (USD)"
                                value={formatCurrency(totalAmount, 'USD')}
                                valueStyle="text-primary font-bold text-xl"
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="account-cash-outline"
                                label="Saldo Pendiente (USD)"
                                value={formatCurrency(remainingBalanceUSD, 'USD')}
                                valueStyle={remainingBalanceUSD > 0 ? "text-orange-500 font-bold text-xl" : "text-green-500 font-bold"}
                            />

                            {/* VES Calculations */}
                            {isVES && (
                                <>
                                    <View className="h-[1px] bg-gray-200 dark:bg-gray-700 my-6" />
                                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
                                        Detalles en Bolívares
                                    </Text>
                                    <DetailItem
                                        icon="cash-multiple"
                                        label="Monto Original"
                                        value={formatCurrency(amountVES, 'VES')}
                                    />
                                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                                    <DetailItem
                                        icon="swap-horizontal"
                                        label="Tasa de Cambio"
                                        value={formatCurrency(transaction.rate || 0, 'VES')}
                                    />
                                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                                    <DetailItem
                                        icon="trending-up"
                                        label="Interés (VES)"
                                        value={formatCurrency(interestAmountVES, 'VES')}
                                        valueStyle="text-expense font-medium"
                                    />
                                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                                    <DetailItem
                                        icon="sigma"
                                        label="Total a Pagar (VES)"
                                        value={formatCurrency(totalAmountVES, 'VES')}
                                        valueStyle="text-primary font-bold text-xl"
                                    />
                                    <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                                    <DetailItem
                                        icon="account-cash-outline"
                                        label="Saldo Pendiente (VES est.)"
                                        value={formatCurrency(estimatedRemainingVES, 'VES')}
                                        valueStyle={estimatedRemainingVES > 0 ? "text-orange-500 font-bold text-xl" : "text-green-500 font-bold"}
                                    />
                                </>
                            )}
                        </View>
                    )}

                    {/* Actions */}
                    {transaction.type === 'loan' && transaction.loan && (
                        <View className="gap-4">
                            {!transaction.loan.isPaid && (
                                <Button
                                    onPress={() => setShowPaymentModal(true)}
                                    variant="outline"
                                >
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="plus" size={20} color={primaryColor} />
                                        <Text className="ml-2 text-primary-500 font-semibold">Registrar Pago</Text>
                                    </View>
                                </Button>
                            )}

                            <Button
                                onPress={handleMarkAsPaid}
                                disabled={!isFullyPaid || transaction.loan.isPaid}
                                variant={transaction.loan.isPaid ? 'secondary' : 'primary'}
                            >
                                <View className="flex-row items-center">
                                    <MaterialCommunityIcons
                                        name={transaction.loan.isPaid ? 'check-circle' : 'check-all'}
                                        size={20}
                                        color={transaction.loan.isPaid ? '#6b7280' : '#fff'}
                                    />
                                    <Text className={`ml-2 font-semibold ${transaction.loan.isPaid ? 'text-gray-500' : 'text-white'}`}>
                                        {transaction.loan.isPaid ? 'Préstamo Finalizado' : 'Marcar como Pagado'}
                                    </Text>
                                </View>
                            </Button>
                        </View>
                    )}

                    {/* Payments History List */}
                    {transaction.type === 'loan' && payments.length > 0 && (
                        <View className="mt-8">
                            <Text className="text-xl font-bold text-gray-700 dark:text-white mb-4">
                                Historial de Pagos
                            </Text>
                            <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm">
                                {payments.map((p, index) => (
                                    <View key={p.id}>
                                        <View className="flex-row justify-between items-center py-2">
                                            <View>
                                                <Text className="text-gray-700 dark:text-white font-semibold">
                                                    {formatCurrency(p.amount, 'USD')}
                                                </Text>
                                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(p.date)}
                                                </Text>
                                            </View>
                                            {p.currency === 'VES' && (
                                                <View className="items-end">
                                                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                                                        Original: {formatCurrency(p.amount * (p.rate || 1), 'VES')}
                                                    </Text>
                                                    <Text className="text-[10px] text-gray-400">
                                                        Tasa: {p.rate}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        {index < payments.length - 1 && (
                                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-2" />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Payment Modal */}
                    <Modal
                        visible={showPaymentModal}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setShowPaymentModal(false)}
                    >
                        <TouchableOpacity
                            className="flex-1 bg-black/50 justify-center p-4"
                            activeOpacity={1}
                            onPress={() => setShowPaymentModal(false)}
                        >
                            <Pressable onPress={(e: any) => e.stopPropagation()}>
                                <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                                    <View className="p-4">
                                        <Text className="text-xl font-bold text-gray-700 dark:text-white mb-4">
                                            Registrar Devolución
                                        </Text>

                                        <View className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl mb-6">
                                            <Text className="text-orange-700 dark:text-orange-400 font-bold text-center">
                                                Deuda Restante: {formatCurrency(remainingBalanceUSD, 'USD')}
                                            </Text>
                                        </View>

                                        <Input
                                            label={paymentCurrency === 'VES' ? "Monto (VES)" : "Monto (USD)"}
                                            placeholder="0.00"
                                            value={paymentAmount}
                                            onChangeText={setPaymentAmount}
                                            keyboardType="decimal-pad"
                                            leftIcon="cash"
                                        />

                                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Moneda
                                        </Text>
                                        <View className="flex-row gap-2 mb-6">
                                            {['USD', 'VES'].map((c) => (
                                                <Chip
                                                    key={c}
                                                    label={c}
                                                    selected={paymentCurrency === c}
                                                    onPress={() => setPaymentCurrency(c as Currency)}
                                                />
                                            ))}
                                        </View>

                                        {paymentCurrency === 'VES' && (
                                            <>
                                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tasa de Cambio
                                                </Text>
                                                <View className="flex-row gap-2 mb-4">
                                                    {(['BCV_USD', 'Binance', 'Custom'] as ExchangeRateSource[]).map((source) => (
                                                        <Chip
                                                            key={source}
                                                            label={source === 'BCV_USD' ? 'BCV' : source}
                                                            selected={rateSource === source}
                                                            onPress={() => setRateSource(source)}
                                                        />
                                                    ))}
                                                </View>

                                                {rateSource === 'Custom' && (
                                                    <Input
                                                        label="Tasa Personalizada"
                                                        placeholder="0.00"
                                                        value={customRate}
                                                        onChangeText={setCustomRate}
                                                        keyboardType="decimal-pad"
                                                        leftIcon="swap-horizontal"
                                                    />
                                                )}

                                                <Input
                                                    label="Monto Equivalente (USD)"
                                                    value={calculatedUSD}
                                                    editable={false}
                                                    leftIcon="calculator"
                                                    containerClassName="opacity-70"
                                                />
                                            </>
                                        )}

                                        <DatePickerTrigger
                                            label="Fecha de Pago"
                                            value={paymentDate}
                                            onPress={() => setShowDatePicker(true)}
                                            icon="calendar"
                                        />

                                        <View className="flex-row gap-2 mt-4">
                                            <Button
                                                onPress={() => setShowPaymentModal(false)}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onPress={handleAddPayment}
                                                className="flex-1"
                                            >
                                                Guardar
                                            </Button>
                                        </View>
                                    </View>
                                </Card>
                            </Pressable>
                        </TouchableOpacity>

                        <DatePickerModal
                            visible={showDatePicker}
                            onClose={() => setShowDatePicker(false)}
                            value={paymentDate}
                            onChange={setPaymentDate}
                            label="Seleccionar Fecha de Pago"
                        />
                    </Modal>

                    <TouchableOpacity
                        onPress={handleDelete}
                        className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 active:opacity-70 mt-12"
                    >
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                        <Text className="ml-2 text-red-500 font-semibold text-lg">Eliminar Transacción</Text>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </>
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
        <Text className={`text-gray-700 dark:text-white font-semibold text-right flex-1 ml-4 ${valueStyle}`}>
            {value}
        </Text>
    </View>
);
