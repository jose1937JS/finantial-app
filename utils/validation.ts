/**
 * Form validation utilities
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'El correo es requerido' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Ingresa un correo válido' };
    }

    return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
    if (!password || password.trim() === '') {
        return { isValid: false, error: 'La contraseña es requerida' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
    if (!value || value.trim() === '') {
        return { isValid: false, error: `${fieldName} es requerido` };
    }

    return { isValid: true };
};

export const validateAmount = (amount: string): ValidationResult => {
    if (!amount || amount.trim() === '') {
        return { isValid: false, error: 'El monto es requerido' };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return { isValid: false, error: 'Ingresa un monto válido' };
    }

    if (numAmount <= 0) {
        return { isValid: false, error: 'El monto debe ser mayor a 0' };
    }

    return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
        return { isValid: true }; // Phone is optional
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: 'Ingresa un teléfono válido' };
    }

    return { isValid: true };
};

export const validateDate = (date: string): ValidationResult => {
    if (!date || date.trim() === '') {
        return { isValid: false, error: 'La fecha es requerida' };
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
        return { isValid: false, error: 'Ingresa una fecha válida' };
    }

    return { isValid: true };
};
