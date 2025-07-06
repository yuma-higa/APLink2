// バリデーションルール（バックエンドと同期）
export const VALIDATION_RULES = {
  username: {
    min: 3,
    max: 20
  },
  password: {
    min: 8,
    max: 40,
    regex: /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{8,32})/
  }
};

// バリデーション関数
export const validateName = (name: string): string => {
  if (name.length < VALIDATION_RULES.username.min) {
    return `Username must be at least ${VALIDATION_RULES.username.min} characters`;
  }
  if (name.length > VALIDATION_RULES.username.max) {
    return `Username must be less than ${VALIDATION_RULES.username.max} characters`;
  }
  return '';
};

export const validatePassword = (password: string): string => {
  if (password.length < VALIDATION_RULES.password.min) {
    return `Password must be at least ${VALIDATION_RULES.password.min} characters`;
  }
  if (password.length > VALIDATION_RULES.password.max) {
    return `Password must be less than ${VALIDATION_RULES.password.max} characters`;
  }
  if (!VALIDATION_RULES.password.regex.test(password)) {
    return 'Password must contain uppercase, lowercase, number, and special character (@#$%)';
  }
  return '';
};
