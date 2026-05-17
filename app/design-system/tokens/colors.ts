/**
 * Color Palette — Shopify Polaris Design System
 * Primary: Shopify blue (#2C3E91)
 * Semantic: Success, Warning, Critical, Info
 * Neutral: Gray scale from darkest to white
 * Portuguese context: National green accent
 */

export const colors = {
  // Primary
  primary: '#2C3E91',           // Shopify blue
  primaryLight: '#E8F0FF',      // Light background
  primaryDark: '#1A2555',       // Dark variant

  // Semantic
  success: '#4CAF50',           // Green for success states
  warning: '#FF9800',           // Orange for warnings
  critical: '#F44336',          // Red for errors
  info: '#2196F3',              // Blue for info

  // Neutral
  gray900: '#1F2937',           // Darkest (text)
  gray700: '#374151',           // Dark (secondary text)
  gray500: '#6B7280',           // Medium (tertiary text)
  gray300: '#D1D5DB',           // Light (borders)
  gray100: '#F3F4F6',           // Very light (backgrounds)
  white: '#FFFFFF',             // White

  // Portuguese Context
  portugueseGreen: '#00A65E',   // PT national green

  // Admin Accent
  adminAccent: '#D32F2F',       // Deep red for admin routes (left border)
} as const;

/**
 * Helper function: Get semantic color for status
 */
export function getStatusColor(status: 'active' | 'pending' | 'archived' | 'banned'): string {
  switch (status) {
    case 'active':
      return colors.success;
    case 'pending':
      return colors.warning;
    case 'archived':
    case 'banned':
      return colors.critical;
    default:
      return colors.gray500;
  }
}

export default colors;
