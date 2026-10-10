import { useState } from 'react';
import { Calendar, MapPin, Video, Users, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { createEvent } from '../../services/clubsEventsApi.js';

export default function CreateEventModal({ open, onClose, clubs = [], onEventCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'TECHNICAL',
    clubId: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    registrationDeadline: '',
    venue: '',
    online: false,
    meetingUrl: '',
    capacity: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Event title is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Event description is required.');
      return;
    }
    if (!formData.startDateTime) {
      setError('Start date and time is required.');
      return;
    }

    const start = new Date(formData.startDateTime);
    if (formData.endDateTime && new Date(formData.endDateTime) <= start) {
      setError('End date and time must be after the start time.');
      return;
    }
    if (formData.registrationDeadline && new Date(formData.registrationDeadline) > start) {
      setError('Registration deadline cannot be after the event starts.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        clubId: formData.clubId ? Number(formData.clubId) : null,
        description: formData.description.trim(),
        startDateTime: new Date(formData.startDateTime).toISOString(),
        endDateTime: formData.endDateTime ? new Date(formData.endDateTime).toISOString() : null,
        registrationDeadline: formData.registrationDeadline
          ? new Date(formData.registrationDeadline).toISOString()
          : null,
        venue: formData.online ? null : formData.venue.trim() || 'Campus Auditorium',
        online: Boolean(formData.online),
        meetingUrl: formData.online ? formData.meetingUrl.trim() : null,
        capacity: formData.capacity ? Number(formData.capacity) : null,
      };

      await createEvent(payload);
      if (onEventCreated) onEventCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create event', err);
      setError(err.response?.data?.message || 'Could not create event. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Campus Event"
      description="Publish an official or club-sponsored activity for the campus community."
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-event-form"
            disabled={loading}
            className={`rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
          >
            {loading ? 'Publishing…' : 'Publish Event'}
          </button>
        </div>
      }
    >
      <form id="create-event-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Event Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Annual Campus Hackathon 2026"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Category & Associated Club */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="TECHNICAL">Technical & Coding</option>
              <option value="CULTURAL">Cultural & Arts</option>
              <option value="SPORTS">Sports & Athletics</option>
              <option value="ACADEMIC">Academic & Science</option>
              <option value="SOCIAL">Social & Impact</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Organizing Club (Optional)
            </label>
            <select
              name="clubId"
              value={formData.clubId}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">General Campus Event</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Description *
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed overview of schedule, criteria, prizes, or what to bring..."
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Timestamps */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Capacity & Deadline */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Capacity Limit (Seats)
            </label>
            <input
              type="number"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 100 (leave blank for unlimited)"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              value={formData.registrationDeadline}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Location & Online Option */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="online"
              checked={formData.online}
              onChange={handleChange}
              className="size-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>This is a Virtual / Online Session</span>
          </label>

          {formData.online ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Meeting URL
              </label>
              <input
                type="url"
                name="meetingUrl"
                value={formData.meetingUrl}
                onChange={handleChange}
                placeholder="https://meet.google.com/... or Zoom link"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                Campus Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium, Innovation Lab 2, Sports Complex"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}
