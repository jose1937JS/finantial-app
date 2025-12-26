import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const primaryColor = useThemeColor({}, 'tint');

    const handleResetPassword = async () => {
        const emailValidation = validateEmail(email);

        if (!emailValidation.isValid) {
            setError(emailValidation.error);
            return;
        }

        setError(undefined);
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSent(true);
    };

    if (isSent) {
        return (
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
                <View className="flex-1 items-center justify-center px-6">
                    <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
                        <MaterialCommunityIcons name="email-check" size={40} color={primaryColor} />
                    </View>

                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                        Correo Enviado
                    </Text>

                    <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-8">
                        Hemos enviado instrucciones para restablecer tu contraseña a{' '}
                        <Text className="font-semibold text-gray-700 dark:text-gray-300">
                            {email}
                        </Text>
                    </Text>

                    <Button
                        onPress={() => router.replace('/login')}
                        className="w-full mb-4"
                        size="lg"
                    >
                        Volver al Inicio
                    </Button>

                    <Button
                        variant="ghost"
                        onPress={() => setIsSent(false)}
                    >
                        Usar otro correo
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    className="px-6"
                >
                    {/* Back button */}
                    <Link href="/login" asChild>
                        <View className="flex-row items-center mt-4 mb-8">
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#6b7280" />
                            <Text className="text-gray-500 ml-2">Volver</Text>
                        </View>
                    </Link>

                    {/* Header */}
                    <View className="items-center mb-10">
                        <View className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-6">
                            <MaterialCommunityIcons name="lock-reset" size={40} color={primaryColor} />
                        </View>
                        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ¿Olvidaste tu contraseña?
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-gray-400 text-center px-4">
                            No te preocupes. Ingresa tu correo y te enviaremos instrucciones para recuperarla.
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="flex-1">
                        <Input
                            label="Correo electrónico"
                            placeholder="tu@email.com"
                            leftIcon="email-outline"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={error}
                        />

                        <Button
                            onPress={handleResetPassword}
                            isLoading={isLoading}
                            className="mt-4"
                            size="lg"
                        >
                            Enviar Instrucciones
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
