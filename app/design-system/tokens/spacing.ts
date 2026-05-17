/**
 * Spacing Scale — Consistent spacing throughout the design system
 * Uses a 4px base unit for precision
 */

export const spacing = {
  xs: '4px',    // 1 unit
  sm: '8px',    // 2 units
  md: '16px',   // 4 units
  lg: '24px',   // 6 units
  xl: '32px',   // 8 units
  xxl: '48px',  // 12 units
} as const;

/**
 * Helper: spacing object with pixel values for calculations
 */
export const spacingPixels = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export default spacing;
