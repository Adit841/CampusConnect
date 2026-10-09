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
 * The backend currently exposes only /api/auth/** and /api/profile, so all sections below are mock.
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
  return { source: 'mock', ...build(demoState === 'empty') };
}

const byDate = (key) => (a, b) => new Date(a[key]) - new Date(b[key]);
const isUpcoming = (iso) => new Date(iso) >= new Date();
const isWithinAWeek = (iso) => isUpcoming(iso) && new Date(iso) - new Date() <= SEVEN_DAYS;

export function getStudentDashboard() {
  return fromMock((empty) => {
    const assignments = empty ? [] : mockStudentAssignments.filter((a) => isUpcoming(a.dueAt)).sort(byDate('dueAt'));
    const announcements = empty ? [] : mockAnnouncements;
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
  return fromMock((empty) => {
    const assignments = empty ? [] : [...mockTeacherAssignments].sort(byDate('dueAt'));
    const pendingReviews = empty ? [] : mockPendingReviews;
    const announcements = empty ? [] : mockAnnouncements;
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
  return fromMock((empty) => ({
    stats: empty
      ? { total: 0, students: 0, teachers: 0, activeClubs: 0 }
      : { ...mockUserSummary, activeClubs: mockActiveClubs },
    activity: empty ? [] : mockPlatformActivity,
    announcements: empty ? [] : mockAnnouncements,
    events: empty ? [] : mockEvents,
  }));
}
