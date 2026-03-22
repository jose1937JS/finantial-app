import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { validateEmail, validatePassword, validateRequired } from '@/utils/validation';

export default function RegisterScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { register, isLoading } = useAuthStore();

    const handleRegister = async () => {
        // Validate all fields
        const nameValidation = validateRequired(fullName, 'Nombre completo');
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        const newErrors: Record<string, string> = {};

        if (!nameValidation.isValid) newErrors.fullName = nameValidation.error!;
        if (!emailValidation.isValid) newErrors.email = emailValidation.error!;
        if (!passwordValidation.isValid) newErrors.password = passwordValidation.error!;
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const success = await register(fullName, email, password);
        if (success) {
            // Navigation handled by auth state change
        }
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
                    <View className="items-center mt-8 mb-8">
                        <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mb-4">
                            <MaterialCommunityIcons name="account-plus" size={32} color="#fff" />
                        </View>
                        <Text className="text-2xl font-bold text-gray-700 dark:text-white mb-2">
                            Crear Cuenta
                        </Text>
                        <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
                            Comienza a controlar tus finanzas
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="flex-1">
                        <Input
                            label="Nombre completo"
                            placeholder="Juan Pérez"
                            leftIcon="account-outline"
                            value={fullName}
                            onChangeText={setFullName}
                            autoComplete="name"
                            error={errors.fullName}
                        />

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
                            placeholder="Mínimo 6 caracteres"
                            leftIcon="lock-outline"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            error={errors.password}
                        />

                        <Input
                            label="Confirmar contraseña"
                            placeholder="Repite tu contraseña"
                            leftIcon="lock-check-outline"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            error={errors.confirmPassword}
                        />

                        <Button
                            onPress={handleRegister}
                            isLoading={isLoading}
                            className="mt-4 mb-4"
                            size="lg"
                        >
                            Crear Cuenta
                        </Button>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center py-6">
                        <Text className="text-gray-500 dark:text-gray-400">
                            ¿Ya tienes cuenta?{' '}
                        </Text>
                        <Link href="/login" asChild>
                            <Text className="text-primary-500 font-semibold">
                                Inicia Sesión
                            </Text>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
