import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { CustomHeader } from '@/components/ui/custom-header';
import { DatePickerModal, DatePickerTrigger } from '@/components/ui/date-picker-modal';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { useTransactionStore } from '@/store/transaction-store';
import type { Currency, ExchangeRateSource, LoanDetails, TransactionType } from '@/types';
import { validateAmount, validateDate, validateEmail, validatePhone, validateRequired } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OperationType = TransactionType;

export default function AddTransactionScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ type?: string }>();
    const { addTransaction } = useTransactionStore();
    const { preferences, categories, exchangeRates, exchangeRateIds } = useSettingsStore();
    const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';
    const { showAlert } = useAlert();
    // Form state
    const [operationType, setOperationType] = useState<OperationType>(
        (params.type as OperationType) || 'expense'
    );
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [currency, setCurrency] = useState<Currency>('USD');
    const [rateSource, setRateSource] = useState<ExchangeRateSource>('BCV_USD');

    // Calculated fields
    const exchangeRate = exchangeRates[rateSource as keyof typeof exchangeRates] || 0;

    const isEur = rateSource === 'BCV_EUR';
    const currSymbol = isEur ? '€' : '$';
    const currName = isEur ? 'EUR' : 'USD';
    const currIcon = isEur ? 'currency-eur' : 'currency-usd';

    const calculatedAmount = currency === 'VES' && exchangeRate > 0
        ? (parseFloat(amount) / exchangeRate).toFixed(2)
        : amount;

    // Loan-specific state
    const [debtorName, setDebtorName] = useState('');
    const [debtorLastName, setDebtorLastName] = useState('');
    const [debtorEmail, setDebtorEmail] = useState('');
    const [debtorPhone, setDebtorPhone] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [interestRate, setInterestRate] = useState('0');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const filteredCategories = categories.filter(
        c => c.type === operationType || c.name.replace(/\s/g, '').toLowerCase() === 'prestamo' || c.name.replace(/\s/g, '').toLowerCase() === 'préstamo'
    );

    const loandCategory = categories.find(c => c.type === 'expense' || c.name.replace(/\s/g, '').toLowerCase() === 'prestamo' || c.name.replace(/\s/g, '').toLowerCase() === 'préstamo');

    const saveTransaction = async () => {
        setIsLoading(true);

        try {
            const loanDetails: LoanDetails | undefined = operationType === 'loan' ? {
                debtorName,
                debtorLastName,
                debtorEmail: debtorEmail || undefined,
                debtorPhone: debtorPhone || undefined,
                dueDate: (() => {
                    const d = new Date(dueDate);
                    d.setHours(12, 0, 0, 0);
                    return d.toISOString();
                })(),
                interestRate: parseFloat(interestRate) || 0,
                isPaid: false,
            } : undefined;

            const payload = {
                type: operationType,
                amount: parseFloat(amount),
                currency: currency,
                category: categories.find(c => c.id === categoryId)?.name || 'Otros',
                categoryId: parseInt(categoryId, 10),
                description: description,
                date: (() => {
                    const d = new Date(date);
                    d.setHours(12, 0, 0, 0);
                    return d.toISOString();
                })(),
                created_at: new Date().toISOString(),
                rate_id: exchangeRateIds[rateSource],
                loan: loanDetails,
            };

            console.log({
                transactionPayload: payload,
                rate: {
                    id: exchangeRateIds[rateSource],
                    rate: exchangeRate,
                    currency: rateSource,
                },
            })

            await addTransaction(payload);

            showAlert({
                title: 'Éxito',
                message: 'Transacción agregada correctamente',
                icon: 'check-circle',
                iconColor: '#22c55e',
                buttons: [{
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/history')
                }]
            });
        } catch (error) {

            showAlert({ title: 'Error', message: 'No se pudo agregar la transacción', icon: 'alert-circle', iconColor: '#ef4444' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        const newErrors: Record<string, string> = {};

        // Validate common fields
        const amountValidation = validateAmount(amount);
        if (!amountValidation.isValid) newErrors.amount = amountValidation.error!;

        if (!categoryId) newErrors.categoryId = 'Selecciona una categoría';

        // Validate loan fields
        if (operationType === 'loan') {
            const nameValidation = validateRequired(debtorName, 'Nombre');
            if (!nameValidation.isValid) newErrors.debtorName = nameValidation.error!;

            const lastNameValidation = validateRequired(debtorLastName, 'Apellido');
            if (!lastNameValidation.isValid) newErrors.debtorLastName = lastNameValidation.error!;

            const dueDateValidation = validateDate(dueDate);
            if (!dueDateValidation.isValid) newErrors.dueDate = dueDateValidation.error!;

            if (debtorEmail) {
                const emailValidation = validateEmail(debtorEmail);
                if (!emailValidation.isValid) newErrors.debtorEmail = emailValidation.error!;
            }

            if (debtorPhone) {
                const phoneValidation = validatePhone(debtorPhone);
                const phoneValidationRequired = validateRequired(debtorPhone, 'Teléfono');
                if (!phoneValidation.isValid && !phoneValidationRequired.isValid) newErrors.debtorPhone = phoneValidation.error!;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const categoryName = categories.find(c => c.id === categoryId)?.name || 'Otros';
        const typeLabel = operationType === 'income' ? 'Ingreso' : operationType === 'loan' ? 'Préstamo' : 'Gasto';

        let confirmMessage = `¿Desea registrar esta transacción con la siguiente información?\n\n` +
            `• Tipo: ${typeLabel}\n` +
            `• Monto: ${amount} ${currency}\n` +
            `• Categoría: ${categoryName}\n` +
            `• Fecha: ${date}`;

        if (description) {
            confirmMessage += `\n• Descripción: ${description}`;
        }

        if (operationType === 'loan') {
            confirmMessage += `\n• Deudor: ${debtorName} ${debtorLastName}`;
        }

        showAlert({
            title: 'Confirmar Transacción',
            message: confirmMessage,
            icon: 'swap-horizontal',
            iconColor: primaryColorHex,
            buttons: [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Confirmar',
                    style: 'default',
                    onPress: () => {
                        saveTransaction();
                    }
                }
            ]
        });
    };

    return (
        <>
            <CustomHeader title="Nueva Transacción" />
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 15 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                            {/* Type Selector */}
                            <View className="mb-6">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tipo de operación
                                </Text>
                                <View className="flex-row gap-2">
                                    <Chip
                                        label="Ingreso"
                                        selected={operationType === 'income'}
                                        onPress={() => { setOperationType('income'); setCategoryId(''); }}
                                        variant="income"
                                    />
                                    <Chip
                                        label="Gasto"
                                        selected={operationType === 'expense'}
                                        onPress={() => { setOperationType('expense'); setCategoryId(''); }}
                                        variant="expense"
                                    />
                                    <Chip
                                        label="Préstamo"
                                        selected={operationType === 'loan'}
                                        onPress={() => {
                                            setOperationType('loan');
                                            const loanCat = loandCategory;
                                            if (loanCat) setCategoryId(loanCat.id);
                                        }}
                                        variant="loan"
                                    />
                                </View>
                            </View>

                            {/* Currency Selector */}
                            <View className="mb-6">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Moneda
                                </Text>
                                <View className="flex-row gap-2">
                                    <Chip
                                        label="USD (Efectivo)"
                                        selected={currency === 'USD'}
                                        onPress={() => setCurrency('USD')}
                                        variant={currency === 'USD' ? 'default' : 'outline'}
                                    />
                                    <Chip
                                        label="Bolívares"
                                        selected={currency === 'VES'}
                                        onPress={() => setCurrency('VES')}
                                        variant={currency === 'VES' ? 'default' : 'outline'}
                                    />
                                    <Chip
                                        label="USDT"
                                        selected={currency === 'USDT'}
                                        onPress={() => setCurrency('USDT')}
                                        variant={currency === 'USDT' ? 'default' : 'outline'}
                                    />
                                </View>
                            </View>

                            {/* Exchange Rate Section - Only for VES */}
                            {currency === 'VES' && (
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Tasa de Cambio
                                    </Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View className="flex-row gap-2">
                                            <Chip
                                                label={`BCV ($${exchangeRates.BCV_USD})`}
                                                selected={rateSource === 'BCV_USD'}
                                                onPress={() => setRateSource('BCV_USD')}
                                                variant={rateSource === 'BCV_USD' ? 'default' : 'outline'}
                                            />
                                            <Chip
                                                label={`BCV EUR ($${exchangeRates.BCV_EUR})`}
                                                selected={rateSource === 'BCV_EUR'}
                                                onPress={() => setRateSource('BCV_EUR')}
                                                variant={rateSource === 'BCV_EUR' ? 'default' : 'outline'}
                                            />
                                            <Chip
                                                label={`Binance ($${exchangeRates.Binance})`}
                                                selected={rateSource === 'Binance'}
                                                onPress={() => setRateSource('Binance')}
                                                variant={rateSource === 'Binance' ? 'default' : 'outline'}
                                            />
                                        </View>
                                    </ScrollView>

                                    <View className="mt-4">
                                        <Input
                                            label={`Monto en ${currName} (Calculado)`}
                                            value={amount && !isNaN(parseFloat(calculatedAmount)) ? `${calculatedAmount}` : `0.00`}
                                            editable={false}
                                            leftIcon={currIcon}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Amount */}
                            <Input
                                label="Monto"
                                placeholder="0.00"
                                leftIcon="currency-usd"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                error={errors.amount}
                            />

                            {/* Category Selector */}
                            <View className="mb-4">
                                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Categoría
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="flex-row gap-2">
                                        {filteredCategories.map((cat) => (
                                            <Pressable
                                                key={cat.id}
                                                onPress={() => setCategoryId(cat.id)}
                                                className={`items-center px-4 py-3 rounded-2xl ${categoryId === cat.id
                                                    ? 'bg-primary-500'
                                                    : 'bg-light-surface dark:bg-dark-surface'
                                                    }`}
                                            >
                                                <MaterialCommunityIcons
                                                    name={cat.icon as any}
                                                    size={20}
                                                    color={categoryId === cat.id ? '#fff' : cat.color}
                                                />
                                                <Text className={`text-xs mt-1 ${categoryId === cat.id
                                                    ? 'text-white font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {cat.name}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </ScrollView>
                                {errors.categoryId && (
                                    <Text className="text-sm text-expense mt-2">{errors.categoryId}</Text>
                                )}
                            </View>

                            {/* Description */}
                            <Input
                                label="Descripción"
                                placeholder="Descripción de la transacción"
                                leftIcon="text"
                                value={description}
                                onChangeText={setDescription}
                            />

                            {/* Date */}
                            <DatePickerTrigger
                                label="Fecha"
                                value={date}
                                icon="calendar"
                                onPress={() => setShowDatePicker(true)}
                            />

                            <DatePickerModal
                                visible={showDatePicker}
                                onClose={() => setShowDatePicker(false)}
                                value={date}
                                onChange={setDate}
                                label="Seleccionar Fecha"
                            />
                        </Card>

                        {/* Loan-specific fields */}
                        {operationType === 'loan' && (
                            <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                                <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                                    Datos del Deudor
                                </Text>

                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <Input
                                            label="Nombre"
                                            placeholder="Juan"
                                            leftIcon="account"
                                            value={debtorName}
                                            onChangeText={setDebtorName}
                                            error={errors.debtorName}
                                            containerClassName="mb-0"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Input
                                            label="Apellido"
                                            placeholder="Pérez"
                                            value={debtorLastName}
                                            onChangeText={setDebtorLastName}
                                            error={errors.debtorLastName}
                                            containerClassName="mb-0"
                                        />
                                    </View>
                                </View>

                                <Input
                                    label="Correo (opcional)"
                                    placeholder="correo@ejemplo.com"
                                    leftIcon="email-outline"
                                    value={debtorEmail}
                                    onChangeText={setDebtorEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    error={errors.debtorEmail}
                                />

                                <Input
                                    label="Teléfono"
                                    placeholder="+58 412 1234567"
                                    leftIcon="phone-outline"
                                    value={debtorPhone}
                                    onChangeText={setDebtorPhone}
                                    keyboardType="phone-pad"
                                    error={errors.debtorPhone}
                                />

                                <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4 mt-2">
                                    Datos Financieros
                                </Text>

                                <DatePickerTrigger
                                    label="Fecha de vencimiento"
                                    value={dueDate}
                                    icon="calendar-clock"
                                    onPress={() => setShowDueDatePicker(true)}
                                    error={errors.dueDate}
                                />

                                <DatePickerModal
                                    visible={showDueDatePicker}
                                    onClose={() => setShowDueDatePicker(false)}
                                    value={dueDate || new Date().toISOString().split('T')[0]}
                                    onChange={setDueDate}
                                    label="Fecha de Vencimiento"
                                    minimumDate={new Date()}
                                />

                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <Input
                                            label="Tasa de interés (%)"
                                            placeholder="0"
                                            leftIcon="percent"
                                            value={interestRate}
                                            onChangeText={setInterestRate}
                                            keyboardType="decimal-pad"
                                            containerClassName="mb-0"
                                        />
                                    </View>
                                </View>
                            </Card>
                        )}

                        {/* Submit Button */}
                        <View className="mt-6 mb-4">
                            <Button
                                onPress={handleSubmit}
                                isLoading={isLoading}
                                size="lg"
                            >
                                {operationType === 'income' ? 'Agregar Ingreso' :
                                    operationType === 'loan' ? 'Registrar Préstamo' :
                                        'Agregar Gasto'}
                            </Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
