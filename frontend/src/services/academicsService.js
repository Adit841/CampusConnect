import api from './api.js';
import { getErrorMessage } from './profileService.js';

/*
 * Academics & Assignments API client plus the display rules shared by the academics components.
 *
 * Real sessions always use the backend (/api/subjects, /api/assignments, /api/submissions); a failed request
 * surfaces as an error state, never as mock data. Only the development demo mode (no backend session) loads
 * the read-only fictional data in data/mockAcademicsData.js, labelled with source: 'mock'.
 */

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export async function loadAcademics(role, isDemo) {
  if (isDemo) {
    if (!import.meta.env.DEV) return { source: 'mock', subjects: [], assignments: [] };
    const { demoAcademics } = await import('../data/mockAcademicsData.js');
    const data = demoAcademics[role] ?? { subjects: [], assignments: [] };
    return { source: 'mock', subjects: data.subjects, assignments: data.assignments };
  }
  const [subjects, assignments] = await Promise.all([api.get('/subjects'), api.get('/assignments')]);
  return { source: 'api', subjects: subjects.data ?? [], assignments: assignments.data ?? [] };
}

// ── Subjects ──────────────────────────────────────────────────────────────────

export async function createSubject(payload) {
  const { data } = await api.post('/subjects', payload);
  return data;
}

export async function updateSubject(id, payload) {
  const { data } = await api.put(`/subjects/${id}`, payload);
  return data;
}

/** ADMIN only: teachers that a subject can be assigned to. */
export async function fetchTeacherOptions() {
  const { data } = await api.get('/subjects/teachers');
  return data ?? [];
}

// ── Assignments ───────────────────────────────────────────────────────────────

export async function createAssignment(payload) {
  const { data } = await api.post('/assignments', payload);
  return data;
}

export async function updateAssignment(id, payload) {
  const { data } = await api.put(`/assignments/${id}`, payload);
  return data;
}

export async function publishAssignment(id) {
  const { data } = await api.post(`/assignments/${id}/publish`);
  return data;
}

export async function deleteAssignment(id) {
  await api.delete(`/assignments/${id}`);
}

