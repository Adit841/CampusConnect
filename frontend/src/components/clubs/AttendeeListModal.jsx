import { useEffect, useState } from 'react';
import { Users, Mail, Building, Calendar, Search } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import { focusRing } from '../ui/Card.jsx';
import { SkeletonList, EmptyState } from '../ui/StateViews.jsx';
import { getEventAttendees } from '../../services/clubsEventsApi.js';

export default function AttendeeListModal({ eventId, open, onClose }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open || !eventId) {
      setAttendees([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getEventAttendees(eventId)
      .then((data) => {
        if (!cancelled) setAttendees(data.content || []);
      })
      .catch((err) => {
        console.error('Failed to load attendees', err);
        if (!cancelled) setError(err.response?.data?.message || 'Could not load attendee roster.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, eventId]);

  const filtered = attendees.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.userName?.toLowerCase().includes(q) ||
      a.userEmail?.toLowerCase().includes(q) ||
      a.userDepartment?.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Registered Attendees</span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {attendees.length} total
          </span>
        </div>
      }
      description="Authorized organizer view of confirmed student registrations."
      footer={
        <button
          type="button"
          onClick={onClose}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${focusRing}`}
        >
          Close Roster
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or department..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {loading ? (
          <SkeletonList rows={4} />
        ) : error ? (
          <div className="p-4 text-center text-xs text-rose-600 dark:text-rose-400">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={attendees.length === 0 ? 'No attendees registered yet' : 'No matching attendees'}
            description={
              attendees.length === 0
                ? 'Registered students will appear here as soon as they enroll.'
                : 'Try adjusting your search filter.'
            }
          />
        ) : (
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 max-h-96 overflow-y-auto">
            {filtered.map((att) => {
              const regDate = new Date(att.registeredAt);
              return (
                <div key={att.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {att.userName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="size-3" />
                        <span>{att.userEmail}</span>
                      </span>
                      {att.userDepartment && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Building className="size-3" />
                            <span>{att.userDepartment}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                    {regDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
