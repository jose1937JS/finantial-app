// Transaction types
export type TransactionType = 'income' | 'expense' | 'loan';

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    category: string;
    description: string;
    date: string;
    createdAt: string;
    // Loan-specific fields
    loan?: LoanDetails;
}

export interface LoanDetails {
    debtorName: string;
    debtorLastName: string;
    debtorEmail?: string;
    debtorPhone?: string;
    dueDate: string;
    interestRate: number;
    exchangeRateUSD: number;
    isPaid: boolean;
}

// User types
export interface User {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    createdAt: string;
}

// Exchange rate types
export interface ExchangeRate {
    id: string;
    baseCurrency: string;
    targetCurrency: string;
    rate: number;
    date: string;
    source: string;
}

export interface ExchangeRateHistory {
    currency: string;
    data: { date: string; rate: number }[];
}

// Category types
export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense' | 'both';
    isDefault: boolean;
}

// Notification types
export type NotificationType = 'loan_due' | 'budget_limit' | 'reminder' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    date: string;
    isRead: boolean;
    relatedId?: string; // Transaction or loan ID
}

// Settings types
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'es' | 'en';
export type Currency = 'USD' | 'VES' | 'USDT';

export interface UserPreferences {
    theme: ThemeMode;
    language: Language;
    mainCurrency: Currency;
}

// Auth types
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// Filter types
export interface TransactionFilters {
    type?: TransactionType | 'all';
    dateFrom?: string;
    dateTo?: string;
    category?: string;
    searchQuery?: string;
}

// Chart data types
export interface PieChartData {
    value: number;
    color: string;
    label: string;
    percentage: number;
}

export interface LineChartData {
    value: number;
    date: string;
    label?: string;
}
