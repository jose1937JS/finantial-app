import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Button } from './button';
import { Card } from './card';

interface DatePickerModalProps {
    visible: boolean;
    onClose: () => void;
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    label: string;
    minimumDate?: Date;
    error?: string;
}

export function DatePickerModal({
    visible,
    onClose,
    value,
    onChange,
    label,
    minimumDate,
    error,
}: DatePickerModalProps) {
    const [tempDate, setTempDate] = useState(new Date(value + 'T12:00:00')); // Use noon to avoid offset issues
    const opacity = useSharedValue(0);
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        if (visible && Platform.OS === 'ios') {
            opacity.value = withTiming(1, { duration: 300 });
            setTempDate(new Date(value + 'T12:00:00'));
        } else if (!visible && Platform.OS === 'ios') {
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: 0.9 + (opacity.value * 0.1) }],
    }));

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleConfirm = () => {
        onChange(formatDate(tempDate));
        onClose();
    };

    // For Android, we don't show the custom modal, we use the native one directly
    if (Platform.OS === 'android') {
        if (!visible) return null;
        return (
            <DateTimePicker
                value={new Date(value + 'T12:00:00')}
                mode="date"
                display="default"
                minimumDate={minimumDate}
                onChange={(event, selectedDate) => {
                    onClose();
                    if (selectedDate && event.type !== 'dismissed') {
                        onChange(formatDate(selectedDate));
                    }
                }}
            />
        );
    }

    // For iOS, we show a professional modal
    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    style={[overlayStyle]}
                    className="flex-1 bg-black/50 justify-center items-center px-6"
                >
                    <TouchableWithoutFeedback>
                        <Animated.View style={[cardStyle]} className="w-full">
                            <Card className="bg-white dark:bg-dark-surface p-6 rounded-3xl overflow-hidden">
                                <Text className="text-xl font-bold text-gray-700 dark:text-white mb-6 text-center">
                                    {label}
                                </Text>

                                <View className="items-center justify-center mb-6">
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="date"
                                        display="spinner"
                                        minimumDate={minimumDate}
                                        textColor={Platform.OS === 'ios' ? (colorScheme === 'dark' ? '#ffffff' : '#000000') : undefined}
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                setTempDate(selectedDate);
                                            }
                                        }}
                                        style={{ height: 200, width: '100%' }}
                                    />
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Button
                                            variant="outline"
                                            onPress={onClose}
                                            className="border-gray-200 dark:border-gray-800"
                                        >
                                            <Text className="text-gray-600 dark:text-gray-400">Cancelar</Text>
                                        </Button>
                                    </View>
                                    <View className="flex-1">
                                        <Button onPress={handleConfirm}>
                                            <Text className="text-white">Confirmar</Text>
                                        </Button>
                                    </View>
                                </View>
                            </Card>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

interface DatePickerTriggerProps {
    value: string;
    onPress: () => void;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    error?: string;
    placeholder?: string;
}

export function DatePickerTrigger({
    value,
    onPress,
    label,
    icon,
    error,
    placeholder = 'Seleccionar fecha',
}: DatePickerTriggerProps) {
    return (
        <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {label}
            </Text>
            <Pressable
                onPress={onPress}
                className={`flex-row items-center bg-gray-50 dark:bg-dark-surface border rounded-xl px-4 py-3 ${error ? 'border-expense' : 'border-gray-200 dark:border-gray-800'}`}
            >
                <MaterialCommunityIcons
                    name={icon}
                    size={20}
                    color={error ? '#ef4444' : '#6b7280'}
                    style={{ marginRight: 10 }}
                />
                <Text className={`text-base flex-1 ${value ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400'
                    }`}>
                    {value || placeholder}
                </Text>
            </Pressable>
            {error && (
                <Text className="text-sm text-expense mt-1">{error}</Text>
            )}
        </View>
    );
}
