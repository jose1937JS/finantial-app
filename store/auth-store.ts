import { AuthService } from '@/api/services/auth.service';
import type { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (fullName: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    updateUser: (user: Partial<User>) => void;
    token: string | null;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true });
                try {
                    const data = await AuthService.login({ email, password });
                    const token = data.access_token;
                    const userPayload = data.user;

                    if (token) {
                        await AsyncStorage.setItem('auth_token', token);
                    }
                    const user: User = {
                        id: String(userPayload.id ?? userPayload.userId ?? ''),
                        email: userPayload.email ?? email,
                        fullName: [userPayload.name, userPayload.lastName].filter(Boolean).join(' ') || email.split('@')[0],
                        avatar: userPayload.avatar,
                        phone: userPayload.phone,
                        createdAt: userPayload.createdAt ?? new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false, token });
                    return { success: true };
                } catch (error: any) {
                    console.error('Login error:', error);
                    let errorMessage = 'Ocurrió un error inesperado al iniciar sesión';
                    if (error.response?.data?.message) {
                        const msg = error.response.data.message;
                        errorMessage = Array.isArray(msg) ? msg[0] : msg;
                    }
                    set({ isLoading: false });
                    return { success: false, error: errorMessage };
                }
            },

            register: async (fullName: string, email: string, password: string) => {
                set({ isLoading: true });
                try {
                    // Split fullName into name + last_name for the backend DTO
                    const nameParts = fullName.trim().split(' ');
                    const firstName = nameParts[0];
                    const lastName = nameParts.slice(1).join(' ') || firstName;
                    const data = await AuthService.register({
                        name: firstName,
                        last_name: lastName,
                        email,
                        password,
                        phone: '',
                    });
                    const token = data.access_token ?? data.token;
                    const userPayload = data.user ?? data;
                    if (token) {
                        await AsyncStorage.setItem('auth_token', token);
                    }
                    const user: User = {
                        id: String(userPayload.id ?? userPayload.userId ?? Date.now()),
                        email: userPayload.email ?? email,
                        fullName: [userPayload.name, userPayload.lastName].filter(Boolean).join(' ') || fullName,
                        avatar: userPayload.avatar,
                        phone: userPayload.phone || '',
                        createdAt: userPayload.createdAt ?? new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (error) {
                    console.error('Register error:', error);
                    set({ isLoading: false });
                    return false;
                }
            },

            logout: async () => {
                await AsyncStorage.removeItem('auth_token');
                set({ user: null, isAuthenticated: false, token: null });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            updateUser: (userData: Partial<User>) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({ user: { ...currentUser, ...userData } });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
