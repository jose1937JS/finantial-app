/**
 * Currency and date formatting utilities
 */

export const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    locale: string = 'en-US'
): string => {
    const formatters: Record<string, Intl.NumberFormatOptions> = {
        USD: { style: 'currency', currency: 'USD' },
        VES: { style: 'currency', currency: 'VES', maximumFractionDigits: 0 },
        USDT: { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 },
    };

    const options = formatters[currency] || formatters.USD;

    if (currency === 'USDT') {
        return `${new Intl.NumberFormat(locale, options).format(amount)} USDT`;
    }

    return new Intl.NumberFormat(locale, options).format(amount);
};

export const formatDate = (
    date: string | Date,
    format: 'short' | 'long' | 'relative' = 'short',
    locale: string = 'es-ES'
): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'relative') {
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

        return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    }

    if (format === 'long') {
        return d.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export const formatTime = (date: string | Date, locale: string = 'es-ES'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

export const formatNumber = (num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
};
