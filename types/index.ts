// Transaction types
export type TransactionType = 'income' | 'expense' | 'loan';

export interface RateObject {
    id?: number;
    /** Numeric value of the exchange rate */
    rate: number;
    /** Source/currency key, e.g. 'BCV_USD', 'BCV_EUR', 'Binance' */
    currency?: string;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    amount: number;
    currency: string;
    category: string;
    description: string;
    date: string;
    createdAt?: string;
    created_at?: string;
    // Optional currency details
    amountInVES?: number;
    /** Rate stored as object { id, rate, currency } — use .rate for the numeric value */
    rate?: RateObject;
    rate_id?: number;
    // Loan-specific fields
    loan?: LoanDetails;
    loanDetailsId?: number;
    // Job-specific fields
    job_id?: number;
}

export interface LoanDetails {
    id?: string;
    debtorName: string;
    debtorLastName: string;
    debtorEmail?: string;
    debtorPhone?: string;
    dueDate: string;
    interestRate: number;
    isPaid: boolean;
    payments?: Payment[];
}

export interface Payment {
    id?: string;
    amount: number;
    currency?: string;
    /** Raw rate object from backend (has .rate property) or numeric rate */
    rate?: any;
    date?: string;
    rate_id?: number;
    /** Amount converted to the loan's original currency (e.g. VES payment → USD) */
    amountInLoanCurrency?: number;
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

export type ExchangeRateSource = 'BCV_USD' | 'BCV_EUR' | 'Binance';

export interface ExchangeRates {
    BCV_USD: number;
    BCV_EUR: number;
    Binance: number;
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
    customImage?: string;
    color: string;
    type: 'income' | 'expense' | 'loan';
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
export type Language = 'es' | 'en' | 'pt';
export type Currency = 'USD' | 'VES' | 'USDT';
export type PrimaryColor = 'green' | 'blue' | 'purple' | 'orange' | 'pink' | 'teal' | 'red' | 'indigo';

export interface UserPreferences {
    theme: ThemeMode;
    language: Language;
    mainCurrency: Currency;
    primaryColor: PrimaryColor;
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
