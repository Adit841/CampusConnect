/**
 * Lightweight date utilities for the chat module.
 * Avoids importing a full date library.
 */

/**
 * Returns a relative time string like "just now", "5m", "2h", "Mon", or a date string.
 * @param {string|number|Date} date
 * @returns {string}
 */
export function formatDistanceToNow(date) {
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();

  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 604_800_000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Formats a timestamp for a message group header.
 * @param {string|number|Date} date
 * @returns {string}
 */
export function formatMessageDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}
