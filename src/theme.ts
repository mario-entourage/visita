import { Platform } from 'react-native';

export const C = {
  tealDark: '#0d6e6e',
  teal: '#0d6e6e',
  tealLight: '#14b8a6',
  bg: '#f0ebe2',
  card: '#ffffff',
  text: '#111827',
  textMuted: '#5a6470',
  textLight: '#9ca3af',
  red: '#ef4444',
  redLight: '#fee2e2',
  green: '#22c55e',
  greenLight: '#dcfce7',
  amber: '#f59e0b',
  amberLight: '#fef3c7',
  border: '#e5e7eb',
  white: '#ffffff',
};

// ---------------------------------------------------------------------------
// Cross-platform shadows (avoids React Native Web deprecation warnings)
// Usage: spread into StyleSheet.create → `...S.card`
// ---------------------------------------------------------------------------
export const S = {
  /** Subtle card shadow — used on almost every card in the app */
  card: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' } as object,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    },
  })!,
  /** Stronger shadow — used on the home hub buttons */
  lifted: Platform.select({
    web: { boxShadow: '0 4px 10px rgba(0,0,0,0.2)' } as object,
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
  })!,
};

// Result code colors: 1 (red/negative) → 5 (teal/prescribing)
export const RESULT_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#fee2e2', text: '#b91c1c' },
  2: { bg: '#ffedd5', text: '#c2410c' },
  3: { bg: '#fef9c3', text: '#854d0e' },
  4: { bg: '#dcfce7', text: '#15803d' },
  5: { bg: '#ccfbf1', text: '#0f766e' },
};
