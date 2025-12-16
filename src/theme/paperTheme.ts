import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { COLORS, TYPOGRAPHY } from '../constants/theme';

// Configure fonts to match our theme
const fontConfig = {
  displayLarge: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
  },
  displayMedium: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.xxl,
  },
  displaySmall: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  headlineLarge: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.xl,
  },
  headlineMedium: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  headlineSmall: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  bodyLarge: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  bodyMedium: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  bodySmall: {
    ...TYPOGRAPHY,
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
} as any;

export const paperTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.primaryLight,
    background: COLORS.background,
    surface: COLORS.background,
    error: COLORS.error,
    onPrimary: COLORS.textInverse,
    onBackground: COLORS.text,
    onSurface: COLORS.text,
  },
};
