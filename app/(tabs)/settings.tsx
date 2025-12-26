import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SelectModal, SelectOption } from '@/components/ui/select-modal';
import { useAuthStore } from '@/store/auth-store';
import { primaryColors, useSettingsStore } from '@/store/settings-store';
import type { Currency, Language, PrimaryColor } from '@/types';

interface SettingItemProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
}

function SettingItem({ icon, iconColor = '#6b7280', title, subtitle, onPress, rightElement }: SettingItemProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center py-4 active:opacity-70"
            disabled={!onPress}
        >
            <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${iconColor}20` }}
            >
                <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-medium text-gray-900 dark:text-white">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightElement || (
                onPress && <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
            )}
        </Pressable>
    );
}

// Modal types
type ModalType = 'language' | 'currency' | 'theme' | 'export' | 'logout' | null;

export default function SettingsScreen() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { preferences, setTheme, setLanguage, setCurrency, setPrimaryColor } = useSettingsStore();

    const [activeModal, setActiveModal] = useState<ModalType>(null);

    const isDarkMode = preferences.theme === 'dark';
    const currentPrimaryColor = primaryColors[preferences.primaryColor]?.hex || '#22c55e';

    const handleToggleDarkMode = () => {
        setTheme(isDarkMode ? 'light' : 'dark');
    };

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    // Language options
    const languageOptions: SelectOption<Language>[] = [
        { label: 'Español', value: 'es', icon: 'translate' },
        { label: 'English', value: 'en', icon: 'translate' },
        { label: 'Português', value: 'pt', icon: 'translate' },
    ];

    // Currency options
    const currencyOptions: SelectOption<Currency>[] = [
        { label: 'USD ($)', value: 'USD', icon: 'currency-usd', color: currentPrimaryColor },
        { label: 'VES (Bs.)', value: 'VES', icon: 'currency-usd', color: '#3b82f6' },
        { label: 'USDT', value: 'USDT', icon: 'currency-btc', color: '#14b8a6' },
    ];

    // Theme color options
    const themeColorOptions: SelectOption<PrimaryColor>[] = Object.entries(primaryColors).map(
        ([key, value]) => ({
            label: value.name,
            value: key as PrimaryColor,
            color: value.hex,
        })
    );

    // Export options
    const exportOptions: SelectOption<string>[] = [
        { label: 'Exportar como CSV', value: 'csv', icon: 'file-delimited', color: currentPrimaryColor },
        { label: 'Exportar como PDF', value: 'pdf', icon: 'file-pdf-box', color: '#ef4444' },
    ];

    // Logout options
    const logoutOptions: SelectOption<string>[] = [
        { label: 'Cancelar', value: 'cancel', icon: 'close', color: '#6b7280' },
        { label: 'Cerrar Sesión', value: 'logout', icon: 'logout', color: '#ef4444' },
    ];

    const handleExportSelect = (value: string) => {
        if (value === 'csv') {
            Alert.alert('Éxito', 'Datos exportados en CSV');
        } else if (value === 'pdf') {
            Alert.alert('Éxito', 'Datos exportados en PDF');
        }
    };

    const handleLogoutSelect = (value: string) => {
        if (value === 'logout') {
            handleLogout();
        }
    };

    const getLanguageLabel = (lang: Language) => {
        const labels: Record<Language, string> = {
            es: 'Español',
            en: 'English',
            pt: 'Português',
        };
        return labels[lang];
    };

    const getCurrencyLabel = (currency: Currency) => {
        const labels: Record<Currency, string> = {
            USD: 'USD ($)',
            VES: 'VES (Bs.)',
            USDT: 'USDT',
        };
        return labels[currency];
    };

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg">
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Ajustes
                </Text>

                {/* Profile Section */}
                <Card variant="elevated" className="mb-6">
                    <View className="flex-row items-center">
                        {user?.avatar ? (
                            <Image
                                source={{ uri: user.avatar }}
                                className="w-16 h-16 rounded-full mr-4"
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: currentPrimaryColor }}
                            >
                                <Text className="text-2xl font-bold text-white">
                                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                                </Text>
                            </View>
                        )}
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user?.fullName || 'Usuario'}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email || 'email@ejemplo.com'}
                            </Text>
                        </View>
                        <Pressable
                            className="p-2"
                            onPress={() => router.push('/profile-edit')}
                        >
                            <MaterialCommunityIcons name="pencil" size={20} color={currentPrimaryColor} />
                        </Pressable>
                    </View>
                </Card>

                {/* Preferences Section */}
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
                    Preferencias
                </Text>
                <Card variant="elevated" className="mb-6">
                    <SettingItem
                        icon="theme-light-dark"
                        iconColor="#6366f1"
                        title="Modo Oscuro"
                        subtitle={isDarkMode ? 'Activado' : 'Desactivado'}
                        rightElement={
                            <Switch
                                value={isDarkMode}
                                onValueChange={handleToggleDarkMode}
                                trackColor={{ false: '#e5e7eb', true: currentPrimaryColor }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="palette"
                        iconColor={currentPrimaryColor}
                        title="Color del Tema"
                        subtitle={primaryColors[preferences.primaryColor]?.name || 'Verde'}
                        onPress={() => setActiveModal('theme')}
                        rightElement={
                            <View className="flex-row items-center">
                                <View
                                    className="w-6 h-6 rounded-full mr-2"
                                    style={{ backgroundColor: currentPrimaryColor }}
                                />
                                <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
                            </View>
                        }
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="translate"
                        iconColor="#3b82f6"
                        title="Idioma"
                        subtitle={getLanguageLabel(preferences.language)}
                        onPress={() => setActiveModal('language')}
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="currency-usd"
                        iconColor={currentPrimaryColor}
                        title="Moneda Principal"
                        subtitle={getCurrencyLabel(preferences.mainCurrency)}
                        onPress={() => setActiveModal('currency')}
                    />
                </Card>

                {/* Categories Section */}
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
                    Gestión
                </Text>
                <Card variant="elevated" className="mb-6">
                    <SettingItem
                        icon="shape"
                        iconColor="#f97316"
                        title="Categorías"
                        subtitle="Administra tus categorías personalizadas"
                        onPress={() => router.push('/categories')}
                    />
                </Card>

                {/* Data Section */}
                <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">
                    Datos
                </Text>
                <Card variant="elevated" className="mb-6">
                    <SettingItem
                        icon="export"
                        iconColor="#14b8a6"
                        title="Exportar Datos"
                        subtitle="CSV o PDF"
                        onPress={() => setActiveModal('export')}
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="import"
                        iconColor="#a855f7"
                        title="Importar Datos"
                        subtitle="Restaurar desde backup"
                        onPress={() => Alert.alert('Importar Datos', 'Esta función estará disponible próximamente')}
                    />
                </Card>

                {/* Logout Button */}
                <Button
                    variant="danger"
                    onPress={() => setActiveModal('logout')}
                    className="mb-8"
                >
                    Cerrar Sesión
                </Button>

                {/* App Version */}
                <Text className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">
                    FinanceApp v1.0.0
                </Text>
            </ScrollView>

            {/* Modals */}
            <SelectModal<Language>
                visible={activeModal === 'language'}
                onClose={() => setActiveModal(null)}
                title="Idioma"
                subtitle="Selecciona tu idioma preferido"
                options={languageOptions}
                selectedValue={preferences.language}
                onSelect={setLanguage}
            />

            <SelectModal<Currency>
                visible={activeModal === 'currency'}
                onClose={() => setActiveModal(null)}
                title="Moneda Principal"
                subtitle="Selecciona tu moneda principal"
                options={currencyOptions}
                selectedValue={preferences.mainCurrency}
                onSelect={setCurrency}
            />

            <SelectModal<PrimaryColor>
                visible={activeModal === 'theme'}
                onClose={() => setActiveModal(null)}
                title="Color del Tema"
                subtitle="Personaliza el color principal de la app"
                options={themeColorOptions}
                selectedValue={preferences.primaryColor}
                onSelect={setPrimaryColor}
                showColors
            />

            <SelectModal<string>
                visible={activeModal === 'export'}
                onClose={() => setActiveModal(null)}
                title="Exportar Datos"
                subtitle="Selecciona el formato de exportación"
                options={exportOptions}
                onSelect={handleExportSelect}
            />

            <SelectModal<string>
                visible={activeModal === 'logout'}
                onClose={() => setActiveModal(null)}
                title="Cerrar Sesión"
                subtitle="¿Estás seguro que deseas cerrar sesión?"
                options={logoutOptions}
                onSelect={handleLogoutSelect}
            />
        </SafeAreaView>
    );
}
