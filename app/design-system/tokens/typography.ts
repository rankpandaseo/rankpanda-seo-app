/**
 * Typography Scale — Consistent typography throughout the design system
 */

export const typography = {
  // Headings (bold, hierarchical)
  headingXl: {
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.5px',
  },
  headingLg: {
    fontSize: '24px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.3px',
  },
  headingMd: {
    fontSize: '18px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0px',
  },
  headingSm: {
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0px',
  },

  // Body text (regular weight)
  bodyLg: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0px',
  },
  bodySm: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0px',
  },

  // Monospace (for code, IDs, etc.)
  mono: {
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.5,
  },
} as const;

export default typography;
