import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSettingsStore } from '@/store/settings-store';

const COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const ICONS = [
    'food', 'shopping', 'car', 'home', 'medical-bag',
    'school', 'gamepad-variant', 'cash', 'bank', 'chart-line',
    'gift', 'airplane', 'music', 'book', 'briefcase', 'hammer'
];

export default function CategoryFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { categories, addCategory, updateCategory } = useSettingsStore();
    const colorScheme = useColorScheme();
    const primaryColor = useThemeColor({}, 'tint');

    const isEditing = !!id;

    const [name, setName] = useState('');
    const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
    const [color, setColor] = useState(COLORS[4]);
    const [icon, setIcon] = useState('tag');
    const [customImage, setCustomImage] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (isEditing && id) {
            const category = categories.find(c => c.id === id);
            if (category) {
                setName(category.name);
                setType(category.type);
                setColor(category.color);
                setIcon(category.icon);
                setCustomImage(category.customImage);
            }
        }
    }, [id, categories]);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permiso requerido', 'Es necesario el permiso para acceder a la galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setCustomImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        const categoryData = {
            name,
            type,
            color,
            icon,
            customImage,
        };

        if (isEditing && id) {
            updateCategory(id, categoryData);
        } else {
            addCategory(categoryData as any);
        }
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-light-bg dark:bg-dark-bg" edges={['top']}>
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                <Pressable onPress={() => router.back()} className="p-2">
                    <MaterialCommunityIcons name="close" size={24} color="#000" className="dark:text-white" />
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </Text>
                <Pressable onPress={handleSave} className="p-2">
                    <Text className="text-primary-500 font-bold text-lg">Guardar</Text>
                </Pressable>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Preview */}
                <View className="items-center mb-8">
                    <View
                        className="w-24 h-24 rounded-full items-center justify-center mb-2 shadow-sm"
                        style={{ backgroundColor: customImage ? 'transparent' : color }}
                    >
                        {customImage ? (
                            <Image source={{ uri: customImage }} className="w-24 h-24 rounded-full" />
                        ) : (
                            <MaterialCommunityIcons name={icon as any} size={48} color="#fff" />
                        )}

                        <Pressable
                            onPress={handlePickImage}
                            className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2"
                        >
                            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
                        </Pressable>
                    </View>
                    <Text className="text-gray-500 text-sm">Toque el icono para subir imagen</Text>
                </View>

                {/* Name */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre</Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Ej. Comida, Transporte..."
                        className="bg-white dark:bg-dark-card p-4 rounded-xl text-gray-900 dark:text-white text-base"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Type */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</Text>
                    <View className="flex-row bg-gray-100 dark:bg-dark-surface p-1 rounded-xl">
                        {(['expense', 'income', 'both'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 8,
                                    alignItems: 'center',
                                    borderRadius: 8,
                                    backgroundColor: type === t ? (colorScheme === 'dark' ? '#374151' : '#ffffff') : 'transparent',
                                    shadowOpacity: type === t ? 0.1 : 0,
                                    shadowRadius: 2,
                                    shadowOffset: { width: 0, height: 1 },
                                    elevation: type === t ? 2 : 0,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: '500',
                                        color: type === t
                                            ? (colorScheme === 'dark' ? '#ffffff' : primaryColor)
                                            : '#6b7280'
                                    }}
                                >
                                    {t === 'expense' ? 'Gasto' : t === 'income' ? 'Ingreso' : 'Ambos'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Color Picker */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {COLORS.map((c) => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => setColor(c)}
                                className={`w-10 h-10 rounded-full ${color === c ? 'border-2 border-gray-400' : ''}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </View>
                </View>

                {/* Icon Picker (only if no image) */}
                <View className="mb-8">
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icono</Text>
                    <View className="flex-row flex-wrap gap-4">
                        {ICONS.map((i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => { setIcon(i); setCustomImage(undefined); }}
                                className={`w-12 h-12 rounded-xl items-center justify-center bg-white dark:bg-dark-card ${icon === i && !customImage ? 'border-2 border-primary-500' : ''}`}
                            >
                                <MaterialCommunityIcons name={i as any} size={24} color="#6b7280" />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
