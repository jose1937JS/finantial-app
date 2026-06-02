import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { CustomHeader } from '@/components/ui/custom-header';
import { DatePickerModal, DatePickerTrigger } from '@/components/ui/date-picker-modal';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { useCreateJobMutation } from '@/hooks/mutations/useJobMutations';
import { useSettingsStore } from '@/store/settings-store';
import { validateAmount, validateDate, validateRequired } from '@/utils/validation';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateJobScreen() {
  const router = useRouter();
  const { exchangeRates } = useSettingsStore();
  const { showAlert } = useAlert();
  const createJobMutation = useCreateJobMutation();

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'USDT'>('USD');
  const [rateSource, setRateSource] = useState<'BCV_USD' | 'BCV_EUR' | 'Binance' | 'USDT'>('BCV_USD');
  const [frequency, setFrequency] = useState<1 | 2>(2); // 1 = Monthly, 2 = Bi-weekly (Quincenal)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    const nameVal = validateRequired(name, 'Nombre del trabajo');
    if (!nameVal.isValid) newErrors.name = nameVal.error!;

    const companyVal = validateRequired(company, 'Empresa');
    if (!companyVal.isValid) newErrors.company = companyVal.error!;

    const salaryVal = validateAmount(salary);
    if (!salaryVal.isValid) newErrors.salary = salaryVal.error!;

    const dateVal = validateDate(startDate);
    if (!dateVal.isValid) newErrors.startDate = dateVal.error!;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name,
        description,
        salary,
        currency,
        rate: rateSource,
        monthly_payment_frequency: frequency,
        company,
        start_date: startDate,
        logo: '',
      };

      console.log(JSON.stringify(payload, null, 4))

      await createJobMutation.mutateAsync(payload);

      showAlert({
        title: 'Éxito',
        message: 'Trabajo registrado correctamente',
        icon: 'check-circle',
        iconColor: '#22c55e',
        buttons: [{
          text: 'OK',
          onPress: () => router.replace('/(tabs)/salary')
        }]
      });
    } catch (error) {
      console.log(JSON.stringify(error, null, 4))
      showAlert({
        title: 'Error',
        message: 'No se pudo registrar el trabajo',
        icon: 'alert-circle',
        iconColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CustomHeader title="Nuevo Trabajo" />
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
              {/* Job Name */}
              <Input
                label="Nombre del Puesto / Trabajo"
                placeholder="Ej. Desarrollador de Software"
                leftIcon="briefcase-outline"
                value={name}
                onChangeText={setName}
                error={errors.name}
              />

              {/* Company */}
              <Input
                label="Empresa"
                placeholder="Ej. NexttiSolutions"
                leftIcon="domain"
                value={company}
                onChangeText={setCompany}
                error={errors.company}
              />

              {/* Description */}
              <Input
                label="Descripción (opcional)"
                placeholder="Ej. Construcción de interfaces móviles..."
                leftIcon="text"
                value={description}
                onChangeText={setDescription}
              />

              {/* Salary */}
              <Input
                label="Salario mensual"
                placeholder="0.00"
                leftIcon="cash"
                value={salary}
                onChangeText={setSalary}
                keyboardType="decimal-pad"
                error={errors.salary}
              />

              {/* Currency Selector */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Moneda de pago
                </Text>
                <View className="flex-row gap-2">
                  <Chip
                    label="USD (Dólares)"
                    selected={currency === 'USD'}
                    onPress={() => setCurrency('USD')}
                    variant={currency === 'USD' ? 'default' : 'outline'}
                  />
                  <Chip
                    label="VES (Bolívares)"
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

              {/* Rate Reference Selector */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Referencia de Tasa de Cambio
                </Text>
                <View className="flex-row gap-2">
                  <Chip
                    label={`BCV ($${exchangeRates.BCV_USD || '0'})`}
                    selected={rateSource === 'BCV_USD'}
                    onPress={() => setRateSource('BCV_USD')}
                    variant={rateSource === 'BCV_USD' ? 'default' : 'outline'}
                  />
                  <Chip
                    label={`BCV EUR ($${exchangeRates.BCV_EUR || '0'})`}
                    selected={rateSource === 'BCV_EUR'}
                    onPress={() => setRateSource('BCV_EUR')}
                    variant={rateSource === 'BCV_EUR' ? 'default' : 'outline'}
                  />
                  <Chip
                    label={`Binance ($${exchangeRates.Binance || '0'})`}
                    selected={rateSource === 'Binance'}
                    onPress={() => setRateSource('Binance')}
                    variant={rateSource === 'Binance' ? 'default' : 'outline'}
                  />
                  <Chip
                    label="USDT"
                    selected={rateSource === 'USDT'}
                    onPress={() => setRateSource('USDT')}
                    variant={rateSource === 'USDT' ? 'default' : 'outline'}
                  />
                </View>
              </View>

              {/* Payment Frequency Selector */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Frecuencia de Pago
                </Text>
                <View className="flex-row gap-2">
                  <Chip
                    label="Mensual"
                    selected={frequency === 1}
                    onPress={() => setFrequency(1)}
                    variant={frequency === 1 ? 'default' : 'outline'}
                  />
                  <Chip
                    label="Quincenal (2 veces al mes)"
                    selected={frequency === 2}
                    onPress={() => setFrequency(2)}
                    variant={frequency === 2 ? 'default' : 'outline'}
                  />
                </View>
              </View>

              {/* Start Date */}
              <DatePickerTrigger
                label="Fecha de Inicio"
                value={startDate}
                icon="calendar"
                onPress={() => setShowDatePicker(true)}
                error={errors.startDate}
              />

              <DatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                value={startDate}
                onChange={setStartDate}
                label="Seleccionar Fecha de Inicio"
              />
            </Card>

            {/* Submit Button */}
            <View className="mt-4 mb-8">
              <Button
                onPress={handleSubmit}
                isLoading={isLoading}
                size="lg"
              >
                Registrar Trabajo
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
