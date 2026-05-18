import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = useCallback(
    (formData: Record<string, any>) => {
      const newErrors: { [key: string]: string } = {};

      Object.entries(rules).forEach(([fieldName, rule]) => {
        const value = formData[fieldName];

        if (rule.required && (!value || value.toString().trim() === '')) {
          newErrors[fieldName] = 'Este campo é obrigatório';
          return;
        }

        if (rule.minLength && value && value.toString().length < rule.minLength) {
          newErrors[fieldName] = `Mínimo ${rule.minLength} caracteres`;
          return;
        }

        if (rule.maxLength && value && value.toString().length > rule.maxLength) {
          newErrors[fieldName] = `Máximo ${rule.maxLength} caracteres`;
          return;
        }

        if (rule.pattern && value && !rule.pattern.test(value.toString())) {
          newErrors[fieldName] = 'Formato inválido';
          return;
        }

        if (rule.custom && value) {
          const result = rule.custom(value);
          if (typeof result === 'string') {
            newErrors[fieldName] = result;
          } else if (result === false) {
            newErrors[fieldName] = 'Valor inválido';
          }
        }
      });

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [rules]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    setFieldError,
  };
}
