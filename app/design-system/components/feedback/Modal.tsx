/**
 * Modal Component — CSS-based modal (no AppProvider dependency)
 * Provides overlay backdrop, centered dialog, keyboard escape support
 */

import React, { useEffect } from 'react';
import { spacing, colors } from '../../tokens';

interface ModalAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: ModalAction[];
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions = [],
}) => {
  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 200ms ease',
        }}
      />

      {/* Modal dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.white,
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          animation: 'slideUp 200ms ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing.lg,
            borderBottom: `1px solid ${colors.gray300}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: colors.gray900,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: colors.gray500,
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: spacing.lg }}>{children}</div>

        {/* Footer with actions */}
        {actions.length > 0 && (
          <div
            style={{
              padding: spacing.lg,
              borderTop: `1px solid ${colors.gray300}`,
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'flex-end',
            }}
          >
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                style={{
                  padding: `${spacing.sm} ${spacing.md}`,
                  border: action.primary
                    ? 'none'
                    : `1px solid ${colors.gray300}`,
                  borderRadius: '4px',
                  backgroundColor: action.primary
                    ? colors.primary
                    : action.danger
                      ? colors.critical
                      : colors.white,
                  color: action.primary || action.danger ? colors.white : colors.gray900,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.backgroundColor = colors.primaryDark;
                  } else if (action.danger) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.primary) {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  } else if (action.danger) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

export default Modal;
