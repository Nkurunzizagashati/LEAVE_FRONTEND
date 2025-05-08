export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateLength = (value, min, max) => {
  return value.length >= min && value.length <= max;
};

export const validate2FACode = (code) => {
  return /^\d{6}$/.test(code);
};

export const validateLeaveDates = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const getValidationErrors = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];

    fieldRules.forEach((rule) => {
      if (!rule.validate(value, formData)) {
        errors[field] = rule.message;
      }
    });
  });

  return errors;
};

export const createValidationRule = (validate, message) => ({
  validate,
  message,
}); 