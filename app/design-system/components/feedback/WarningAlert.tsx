import { colors, spacing } from '~/design-system/tokens';

interface WarningAlertProps {
  message: string;
  details?: string;
}

export function WarningAlert({ message, details }: WarningAlertProps) {
  return (
    <div
      style={{
        padding: spacing.md,
        backgroundColor: '#FFF3E0',
        borderLeft: `4px solid ${colors.warning}`,
        color: colors.warning,
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
