export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },
  USER: {
    GET_ONE: (id: number) => `/api/v1/user/${id}`,
    UPDATE: (id: number) => `/api/v1/user/${id}`,
    DELETE: (id: number) => `/api/v1/user/${id}`,
  },
  CATEGORY: {
    GET_ALL: '/api/v1/category',
    CREATE: '/api/v1/category',
    GET_BY_USER: '/api/v1/category/user',
    GET_ONE: (id: number) => `/api/v1/category/${id}`,
    UPDATE: (id: number) => `/api/v1/category/${id}`,
    DELETE: (id: number) => `/api/v1/category/${id}`,
  },
  TRANSACTION: {
    GET_ALL: '/api/v1/transaction',
    CREATE: '/api/v1/transaction',
    GET_INITIAL_DATA: '/api/v1/transaction/initial-data',
    GET_ONE: (id: number) => `/api/v1/transaction/${id}`,
    DELETE: (id: number) => `/api/v1/transaction/${id}`,
  },
  LOAN: {
    GET_ALL: '/api/v1/loan',
    CREATE: '/api/v1/loan',
    GET_DETAIL: (id: number) => `/api/v1/loan/${id}`,
    REGISTER_PAYMENT: (id: number) => `/api/v1/loan/${id}/payment`,
  },
  RATE: {
    GET_ALL: '/api/v1/rate',
    CREATE: '/api/v1/rate',
    UPDATE: (id: number) => `/api/v1/rate/${id}`,
    DELETE: (id: number) => `/api/v1/rate/${id}`,
  },
  NOTIFICATION: {
    GET_ALL: '/api/v1/notification',
    CREATE: '/api/v1/notification',
    READ_ALL: '/api/v1/notification/read-all',
  },
  USER_SETTING: {
    GET_ALL: '/api/v1/user-setting',
    UPSERT: '/api/v1/user-setting',
  },
  JOB: {
    GET_ALL: '/api/v1/jobs',
    CREATE: '/api/v1/jobs',
    GET_ONE: (id: number) => `/api/v1/jobs/${id}`,
    ADD_PAYMENT: (id: number) => `/api/v1/jobs/${id}/payments`,
  },
  CHART: {
    INCOME_EXPENSE: '/api/v1/chart/income-expense',
    EXPENSES_BY_CATEGORY: '/api/v1/chart/expenses-by-category',
    TIMELINE: (range: string) => `/api/v1/chart/timeline?range=${range}`,
  },
  AI: {
    ANALYZE_TEXT: '/api/v1/ai/analyze/text',
    ANALYZE_AUDIO: '/api/v1/ai/analyze/audio',
    ANALYZE_IMAGE: '/api/v1/ai/analyze/image',
  },
} as const;
