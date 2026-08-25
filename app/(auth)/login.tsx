import { InfoModal } from '@/components/ui/info-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('jose@jose.com');
    const [password, setPassword] = useState('123123');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');

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
        const result = await login(email, password);

        if (result.success) {
            router.replace('/(tabs)');
        }
        else {
            setModalErrorMsg(result.error || 'Correo o contraseña incorrectos');
            setShowErrorModal(true);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-primary dark:bg-dark-bg" edges={['top']}>
            <KeyboardAvoidingView
                className='flex-1'
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View className='flex-1 justify-end'>
                    <Card variant="elevated" className='p-7 py-10'>
                        {/* Header */}
                        <View className="items-center mt-4 mb-10">
                            <View className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center mb-6">
                                <MaterialCommunityIcons name="wallet" size={40} color="#fff" />
                            </View>
                            <Text className="text-3xl font-bold text-gray-700 dark:text-white mb-2">
                                Bienvenido
                            </Text>
                            <Text className="text-base text-gray-500 dark:text-gray-400 text-center">
                                Inicia sesión para gestionar tus finanzas
                            </Text>
                        </View>
                        
                        {/* Form */}
                        <View >
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
                                <Text className="text-right text-primary-500 font-medium mb-10">
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
                        {/* <View className="flex-row justify-center py-8">
                            <Text className="text-gray-500 dark:text-gray-400">
                                ¿No tienes cuenta?{' '}
                            </Text>
                            <Link href="/register" asChild>
                                <Text className="text-primary-500 font-semibold">
                                    Regístrate
                                </Text>
                            </Link>
                        </View> */}
                    </Card>
                </View>
            </KeyboardAvoidingView>

            <InfoModal
                visible={showErrorModal}
                title="Error de autenticación"
                message={modalErrorMsg}
                type="error"
                onClose={() => setShowErrorModal(false)}
            />
        </SafeAreaView>
    );
}
