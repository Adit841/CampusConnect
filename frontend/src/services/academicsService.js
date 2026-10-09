/*
 * Academics data and the rules that derive statuses, summaries and filters from it.
 *
 * The backend has no academics endpoints yet, so:
 * - In development demo mode, fictional data is loaded from data/mockAcademicsData.js (source: 'mock').
 * - Otherwise nothing is fabricated: the page shows that the module is not connected (source: 'unavailable').
 * When the API exists, fetch it here with `api` from ./api.js and map it to the same shape.
 */

export async function loadAcademics(role, isDemo) {
  if (import.meta.env.DEV && isDemo) {
    const { demoAcademics } = await import('../data/mockAcademicsData.js');
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = demoAcademics[role] ?? { subjects: [], assignments: [] };
    return { source: 'mock', subjects: data.subjects, assignments: data.assignments };
  }
  return { source: 'unavailable', subjects: [], assignments: [] };
}

export const statusMeta = {
  PENDING: { label: 'Pending', tone: 'accent' },
  OVERDUE: { label: 'Overdue', tone: 'danger' },
  SUBMITTED: { label: 'Submitted', tone: 'success' },
  OPEN: { label: 'Open', tone: 'accent' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export const priorityMeta = {
  HIGH: { label: 'High priority', tone: 'danger' },
  MEDIUM: { label: 'Medium priority', tone: 'warning' },
  LOW: { label: 'Low priority', tone: 'neutral' },
};

export const statusFilters = {
  STUDENT: ['PENDING', 'OVERDUE', 'SUBMITTED'],
  TEACHER: ['OPEN', 'CLOSED'],
};

const isPast = (iso) => new Date(iso) < new Date();

/**
 * Adds `status`, `subject` and (for students) `demoSubmission` to each assignment.
 * `demoSubmissions` holds this session's demo-only submissions: { [assignmentId]: { fileName, at } }.
 */
export function withDerivedFields(assignments, subjects, role, demoSubmissions = {}) {
  const subjectsById = Object.fromEntries(subjects.map((subject) => [subject.id, subject]));
  return assignments.map((assignment) => {
    const subject = subjectsById[assignment.subjectId] ?? null;
    if (role === 'TEACHER') {
      return { ...assignment, subject, status: isPast(assignment.dueAt) ? 'CLOSED' : 'OPEN' };
    }
    const demoSubmission = demoSubmissions[assignment.id] ?? null;
    const submitted = Boolean(assignment.submittedAt || demoSubmission);
    const status = submitted ? 'SUBMITTED' : isPast(assignment.dueAt) ? 'OVERDUE' : 'PENDING';
    return { ...assignment, subject, status, demoSubmission };
  });
}

export function summarize(role, subjects, assignments) {
  const count = (status) => assignments.filter((a) => a.status === status).length;
  if (role === 'TEACHER') {
    return {
      subjects: subjects.length,
      assignments: assignments.length,
      open: count('OPEN'),
      awaitingReview: assignments.reduce((sum, a) => sum + (a.submittedCount - a.reviewedCount), 0),
    };
  }
  return {
    subjects: subjects.length,
    assignments: assignments.length,
    pending: count('PENDING'),
    overdue: count('OVERDUE'),
    submitted: count('SUBMITTED'),
  };
}

export const defaultFilters = { query: '', status: 'ALL', subjectId: 'ALL', sort: 'DUE_ASC' };

export function filterAssignments(assignments, { query, status, subjectId, sort }) {
  const needle = query.trim().toLowerCase();
  const filtered = assignments.filter((a) => {
    if (status !== 'ALL' && a.status !== status) return false;
    if (subjectId !== 'ALL' && a.subjectId !== subjectId) return false;
    if (!needle) return true;
    return [a.title, a.subject?.name, a.subject?.code].some((text) => text?.toLowerCase().includes(needle));
  });
  const direction = sort === 'DUE_DESC' ? -1 : 1;
  return filtered.sort((a, b) => direction * (new Date(a.dueAt) - new Date(b.dueAt)));
}

/** Returns an error message, or null when the file satisfies the assignment's submission rules. */
export function validateSubmissionFile(file, rules) {
  if (!file) return 'Choose a file to submit.';
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (!rules.allowedTypes.includes(extension)) {
    return `Only ${rules.allowedTypes.map((type) => `.${type}`).join(', ')} files are accepted.`;
  }
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > rules.maxSizeMb * 1024 * 1024) return `The file must be ${rules.maxSizeMb} MB or smaller.`;
  return null;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
