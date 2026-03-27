export interface RegisterDto {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense' | 'loan';
  userId: number;
  color: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  transactions?: Transaction[];
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'income' | 'expense' | 'loan';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface UserSetting {
  id: number;
  userId: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
  categories?: Category[];
  notifications?: Notification[];
  settings?: UserSetting[];
}

export interface LoanDetail {
  id: number;
  debtorName: string;
  debtorLastname: string;
  debtorEmail: string;
  debtorPhone: string;
  expirationDate: string;
  interestRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  currency: 'USDT' | 'VES' | 'USD' | 'EUR';
  date: string;
  type: 'income' | 'expense' | 'loan';
  categoryId: number;
  userId: number;
  loanDetailsId: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  category?: Category;
  loanDetail?: LoanDetail;
}

export interface UpdateUserDto {
  name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  type: 'income' | 'expense' | 'loan';
  color?: string;
}

export interface LoanDetailsDto {
  debtor_name: string;
  debtor_lastname?: string;
  debtor_email?: string;
  debtor_phone?: string;
  expiration_date?: string;
  interest_rate?: number;
}

export interface CreateTransactionDto {
  amount: number;
  description?: string;
  currency?: 'USDT' | 'VES' | 'USD' | 'EUR';
  date: string;
  type: 'income' | 'expense' | 'loan';
  category_id?: number;
  loan_details?: LoanDetailsDto;
}

export interface CreateLoanDto {
  amount: number;
  description?: string;
  currency?: string;
  debtor_name: string;
  debtor_lastname?: string;
  debtor_email?: string;
  debtor_phone?: string;
  expiration_date?: string;
  interest_rate?: number;
  category_id?: number;
}

export interface LoanPaymentDto {
  amount: number;
  currency?: 'USD' | 'VES' | 'USDT';
  exchange_rate?: number;
  rate_id?: number;
  date?: string;
}

export interface Rate {
  id: number;
  currency: 'BCV_EUR' | 'BCV_USD' | 'USDT';
  date: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateDto {
  currency: 'BCV_EUR' | 'BCV_USD' | 'USDT';
  date: string;
  rate: number;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'income' | 'expense' | 'loan';
  user_id?: number;
}

export interface UpsertSettingDto {
  key: string;
  value: string;
}

// Additional interface for analysis endpoints (they return a CreateTransactionDto generally)
export type AnalyzeResponse = CreateTransactionDto;

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}
