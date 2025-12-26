import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { primaryColors, useSettingsStore } from '@/store/settings-store';

interface OperationOptionProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function OperationOption({ icon, iconColor, bgColor, title, subtitle, onPress }: OperationOptionProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white dark:bg-dark-card rounded-3xl p-6 mb-4 active:opacity-80 shadow-sm"
    >
      <View className="flex-row items-center">
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: bgColor }}
        >
          <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

export default function ModalScreen() {
  const router = useRouter();
  const { preferences } = useSettingsStore();
  const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

  const handleManual = () => {
    router.push('/add-transaction');
  };

  const handleDynamic = () => {
    router.push('/add-dynamic');
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
      <View className="flex-1 px-5 py-6">
        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${currentPrimaryColor}20` }}
          >
            <MaterialCommunityIcons name="plus-circle" size={48} color={currentPrimaryColor} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Agregar Operación
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-8">
            Selecciona cómo deseas registrar tu transacción
          </Text>
        </View>

        {/* Options */}
        <View className="flex-1">
          <OperationOption
            icon="pencil-box"
            iconColor={currentPrimaryColor}
            bgColor={`${currentPrimaryColor}15`}
            title="Manual"
            subtitle="Ingresa los datos de la operación manualmente"
            onPress={handleManual}
          />

          <OperationOption
            icon="robot"
            iconColor="#a855f7"
            bgColor="#a855f715"
            title="Dinámica (IA)"
            subtitle="Usa texto, voz o foto para registrar con inteligencia artificial"
            onPress={handleDynamic}
          />
        </View>

        {/* Features of Dynamic */}
        <View className="bg-light-surface dark:bg-dark-surface rounded-2xl p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            La opción Dinámica incluye:
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <MaterialCommunityIcons name="message-text" size={24} color="#3b82f6" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Texto</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons name="microphone" size={24} color="#22c55e" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Voz</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons name="camera" size={24} color="#f97316" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">Foto</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
