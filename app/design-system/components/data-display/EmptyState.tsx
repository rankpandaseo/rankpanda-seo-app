import { colors, spacing } from '~/design-system/tokens';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      <div
        style={{
          fontSize: '48px',
          marginBottom: spacing.lg,
          color: colors.gray300,
        }}
      >
        📦
      </div>
      <h3
        style={{
          margin: 0,
          marginBottom: spacing.md,
          fontSize: '18px',
          fontWeight: 600,
          color: colors.gray900,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: '0 0 ' + spacing.lg + ' 0',
            fontSize: '14px',
            color: colors.gray600,
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: `${spacing.sm} ${spacing.md}`,
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryDark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
