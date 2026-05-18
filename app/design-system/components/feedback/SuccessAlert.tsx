import { colors, spacing } from '~/design-system/tokens';

interface SuccessAlertProps {
  message: string;
  details?: string;
}

export function SuccessAlert({ message, details }: SuccessAlertProps) {
  return (
    <div
      style={{
        padding: spacing.md,
        backgroundColor: '#E8F5E9',
        borderLeft: `4px solid ${colors.success}`,
        color: colors.success,
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
