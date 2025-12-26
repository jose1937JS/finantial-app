import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text } from 'react-native';

interface ChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    variant?: 'default' | 'income' | 'expense' | 'outline';
    size?: 'sm' | 'md';
    className?: string;
}

export function Chip({
    label,
    selected = false,
    onPress,
    variant = 'default',
    size = 'md',
    className = '',
}: ChipProps) {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5',
        md: 'px-4 py-2',
    };

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
    };

    const getVariantClasses = () => {
        if (selected) {
            switch (variant) {
                case 'income':
                    return 'bg-income';
                case 'expense':
                    return 'bg-expense';
                case 'outline':
                    return 'bg-primary-500';
                default:
                    return 'bg-primary-500';
            }
        }
        return 'bg-light-surface dark:bg-dark-surface';
    };

    const getTextClasses = () => {
        if (selected) {
            return 'text-white font-semibold';
        }
        return 'text-gray-600 dark:text-gray-400 font-medium';
    };

    return (
        <Pressable
            onPress={handlePress}
            className={`rounded-full ${sizeClasses[size]} ${getVariantClasses()} active:opacity-80 ${className}`}
        >
            <Text className={`${textSizeClasses[size]} ${getTextClasses()}`}>
                {label}
            </Text>
        </Pressable>
    );
}

interface ChipGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function ChipGroup({ children, className = '' }: ChipGroupProps) {
    return (
        <Pressable className={`flex-row flex-wrap gap-2 ${className}`}>
            {children}
        </Pressable>
    );
}
