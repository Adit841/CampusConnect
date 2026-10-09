import { BookOpen, ClipboardList } from 'lucide-react';
import { SectionCard } from '../ui/Card.jsx';
import { DataSourceBadge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/StateViews.jsx';
import AssignmentList from './AssignmentList.jsx';

function needsAttention(role, assignments) {
  if (role === 'TEACHER') {
    return assignments
      .filter((a) => a.submittedCount > a.reviewedCount || a.status === 'OPEN')
      .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  }
  return assignments
    .filter((a) => a.status !== 'SUBMITTED')
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

function AcademicsOverview({ role, subjects, assignments, source, onOpen, onShowAll }) {
  const upcoming = needsAttention(role, assignments).slice(0, 4);
  const countBySubject = (id) => assignments.filter((a) => a.subjectId === id).length;

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <SectionCard
        className="xl:col-span-2"
        title={role === 'TEACHER' ? 'Needs your attention' : 'Up next'}
        icon={ClipboardList}
        badge={<DataSourceBadge source={source} />}
      >
        {upcoming.length === 0 ? (
          <EmptyState
            title={role === 'TEACHER' ? 'Nothing needs attention' : "You're all caught up"}
            description={role === 'TEACHER' ? 'Open assignments and unreviewed work appear here.' : 'Pending and overdue assignments appear here.'}
          />
        ) : (
          <>
            <AssignmentList assignments={upcoming} role={role} onOpen={onOpen} />
            <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
              <button
                type="button"
                onClick={onShowAll}
                className="rounded text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-indigo-400"
              >
                See all assignments
              </button>
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title={role === 'TEACHER' ? 'Subjects you teach' : 'Your subjects'} icon={BookOpen} badge={<DataSourceBadge source={source} />}>
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {subjects.map((subject) => (
              <li key={subject.id} className="px-5 py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{subject.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subject.code} · {subject.credits} credits · {countBySubject(subject.id)} assignments
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

export default AcademicsOverview;
