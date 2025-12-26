import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
    onRightIconPress?: () => void;
    containerClassName?: string;
    inputClassName?: string;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerClassName = '',
    inputClassName = '',
    secureTextEntry,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const showPasswordToggle = secureTextEntry !== undefined;
    const actualSecureTextEntry = secureTextEntry && !isPasswordVisible;

    const borderColor = error
        ? 'border-expense'
        : isFocused
            ? 'border-primary-500'
            : 'border-light-border dark:border-dark-border';

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {label && (
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </Text>
            )}

            <View
                className={`flex-row items-center bg-light-surface dark:bg-dark-surface rounded-2xl border-2 ${borderColor} px-4`}
            >
                {leftIcon && (
                    <MaterialCommunityIcons
                        name={leftIcon}
                        size={20}
                        color={error ? '#ef4444' : '#9ca3af'}
                        style={{ marginRight: 12 }}
                    />
                )}

                <TextInput
                    className={`flex-1 py-4 text-base text-gray-900 dark:text-white ${inputClassName}`}
                    placeholderTextColor="#9ca3af"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={actualSecureTextEntry}
                    {...props}
                />

                {showPasswordToggle && (
                    <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <MaterialCommunityIcons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color="#9ca3af"
                        />
                    </Pressable>
                )}

                {rightIcon && !showPasswordToggle && (
                    <Pressable onPress={onRightIconPress}>
                        <MaterialCommunityIcons
                            name={rightIcon}
                            size={20}
                            color="#9ca3af"
                        />
                    </Pressable>
                )}
            </View>

            {error && (
                <Text className="text-sm text-expense mt-1 ml-1">
                    {error}
                </Text>
            )}
        </View>
    );
}
