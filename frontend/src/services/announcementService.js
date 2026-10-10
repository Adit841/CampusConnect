import api from './api.js';
import { mockAnnouncements } from '../data/mockDashboardData.js';

/**
 * Announcements module API service.
 * Handles communications with /api/announcements.
 */

export async function fetchAnnouncements({ category, search, limit } = {}) {
  const params = {};
  if (category && category !== 'ALL') params.category = category;
  if (search) params.search = search;
  if (limit) params.limit = limit;

  try {
    const res = await api.get('/announcements', { params });
    return {
      source: 'api',
      data: res.data || [],
    };
  } catch (error) {
    // If running in development demo mode without backend connected, provide graceful mock fallback
    if (import.meta.env.DEV) {
      console.warn('Backend /api/announcements unavailable, using mock data:', error?.message);
      let list = [...mockAnnouncements];
      if (category && category !== 'ALL') {
        list = list.filter((a) => (a.category || 'GENERAL').toUpperCase() === category.toUpperCase());
      }
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((a) => a.title.toLowerCase().includes(q) || (a.content || '').toLowerCase().includes(q));
      }
      if (limit) {
        list = list.slice(0, limit);
      }
      return {
        source: 'mock',
        data: list,
      };
    }
    throw error;
  }
}

export async function fetchAnnouncementById(id) {
  try {
    const res = await api.get(`/announcements/${id}`);
    return res.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      const found = mockAnnouncements.find((a) => String(a.id) === String(id));
      if (found) return found;
    }
    throw error;
  }
}

export async function createAnnouncement(payload) {
  const res = await api.post('/announcements', payload);
  return res.data;
}

export async function updateAnnouncement(id, payload) {
  const res = await api.put(`/announcements/${id}`, payload);
  return res.data;
}

export async function deleteAnnouncement(id) {
  await api.delete(`/announcements/${id}`);
  return true;
}

export const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'GENERAL', label: 'General' },
  { id: 'ACADEMIC', label: 'Academics' },
  { id: 'EXAM', label: 'Examinations' },
  { id: 'EVENT', label: 'Events' },
  { id: 'URGENT', label: 'Urgent' },
];

export const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'Everyone (All Campus)' },
  { value: 'STUDENTS', label: 'All Students' },
  { value: 'TEACHERS', label: 'Faculty & Teachers Only' },
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Electronics', label: 'Electronics & Communication' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
];
