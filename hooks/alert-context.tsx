import { AlertButton, AlertModal } from '@/components/ui/alert-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

interface AlertConfig {
    title: string;
    message?: string;
    buttons?: AlertButton[];
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor?: string;
    // If true, uses native iOS Alert to avoid conflicts with navigation
    useNativeOnIOS?: boolean;
}

interface AlertContextType {
    showAlert: (config: AlertConfig) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertConfig>({ title: '' });
    const isNavigatingRef = useRef(false);

    const showAlert = useCallback((newConfig: AlertConfig) => {
        // On iOS, if useNativeOnIOS is true or there are action buttons with navigation,
        // use the native Alert to avoid freezing issues
        if (Platform.OS === 'ios' && newConfig.useNativeOnIOS) {
            const nativeButtons = (newConfig.buttons || [{ text: 'OK' }]).map(btn => ({
                text: btn.text,
                style: btn.style === 'destructive' ? 'destructive' as const :
                    btn.style === 'cancel' ? 'cancel' as const : 'default' as const,
                onPress: btn.onPress,
            }));
            Alert.alert(newConfig.title, newConfig.message, nativeButtons);
            return;
        }

        setConfig(newConfig);
        setVisible(true);
    }, []);

    const handleClose = useCallback(() => {
        setVisible(false);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <AlertModal
                visible={visible}
                onClose={handleClose}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
                icon={config.icon}
                iconColor={config.iconColor}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
