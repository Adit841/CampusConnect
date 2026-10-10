import { useState } from 'react';
import { Users, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { createClub } from '../../services/clubsEventsApi.js';

export default function CreateClubModal({ open, onClose, onClubCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'TECHNICAL',
    tagline: '',
    description: '',
    activities: '',
    logoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Club name is required.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Club description is required.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        tagline: formData.tagline.trim() || null,
        description: formData.description.trim(),
        activities: formData.activities.trim() || null,
        logoUrl: formData.logoUrl.trim() || null,
      };

      await createClub(payload);
      if (onClubCreated) onClubCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create club', err);
      setError(err.response?.data?.message || 'Could not register club.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Campus Club"
      description="Register a new student club or campus chapter in the official directory."
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
            form="create-club-form"
            disabled={loading}
            className={`rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-60 dark:bg-indigo-500 dark:hover:bg-indigo-400 ${focusRing}`}
          >
            {loading ? 'Creating…' : 'Register Club'}
          </button>
        </div>
      }
    >
      <form id="create-club-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Club Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Arya Artificial Intelligence Society"
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

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
            Tagline / Motto
          </label>
          <input
            type="text"
            name="tagline"
            value={formData.tagline}
            onChange={handleChange}
            placeholder="e.g. Exploring modern algorithms & building intelligence together"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Description *
          </label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Club overview, mission, regular gatherings, and member benefits..."
            required
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Focus Areas & Activities (comma-separated)
          </label>
          <input
            type="text"
            name="activities"
            value={formData.activities}
            onChange={handleChange}
            placeholder="e.g. Workshops, Hackathons, Project Showcases, Study Jams"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </form>
    </Modal>
  );
}
