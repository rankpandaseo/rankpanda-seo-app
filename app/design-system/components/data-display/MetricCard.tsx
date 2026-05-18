import { colors, spacing } from '~/design-system/tokens';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
}

export function MetricCard({ label, value, trend, trendValue, description }: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.critical;
      case 'neutral':
      default:
        return colors.gray600;
    }
  };

  const getTrendSymbol = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        backgroundColor: colors.white,
        borderRadius: '8px',
        padding: spacing.lg,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${colors.gray200}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '12px',
          fontWeight: 600,
          color: colors.gray600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: spacing.sm,
        }}
      >
        {label}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: spacing.md,
          marginBottom: spacing.md,
        }}
      >
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.gray900,
          }}
        >
          {value}
        </div>

        {trendValue && trend && (
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: getTrendColor(),
            }}
          >
            {getTrendSymbol()} {trendValue}
          </div>
        )}
      </div>

      {description && (
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: colors.gray600,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
