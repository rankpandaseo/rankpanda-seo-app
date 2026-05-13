export interface ValidationError {
  field: string;
  message: string;
}

export function validateEmail(email: string): ValidationError | null {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { field: 'email', message: 'Invalid email format' };
  }
  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password || typeof password !== 'string') {
    return { field: 'password', message: 'Password is required' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters' };
  }
  return null;
}

export function validatePasswords(
  password: string,
  confirmPassword: string
): ValidationError | null {
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Passwords do not match' };
  }
  return null;
}