export async function uploadAssignmentAttachment(id, file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/assignments/${id}/attachment`, form, multipart);
  return data;
}

export async function removeAssignmentAttachment(id) {
  const { data } = await api.delete(`/assignments/${id}/attachment`);
  return data;
}

export function downloadAssignmentAttachment(assignment) {
  return downloadFile(`/assignments/${assignment.id}/attachment`, assignment.attachment?.fileName);
}

// ── Submissions ───────────────────────────────────────────────────────────────

function submissionForm({ textResponse, file, removeFile }) {
  const form = new FormData();
  if (textResponse != null) form.append('textResponse', textResponse);
  if (file) form.append('file', file);
  if (removeFile) form.append('removeFile', 'true');
  return form;
}

export async function submitAssignment(assignmentId, { textResponse, file }) {
  const { data } = await api.post(`/assignments/${assignmentId}/submissions`, submissionForm({ textResponse, file }), multipart);
  return data;
}

export async function resubmitAssignment(submissionId, { textResponse, file, removeFile }) {
  const { data } = await api.put(`/submissions/${submissionId}`, submissionForm({ textResponse, file, removeFile }), multipart);
  return data;
}

/** TEACHER (own subjects) / ADMIN: `{ assignment, entries }` with every eligible student. */
export async function fetchAssignmentSubmissions(assignmentId) {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
  return data;
}

export async function gradeSubmission(submissionId, { marks, feedback, returnToStudent }) {
  const { data } = await api.post(`/submissions/${submissionId}/grade`, { marks, feedback, returnToStudent });
  return data;
}

export function downloadSubmissionFile(submission) {
  return downloadFile(`/submissions/${submission.id}/file`, submission.file?.fileName);
}

/** Files require the Bearer token, so they are fetched as blobs rather than linked directly. */
async function downloadFile(url, fileName = 'download') {
  const response = await api.get(url, { responseType: 'blob' });
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

/** Like getErrorMessage, but also reads JSON error bodies returned for blob (download) requests. */
export async function describeError(error) {
  const data = error?.response?.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (parsed?.message) return parsed.message;
    } catch {
      // Not JSON; fall through to the generic message.
    }
  }
  const validation = data?.validationErrors;
  if (validation && typeof validation === 'object') {
    const first = Object.values(validation)[0];
    if (first) return first;
  }
  if (error?.response?.status === 403 && (!data?.message || data.message === 'Access is denied')) {
    return "You don't have permission to do that.";
  }
  return getErrorMessage(error);
}

// ── Display rules ─────────────────────────────────────────────────────────────

export const statusMeta = {
  PENDING: { label: 'Pending', tone: 'accent' },
  OVERDUE: { label: 'Overdue', tone: 'danger' },
  SUBMITTED: { label: 'Submitted', tone: 'success' },
  GRADED: { label: 'Graded', tone: 'success' },
  DRAFT: { label: 'Draft', tone: 'neutral' },
  OPEN: { label: 'Open', tone: 'accent' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

export const submissionStatusMeta = {
  NOT_SUBMITTED: { label: 'Not submitted', tone: 'neutral' },
  SUBMITTED: { label: 'Awaiting review', tone: 'warning' },
  GRADED: { label: 'Graded (not returned)', tone: 'accent' },
  RETURNED: { label: 'Returned', tone: 'success' },
};

export const statusFilters = {
  STUDENT: ['PENDING', 'OVERDUE', 'SUBMITTED', 'GRADED'],
  TEACHER: ['DRAFT', 'OPEN', 'CLOSED'],
  ADMIN: ['DRAFT', 'OPEN', 'CLOSED'],
};

const DUE_SOON_MS = 48 * 60 * 60 * 1000;

/** Students get the server-derived `myStatus`; staff see DRAFT / OPEN / CLOSED. */
export function displayStatus(assignment) {
  if (assignment.myStatus) return assignment.myStatus;
  if (assignment.status === 'DRAFT') return 'DRAFT';
  return new Date(assignment.dueAt) < new Date() ? 'CLOSED' : 'OPEN';
}

export function isDueSoon(assignment) {
  const remaining = new Date(assignment.dueAt) - new Date();
  return remaining > 0 && remaining <= DUE_SOON_MS;
}

export function summarize(role, subjects, assignments) {
  const count = (status) => assignments.filter((a) => displayStatus(a) === status).length;
  const awaitingReview = assignments.reduce((sum, a) => sum + (a.stats?.awaitingReview ?? 0), 0);
  if (role === 'STUDENT') {
    return {
      subjects: subjects.length,
      assignments: assignments.length,
      pending: count('PENDING'),
      overdue: count('OVERDUE'),
      submitted: count('SUBMITTED') + count('GRADED'),
      graded: count('GRADED'),
    };
  }
  return {
    subjects: subjects.length,
    assignments: assignments.length,
    drafts: count('DRAFT'),
    open: count('OPEN'),
    awaitingReview,
  };
}

export const defaultFilters = { query: '', status: 'ALL', subjectId: 'ALL', sort: 'DUE_ASC' };

export function filterAssignments(assignments, { query, status, subjectId, sort }) {
  const needle = query.trim().toLowerCase();
  const filtered = assignments.filter((a) => {
    if (status !== 'ALL' && displayStatus(a) !== status) return false;
    if (subjectId !== 'ALL' && String(a.subjectId) !== String(subjectId)) return false;
    return !needle || a.title?.toLowerCase().includes(needle);
  });
  if (sort === 'NEWEST') {
    const published = (a) => new Date(a.publishedAt || a.createdAt || 0);
    return filtered.sort((a, b) => published(b) - published(a));
  }
  return filtered.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

/** Mirrors the backend defaults (app.academics.*) so users get feedback before uploading. */
export const fileRules = {
  allowedTypes: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'csv', 'zip', 'png', 'jpg', 'jpeg'],
  maxSizeMb: 10,
};

export const acceptAttribute = fileRules.allowedTypes.map((type) => `.${type}`).join(',');

/** Returns an error message, or null when the file is acceptable. The server validates again. */
export function validateFile(file) {
  if (!file) return null;
  const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
  if (!fileRules.allowedTypes.includes(extension)) {
    return `Unsupported file type. Allowed: ${fileRules.allowedTypes.map((type) => `.${type}`).join(', ')}`;
  }
  if (file.size === 0) return 'The selected file is empty.';
  if (file.size > fileRules.maxSizeMb * 1024 * 1024) return `The file must be ${fileRules.maxSizeMb} MB or smaller.`;
  return null;
}

export function formatFileSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** ISO instant -> value for <input type="datetime-local"> in the user's time zone. */
export function toLocalInputValue(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatMarks(value) {
  if (value == null) return '—';
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
}
