import { TransactionService } from '@/api/services/transaction.service';
import { useSettingsStore } from '@/store/settings-store';
import type { Payment, Transaction, TransactionFilters } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const getAmountInUSD = (t: Transaction) => {
    const { exchangeRates } = useSettingsStore.getState();
    let amountUSD = t.amount;
    if (t.currency === 'VES' && exchangeRates.BCV_USD > 0) {
        amountUSD = t.amount / exchangeRates.BCV_USD;
    } else if (t.currency === 'EUR' && exchangeRates.BCV_EUR > 0 && exchangeRates.BCV_USD > 0) {
        amountUSD = (t.amount * exchangeRates.BCV_EUR) / exchangeRates.BCV_USD;
    }
    return amountUSD;
};

interface TransactionStore {
    transactions: Transaction[];
    filters: TransactionFilters;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTransactions: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'created_at'>) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    addLoanPayment: (transactionId: string, payment: Payment) => void;
    deleteTransaction: (id: string) => Promise<void>;
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

export const useTransactionStore = create<TransactionStore>()(
    persist(
        (set, get) => ({
            transactions: [],
            filters: { type: 'all' },
            isLoading: false,
            error: null,

            fetchTransactions: async () => {
                set({ isLoading: true, error: null });
                try {
                    const apiTransactions = await TransactionService.getAll();
                    // Map API Transaction shape → local Transaction shape
                    const mapped: Transaction[] = apiTransactions.map((t: any) => ({
                        id: String(t.id),
                        type: t.type,
                        amount: Number(t.amount),
                        currency: t.currency ?? 'USD',
                        category: t.category?.name ?? t.categoryId?.toString() ?? 'Otros',
                        description: t.description ?? '',
                        date: t.date ?? t.createdAt,
                        createdAt: t.createdAt,
                        created_at: t.createdAt,
                        rate: t.rate,
                        amountInVES: t.amountInVES,
                        // Map loan details if present
                        loan: t.loanDetail
                            ? {
                                debtorName: t.loanDetail.debtorName ?? t.loanDetail.debtor_name,
                                debtorLastName: t.loanDetail.debtorLastname ?? t.loanDetail.debtor_lastname,
                                debtorEmail: t.loanDetail.debtorEmail ?? t.loanDetail.debtor_email,
                                debtorPhone: t.loanDetail.debtorPhone ?? t.loanDetail.debtor_phone,
                                dueDate: t.loanDetail.expirationDate ?? t.loanDetail.expiration_date,
                                interestRate: Number(t.loanDetail.interestRate ?? t.loanDetail.interest_rate ?? 0),
                                isPaid: t.loanDetail.isPaid ?? false,
                                payments: t.loanDetail.payments ?? [],
                            }
                            : undefined,
                    }));
                    set({ transactions: mapped, isLoading: false });
                } catch (error: any) {
                    console.error('fetchTransactions error:', error);
                    set({ isLoading: false, error: error?.message ?? 'Error al cargar transacciones' });
                }
            },

            addTransaction: async (transactionData) => {
                try {
                    // Build the DTO expected by the backend
                    const isLoan = transactionData.type === 'loan';
                    const loanInfo = transactionData.loan;

                    const dto: any = {
                        amount: transactionData.amount,
                        description: transactionData.description,
                        currency: (transactionData.currency as any) ?? 'USD',
                        date: transactionData.date,
                        type: transactionData.type,
                        category_id: (transactionData as any).categoryId,
                    };

                    if (isLoan && loanInfo) {
                        dto.loan_details = {
                            debtor_name: loanInfo.debtorName,
                            debtor_lastname: loanInfo.debtorLastName,
                            debtor_email: loanInfo.debtorEmail,
                            debtor_phone: loanInfo.debtorPhone,
                            expiration_date: loanInfo.dueDate,
                            interest_rate: loanInfo.interestRate,
                        };
                    }

                    const created = await TransactionService.create(dto);
                    // Optimistically build local shape from the created response
                    const newTransaction: Transaction = {
                        ...transactionData,
                        id: String(created.id ?? Date.now()),
                        createdAt: created.createdAt ?? new Date().toISOString(),
                        created_at: created.createdAt ?? new Date().toISOString(),
                    };
                    set((state) => ({
                        transactions: [newTransaction, ...state.transactions],
                    }));
                } catch (error: any) {
                    console.error('addTransaction error:', error);
                    // Still add locally so UI doesn't break in offline scenarios
                    const newTransaction: Transaction = {
                        ...transactionData,
                        id: Date.now().toString(),
                        createdAt: new Date().toISOString(),
                        created_at: new Date().toISOString(),
                    };
                    set((state) => ({
                        transactions: [newTransaction, ...state.transactions],
                    }));
                }
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

                        const interestAmount = t.amount * (t.loan.interestRate / 100);
                        const totalDebt = t.amount + interestAmount;
                        const totalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
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

            deleteTransaction: async (id) => {
                // Optimistic removal
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                }));
                try {
                    await TransactionService.delete(Number(id));
                } catch (error: any) {
                    console.error('deleteTransaction error:', error);
                    // Re-fetch to restore state if delete failed
                    get().fetchTransactions();
                }
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
                    const amountUSD = getAmountInUSD(t);
                    if (t.type === 'income') return acc + amountUSD;
                    if (t.type === 'expense' || t.type === 'loan') return acc - amountUSD;
                    return acc;
                }, 0);
            },

            getTotalIncome: () => {
                const { transactions } = get();
                return transactions
                    .filter((t) => t.type === 'income')
                    .reduce((acc, t) => acc + getAmountInUSD(t), 0);
            },

            getTotalExpenses: () => {
                const { transactions } = get();
                return transactions
                    .filter((t) => t.type === 'expense' || t.type === 'loan')
                    .reduce((acc, t) => acc + getAmountInUSD(t), 0);
            },

            getRecentTransactions: (limit = 5) => {
                const { transactions } = get();
                return [...transactions]
                    .sort((a, b) => Number(b.id) - Number(a.id))
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
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            },
        }),
        {
            name: 'transaction-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
