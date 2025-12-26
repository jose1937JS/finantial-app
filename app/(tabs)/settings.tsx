import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import type { Currency, Language } from '@/types';

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

export default function SettingsScreen() {
    const { user, logout } = useAuthStore();
    const { preferences, setTheme, setLanguage, setCurrency } = useSettingsStore();

    const isDarkMode = preferences.theme === 'dark';

    const handleToggleDarkMode = () => {
        setTheme(isDarkMode ? 'light' : 'dark');
    };

    const handleSelectLanguage = () => {
        Alert.alert(
            'Idioma',
            'Selecciona tu idioma preferido',
            [
                { text: 'Español', onPress: () => setLanguage('es') },
                { text: 'English', onPress: () => setLanguage('en') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleSelectCurrency = () => {
        Alert.alert(
            'Moneda Principal',
            'Selecciona tu moneda principal',
            [
                { text: 'USD ($)', onPress: () => setCurrency('USD') },
                { text: 'VES (Bs.)', onPress: () => setCurrency('VES') },
                { text: 'USDT', onPress: () => setCurrency('USDT') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleExport = () => {
        Alert.alert(
            'Exportar Datos',
            '¿En qué formato deseas exportar?',
            [
                { text: 'CSV', onPress: () => Alert.alert('Éxito', 'Datos exportados en CSV') },
                { text: 'PDF', onPress: () => Alert.alert('Éxito', 'Datos exportados en PDF') },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleImport = () => {
        Alert.alert('Importar Datos', 'Esta función estará disponible próximamente');
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
            ]
        );
    };

    const getLanguageLabel = (lang: Language) => {
        return lang === 'es' ? 'Español' : 'English';
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
                        <View className="w-16 h-16 rounded-full bg-primary-500 items-center justify-center mr-4">
                            <Text className="text-2xl font-bold text-white">
                                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                                {user?.fullName || 'Usuario'}
                            </Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">
                                {user?.email || 'email@ejemplo.com'}
                            </Text>
                        </View>
                        <Pressable className="p-2">
                            <MaterialCommunityIcons name="pencil" size={20} color="#22c55e" />
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
                                trackColor={{ false: '#e5e7eb', true: '#22c55e' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="translate"
                        iconColor="#3b82f6"
                        title="Idioma"
                        subtitle={getLanguageLabel(preferences.language)}
                        onPress={handleSelectLanguage}
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="currency-usd"
                        iconColor="#22c55e"
                        title="Moneda Principal"
                        subtitle={getCurrencyLabel(preferences.mainCurrency)}
                        onPress={handleSelectCurrency}
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
                        onPress={() => Alert.alert('Categorías', 'Gestión de categorías próximamente')}
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
                        onPress={handleExport}
                    />
                    <View className="h-px bg-light-border dark:bg-dark-border" />

                    <SettingItem
                        icon="import"
                        iconColor="#a855f7"
                        title="Importar Datos"
                        subtitle="Restaurar desde backup"
                        onPress={handleImport}
                    />
                </Card>

                {/* Logout Button */}
                <Button
                    variant="danger"
                    onPress={handleLogout}
                    className="mb-8"
                >
                    Cerrar Sesión
                </Button>

                {/* App Version */}
                <Text className="text-center text-sm text-gray-400 dark:text-gray-500 mb-4">
                    FinanceApp v1.0.0
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
