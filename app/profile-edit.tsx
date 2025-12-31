import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomHeader } from '@/components/ui/custom-header';
import { Input } from '@/components/ui/input';
import { useAlert } from '@/hooks/alert-context';
import { useAuthStore } from '@/store/auth-store';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import { validateEmail, validateRequired } from '@/utils/validation';

export default function ProfileEditScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const { preferences } = useSettingsStore();
    const { showAlert } = useAlert();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

    const pickImage = async () => {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            showAlert({ title: 'Permisos necesarios', message: 'Necesitamos acceso a tu galería para seleccionar una imagen', icon: 'image-off', iconColor: '#f59e0b' });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                // Store as base64 data URI
                const mimeType = asset.mimeType || 'image/jpeg';
                const base64Uri = `data:${mimeType};base64,${asset.base64}`;
                setAvatar(base64Uri);
            }
        }
    };

    const takePhoto = async () => {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            showAlert({ title: 'Permisos necesarios', message: 'Necesitamos acceso a tu cámara para tomar una foto', icon: 'camera-off', iconColor: '#f59e0b' });
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (asset.base64) {
                const mimeType = asset.mimeType || 'image/jpeg';
                const base64Uri = `data:${mimeType};base64,${asset.base64}`;
                setAvatar(base64Uri);
            }
        }
    };

    const showImageOptions = () => {
        showAlert({
            title: 'Cambiar Foto',
            message: 'Selecciona una opción',
            icon: 'camera',
            buttons: [
                { text: 'Cámara', onPress: takePhoto },
                { text: 'Galería', onPress: pickImage },
            ]
        });
    };

    const handleSave = async () => {
        const newErrors: Record<string, string> = {};

        const nameValidation = validateRequired(fullName, 'Nombre');
        if (!nameValidation.isValid) newErrors.fullName = nameValidation.error!;

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) newErrors.email = emailValidation.error!;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Update user in store
            updateUser({
                fullName,
                email,
                avatar: avatar || undefined,
            });

            showAlert({
                title: 'Éxito',
                message: 'Perfil actualizado correctamente',
                icon: 'check-circle',
                iconColor: '#22c55e',
                buttons: [{ text: 'OK', onPress: () => router.back() }]
            });
        } catch (error) {
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
                            <Pressable onPress={showImageOptions} className="relative">
                                {avatar ? (
                                    <Image
                                        source={{ uri: avatar }}
                                        className="w-28 h-28 rounded-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View
                                        className="w-28 h-28 rounded-full items-center justify-center"
                                        style={{ backgroundColor: currentPrimaryColor }}
                                    >
                                        <Text className="text-4xl font-bold text-white">
                                            {fullName?.charAt(0).toUpperCase() || 'U'}
                                        </Text>
                                    </View>
                                )}

                                {/* Camera badge */}
                                <View
                                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full items-center justify-center border-4 border-light-bg dark:border-dark-bg"
                                    style={{ backgroundColor: currentPrimaryColor }}
                                >
                                    <MaterialCommunityIcons name="camera" size={20} color="#fff" />
                                </View>
                            </Pressable>

                            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                Toca para cambiar la foto
                            </Text>
                        </View>

                        {/* Form */}
                        <Card variant="elevated" className="mb-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
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
                        </Card>

                        {/* Account Info */}
                        <Card variant="elevated" className="mb-6">
                            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
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
