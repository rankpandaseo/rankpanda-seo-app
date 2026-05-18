/**
 * Color Tokens — Shopify Polaris Palette
 * Alinhado com https://shopify.dev/docs/api/app-home/design-system
 */

export const colors = {
  // Primary
  primary: '#2C3E91', // Shopify blue (RankPanda brand)
  primaryDark: '#1a2557',
  primaryLight: '#E8F0FF',

  // Semantic
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  critical: '#F44336',
  criticalLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',

  // Neutral (gray scale)
  gray900: '#1F2937', // Darkest
  gray800: '#374151',
  gray700: '#4B5563',
  gray600: '#6B7280',
  gray500: '#9CA3AF',
  gray400: '#D1D5DB',
  gray300: '#E5E7EB',
  gray200: '#F3F4F6',
  gray100: '#F9FAFB', // Lightest
  white: '#FFFFFF',
  black: '#000000',

  // Status helpers
  disabled: '#D1D5DB',
};

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'banned':
    case 'error':
      return colors.critical;
    default:
      return colors.gray500;
  }
}
