export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export const TRIP_STATUS = {
  DRAFT: 'draft',
  PLANNING: 'planning',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ACTIVITY_TYPES = {
  SIGHTSEEING: 'sightseeing',
  DINING: 'dining',
  SHOPPING: 'shopping',
  ENTERTAINMENT: 'entertainment',
  TRANSPORTATION: 'transportation',
  ACCOMMODATION: 'accommodation',
  OTHER: 'other'
};

export const BUDGET_CATEGORIES = {
  ACCOMMODATION: 'accommodation',
  FOOD: 'food',
  TRANSPORTATION: 'transportation',
  ACTIVITIES: 'activities',
  SHOPPING: 'shopping',
  OTHER: 'other'
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  INR: '₹'
};

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  API: 'YYYY-MM-DD',
  FULL: 'MMMM DD, YYYY',
  SHORT: 'MM/DD/YYYY'
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PASSWORD_MESSAGE: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  TRIP_NAME_MIN_LENGTH: 3,
  TRIP_NAME_MAX_LENGTH: 100,
  PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
  COUNTRY_MAX_LENGTH: 100,
  CITY_MAX_LENGTH: 100
};

export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN: 'globetrotter_access_token',
  REFRESH_TOKEN: 'globetrotter_refresh_token',
  USER_PREFERENCES: 'globetrotter_user_preferences',
  TRIP_DRAFT: 'globetrotter_trip_draft'
};