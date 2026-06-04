import { UserService } from '@/api/services/user.service';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomHeader } from '@/components/ui/custom-header';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { useAuthStore } from '@/store/auth-store';
import { validateEmail, validatePhone, validateRequired } from '@/utils/validation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const { showAlert } = useAlert();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};

        const nameValidation = validateRequired(fullName, 'Nombre');
        if (!nameValidation.isValid) newErrors.fullName = nameValidation.error!;

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) newErrors.email = emailValidation.error!;

        const phoneValidation = validatePhone(phone);
        if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error!;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Split fullName into name + last_name for the backend DTO
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ') || '';

            await UserService.update(Number(user?.id), {
                name: firstName,
                last_name: lastName || undefined,
                phone: phone || undefined,
            });

            // Update auth store locally
            updateUser({
                fullName,
                email,
                phone: phone || undefined,
            });

            showAlert({
                title: 'Éxito',
                message: 'Perfil actualizado correctamente',
                icon: 'check-circle',
                iconColor: '#22c55e',
                buttons: [{ text: 'OK', onPress: () => router.back() }]
            });
        } catch (error) {
            console.log("Error actualizando el perfil: ", error)
            showAlert({ title: 'Error', message: 'No se pudo actualizar el perfil', icon: 'alert-circle', iconColor: '#ef4444' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <CustomHeader title="Editar Perfil" />
            <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ padding: 20 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Avatar Section */}
                        <View className="items-center mb-8">
                            <Image
                                source={{ uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                className="w-28 h-28 rounded-full"
                                resizeMode="cover"
                            />
                        </View>

                        {/* Form */}
                        <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                            <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                                Información Personal
                            </Text>

                            <Input
                                label="Nombre Completo"
                                placeholder="Tu nombre"
                                leftIcon="account-outline"
                                value={fullName}
                                onChangeText={setFullName}
                                error={errors.fullName}
                            />

                            <Input
                                label="Correo Electrónico"
                                placeholder="tu@email.com"
                                leftIcon="email-outline"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email}
                            />

                            <Input
                                label="Teléfono"
                                placeholder="Tu número de teléfono"
                                leftIcon="phone-outline"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                error={errors.phone}
                            />
                        </Card>

                        {/* Account Info */}
                        <Card className="mb-6 shadow-sm shadow-slate-200 dark:shadow-slate-700">
                            <Text className="text-lg font-bold text-gray-700 dark:text-white mb-4">
                                Información de la Cuenta
                            </Text>

                            <View className="flex-row items-center py-3">
                                <MaterialCommunityIcons name="identifier" size={20} color="#9ca3af" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                                    ID: {user?.id || 'N/A'}
                                </Text>
                            </View>

                            <View className="flex-row items-center py-3">
                                <MaterialCommunityIcons name="calendar" size={20} color="#9ca3af" />
                                <Text className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                                    Miembro desde: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'N/A'}
                                </Text>
                            </View>
                        </Card>

                        {/* Save Button */}
                        <Button
                            onPress={handleSave}
                            isLoading={isLoading}
                            size="lg"
                            className="mb-4"
                        >
                            Guardar Cambios
                        </Button>

                        <Button
                            variant="ghost"
                            onPress={() => router.back()}
                        >
                            Cancelar
                        </Button>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}
