import type { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    register: (fullName: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email: string, password: string) => {
                set({ isLoading: true });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Mock successful login
                if (email && password) {
                    const user: User = {
                        id: '1',
                        email,
                        fullName: email.split('@')[0],
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false });
                    return true;
                }

                set({ isLoading: false });
                return false;
            },

            register: async (fullName: string, email: string, password: string) => {
                set({ isLoading: true });

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (fullName && email && password) {
                    const user: User = {
                        id: Date.now().toString(),
                        email,
                        fullName,
                        createdAt: new Date().toISOString(),
                    };
                    set({ user, isAuthenticated: true, isLoading: false });
                    return true;
                }

                set({ isLoading: false });
                return false;
            },

            logout: () => {
                set({ user: null, isAuthenticated: false });
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
