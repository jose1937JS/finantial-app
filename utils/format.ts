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
    let d: Date;

    if (typeof date === 'string') {
        // Handle ISO strings and plain date strings
        if (date.includes('T')) {
            d = new Date(date);
            // If it has a time, adjust it to noon local time as requested
            d.setHours(12, 0, 0, 0);
        } else {
            // If it's just a date YYYY-MM-DD, parse as local to avoid UTC shift
            const [year, month, day] = date.split('-').map(Number);
            d = new Date(year, month - 1, day, 12, 0, 0);
        }
    } else {
        d = new Date(date.getTime());
        d.setHours(12, 0, 0, 0);
    }

    if (format === 'relative') {
        const now = new Date();
        now.setHours(12, 0, 0, 0);

        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const absDiffDays = Math.abs(diffDays);

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';

        // Use absolute value to avoid "hace -X dias" as requested
        if (absDiffDays < 7) return `Hace ${absDiffDays} días`;
        if (absDiffDays < 30) return `Hace ${Math.floor(absDiffDays / 7)} semanas`;

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

export const formatTime = (date: string | Date | undefined | null, locale: string = 'es-ES'): string => {
    if (!date) return '';
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
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
