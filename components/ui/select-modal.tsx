import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, TouchableWithoutFeedback, View } from 'react-native';

export interface SelectOption<T = string> {
    label: string;
    value: T;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    color?: string;
}

interface SelectModalProps<T = string> {
    visible: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    options: SelectOption<T>[];
    selectedValue?: T;
    onSelect: (value: T) => void;
    showColors?: boolean;
}

export function SelectModal<T = string>({
    visible,
    onClose,
    title,
    subtitle,
    options,
    selectedValue,
    onSelect,
    showColors = false,
}: SelectModalProps<T>) {
    const handleSelect = (value: T) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(value);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableWithoutFeedback>
                        <View className="bg-white dark:bg-dark-card rounded-t-3xl max-h-[70%]">
                            {/* Header */}
                            <View className="px-6 pt-6 pb-4 border-b border-light-border dark:border-dark-border">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                        {title}
                                    </Text>
                                    <Pressable
                                        onPress={onClose}
                                        className="w-8 h-8 rounded-full bg-light-surface dark:bg-dark-surface items-center justify-center"
                                    >
                                        <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
                                    </Pressable>
                                </View>
                                {subtitle && (
                                    <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {subtitle}
                                    </Text>
                                )}
                            </View>

                            {/* Options */}
                            <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
                                {showColors ? (
                                    // Color grid layout
                                    <View className="flex-row flex-wrap justify-center gap-4 pb-8">
                                        {options.map((option, index) => (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleSelect(option.value)}
                                                className="items-center"
                                            >
                                                <View
                                                    className={`w-16 h-16 rounded-2xl items-center justify-center ${selectedValue === option.value
                                                            ? 'border-4 border-gray-900 dark:border-white'
                                                            : 'border-2 border-transparent'
                                                        }`}
                                                    style={{ backgroundColor: option.color }}
                                                >
                                                    {selectedValue === option.value && (
                                                        <MaterialCommunityIcons name="check" size={28} color="#fff" />
                                                    )}
                                                </View>
                                                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                                                    {option.label}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                ) : (
                                    // List layout
                                    <View className="pb-8">
                                        {options.map((option, index) => (
                                            <Pressable
                                                key={index}
                                                onPress={() => handleSelect(option.value)}
                                                className={`flex-row items-center py-4 px-4 rounded-2xl mb-2 ${selectedValue === option.value
                                                        ? 'bg-primary-500/10'
                                                        : 'bg-light-surface dark:bg-dark-surface'
                                                    }`}
                                            >
                                                {option.icon && (
                                                    <View
                                                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                                        style={{ backgroundColor: option.color ? `${option.color}20` : '#6b728020' }}
                                                    >
                                                        <MaterialCommunityIcons
                                                            name={option.icon}
                                                            size={22}
                                                            color={option.color || '#6b7280'}
                                                        />
                                                    </View>
                                                )}
                                                {option.color && !option.icon && (
                                                    <View
                                                        className="w-6 h-6 rounded-full mr-4"
                                                        style={{ backgroundColor: option.color }}
                                                    />
                                                )}
                                                <Text className={`flex-1 text-base ${selectedValue === option.value
                                                        ? 'font-semibold text-primary-500'
                                                        : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {option.label}
                                                </Text>
                                                {selectedValue === option.value && (
                                                    <MaterialCommunityIcons name="check-circle" size={24} color="#22c55e" />
                                                )}
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
