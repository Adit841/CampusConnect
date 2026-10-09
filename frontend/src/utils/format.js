const DAY = 24 * 60 * 60 * 1000;

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** "in 3 days", "tomorrow", "2 hours ago", ... */
export function formatRelative(iso) {
  const diff = new Date(iso) - new Date();
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 60 * 60 * 1000) return rtf.format(Math.round(diff / 60000), 'minute');
  if (abs < DAY) return rtf.format(Math.round(diff / (60 * 60 * 1000)), 'hour');
  return rtf.format(calendarDaysBetween(new Date(), new Date(iso)), 'day');
}

function calendarDaysBetween(from, to) {
  const startOf = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((startOf(to) - startOf(from)) / DAY);
}

export function daysUntil(iso) {
  return (new Date(iso) - new Date()) / DAY;
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getInitials(name = '') {
  return name
    .replace(/^(prof|dr|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function getFirstName(name = '') {
  return name.replace(/^(prof|dr|mr|mrs|ms)\.?\s+/i, '').split(/\s+/)[0] || name;
}

export const roleLabels = { STUDENT: 'Student', TEACHER: 'Teacher', ADMIN: 'Administrator' };
