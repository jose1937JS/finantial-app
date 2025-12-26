import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const { login, isLoading } = useAuthStore();

    const handleLogin = async () => {
        // Validate
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        if (!emailValidation.isValid || !passwordValidation.isValid) {
            setErrors({
                email: emailValidation.error,
                password: passwordValidation.error,
            });
            return;
        }

        setErrors({});
        await login(email, password);
    };

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
                    {/* Header */}
                    <View className="items-center mt-12 mb-10">
                        <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-6">
                            <MaterialCommunityIcons name="wallet" size={40} color="#fff" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Bienvenido
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
                            Inicia sesión para gestionar tus finanzas
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
                            error={errors.email}
                        />

                        <Input
                            label="Contraseña"
                            placeholder="••••••••"
                            leftIcon="lock-outline"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            error={errors.password}
                        />

                        <Link href="/forgot-password" asChild>
                            <Text className="text-right text-primary-500 font-medium mb-6">
                                ¿Olvidaste tu contraseña?
                            </Text>
                        </Link>

                        <Button
                            onPress={handleLogin}
                            isLoading={isLoading}
                            className="mb-4"
                            size="lg"
                        >
                            Iniciar Sesión
                        </Button>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center py-8">
                        <Text className="text-gray-500 dark:text-gray-400">
                            ¿No tienes cuenta?{' '}
                        </Text>
                        <Link href="/register" asChild>
                            <Text className="text-primary-500 font-semibold">
                                Regístrate
                            </Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
