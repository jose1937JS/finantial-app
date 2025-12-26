import { useAuthStore } from '@/store/auth-store';
import { Redirect } from 'expo-router';

export default function Index() {
    const { isAuthenticated } = useAuthStore();

    // Redirect based on auth state
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/(auth)/login" />;
}
