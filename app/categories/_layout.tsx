import { Stack } from 'expo-router';
import React from 'react';

export default function CategoryLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="form" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
