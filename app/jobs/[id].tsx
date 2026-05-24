import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomHeader } from '@/components/ui/custom-header';
import { useJob } from '@/hooks/queries/useJobQueries';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const jobId = id ? parseInt(id, 10) : 0;
  const { data: job, isLoading, error } = useJob(jobId);
  const { preferences } = useSettingsStore();
  const primaryColorHex = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

  if (isLoading) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg justify-center items-center">
        <ActivityIndicator size="large" color={primaryColorHex} />
      </View>
    );
  }

  if (error || !job) {
    return (
      <View className="flex-1 bg-light-bg dark:bg-dark-bg justify-center items-center p-5">
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="text-lg font-bold text-gray-700 dark:text-white mt-4">
          Error al cargar los detalles
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
          No pudimos recuperar la información de este trabajo.
        </Text>
        <Button className="mt-6" onPress={() => router.back()}>
          Volver
        </Button>
      </View>
    );
  }

  const { debt, payments, equivalent_calculation } = job;
  const progressPercent = job.expected_payments > 0 ? Math.min(Math.round((debt?.total_payments_made || 0) / job.expected_payments * 100), 100) : 0;

  return (
    <>
      <CustomHeader title={job.name} />
      <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
        <ScrollView
          contentContainerStyle={{ padding: 15 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Info Card */}
          <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700 p-5">
            <View className="flex-row items-center mb-4">
              <View className="w-14 h-14 rounded-2xl bg-primary-500/10 items-center justify-center mr-4">
                <MaterialCommunityIcons name="briefcase-outline" size={28} color={primaryColorHex} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                  {job.name}
                </Text>
                <Text className="text-base text-gray-500 dark:text-gray-400 font-semibold">
                  {job.company}
                </Text>
              </View>
            </View>

            {job.description ? (
              <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-dark-surface p-3 rounded-2xl">
                {job.description}
              </Text>
            ) : null}

            <View className="border-t border-gray-100 dark:border-gray-800 pt-4 flex-row justify-between flex-wrap gap-4">
              <View className='gap-2 justify-center'>
                <View>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Frecuencia de Pago
                  </Text>
                  <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {job.monthly_payment_frequency === 2 ? 'Quincenal' : 'Mensual'}
                  </Text>
                </View>
                <View>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Fecha de Inicio
                  </Text>
                  <Text className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {job.start_date}
                  </Text>
                </View>
              </View>

              <View className='gap-2 justify-center'>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Monto por Periodo
                  </Text>
                  <Text className="text-lg font-bold text-primary-500">
                    {job.expected_amount_per_period_usd.toLocaleString('es-VE', { maximumFractionDigits: 2 })} USD
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Salario Mensual
                  </Text>
                  <Text className="text-lg font-bold text-primary-500">
                    {Number(job.salary).toLocaleString('es-VE', { maximumFractionDigits: 2 })} {job.currency}
                  </Text>
                </View>
              </View>
            </View>

            {equivalent_calculation ? (
              <View className="mt-4 bg-primary-500/10 p-3 rounded-lg flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                    Equivalente en Bolívares
                  </Text>
                  <Text className="text-sm font-semibold text-gray-800 dark:text-white">
                    {(Number(equivalent_calculation.salary_ves) / Number(job.monthly_payment_frequency)).toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                    Tasa de Referencia ({job.rate?.currency})
                  </Text>
                  <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {Number(equivalent_calculation.rate_value).toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.
                  </Text>
                </View>
              </View>
            ) : null}
          </Card>

          {/* Debt Summary Card */}
          <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700 p-5">
            <Text className="text-base font-bold text-gray-800 dark:text-white mb-4">
              Estado de Cuenta y Deudas
            </Text>

            <View className="flex-row justify-between mb-4">
              <View className="">
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  Deuda Acumulada
                </Text>
                <Text className="text-xl font-extrabold text-red-500">
                  {job.debt_usd.toLocaleString('es-VE', { maximumFractionDigits: 2 })} USD
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  Total Pagado
                </Text>
                <Text className="text-xl font-extrabold text-emerald-500">
                  {Number(debt?.amount_paid || 0).toLocaleString('es-VE', { maximumFractionDigits: 2 })} USD
                </Text>
              </View>
            </View>

            {equivalent_calculation?.debt_ves ? (
              <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <View className='w-full'>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Deuda Equivalente en Bolívares
                  </Text>
                  <Text className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                    {equivalent_calculation.debt_ves.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Progress of Payments */}
            <View>
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Pagos Recibidos: {debt?.total_payments_made || 0} / {job.expected_payments}
                </Text>
                <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {progressPercent}%
                </Text>
              </View>
              <View className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <View
                  style={{ width: `${progressPercent}%`, backgroundColor: primaryColorHex }}
                  className="h-full rounded-full"
                />
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="mb-6">
            <Button
              onPress={() => router.push(`/jobs/${jobId}/payments`)}
              size="lg"
            >
              Ver y Registrar Pagos
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
