import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { CustomHeader } from '@/components/ui/custom-header';
import { DatePickerModal, DatePickerTrigger } from '@/components/ui/date-picker-modal';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { useAddJobPaymentMutation } from '@/hooks/mutations/useJobMutations';
import { useJob } from '@/hooks/queries/useJobQueries';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { JobPayment } from '@/types/api';
import { validateAmount, validateDate } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobPaymentsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : 0;

  const { data: job, isLoading: isJobLoading } = useJob(jobId);
  const addPaymentMutation = useAddJobPaymentMutation(jobId);
  const { showAlert } = useAlert();
  const { preferences } = useSettingsStore();
  const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

  // Form states
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT'>('USD');
  const [type, setType] = useState<string>('SALARY');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processPayment = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        amount: parseFloat(amount),
        currency,
        date,
        type,
      };

      console.log(JSON.stringify(payload, null, 4))

      await addPaymentMutation.mutateAsync(payload);

      showAlert({
        title: 'Éxito',
        message: 'Pago registrado correctamente',
        icon: 'check-circle',
        iconColor: '#22c55e',
        buttons: [{
          text: 'OK',
          onPress: () => {
            // Reset form
            setAmount('');
            setErrors({});
          }
        }]
      });
    } catch (error) {
      console.log(JSON.stringify(error, null, 4))
      showAlert({
        title: 'Error',
        message: 'No se pudo registrar el pago',
        icon: 'alert-circle',
        iconColor: '#ef4444'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    const amountVal = validateAmount(amount);
    if (!amountVal.isValid) newErrors.amount = amountVal.error!;

    const dateVal = validateDate(date);
    if (!dateVal.isValid) newErrors.date = dateVal.error!;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    showAlert({
      title: 'Confirmar Pago',
      message: `¿Desea registrar este pago con la siguiente información?\n\n• Monto: ${amount} ${currency}\n• Tipo: ${type === 'SALARY' ? 'Salario' : 'Bono'}\n• Fecha: ${date}`,
      icon: 'cash-register',
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
            processPayment();
          }
        }
      ]
    });
  };

  if (isJobLoading) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg justify-center items-center">
        <ActivityIndicator size="large" color={primaryColorHex} />
      </View>
    );
  }

  const renderPaymentItem = ({ item }: { item: JobPayment }) => (
    <View
      className="bg-white dark:bg-dark-surface p-4 shadow-sm shadow-gray-200 dark:shadow-slate-950 rounded-2xl mb-3 flex-row justify-between items-center border border-gray-100 dark:border-gray-700"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center mr-3">
          <MaterialCommunityIcons name="cash-check" size={20} color="#10b981" />
        </View>
        <View>
          <Text className="text-sm font-bold text-gray-800 dark:text-white">
            Pago {item.type}
          </Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {item.date}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-base font-extrabold text-emerald-500">
          +{Number(item.amount).toLocaleString('es-VE', { maximumFractionDigits: 2 })} {item.currency}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <CustomHeader title={`Pagos de ${job?.name || 'Trabajo'}`} />
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <FlatList
            data={job?.payments || []}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderPaymentItem}
            contentContainerStyle={{ padding: 15 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700 p-5">
                <Text className="text-base font-bold text-gray-800 dark:text-white mb-4">
                  Registrar Nuevo Pago
                </Text>

                {/* Amount */}
                <Input
                  label="Monto del pago"
                  placeholder="0.00"
                  leftIcon="currency-usd"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  error={errors.amount}
                />

                {/* Currency Selector */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Moneda
                  </Text>
                  <View className="flex-row gap-2">
                    <Chip
                      label="Dólares"
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

                {/* Payment Type Selector */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Tipo de Pago
                  </Text>
                  <View className="flex-row gap-2 flex-wrap">
                    <Chip
                      label="Salario"
                      selected={type === 'SALARY'}
                      onPress={() => setType('SALARY')}
                      variant={type === 'SALARY' ? 'default' : 'outline'}
                    />
                    <Chip
                      label="Bono"
                      selected={type === 'BONUS'}
                      onPress={() => setType('BONUS')}
                      variant={type === 'BONUS' ? 'default' : 'outline'}
                    />
                  </View>
                </View>

                {/* Date */}
                <DatePickerTrigger
                  label="Fecha de Pago"
                  value={date}
                  icon="calendar"
                  onPress={() => setShowDatePicker(true)}
                  error={errors.date}
                />

                <DatePickerModal
                  visible={showDatePicker}
                  onClose={() => setShowDatePicker(false)}
                  value={date}
                  onChange={setDate}
                  label="Seleccionar Fecha de Pago"
                />

                {/* Submit Button */}
                <View className="mt-4">
                  <Button
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    size="lg"
                  >
                    Registrar Pago
                  </Button>
                </View>
              </Card>
            }
            ListEmptyComponent={() => (
              <View className="bg-light-surface dark:bg-dark-surface p-8 rounded-3xl items-center justify-center border border-gray-150 dark:border-gray-800">
                <MaterialCommunityIcons name="currency-usd-off" size={40} color="#9ca3af" />
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                  No hay pagos registrados para este trabajo.
                </Text>
              </View>
            )}
            ListFooterComponent={() => <View className="h-6" />}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}


// <View className="mb-6">
//   <Text className="text-base font-bold text-gray-800 dark:text-white mb-3">
//     Últimos Pagos Registrados
//   </Text>

//   {payments && payments.length > 0 ? (
//     payments.map((payment: JobPayment) => (
//       <View
//         key={payment.id}
//         className="bg-light-surface dark:bg-dark-surface p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-gray-100 dark:border-gray-850"
//       >
//         <View className="flex-row items-center">
//           <View className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center mr-3">
//             <MaterialCommunityIcons name="cash-check" size={20} color="#10b981" />
//           </View>
//           <View>
//             <Text className="text-sm font-bold text-gray-800 dark:text-white">
//               Pago {payment.type}
//             </Text>
//             <Text className="text-xs text-gray-400 dark:text-gray-500">
//               {payment.date}
//             </Text>
//           </View>
//         </View>
//         <View className="items-end">
//           <Text className="text-base font-extrabold text-emerald-500">
//             +{Number(payment.amount).toLocaleString('es-VE', { maximumFractionDigits: 2 })} {payment.currency}
//           </Text>
//         </View>
//       </View>
//     ))
//   ) : (
//     <View className="bg-light-surface dark:bg-dark-surface p-8 rounded-3xl items-center justify-center border border-gray-100 dark:border-gray-800">
//       <MaterialCommunityIcons name="currency-usd-off" size={40} color="#9ca3af" />
//       <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
//         No se han registrado pagos para este trabajo.
//       </Text>
//     </View>
//   )}
// </View>