/**
 * Lightweight date utilities for the chat and community modules.
 * Ensures consistent, deterministic human-readable timestamps that agree
 * with real underlying timestamps.
 */

/**
 * Returns a relative time string such as "now", "9m", "2h", "Yesterday", "Mon", or "Oct 10".
 * Handles edge cases like null/undefined, invalid dates, and slight clock drift.
 *
 * @param {string|number|Date|null|undefined} date
 * @returns {string}
 */
export function formatDistanceToNow(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const now = Date.now();
  const diff = now - d.getTime();

  // Guard against future timestamps due to slight server/client clock drift
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours}h`;
  }

  // Check if calendar yesterday
  const nowDate = new Date();
  const yesterday = new Date(nowDate);
  yesterday.setDate(nowDate.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Within past 7 days -> Weekday abbreviation (e.g. "Mon")
  if (diff < 604_800_000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }

  // Same year -> "Oct 10", different year -> "Oct 10, 2025"
  if (d.getFullYear() === nowDate.getFullYear()) {
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Formats a timestamp for day group dividers in the message pane.
 * @param {string|number|Date|null|undefined} date
 * @returns {string}
 */
export function formatMessageDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Formats message timestamp into human-readable 12-hour or local time (e.g., "10:45 AM").
 * @param {string|number|Date|null|undefined} date
 * @returns {string}
 */
export function formatMessageTime(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
