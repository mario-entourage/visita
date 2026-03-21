export const C = {
  tealDark: '#0d6e6e',
  teal: '#0d6e6e',
  tealLight: '#14b8a6',
  bg: '#f0ebe2',
  card: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
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

// Result code colors: 1 (red/negative) → 5 (teal/prescribing)
export const RESULT_COLORS: Record<number, { bg: string; text: string }> = {
  1: { bg: '#fee2e2', text: '#b91c1c' },
  2: { bg: '#ffedd5', text: '#c2410c' },
  3: { bg: '#fef9c3', text: '#854d0e' },
  4: { bg: '#dcfce7', text: '#15803d' },
  5: { bg: '#ccfbf1', text: '#0f766e' },
};
