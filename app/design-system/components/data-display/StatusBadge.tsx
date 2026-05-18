import { colors } from '~/design-system/tokens/colors';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'archived' | 'banned' | 'success' | 'warning' | 'critical';
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status) {
      case 'active':
      case 'success':
        return {
          backgroundColor: '#E8F5E9',
          color: colors.success,
          borderLeft: `4px solid ${colors.success}`,
        };
      case 'pending':
      case 'warning':
        return {
          backgroundColor: '#FFF3E0',
          color: colors.warning,
          borderLeft: `4px solid ${colors.warning}`,
        };
      case 'archived':
      case 'banned':
      case 'critical':
        return {
          backgroundColor: '#FFEBEE',
          color: colors.critical,
          borderLeft: `4px solid ${colors.critical}`,
        };
      default:
        return {
          backgroundColor: colors.gray100,
          color: colors.gray700,
          borderLeft: `4px solid ${colors.gray300}`,
        };
    }
  };

  const style = getStatusStyle();

  return (
    <div
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
