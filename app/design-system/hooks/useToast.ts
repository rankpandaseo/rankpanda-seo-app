/**
 * useToast Hook — Toast notification state management
 * Handles adding/removing toasts with auto-dismiss
 */

import { useContext } from 'react';
import { ToastContext } from '../components/feedback/ToastManager';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // milliseconds, default 4000
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return {
    success: (message: string, duration?: number) =>
      context.addToast(message, 'success', duration),
    error: (message: string, duration?: number) =>
      context.addToast(message, 'error', duration),
    warning: (message: string, duration?: number) =>
      context.addToast(message, 'warning', duration),
    info: (message: string, duration?: number) =>
      context.addToast(message, 'info', duration),
    remove: context.removeToast,
  };
};

export default useToast;
