/**
 * Design System Tokens Barrel Export
 * All design tokens (colors, spacing, typography) exported from a single point
 */

export { colors, getStatusColor } from './colors';
export { spacing, spacingPixels } from './spacing';
export { typography } from './typography';

export default {
  colors: require('./colors').default,
  spacing: require('./spacing').default,
  typography: require('./typography').default,
};
