import api from './api.js';

/** GET /api/profile — returns the authenticated user's ProfileResponse (requires a Bearer token). */
export async function getMyProfile() {
  const { data } = await api.get('/profile');
  return data;
}

/** Turns an Axios error into a short message suitable for showing in the UI. */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.status === 401) return 'Your session has expired. Please sign in again.';
  if (error?.request && !error?.response) return 'Cannot reach the CampusConnect server.';
  return 'Something went wrong. Please try again.';
}
