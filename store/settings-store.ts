import { defaultCategories } from '@/constants/categories';
import type { Category, Currency, Language, PrimaryColor, ThemeMode, UserPreferences } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore {
    preferences: UserPreferences;
    categories: Category[];

    // Preference actions
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (language: Language) => void;
    setCurrency: (currency: Currency) => void;
    setPrimaryColor: (color: PrimaryColor) => void;

    // Category actions
    addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => void;
    updateCategory: (id: string, data: Partial<Category>) => void;
    deleteCategory: (id: string) => void;

    // Data actions
    exportData: () => Promise<string>;
    importData: (data: string) => Promise<boolean>;
    resetSettings: () => void;
}

const defaultPreferences: UserPreferences = {
    theme: 'system',
    language: 'es',
    mainCurrency: 'USD',
    primaryColor: 'green',
};

// Primary color hex values
export const primaryColors: Record<PrimaryColor, { hex: string; name: string }> = {
    green: { hex: '#22c55e', name: 'Verde' },
    blue: { hex: '#3b82f6', name: 'Azul' },
    purple: { hex: '#a855f7', name: 'Morado' },
    orange: { hex: '#f97316', name: 'Naranja' },
    pink: { hex: '#ec4899', name: 'Rosa' },
    teal: { hex: '#14b8a6', name: 'Verde Azulado' },
    red: { hex: '#ef4444', name: 'Rojo' },
    indigo: { hex: '#6366f1', name: 'Índigo' },
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set, get) => ({
            preferences: defaultPreferences,
            categories: defaultCategories,

            setTheme: (theme) => {
                set((state) => ({
                    preferences: { ...state.preferences, theme },
                }));
            },

            setLanguage: (language) => {
                set((state) => ({
                    preferences: { ...state.preferences, language },
                }));
            },

            setCurrency: (currency) => {
                set((state) => ({
                    preferences: { ...state.preferences, mainCurrency: currency },
                }));
            },

            setPrimaryColor: (primaryColor) => {
                set((state) => ({
                    preferences: { ...state.preferences, primaryColor },
                }));
            },

            addCategory: (categoryData) => {
                const newCategory: Category = {
                    ...categoryData,
                    id: Date.now().toString(),
                    isDefault: false,
                };
                set((state) => ({
                    categories: [...state.categories, newCategory],
                }));
            },

            updateCategory: (id, data) => {
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...data } : c
                    ),
                }));
            },

            deleteCategory: (id) => {
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id || c.isDefault),
                }));
            },

            exportData: async () => {
                const { preferences, categories } = get();
                const data = JSON.stringify({ preferences, categories }, null, 2);
                return data;
            },

            importData: async (dataString) => {
                try {
                    const data = JSON.parse(dataString);
                    if (data.preferences) {
                        set({ preferences: data.preferences });
                    }
                    if (data.categories) {
                        set({ categories: data.categories });
                    }
                    return true;
                } catch {
                    return false;
                }
            },

            resetSettings: () => {
                set({
                    preferences: defaultPreferences,
                    categories: defaultCategories,
                });
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
