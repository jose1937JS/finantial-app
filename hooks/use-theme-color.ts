/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { primaryColors, useSettingsStore } from '@/store/settings-store';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const { preferences } = useSettingsStore();

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Override tint colors with selected primary color
    if (colorName === 'tint' || colorName === 'tabIconSelected') {
      const hex = primaryColors[preferences.primaryColor]?.hex;
      if (hex) return hex;
    }
    return Colors[theme][colorName];
  }
}
