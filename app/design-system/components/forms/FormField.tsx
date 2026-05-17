/**
 * FormField Component — Reusable form input wrapper
 * Combines label, input, error message, and help text
 * Replaces 50+ inline input definitions across the app
 */

import React from 'react';
import { spacing, colors } from '../../tokens';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  helpText,
  placeholder,
  disabled = false,
  autoComplete,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        marginBottom: spacing.lg,
      }}
    >
      <label
        htmlFor={name}
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: colors.gray900,
          display: 'flex',
          gap: spacing.xs,
          alignItems: 'center',
        }}
      >
        {label}
        {required && <span style={{ color: colors.critical }}>*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required={required}
        style={{
          padding: `${spacing.sm} ${spacing.md}`,
          border: `1px solid ${error ? colors.critical : colors.gray300}`,
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'inherit',
          backgroundColor: disabled ? colors.gray100 : colors.white,
          color: colors.gray900,
          transition: 'border-color 200ms ease',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = colors.primary;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? colors.critical : colors.gray300;
        }}
      />

      {error && (
        <p
          style={{
            color: colors.critical,
            fontSize: '12px',
            margin: 0,
            marginTop: spacing.xs,
          }}
        >
          {error}
        </p>
      )}

      {helpText && !error && (
        <p
          style={{
            color: colors.gray500,
            fontSize: '12px',
            margin: 0,
            marginTop: spacing.xs,
          }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
