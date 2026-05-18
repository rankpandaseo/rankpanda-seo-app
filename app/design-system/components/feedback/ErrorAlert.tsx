import { colors, spacing } from '~/design-system/tokens';

interface ErrorAlertProps {
  message: string;
  details?: string;
}

export function ErrorAlert({ message, details }: ErrorAlertProps) {
  return (
    <div
      style={{
        padding: spacing.md,
        backgroundColor: '#FFEBEE',
        borderLeft: `4px solid ${colors.critical}`,
        color: colors.critical,
        marginBottom: spacing.lg,
        borderRadius: '4px',
        fontSize: '14px',
      }}
    >
      <p style={{ margin: '0 0 4px 0', fontWeight: 600 }}>{message}</p>
      {details && <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{details}</p>}
    </div>
  );
}
