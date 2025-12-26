import type { Transaction, TransactionFilters } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TransactionStore {
    transactions: Transaction[];
    filters: TransactionFilters;

    // Actions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    setFilters: (filters: TransactionFilters) => void;
    clearFilters: () => void;

    // Computed
    getFilteredTransactions: () => Transaction[];
    getTotalBalance: () => number;
    getTotalIncome: () => number;
    getTotalExpenses: () => number;
    getRecentTransactions: (limit?: number) => Transaction[];
    getLoansDue: () => Transaction[];
}

// Mock initial transactions
const mockTransactions: Transaction[] = [
    {
        id: '1',
        type: 'income',
        amount: 2500,
        currency: 'USD',
        category: 'Salario',
        description: 'Pago mensual',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        type: 'expense',
        amount: 150,
        currency: 'USD',
        category: 'Comida',
        description: 'Supermercado semanal',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: '3',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        type: 'loan',
        amount: 200,
        currency: 'USD',
        category: 'Préstamo',
        description: 'Préstamo a Juan',
        date: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        loan: {
            debtorName: 'Juan',
            debtorLastName: 'Pérez',
            debtorEmail: 'juan@email.com',
            debtorPhone: '+58 412 1234567',
            dueDate: new Date(Date.now() + 604800000).toISOString(),
            interestRate: 0,
            exchangeRateUSD: 1,
            isPaid: false,
        },
    },
];

export const useTransactionStore = create<TransactionStore>()(
    persist(
        (set, get) => ({
            transactions: mockTransactions,
            filters: { type: 'all' },

            addTransaction: (transactionData) => {
                const newTransaction: Transaction = {
                    ...transactionData,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                };
                set((state) => ({
                    transactions: [newTransaction, ...state.transactions],
                }));
            },

            updateTransaction: (id, data) => {
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                }));
            },

            deleteTransaction: (id) => {
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }));
            },

            setFilters: (filters) => {
                set((state) => ({
                    filters: { ...state.filters, ...filters },
                }));
            },

            clearFilters: () => {
                set({ filters: { type: 'all' } });
            },

            getFilteredTransactions: () => {
                const { transactions, filters } = get();
                let filtered = [...transactions];

                if (filters.type && filters.type !== 'all') {
                    filtered = filtered.filter((t) => t.type === filters.type);
                }

                if (filters.searchQuery) {
                    const query = filters.searchQuery.toLowerCase();
                    filtered = filtered.filter(
                        (t) =>
                            t.description.toLowerCase().includes(query) ||
                            t.category.toLowerCase().includes(query)
                    );
                }

                if (filters.category) {
                    filtered = filtered.filter((t) => t.category === filters.category);
                }

                if (filters.dateFrom) {
                    filtered = filtered.filter((t) => t.date >= filters.dateFrom!);
                }

                if (filters.dateTo) {
                    filtered = filtered.filter((t) => t.date <= filters.dateTo!);
                }

                return filtered.sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
            },

            getTotalBalance: () => {
                const { transactions } = get();
                return transactions.reduce((acc, t) => {
                    if (t.type === 'income') return acc + t.amount;
                    if (t.type === 'expense' || t.type === 'loan') return acc - t.amount;
                    return acc;
                }, 0);
            },

            getTotalIncome: () => {
                const { transactions } = get();
                return transactions
                    .filter((t) => t.type === 'income')
                    .reduce((acc, t) => acc + t.amount, 0);
            },

            getTotalExpenses: () => {
                const { transactions } = get();
                return transactions
                    .filter((t) => t.type === 'expense' || t.type === 'loan')
                    .reduce((acc, t) => acc + t.amount, 0);
            },

            getRecentTransactions: (limit = 5) => {
                const { transactions } = get();
                return [...transactions]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, limit);
            },

            getLoansDue: () => {
                const { transactions } = get();
                const now = new Date();
                return transactions.filter(
                    (t) =>
                        t.type === 'loan' &&
                        t.loan &&
                        !t.loan.isPaid &&
                        new Date(t.loan.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                );
            },
        }),
        {
            name: 'transaction-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
