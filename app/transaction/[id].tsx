import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
    const { id, type } = useLocalSearchParams<{ id: string, type: string }>();
    const router = useRouter();
    const { deleteTransaction, addLoanPayment, transactions } = useTransactionStore();
    const { exchangeRates, exchangeRateIds } = useSettingsStore();
    const primaryColor = useThemeColor({}, 'tint');
    const { showAlert } = useAlert();
    // Payment Form State
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);
    const [showHistoryModal, setShowHistoryModal] = React.useState(false);
    const [paymentAmount, setPaymentAmount] = React.useState('');
    const [paymentCurrency, setPaymentCurrency] = React.useState<Currency>('USD');
    const [rateSource, setRateSource] = React.useState<ExchangeRateSource>('BCV_USD');
    const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const [transaction, setTransaction] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const fetchDetail = React.useCallback(async () => {
        try {
            if (type === 'loan') {
                const { LoanService } = await import('@/api/services/loan.service');
                const data = await LoanService.getLoanDetail(Number(id));
                const { mapBackendTransactionToLocal } = await import('@/store/transaction-store');
                // The loan detail endpoint returns { loan: {...}, payments: [...] } among other things
                // But mapBackendTransactionToLocal expects a standard transaction shape
                // We'll mimic the standard apiTransaction structure so the mapper works:
                const apiTransaction = {
                    ...data.loan,
                    loanDetail: {
                        ...data.loan.loanDetail,
                        isPaid: data.pendingBalance <= 0.01,
                        payments: data.payments
                    }
                };
                setTransaction(mapBackendTransactionToLocal(apiTransaction));
            } else {
                const { TransactionService } = await import('@/api/services/transaction.service');
                const t = await TransactionService.getOne(Number(id));
                const { mapBackendTransactionToLocal } = await import('@/store/transaction-store');
                setTransaction(mapBackendTransactionToLocal(t));
            }
        } catch (error) {
            console.error('Error fetching detail:', error);
            setTransaction(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id, type]);

    React.useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg items-center justify-center p-4">
                <Text className="text-lg text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Cargando...
                </Text>
            </SafeAreaView>
        );
    }

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

    // Repayment Logic — use amountInLoanCurrency (backend-calculated USD equivalent)
    const payments = transaction.loan?.payments || [];
    const totalPaidUSD = payments.reduce((acc: number, p: any) => acc + Number(p.amountInLoanCurrency ?? p.amount), 0);
    const remainingBalanceUSD = totalAmount - totalPaidUSD;
    // const isFullyPaid = totalPaidUSD >= totalAmount - 0.01;

    // Repayment Logic VES
    // const totalPaidVES = payments.reduce((acc: number, p: any) => acc + (p.currency === 'VES' ? (p.amount * (p.rate || 1)) : 0), 0);
    // Note: We don't really have a strict remainingBalanceVES if the debt is pegged to USD,
    // but we can estimate it based on the current rate if original was VES.
    const currentRate = exchangeRates.BCV_USD;
    const estimatedRemainingVES = remainingBalanceUSD * (transaction.rate || currentRate);

    const forcedRateSource: ExchangeRateSource | null =
        transaction.currency === 'USDT' ? 'Binance' :
            transaction.currency === 'EUR' ? 'BCV_EUR' :
                transaction.currency === 'USD' ? 'BCV_USD' : null;

    const activeRateSource = forcedRateSource || rateSource;

    // Safe effective rate — never NaN, always a number (0 if nothing selected)
    const effectiveRate = (() => {
        if (paymentCurrency === 'USD' || paymentCurrency === 'USDT') return 1;
        const v = exchangeRates[activeRateSource as keyof typeof exchangeRates];
        return isNaN(v) || !v ? 0 : v;
    })();

    const calculatedUSD = (paymentCurrency === 'VES' && effectiveRate > 0)
        ? (parseFloat(paymentAmount) / effectiveRate).toFixed(2)
        : paymentAmount;

    const handleAddPayment = async () => {
        // Validate the entered amount (always in the selected currency)
        const rawAmount = parseFloat(paymentAmount);

        if (isNaN(rawAmount) || rawAmount <= 0) {
            setShowPaymentModal(false);
            showAlert({
                title: 'Error',
                message: 'Por favor ingresa un monto válido',
                icon: 'alert-circle',
                iconColor: '#ef4444'
            });
            return;
        }

        // For balance validation we still compare in USD equivalent
        const amountInUSD = paymentCurrency === 'VES' && effectiveRate > 0
            ? rawAmount / effectiveRate
            : rawAmount;

        if (amountInUSD > remainingBalanceUSD + 0.01) {
            setShowPaymentModal(false);
            showAlert({
                title: 'Error',
                message: `El pago excede la deuda restante (${formatCurrency(remainingBalanceUSD, 'USD')})`,
                icon: 'alert-circle',
                iconColor: '#ef4444'
            });
            return;
        }

        try {
            await addLoanPayment(transaction.id, {
                amount: rawAmount,
                currency: paymentCurrency,
                // Only send rate_id when paying in VES, matching the transaction creation logic
                ...(paymentCurrency === 'VES' && { rate_id: exchangeRateIds[activeRateSource] }),
            });
            setShowPaymentModal(false);
            showAlert({
                title: 'Pago registrado',
                message: 'El pago ha sido registrado exitosamente',
                icon: 'check-circle',
                iconColor: '#22c55e'
            });

            // Reset form
            setPaymentAmount('');

            // Refetch details
            fetchDetail();
        } catch (e: any) {
            setShowPaymentModal(false);
            const backendMsg = e?.response?.data?.message;
            showAlert({
                title: 'Error',
                message: Array.isArray(backendMsg)
                    ? backendMsg.join('\n')
                    : backendMsg || e?.message || 'Ocurrió un error al registrar el pago',
                icon: 'alert-circle',
                iconColor: '#ef4444'
            });
        }
    };

    console.log(JSON.stringify(transaction, null, 4))

    return (
        <>
            <CustomHeader title="Detalle de Transacción" />
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>

                <ScrollView
                    contentContainerStyle={{ padding: 24, paddingBottom: 0 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#22c55e']}
                            tintColor="#22c55e"
                        />
                    }
                >
                    {/* Header Card */}
                    <View className="items-center mb-8">
                        <View
                            className="w-20 h-20 rounded-full items-center justify-center mb-4 shadow-sm"
                            style={{ backgroundColor: `${getColor()}15` }}
                        >
                            <MaterialCommunityIcons name={getIcon()} size={40} color={getColor()} />
                        </View>
                        <Text className="text-3xl font-bold text-gray-700 dark:text-white">
                            {formatCurrency(transaction.amount, transaction.currency)}
                        </Text>
                        {transaction.currency === 'VES' && (
                            <Text className='text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1 mb-2'>
                                {transaction.currency === 'VES' ? `${(transaction.amount / exchangeRates.BCV_USD).toFixed(2)} USD` : ''}
                            </Text>
                        )}
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
                        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                        <DetailItem
                            icon="currency-usd"
                            label="Tasa de Cambio"
                            value={transaction.rate != null ? String(transaction.rate) : 'No aplica'}
                        />
                    </View>

                    {/* Loan Specific Details (Shown for both Loan and Loan Payment transactions) */}
                    {transaction.loan && (
                        <View className="bg-white dark:bg-dark-card rounded-3xl p-6 shadow-sm mb-6">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold text-gray-700 dark:text-white">
                                    Información del Préstamo
                                </Text>
                                {transaction.type === 'income' && transaction.loanDetailsId && (
                                    <TouchableOpacity
                                        className="p-2 -mr-2"
                                        onPress={() => {
                                            const parentLoan = transactions.find((t: any) => t.type === 'loan' && t.loanDetailsId === transaction.loanDetailsId);
                                            if (parentLoan) {
                                                router.push(`/transaction/${parentLoan.id}?type=loan`);
                                            } else {
                                                showAlert({
                                                    title: 'No encontrado',
                                                    message: 'No se pudo verificar la transacción original del préstamo localmente.',
                                                    icon: 'alert-circle',
                                                    iconColor: '#ef4444'
                                                });
                                            }
                                        }}
                                    >
                                        <MaterialCommunityIcons name="open-in-new" size={24} color={primaryColor} />
                                    </TouchableOpacity>
                                )}
                            </View>

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
                                Desglose Financiero ({transaction.currency})
                            </Text>

                            {/* USD Calculations */}
                            <DetailItem
                                icon="cash"
                                label="Monto Prestado"
                                value={formatCurrency(transaction.amount, transaction.currency)}
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="trending-up"
                                label={`Interés (${transaction.loan.interestRate}%)`}
                                value={formatCurrency(interestAmount, transaction.currency)}
                                valueStyle="text-expense font-medium"
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="sigma"
                                label="Total a Pagar"
                                value={formatCurrency(totalAmount, transaction.currency)}
                                valueStyle="text-primary font-bold text-xl"
                            />
                            <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
                            <DetailItem
                                icon="account-cash-outline"
                                label="Saldo Pendiente"
                                value={formatCurrency(remainingBalanceUSD, transaction.currency)}
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

                            {/* Actions */}
                            {transaction.type === 'loan' && transaction.loan && (
                                <View className="mt-5">
                                    {!transaction.loan.isPaid ? (
                                        <Button
                                            onPress={() => setShowPaymentModal(true)}
                                        >
                                            <View className="flex-row items-center">
                                                <MaterialCommunityIcons name="plus" size={20} color={primaryColor} />
                                                <Text className="ml-2 text-white font-semibold">Registrar Pago</Text>
                                            </View>
                                        </Button>
                                    ) : (
                                        <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl items-center flex-row justify-center">
                                            <MaterialCommunityIcons
                                                name="check-circle"
                                                size={20}
                                                color="#22c55e"
                                            />
                                            <Text className="ml-2 font-semibold text-green-600 dark:text-green-400">
                                                Préstamo Finalizado
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Payments History Button */}
                    {transaction.type === 'loan' && payments.length > 0 && (
                        <Button
                            onPress={() => setShowHistoryModal(true)}
                            variant="outline"
                        >
                            <View className="flex-row items-center justify-center">
                                <MaterialCommunityIcons name="history" size={20} color={primaryColor} />
                                <Text className="ml-2 font-semibold text-primary dark:text-primary">Ver Historial de Pagos ({payments.length})</Text>
                            </View>
                        </Button>
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
                                            label={
                                                paymentCurrency === 'VES'
                                                    ? 'Monto (Bs.)'
                                                    : paymentCurrency === 'USDT'
                                                        ? 'Monto (USDT)'
                                                        : 'Monto (USD)'
                                            }
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
                                            {(['USD', 'USDT', 'VES'] as Currency[]).map((c) => (
                                                <Chip
                                                    key={c}
                                                    label={c}
                                                    selected={paymentCurrency === c}
                                                    onPress={() => {
                                                        setPaymentCurrency(c);
                                                        setPaymentAmount('');
                                                    }}
                                                />
                                            ))}
                                        </View>

                                        {paymentCurrency === 'VES' && (
                                            <>
                                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tasa de Cambio {forcedRateSource && '(Fijada por moneda original)'}
                                                </Text>
                                                <View className="flex-row gap-2 mb-3 flex-wrap">
                                                    {(forcedRateSource ? [forcedRateSource] : ['BCV_USD', 'BCV_EUR', 'Binance'] as ExchangeRateSource[]).map((source) => (
                                                        <Chip
                                                            key={source}
                                                            label={
                                                                source === 'BCV_USD' ? 'BCV $' :
                                                                    source === 'BCV_EUR' ? 'BCV €' :
                                                                        source
                                                            }
                                                            selected={activeRateSource === source}
                                                            onPress={() => !forcedRateSource && setRateSource(source)}
                                                        />
                                                    ))}
                                                </View>

                                                {/* Selected rate badge */}
                                                {effectiveRate > 0 && (
                                                    <View className="flex-row items-center bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-xl mb-3">
                                                        <MaterialCommunityIcons name="swap-horizontal" size={16} color="#3b82f6" />
                                                        <Text className="ml-2 text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                                            Tasa seleccionada: Bs. {effectiveRate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </Text>
                                                    </View>
                                                )}

                                                <Input
                                                    label="Monto Equivalente (USD)"
                                                    value={effectiveRate > 0 && paymentAmount ? `$${calculatedUSD}` : '$0.00'}
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

                    {!transaction?.loan?.isPaid && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="flex-row items-center justify-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 active:opacity-70 mt-5"
                        >
                            <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                            <Text className="ml-2 text-red-500 font-semibold text-lg">Eliminar Transacción</Text>
                        </TouchableOpacity>
                    )}

                    {/* History Modal */}
                    <Modal
                        visible={showHistoryModal}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowHistoryModal(false)}
                    >
                        <TouchableOpacity
                            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
                            activeOpacity={1}
                            onPress={() => setShowHistoryModal(false)}
                        >
                            <View className="bg-light-bg dark:bg-dark-bg rounded-t-3xl max-h-[80%]">
                                <View className="p-4 border-b border-gray-200 dark:border-gray-800 flex-row justify-between items-center">
                                    <Text className="text-xl font-bold text-gray-800 dark:text-white">
                                        Historial de Pagos
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowHistoryModal(false)} className="p-2">
                                        <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                                    {transaction?.loan?.payments?.map((p: any, index: number) => {
                                        // payment amount in the currency it was paid with
                                        const paidAmount = Number(p.amount);
                                        const paidCurrency = p.currency || 'USD';
                                        // equivalent in the loan's original currency
                                        const loanCurrencyAmount = p.amountInLoanCurrency != null
                                            ? Number(p.amountInLoanCurrency)
                                            : null;
                                        const loanCurrency = transaction.currency || 'USD';
                                        // rate value from the rate object
                                        const rateValue = p.rate?.rate ? Number(p.rate.rate) : null;

                                        return (
                                            <View key={p.id}>
                                                <View className="flex-row justify-between items-center py-3">
                                                    <View className="flex-row items-center flex-1">
                                                        <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-3">
                                                            <MaterialCommunityIcons name="cash-check" size={20} color="#22c55e" />
                                                        </View>
                                                        <View>
                                                            {/* Primary: amount in payment currency */}
                                                            <Text className="text-gray-800 dark:text-white font-semibold text-base">
                                                                {formatCurrency(paidAmount, paidCurrency)}
                                                            </Text>
                                                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                                                {formatDate(p.date)}
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Secondary: equivalent in loan currency (only when different) */}
                                                    {loanCurrencyAmount != null && paidCurrency !== loanCurrency && (
                                                        <View className="items-end ml-2">
                                                            <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                                {formatCurrency(loanCurrencyAmount, loanCurrency)}
                                                            </Text>
                                                            {rateValue && (
                                                                <Text className="text-xs text-gray-400">
                                                                    Tasa: {rateValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                                {index < (transaction.loan.payments?.length || 0) - 1 && (
                                                    <View className="h-[1px] bg-gray-200 dark:bg-gray-800 my-1 ml-14" />
                                                )}
                                            </View>
                                        );
                                    })}
                                    <View className="h-12" />
                                </ScrollView>
                            </View>
                        </TouchableOpacity>
                    </Modal>

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
