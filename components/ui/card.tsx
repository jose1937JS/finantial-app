import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
    variant?: 'default' | 'glass' | 'elevated';
    className?: string;
    children: React.ReactNode;
}

export function Card({
    variant = 'default',
    className = '',
    children,
    ...props
}: CardProps) {
    const baseClasses = 'rounded-3xl p-4';

    const variantClasses = {
        default: 'bg-white dark:bg-dark-card',
        glass: 'bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl',
        elevated: 'bg-white dark:bg-dark-card shadow-lg shadow-black/10',
    };

    return (
        <View
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </View>
    );
}

export function CardHeader({
    className = '',
    children,
    ...props
}: ViewProps & { className?: string }) {
    return (
        <View className={`mb-3 ${className}`} {...props}>
            {children}
        </View>
    );
}

export function CardContent({
    className = '',
    children,
    ...props
}: ViewProps & { className?: string }) {
    return (
        <View className={className} {...props}>
            {children}
        </View>
    );
}

export function CardFooter({
    className = '',
    children,
    ...props
}: ViewProps & { className?: string }) {
    return (
        <View className={`mt-3 pt-3 border-t border-light-border dark:border-dark-border ${className}`} {...props}>
            {children}
        </View>
    );
}
