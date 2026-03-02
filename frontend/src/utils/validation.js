export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // Password must be at least 8 characters and contain:
  // - uppercase letter
  // - lowercase letter  
  // - number
  // - special character
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[\W_]/.test(password)) return false;
  return true;
};

export const getPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[\W_]/.test(password)
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  return {
    checks,
    score: passedChecks,
    isValid: passedChecks === 5,
    strength: passedChecks <= 2 ? 'weak' : passedChecks <= 3 ? 'medium' : passedChecks === 4 ? 'good' : 'strong'
  };
};

export const validateUsername = (username) => {
  return username.length >= 3;
};

export const validateBookForm = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }
  
  if (data.copiesAvailable < 0) {
    errors.copiesAvailable = 'Copies available cannot be negative';
  }
  
  return errors;
};
