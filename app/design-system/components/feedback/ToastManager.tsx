/**
 * ToastManager Component — Context provider + useState toast queue
 * Manages toast notifications without AppProvider dependency
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import { spacing, colors } from '../../tokens';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastManagerProps {
  children: React.ReactNode;
}

export const ToastManager: React.FC<ToastManagerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 4000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}

      {/* Toast Queue Renderer */}
      <div
        style={{
          position: 'fixed',
          bottom: spacing.lg,
          right: spacing.lg,
          zIndex: 2000,
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.md,
        }}
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Individual toast item component
 */
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const getToastColor = () => {
    switch (toast.type) {
      case 'success':
        return { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' };
      case 'error':
        return { bg: '#FFEBEE', border: '#F44336', text: '#C62828' };
      case 'warning':
        return { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' };
      case 'info':
      default:
        return { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' };
    }
  };

  const toastColor = getToastColor();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        backgroundColor: toastColor.bg,
        border: `1px solid ${toastColor.border}`,
        borderLeft: `4px solid ${toastColor.border}`,
        borderRadius: '4px',
        color: toastColor.text,
        fontSize: '14px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        animation: 'slideInRight 300ms ease',
      }}
    >
      <div style={{ flex: 1 }}>{toast.message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: toastColor.text,
          padding: '0 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close toast"
      >
        ×
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ToastManager;
