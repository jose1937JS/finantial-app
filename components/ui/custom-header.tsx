import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';

interface CustomHeaderProps {
    title: string;
    onBack?: () => void;
    rightAction?: React.ReactNode;
}

export function CustomHeader({ title, onBack, rightAction }: CustomHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colorScheme } = useColorScheme();

    const iconColor = colorScheme === 'dark' ? '#ffffff' : '#000000';
    const backgroundColor = colorScheme === 'dark' ? '#0f0f0f' : '#f8fafc';
    const titleColor = colorScheme === 'dark' ? '#ffffff' : '#111827';
    const borderColor = colorScheme === 'dark' ? '#2a2a2a' : '#e5e7eb';

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View
            style={{
                paddingTop: insets.top,
                backgroundColor,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: Platform.OS === 'ios' ? 44 : 56,
                    paddingHorizontal: 8,
                }}
            >
                {/* Back Button */}
                <Pressable
                    onPress={handleBack}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <MaterialCommunityIcons
                        name={Platform.OS === 'ios' ? 'chevron-left' : 'arrow-left'}
                        size={Platform.OS === 'ios' ? 32 : 24}
                        color={iconColor}
                    />
                </Pressable>

                {/* Title */}
                <Text
                    style={{
                        fontSize: 17,
                        fontWeight: '600',
                        color: titleColor,
                        flex: 1,
                        textAlign: 'center',
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {/* Right Action or Spacer */}
                <View style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    {rightAction}
                </View>
            </View>
        </View>
    );
}
