import { useState, useCallback, ReactNode, useMemo } from 'react';
import { colors, spacing } from '~/design-system/tokens';
import { ToastContext, Toast, ToastType } from '~/design-system/hooks/useToast';

interface ToastManagerProps {
  children: ReactNode;
}

export function ToastManager({ children }: ToastManagerProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#E8F5E9',
          color: colors.success,
          borderLeft: `4px solid ${colors.success}`,
        };
      case 'error':
        return {
          backgroundColor: '#FFEBEE',
          color: colors.critical,
          borderLeft: `4px solid ${colors.critical}`,
        };
      case 'warning':
        return {
          backgroundColor: '#FFF3E0',
          color: colors.warning,
          borderLeft: `4px solid ${colors.warning}`,
        };
      case 'info':
      default:
        return {
          backgroundColor: '#E3F2FD',
          color: colors.primary,
          borderLeft: `4px solid ${colors.primary}`,
        };
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: spacing.lg,
          right: spacing.lg,
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
          maxWidth: '400px',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: spacing.md,
              borderRadius: '4px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              animation: 'slideIn 300ms ease',
              ...getToastStyle(toast.type),
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
