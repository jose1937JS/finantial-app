import type { Payment, Transaction, TransactionFilters } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TransactionStore {
    transactions: Transaction[];
    filters: TransactionFilters;

    // Actions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'created_at'>) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    addLoanPayment: (transactionId: string, payment: Payment) => void;
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
        created_at: new Date().toISOString(),
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
        created_at: new Date().toISOString(),
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
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        type: 'income',
        amount: 600,
        currency: 'USD',
        category: 'Salario',
        description: 'Pago mensual',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '5',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '6',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '7',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '8',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '9',
        type: 'expense',
        amount: 50,
        currency: 'USD',
        category: 'Transporte',
        description: 'Gasolina',
        date: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '10',
        type: 'loan',
        amount: 200,
        currency: 'USD',
        category: 'Préstamo',
        description: 'Préstamo a Juan',
        date: new Date(Date.now() - 172800000).toISOString(),
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        created_at: new Date(Date.now() - 172800000).toISOString(),
        loan: {
            debtorName: 'Juan',
            debtorLastName: 'Pérez',
            debtorEmail: 'juan@email.com',
            debtorPhone: '+58 412 1234567',
            dueDate: new Date(Date.now() + 604800000).toISOString(),
            interestRate: 0,
            isPaid: false,
        },
    },
    {
        id: '11',
        type: 'loan',
        amount: 100,
        currency: 'USD',
        category: 'Préstamo',
        description: 'Préstamo a Pedro',
        date: new Date(Date.now() - 259200000).toISOString(),
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        created_at: new Date(Date.now() - 259200000).toISOString(),
        loan: {
            debtorName: 'Pedro',
            debtorLastName: 'Pérez',
            debtorEmail: 'pedro@email.com',
            debtorPhone: '+58 412 1234567',
            dueDate: new Date(Date.now() + 605900000).toISOString(),
            interestRate: 0,
            isPaid: true,
        },
    },
    {
        id: '12',
        type: 'expense',
        amount: 60,
        currency: 'USD',
        category: 'Entretenimiento',
        description: 'Suscripción Netflix/Spotify',
        date: new Date(Date.now() - 345600000).toISOString(),
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        created_at: new Date(Date.now() - 345600000).toISOString(),
    },
    {
        id: '13',
        type: 'expense',
        amount: 120,
        currency: 'USD',
        category: 'Salud',
        description: 'Farmacia',
        date: new Date(Date.now() - 432000000).toISOString(),
        createdAt: new Date(Date.now() - 432000000).toISOString(),
        created_at: new Date(Date.now() - 432000000).toISOString(),
    },
    {
        id: '14',
        type: 'income',
        amount: 100,
        currency: 'USD',
        category: 'Otros',
        description: 'Regalo cumpleaños',
        date: new Date(Date.now() - 518400000).toISOString(),
        createdAt: new Date(Date.now() - 518400000).toISOString(),
        created_at: new Date(Date.now() - 518400000).toISOString(),
    },
    {
        id: '15',
        type: 'expense',
        amount: 300,
        currency: 'USD',
        category: 'Hogar',
        description: 'Reparación tubería',
        date: new Date(Date.now() - 604800000).toISOString(),
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        created_at: new Date(Date.now() - 604800000).toISOString(),
    },
    {
        id: '16',
        type: 'expense',
        amount: 45,
        currency: 'USD',
        category: 'Comida',
        description: 'Cena restaurante',
        date: new Date(Date.now() - 691200000).toISOString(),
        createdAt: new Date(Date.now() - 691200000).toISOString(),
        created_at: new Date(Date.now() - 691200000).toISOString(),
    },
    {
        id: '17',
        type: 'expense',
        amount: 25,
        currency: 'USD',
        category: 'Otros',
        description: 'Corte de cabello',
        date: new Date(Date.now() - 777600000).toISOString(),
        createdAt: new Date(Date.now() - 777600000).toISOString(),
        created_at: new Date(Date.now() - 777600000).toISOString(),
    },
    {
        id: '18',
        type: 'income',
        amount: 1200,
        currency: 'USD',
        category: 'Inversiones',
        description: 'Dividendos acciones',
        date: new Date(Date.now() - 864000000).toISOString(),
        createdAt: new Date(Date.now() - 864000000).toISOString(),
        created_at: new Date(Date.now() - 864000000).toISOString(),
    },
    {
        id: '19',
        type: 'expense',
        amount: 80,
        currency: 'USD',
        category: 'Educación',
        description: 'Libro programación',
        date: new Date(Date.now() - 950400000).toISOString(),
        createdAt: new Date(Date.now() - 950400000).toISOString(),
        created_at: new Date(Date.now() - 950400000).toISOString(),
    },
    {
        id: '20',
        type: 'expense',
        amount: 55,
        currency: 'USD',
        category: 'Salud',
        description: 'Gimnasio mensual',
        date: new Date(Date.now() - 1036800000).toISOString(),
        createdAt: new Date(Date.now() - 1036800000).toISOString(),
        created_at: new Date(Date.now() - 1036800000).toISOString(),
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
                    created_at: new Date().toISOString(),
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

            addLoanPayment: (transactionId, payment) => {
                set((state) => ({
                    transactions: state.transactions.map((t) => {
                        if (t.id !== transactionId || t.type !== 'loan' || !t.loan) return t;

                        const currentPayments = t.loan.payments || [];
                        const newPayments = [...currentPayments, payment];

                        // Calculate totals to auto-update isPaid
                        // Note: Assuming payment amount is in the same currency basis as the debt (USD)
                        // If payment is in VES, the UI should probably convert it to USD before sending here,
                        // or we store the USD equivalent in payment.amount
                        const interestAmount = t.amount * (t.loan.interestRate / 100);
                        const totalDebt = t.amount + interestAmount;
                        const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);

                        // Allow small float epsilon, or strict >=
                        const isPaid = totalPaid >= totalDebt - 0.01;

                        return {
                            ...t,
                            loan: {
                                ...t.loan!,
                                payments: newPayments,
                                isPaid,
                            },
                        };
                    }),
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
                return transactions
                    .filter(
                        (t) =>
                            t.type === 'loan' &&
                            t.loan &&
                            !t.loan.isPaid &&
                            new Date(t.loan.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    )
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // For due dates, we might want soonest first?
            },
        }),
        {
            name: 'transaction-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
