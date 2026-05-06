export const validatePassword = (password: string) => {
  const requirements = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    { id: 'symbol', label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  
  const isValid = requirements.every(req => req.met);
  const message = isValid ? '' : 'Password does not meet all requirements.';
  
  return { isValid, message, requirements };
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
