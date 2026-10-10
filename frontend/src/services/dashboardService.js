import api from './api.js';
import {
  mockActiveClubs,
  mockAnnouncements,
  mockEvents,
  mockPendingReviews,
  mockPlatformActivity,
  mockStudentActivity,
  mockStudentAssignments,
  mockTeacherActivity,
  mockTeacherAssignments,
  mockUserSummary,
} from '../data/mockDashboardData.js';

/*
 * Dashboard data for each role. Every result carries `source: 'mock' | 'api'` so the UI can label it.
 *
 * When a teammate's endpoint ships, replace the matching mock with an `api.get(...)` call and map the
 * response to the same shape. Suggested contracts are listed in docs/dashboard.md.
 */

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Development-only: append ?demoState=loading|empty|error to the URL to preview those states.
function getDemoState() {
  if (!import.meta.env.DEV) return null;
  return new URLSearchParams(window.location.search).get('demoState');
}

async function fromMock(build) {
  const demoState = getDemoState();
  await new Promise((resolve) => setTimeout(resolve, demoState === 'loading' ? 600000 : 350));
  if (demoState === 'error') throw new Error('Simulated failure (demoState=error).');
  const built = await build(demoState === 'empty');
  return { source: 'mock', ...built };
}

async function getLiveOrMockAnnouncements(empty) {
  if (empty) return [];
  try {
    const res = await api.get('/announcements', { params: { limit: 5 } });
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((a) => ({
        id: a.id,
        title: a.title,
        author: a.authorName || a.author || 'Faculty',
        postedAt: a.createdAt || a.postedAt,
        audience: a.audience || 'Everyone',
      }));
    }
  } catch {
    // Graceful fallback to mock announcements
  }
  return mockAnnouncements;
}

const byDate = (key) => (a, b) => new Date(a[key]) - new Date(b[key]);
const isUpcoming = (iso) => new Date(iso) >= new Date();
const isWithinAWeek = (iso) => isUpcoming(iso) && new Date(iso) - new Date() <= SEVEN_DAYS;

export function getStudentDashboard() {
  return fromMock(async (empty) => {
    const assignments = empty ? [] : mockStudentAssignments.filter((a) => isUpcoming(a.dueAt)).sort(byDate('dueAt'));
    const announcements = await getLiveOrMockAnnouncements(empty);
    const events = empty ? [] : mockEvents;
    return {
      stats: {
        pendingAssignments: assignments.length,
        dueThisWeek: assignments.filter((a) => isWithinAWeek(a.dueAt)).length,
        announcements: announcements.length,
        upcomingEvents: events.length,
      },
      assignments,
      announcements,
      events,
      activity: empty ? [] : mockStudentActivity,
    };
  });
}

export function getTeacherDashboard() {
  return fromMock(async (empty) => {
    const assignments = empty ? [] : [...mockTeacherAssignments].sort(byDate('dueAt'));
    const pendingReviews = empty ? [] : mockPendingReviews;
    const announcements = await getLiveOrMockAnnouncements(empty);
    return {
      stats: {
        assignmentsCreated: assignments.length,
        awaitingReview: pendingReviews.length,
        upcomingDeadlines: assignments.filter((a) => isUpcoming(a.dueAt)).length,
        announcements: announcements.length,
      },
      assignments,
      pendingReviews,
      announcements,
      events: empty ? [] : mockEvents,
      activity: empty ? [] : mockTeacherActivity,
    };
  });
}

export function getAdminDashboard() {
  return fromMock(async (empty) => {
    const announcements = await getLiveOrMockAnnouncements(empty);
    return {
      stats: empty
        ? { total: 0, students: 0, teachers: 0, activeClubs: 0 }
        : { ...mockUserSummary, activeClubs: mockActiveClubs },
      activity: empty ? [] : mockPlatformActivity,
      announcements,
      events: empty ? [] : mockEvents,
    };
  });
}
