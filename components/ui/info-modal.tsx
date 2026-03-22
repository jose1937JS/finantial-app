import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';

export interface InfoModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success';
    mode?: 'alert' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export function InfoModal({
    visible,
    onClose,
    title,
    message,
    type = 'info',
    mode = 'alert',
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}: InfoModalProps) {
    const [showModal, setShowModal] = useState(visible);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.9);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            opacity.value = withTiming(1, { duration: 200 });
            scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(0.9, { duration: 200 }, () => {
                runOnJS(setShowModal)(false);
            });
        }
    }, [visible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const handleConfirm = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onConfirm) {
            onConfirm();
        } else {
            onClose();
        }
    };

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onCancel) {
            onCancel();
        } else {
            onClose();
        }
    };

    if (!showModal) return null;

    const iconConfig = {
        info: { name: 'information', color: '#3b82f6', bg: 'bg-blue-500/10' },
        error: { name: 'alert-circle', color: '#ef4444', bg: 'bg-red-500/10' },
        success: { name: 'check-circle', color: '#22c55e', bg: 'bg-green-500/10' },
    } as const;

    const config = iconConfig[type];

    return (
        <Modal
            visible={showModal}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[backdropStyle]} className="flex-1 bg-black/50 justify-center items-center p-6">
                    <TouchableWithoutFeedback>
                        <Animated.View
                            style={[animatedStyle]}
                            className="bg-white dark:bg-dark-card rounded-3xl w-full max-w-sm overflow-hidden"
                        >
                            <View className="p-6 items-center">
                                <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${config.bg}`}>
                                    <MaterialCommunityIcons name={config.name as any} size={32} color={config.color} />
                                </View>

                                <Text className="text-xl font-bold text-gray-700 dark:text-white text-center mb-2">
                                    {title}
                                </Text>

                                <Text className="text-base text-gray-500 dark:text-gray-400 text-center mb-6">
                                    {message}
                                </Text>

                                <View className="flex-row gap-3 w-full">
                                    {mode === 'confirm' && (
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onPress={handleCancel}
                                        >
                                            {cancelText}
                                        </Button>
                                    )}
                                    <Button
                                        className="flex-1"
                                        onPress={handleConfirm}
                                        style={type === 'error' ? { backgroundColor: config.color } : undefined}
                                    >
                                        {confirmText}
                                    </Button>
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
