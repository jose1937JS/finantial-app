import { LoanService } from '@/api/services/loan.service';
import { TransactionService } from '@/api/services/transaction.service';
import { useSettingsStore } from '@/store/settings-store';
import type { Payment, RateObject, Transaction, TransactionFilters } from '@/types';
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
    // Backend-authoritative balance summary (from /transaction/initial-data)
    backendBalance: number | null;
    backendIncome: number | null;
    backendExpenses: number | null;

    // Actions
    fetchTransactions: () => Promise<void>;
    fetchBalance: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'created_at'>) => Promise<void>;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    addLoanPayment: (transactionId: string, payment: Payment) => Promise<void>;
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

export function mapBackendTransactionToLocal(t: any): Transaction {
    return {
        id: String(t.id),
        type: t.type,
        amount: Number(t.amount),
        currency: t.currency ?? 'USD',
        category: t.category?.name ?? t.categoryId?.toString() ?? 'Otros',
        description: t.description ?? '',
        date: t.date ?? t.createdAt,
        createdAt: t.createdAt,
        created_at: t.createdAt,
        // rate comes as an object {id, currency, rate, ...} from the backend
        // rate: always stored as a RateObject { id, rate, currency }
        // Backend sends it as an object; legacy numeric values are wrapped for safety.
        rate: (() => {
            if (!t.rate && t.rate !== 0) return undefined;
            if (typeof t.rate === 'object') {
                return {
                    id: t.rate.id,
                    rate: Number(t.rate.rate),
                    currency: t.rate.currency,
                } as RateObject;
            }
            // Numeric fallback (shouldn't happen with current backend)
            return { rate: Number(t.rate) } as RateObject;
        })(),
        amountInVES: t.amountInVES,
        loanDetailsId: t.loanDetailsId,
        // Map loan details if present (appears on both 'loan' and 'income' loan-payment transactions)
        loan: t.loanDetail
            ? {
                id: t.loanDetail.id,
                debtorName: t.loanDetail.debtorName ?? t.loanDetail.debtor_name,
                debtorLastName: t.loanDetail.debtorLastname ?? t.loanDetail.debtor_lastname,
                debtorEmail: t.loanDetail.debtorEmail ?? t.loanDetail.debtor_email,
                debtorPhone: t.loanDetail.debtorPhone ?? t.loanDetail.debtor_phone,
                dueDate: t.loanDetail.expirationDate ?? t.loanDetail.expiration_date,
                interestRate: Number(t.loanDetail.interestRate ?? t.loanDetail.interest_rate ?? 0),
                isPaid: t.loanDetail.isPaid ?? false,
                // Keep payments as-is — they are full transaction objects from the backend.
                // The history modal accesses p.rate?.rate (object) and p.amountInLoanCurrency directly.
                payments: t.loanDetail.payments ?? [],
            }
            : undefined,
    };
}

export const useTransactionStore = create<TransactionStore>()(
    persist(
        (set, get) => ({
            transactions: [],
            filters: { type: 'all' },
            isLoading: false,
            error: null,
            backendBalance: null,
            backendIncome: null,
            backendExpenses: null,

            fetchBalance: async () => {
                try {
                    const data = await TransactionService.getInitialData();
                    set({
                        backendBalance: Number(data.balance ?? data.total ?? 0),
                        backendIncome: Number(data.income ?? 0),
                        backendExpenses: Number(data.expense ?? data.expenses ?? 0),
                    });
                } catch (error) {
                    console.error('fetchBalance error:', error);
                }
            },

            fetchTransactions: async () => {
                set({ isLoading: true, error: null, transactions: [] });
                try {
                    // Fetch transactions and backend balance in parallel
                    const [apiTransactions] = await Promise.all([
                        TransactionService.getAll(),
                        get().fetchBalance(),
                    ]);
                    const mapped: Transaction[] = apiTransactions.map(mapBackendTransactionToLocal);
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
                        rate_id: transactionData.rate_id,
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
                    };
                    set((state) => ({
                        transactions: [newTransaction, ...state.transactions],
                    }));
                    // Refresh backend balance so totals stay accurate
                    get().fetchBalance();
                } catch (error: any) {
                    console.error('addTransaction error:', error);
                    throw error;
                }
            },

            updateTransaction: (id, data) => {
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                }));
            },

            addLoanPayment: async (transactionId, payment) => {
                let apiResponse;
                try {
                    apiResponse = await LoanService.registerPayment(Number(transactionId), {
                        amount: payment.amount,
                        currency: payment.currency as 'USD' | 'VES' | 'USDT' | undefined,
                        rate_id: payment.rate_id,
                    });
                } catch (error) {
                    console.error('registerPayment API error:', error);
                    throw error;
                }

                // apiResponse.payments[0] is the newest payment and is a full transaction object.
                // Map it directly so the optimistic income tx has all correct fields.
                const latestPayment = apiResponse.payments?.[0];
                const newPaymentTx: Transaction = latestPayment
                    ? mapBackendTransactionToLocal(latestPayment)
                    : {
                        id: String(Date.now()),
                        type: 'income' as const,
                        amount: payment.amount,
                        currency: payment.currency ?? 'USD',
                        category: 'Pago Préstamo',
                        description: '',
                        date: payment.date ?? new Date().toISOString().split('T')[0],
                        createdAt: new Date().toISOString(),
                    };

                set((state) => ({
                    transactions: [
                        // Insert the new income payment transaction
                        newPaymentTx,
                        // Update the parent loan entry with the refreshed payments list
                        ...state.transactions.map((t) => {
                            if (t.id !== transactionId || t.type !== 'loan' || !t.loan) return t;

                            const newPayments = apiResponse.payments?.map((p: any) => ({
                                id: String(p.id),
                                amount: Number(p.amount),
                                currency: p.currency,
                                amountInLoanCurrency: p.amountInLoanCurrency,
                                rate: p.rate || p.exchangeRate || p.exchange_rate,
                                date: p.date,
                            })) || [];

                            return {
                                ...t,
                                loan: {
                                    ...t.loan!,
                                    payments: newPayments,
                                    isPaid: apiResponse.pendingBalance <= 0.01,
                                },
                            };
                        }),
                    ],
                }));
                // Refresh backend balance so totals stay accurate
                get().fetchBalance();
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
                const { backendBalance } = get();
                // Use backend value when available — it accounts for per-transaction rates correctly.
                if (backendBalance !== null) return backendBalance;
                // Fallback: local estimate (may differ due to rate drift)
                const { transactions } = get();
                return transactions.reduce((acc, t) => {
                    const amountUSD = getAmountInUSD(t);
                    if (t.type === 'income') return acc + amountUSD;
                    if (t.type === 'expense' || t.type === 'loan') return acc - amountUSD;
                    return acc;
                }, 0);
            },

            getTotalIncome: () => {
                const { backendIncome } = get();
                if (backendIncome !== null) return backendIncome;
                const { transactions } = get();
                return transactions
                    .filter((t) => t.type === 'income')
                    .reduce((acc, t) => acc + getAmountInUSD(t), 0);
            },

            getTotalExpenses: () => {
                const { backendExpenses } = get();
                if (backendExpenses !== null) return backendExpenses;
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
