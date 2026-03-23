import { CategoryService } from '@/api/services/category.service';
import { RateService } from '@/api/services/rate.service';
import type { Category, Currency, ExchangeRates, Language, PrimaryColor, ThemeMode, UserPreferences } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore {
    preferences: UserPreferences;
    categories: Category[];
    exchangeRates: ExchangeRates;
    exchangeRateIds: Record<string, number>;

    // Preference actions
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (language: Language) => void;
    setCurrency: (currency: Currency) => void;
    setPrimaryColor: (color: PrimaryColor) => void;
    updateExchangeRate: (key: keyof ExchangeRates, value: number) => void;

    // Remote fetch actions
    fetchCategories: () => Promise<void>;
    fetchRates: () => Promise<void>;

    // Category actions
    addCategory: (category: Omit<Category, 'id' | 'isDefault'>) => Promise<void>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

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

const defaultExchangeRates: ExchangeRates = {
    BCV_USD: 0,
    BCV_EUR: 0,
    Binance: 0,
};

const defaultExchangeRateIds: Record<string, number> = {};

// Primary color hex values

// Primary color hex values
export const primaryColors: Record<PrimaryColor, { hex: string; name: string }> = {
    green: { hex: '#2ba654', name: 'Verde' },
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
            categories: [],
            exchangeRates: defaultExchangeRates,
            exchangeRateIds: defaultExchangeRateIds,

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

            updateExchangeRate: (key, value) => {
                set((state) => ({
                    exchangeRates: { ...state.exchangeRates, [key]: value },
                }));
            },

            fetchCategories: async () => {
                try {
                    const apiCategories = await CategoryService.getByUser();
                    // Map API Category → local Category shape
                    const mapped: Category[] = apiCategories.map((c: any) => ({
                        id: String(c.id),
                        name: c.name,
                        type: c.type === 'loan' ? 'loan' : c.type,
                        color: c.color ?? '#22c55e',
                        icon: c.icon ?? 'tag',
                        isDefault: false,
                        customImage: undefined,
                    }));
                    set((state) => ({
                        categories: mapped,
                    }));
                } catch (error) {
                    console.error('fetchCategories error:', error);
                }
            },

            fetchRates: async () => {
                try {
                    const rates = await RateService.getAll();
                    const rateMap: Partial<ExchangeRates> = {};
                    const idMap: Record<string, number> = {};
                    rates.forEach((r: any) => {
                        if (r.currency === 'BCV_USD') { rateMap.BCV_USD = Number(r.rate); idMap.BCV_USD = r.id; }
                        if (r.currency === 'BCV_EUR') { rateMap.BCV_EUR = Number(r.rate); idMap.BCV_EUR = r.id; }
                        if (r.currency === 'USDT' || r.currency === 'Binance') { rateMap.Binance = Number(r.rate); idMap.Binance = r.id; }
                    });
                    if (Object.keys(rateMap).length > 0) {
                        set((state) => ({
                            exchangeRates: { ...state.exchangeRates, ...rateMap },
                            exchangeRateIds: { ...state.exchangeRateIds, ...idMap },
                        }));
                    }
                } catch (error) {
                    console.error('fetchRates error:', error);
                }
            },

            addCategory: async (categoryData) => {
                try {
                    const created = await CategoryService.create({
                        name: categoryData.name,
                        icon: categoryData.icon,
                        type: categoryData.type === 'loan' ? 'loan' : (categoryData.type as any),
                        color: categoryData.color,
                    });
                    const newCategory: Category = {
                        ...categoryData,
                        id: String(created.id ?? Date.now()),
                        isDefault: false,
                    };
                    set((state) => ({
                        categories: [...state.categories, newCategory],
                    }));
                } catch (error) {
                    console.error('addCategory error:', error);
                    // Fallback: add locally
                    const newCategory: Category = {
                        ...categoryData,
                        id: Date.now().toString(),
                        isDefault: false,
                    };
                    set((state) => ({
                        categories: [...state.categories, newCategory],
                    }));
                }
            },

            updateCategory: async (id, data) => {
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...data } : c
                    ),
                }));
                try {
                    await CategoryService.update(Number(id), data as any);
                } catch (error) {
                    console.error('updateCategory error:', error);
                }
            },

            deleteCategory: async (id) => {
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id || c.isDefault),
                }));
                try {
                    await CategoryService.delete(Number(id));
                } catch (error) {
                    console.error('deleteCategory error:', error);
                }
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
                    categories: [],
                    exchangeRates: defaultExchangeRates,
                    exchangeRateIds: defaultExchangeRateIds,
                });
            },
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
