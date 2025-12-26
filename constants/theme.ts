/**
 * Theme colors and fonts for the app
 */

import { Platform } from 'react-native';

const tintColorLight = '#22c55e';
const tintColorDark = '#4ade80';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0f0f0f',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#6b7280',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Finance-specific colors
export const FinanceColors = {
  income: {
    light: '#4ade80',
    default: '#22c55e',
    dark: '#16a34a',
  },
  expense: {
    light: '#f87171',
    default: '#ef4444',
    dark: '#dc2626',
  },
  loan: {
    light: '#fbbf24',
    default: '#f59e0b',
    dark: '#d97706',
  },
};
