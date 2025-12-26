import { Redirect } from 'expo-router';

export default function AuthIndex() {
    // Default to login when accessing auth group
    return <Redirect href="/(auth)/login" />;
}
