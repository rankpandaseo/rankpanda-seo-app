/**
 * StatusBadge Component — Color-coded status indicator
 * Used for keyword status, project status, user status
 */

import React from 'react';
import { getStatusColor } from '../../tokens/colors';
import { spacing } from '../../tokens';

type StatusType = 'active' | 'pending' | 'archived' | 'banned';

interface StatusBadgeProps {
  status: StatusType;
  children?: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const getStatusLabel = (): string => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'archived':
        return 'Arquivado';
      case 'banned':
        return 'Bloqueado';
      default:
        return status;
    }
  };

  const color = getStatusColor(status);

  // Lighter background by using the color with opacity
  const getLightBackground = (): string => {
    const colorMap: Record<StatusType, string> = {
      active: '#E8F5E9',
      pending: '#FFF3E0',
      archived: '#FFEBEE',
      banned: '#FFEBEE',
    };
    return colorMap[status];
  };

  const label = children || getStatusLabel();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.xs,
        padding: `${spacing.xs} ${spacing.sm}`,
        backgroundColor: getLightBackground(),
        border: `1px solid ${color}`,
        borderRadius: '12px',
        color: color,
        fontSize: '12px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
