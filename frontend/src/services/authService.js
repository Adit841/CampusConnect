import api from './api.js';

/**
 * Calls POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, tokenType: string, user: Object }>}
 */
export async function loginUser(credentials) {
  const { data } = await api.post('/auth/login', {
    email: credentials.email?.trim(),
    password: credentials.password,
  });
  return data;
}

/**
 * Calls POST /api/auth/register
 * Supports STUDENT and TEACHER roles matching RegisterRequest.java
 * @param {Object} payload
 * @returns {Promise<{ token: string, tokenType: string, user: Object }>}
 */
export async function registerUser(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

/**
 * Extracts a readable error message or field validation errors from API response
 * @param {any} error
 * @returns {{ message: string, fieldErrors: Record<string, string> }}
 */
export function extractAuthError(error) {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (data?.validationErrors && typeof data.validationErrors === 'object') {
    const fieldErrors = data.validationErrors;
    const firstMessage = Object.values(fieldErrors)[0] || data.message || 'Validation failed';
    return {
      message: firstMessage,
      fieldErrors,
    };
  }

  if (data?.message) {
    return {
      message: data.message,
      fieldErrors: {},
    };
  }

  if (status === 401) {
    return {
      message: 'Invalid email or password.',
      fieldErrors: {},
    };
  }

  if (status === 400) {
    return {
      message: 'Invalid registration details. Please verify your inputs.',
      fieldErrors: {},
    };
  }

  if (error?.request && !error?.response) {
    return {
      message: 'Unable to reach the CampusConnect server. Please check your connection.',
      fieldErrors: {},
    };
  }

  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    fieldErrors: {},
  };
}
