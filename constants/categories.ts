import type { Category } from '@/types';

export const defaultCategories: Category[] = [
    // Income categories
    {
        id: 'salary',
        name: 'Salario',
        icon: 'cash',
        color: '#22c55e',
        type: 'income',
        isDefault: true,
    },
    {
        id: 'freelance',
        name: 'Freelance',
        icon: 'laptop',
        color: '#3b82f6',
        type: 'income',
        isDefault: true,
    },
    {
        id: 'investments',
        name: 'Inversiones',
        icon: 'trending-up',
        color: '#a855f7',
        type: 'income',
        isDefault: true,
    },
    {
        id: 'other-income',
        name: 'Otros Ingresos',
        icon: 'plus-circle',
        color: '#14b8a6',
        type: 'income',
        isDefault: true,
    },

    // Expense categories
    {
        id: 'food',
        name: 'Comida',
        icon: 'food',
        color: '#f97316',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'transport',
        name: 'Transporte',
        icon: 'car',
        color: '#3b82f6',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'entertainment',
        name: 'Entretenimiento',
        icon: 'gamepad-variant',
        color: '#ec4899',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'shopping',
        name: 'Compras',
        icon: 'shopping',
        color: '#eab308',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'health',
        name: 'Salud',
        icon: 'hospital-box',
        color: '#ef4444',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'education',
        name: 'Educación',
        icon: 'school',
        color: '#6366f1',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'utilities',
        name: 'Servicios',
        icon: 'flash',
        color: '#0ea5e9',
        type: 'expense',
        isDefault: true,
    },
    {
        id: 'loan',
        name: 'Préstamo',
        icon: 'hand-coin',
        color: '#f59e0b',
        type: 'both',
        isDefault: true,
    },
    {
        id: 'other-expense',
        name: 'Otros Gastos',
        icon: 'dots-horizontal',
        color: '#71717a',
        type: 'expense',
        isDefault: true,
    },
];

export const getCategoryById = (id: string, categories: Category[]): Category | undefined => {
    return categories.find((c) => c.id === id);
};

export const getCategoryByName = (name: string, categories: Category[]): Category | undefined => {
    return categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
};
