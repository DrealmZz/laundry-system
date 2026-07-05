export const Colors = {
  primary: '#C99763',
  primaryLight: '#F5EFD9',
  primaryDark: '#A87A4E',
  secondary: '#23395B',
  secondaryLight: '#E8EDF2',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  background: '#F5EFD9',
  surface: '#FEFCF5',
  text: '#23395B',
  textSecondary: '#475569',
  textMuted: '#8A7D65',
  border: '#C89B6D',
  borderLight: '#EDE7CC',
  
  // Status colors (konsisten - coklat)
  statusActive: '#A87A4E',      // Coklat gelap untuk semua status aktif
  statusInactive: '#E8DFD0',    // Cream gelap untuk status non-aktif
  statusBackground: '#FEFCF5',  // Background card
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textSecondary },
  bodyBold: { fontSize: 15, fontWeight: '600' as const, color: Colors.text },
  caption: { fontSize: 13, fontWeight: '400' as const, color: Colors.textMuted },
  captionBold: { fontSize: 13, fontWeight: '600' as const, color: Colors.textSecondary },
  small: { fontSize: 11, fontWeight: '500' as const, color: Colors.textMuted },
};

export const Shadows = {
  sm: {
    shadowColor: '#23395B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#23395B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#23395B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
};
