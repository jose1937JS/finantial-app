import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface AlertConfig {
    title: string;
    message?: string;
    buttons?: AlertButton[];
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
}

// Custom styled alert modal component with fade-in animation
export interface AlertModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
}

export function AlertModal({
    visible,
    onClose,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    icon,
    iconColor,
}: AlertModalProps) {
    const primaryColor = useThemeColor({}, 'tint');

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        if (visible) {
            // Fade in animation
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Reset values when hidden
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible, fadeAnim, scaleAnim]);

    if (!visible) return null;

    const handleButtonPress = (button: AlertButton) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Fade out animation before closing
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
            if (button.onPress) {
                // Execute callback after modal is closed
                setTimeout(() => button.onPress?.(), 50);
            }
        });
    };

    const handleBackdropPress = () => {
        // Just close without triggering any button action
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
        });
    };

    const getButtonStyle = (style?: AlertButton['style']) => {
        switch (style) {
            case 'destructive':
                return 'bg-red-500';
            case 'cancel':
                return 'bg-gray-200 dark:bg-gray-700';
            default:
                return 'bg-primary-500';
        }
    };

    const getButtonTextStyle = (style?: AlertButton['style']) => {
        switch (style) {
            case 'cancel':
                return 'text-gray-700 dark:text-gray-300';
            default:
                return 'text-white';
        }
    };

    const getIconColor = () => {
        if (iconColor) return iconColor;
        return primaryColor;
    };

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ scale: scaleAnim }],
                                }
                            ]}
                        >
                            <View className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
                                {/* Content */}
                                <View className="px-6 pt-8 pb-6 items-center">
                                    {icon && (
                                        <View
                                            className="w-16 h-16 rounded-full items-center justify-center mb-4"
                                            style={{ backgroundColor: `${getIconColor()}15` }}
                                        >
                                            <MaterialCommunityIcons
                                                name={icon}
                                                size={32}
                                                color={getIconColor()}
                                            />
                                        </View>
                                    )}
                                    <Text className="text-xl font-bold text-gray-700 dark:text-white text-center mb-2">
                                        {title}
                                    </Text>
                                    {message && (
                                        <Text className="text-base text-gray-600 dark:text-gray-400 text-center leading-6">
                                            {message}
                                        </Text>
                                    )}
                                </View>

                                {/* Buttons */}
                                <View className="px-6 pb-6">
                                    {buttons.length === 1 ? (
                                        <Pressable
                                            onPress={() => handleButtonPress(buttons[0])}
                                            className={`py-4 rounded-2xl ${getButtonStyle(buttons[0].style)}`}
                                        >
                                            <Text className={`text-center font-semibold text-base ${getButtonTextStyle(buttons[0].style)}`}>
                                                {buttons[0].text}
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <View className="flex-row gap-3">
                                            {buttons.map((button, index) => (
                                                <Pressable
                                                    key={index}
                                                    onPress={() => handleButtonPress(button)}
                                                    className={`flex-1 py-3 rounded-2xl ${getButtonStyle(button.style)}`}
                                                >
                                                    <Text className={`text-center font-semibold text-base ${getButtonTextStyle(button.style)}`}>
                                                        {button.text}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
    },
});
