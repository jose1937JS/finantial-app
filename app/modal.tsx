import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      className="flex-1 bg-white dark:bg-dark-card rounded-3xl p-6 m-2 items-center active:opacity-80 shadow-sm"
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center mb-4"
        style={{ backgroundColor: bgColor }}
      >
        <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
      </View>
      <Text className="text-base font-semibold text-gray-900 dark:text-white text-center mb-1">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {subtitle}
      </Text>
    </Pressable>
  );
}

export default function ModalScreen() {
  const router = useRouter();

  const handleManual = () => {
    router.push('/add-transaction');
  };

  const handleVoice = () => {
    // Voice input - placeholder
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    alert('La entrada por voz estará disponible próximamente');
  };

  const handleChat = () => {
    // Chat NLP - placeholder
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    alert('El asistente de chat estará disponible próximamente');
  };

  const handlePhoto = () => {
    // OCR - placeholder
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    alert('El escaneo de recibos estará disponible próximamente');
  };

  return (
    <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="items-center mb-8">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Agregar Operación
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-8">
            Selecciona cómo deseas registrar tu transacción
          </Text>
        </View>

        {/* Options Grid */}
        <View className="flex-1 justify-center">
          <View className="flex-row">
            <OperationOption
              icon="pencil"
              iconColor="#22c55e"
              bgColor="#22c55e20"
              title="Manual"
              subtitle="Ingresa los datos"
              onPress={handleManual}
            />
            <OperationOption
              icon="microphone"
              iconColor="#3b82f6"
              bgColor="#3b82f620"
              title="Voz"
              subtitle="Dicta tu transacción"
              onPress={handleVoice}
            />
          </View>
          <View className="flex-row">
            <OperationOption
              icon="chat-processing"
              iconColor="#a855f7"
              bgColor="#a855f720"
              title="Chat"
              subtitle="Describe en texto"
              onPress={handleChat}
            />
            <OperationOption
              icon="camera"
              iconColor="#f97316"
              bgColor="#f9731620"
              title="Foto"
              subtitle="Escanea un recibo"
              onPress={handlePhoto}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
