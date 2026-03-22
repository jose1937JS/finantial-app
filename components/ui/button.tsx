import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, Text } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';


interface ButtonProps extends PressableProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    textClassName = '',
    children,
    onPress,
    ...props
}: ButtonProps) {
    const primaryColor = useThemeColor({}, 'tint');

    const handlePress = (e: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
    };

    const baseClasses = 'items-center justify-center rounded-2xl active:opacity-80 shadow-sm shadow-slate-200 dark:shadow-slate-700';

    const sizeClasses = {
        sm: 'px-4 py-2',
        md: 'px-6 py-3',
        lg: 'px-8 py-4',
    };

    const variantClasses = {
        primary: 'bg-primary-500',
        secondary: 'bg-light-surface dark:bg-dark-surface',
        outline: 'border-2 border-primary-500 bg-transparent',
        ghost: 'bg-transparent',
        danger: 'bg-expense',
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const textVariantClasses = {
        primary: 'text-white font-semibold',
        secondary: 'text-gray-700 dark:text-gray-200 font-medium',
        outline: 'text-primary-500 font-semibold',
        ghost: 'text-gray-600 dark:text-gray-400 font-medium',
        danger: 'text-white font-semibold',
    };

    const disabledClasses = disabled || isLoading ? 'opacity-50' : '';

    return (
        <Pressable
            className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
            onPress={handlePress}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    size="small"
                    color={variant === 'primary' || variant === 'danger' ? '#fff' : primaryColor}
                />
            ) : (
                <Text className={`${textSizeClasses[size]} ${textVariantClasses[variant]} ${textClassName}`}>
                    {children}
                </Text>
            )}
        </Pressable>
    );
}
