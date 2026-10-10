import api from './api.js';

/**
 * Clubs and Events module API client.
 */

// ── Landing & Summary ────────────────────────────────────────────────────────
export const getClubsLandingSummary = async () => {
  const res = await api.get('/events/landing');
  return res.data;
};

// ── Clubs ────────────────────────────────────────────────────────────────────
export const getClubs = async ({ search = '', category = '', page = 0, size = 12 } = {}) => {
  const params = { page, size };
  if (search?.trim()) params.search = search.trim();
  if (category?.trim() && category !== 'ALL') params.category = category.trim();

  const res = await api.get('/clubs', { params });
  return res.data;
};

export const getClubBySlug = async (slug) => {
  const res = await api.get(`/clubs/${slug}`);
  return res.data;
};

export const createClub = async (data) => {
  const res = await api.post('/clubs', data);
  return res.data;
};

export const updateClub = async (id, data) => {
  const res = await api.put(`/clubs/${id}`, data);
  return res.data;
};

export const joinClub = async (clubId) => {
  const res = await api.post(`/clubs/${clubId}/join`);
  return res.data;
};

export const leaveClub = async (clubId) => {
  const res = await api.delete(`/clubs/${clubId}/leave`);
  return res.data;
};

export const getMyClubMemberships = async () => {
  const res = await api.get('/clubs/my/memberships');
  return res.data;
};

// ── Events ───────────────────────────────────────────────────────────────────
export const getUpcomingEvents = async ({ search = '', category = '', page = 0, size = 12 } = {}) => {
  const params = { page, size };
  if (search?.trim()) params.search = search.trim();
  if (category?.trim() && category !== 'ALL') params.category = category.trim();

  const res = await api.get('/events', { params });
  return res.data;
};

export const getPastEvents = async ({ search = '', category = '', page = 0, size = 12 } = {}) => {
  const params = { page, size };
  if (search?.trim()) params.search = search.trim();
  if (category?.trim() && category !== 'ALL') params.category = category.trim();

  const res = await api.get('/events/past', { params });
  return res.data;
};

export const getEventBySlug = async (slug) => {
  const res = await api.get(`/events/${slug}`);
  return res.data;
};

export const createEvent = async (data) => {
  const res = await api.post('/events', data);
  return res.data;
};

export const updateEvent = async (id, data) => {
  const res = await api.put(`/events/${id}`, data);
  return res.data;
};

export const registerForEvent = async (eventId) => {
  const res = await api.post(`/events/${eventId}/register`);
  return res.data;
};

export const cancelEventRegistration = async (eventId) => {
  const res = await api.delete(`/events/${eventId}/register`);
  return res.data;
};

export const getMyEventRegistrations = async () => {
  const res = await api.get('/events/my/registrations');
  return res.data;
};

export const getEventAttendees = async (eventId, { page = 0, size = 50 } = {}) => {
  const res = await api.get(`/events/${eventId}/attendees`, { params: { page, size } });
  return res.data;
};
