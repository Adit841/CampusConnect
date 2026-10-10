import { BookOpen, ClipboardList } from 'lucide-react';
import { SectionCard } from '../ui/Card.jsx';
import { DataSourceBadge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/StateViews.jsx';
import { displayStatus } from '../../services/academicsService.js';
import AssignmentList from './AssignmentList.jsx';

function needsAttention(role, assignments) {
  const byDue = (a, b) => new Date(a.dueAt) - new Date(b.dueAt);
  if (role === 'STUDENT') {
    return assignments.filter((a) => ['PENDING', 'OVERDUE'].includes(displayStatus(a))).sort(byDue);
  }
  return assignments
    .filter((a) => (a.stats?.awaitingReview ?? 0) > 0 || displayStatus(a) === 'OPEN' || displayStatus(a) === 'DRAFT')
    .sort(byDue);
}

function AcademicsOverview({ role, subjects, assignments, source, onOpen, onShowAll }) {
  const upcoming = needsAttention(role, assignments).slice(0, 4);
  const isStudent = role === 'STUDENT';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <SectionCard
        className="xl:col-span-2"
        title={isStudent ? 'Up next' : 'Needs attention'}
        icon={ClipboardList}
        badge={<DataSourceBadge source={source} />}
      >
        {upcoming.length === 0 ? (
          <EmptyState
            title={isStudent ? "You're all caught up" : 'Nothing needs attention'}
            description={isStudent ? 'Pending and overdue assignments appear here.' : 'Drafts, open assignments and unreviewed work appear here.'}
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

      <SectionCard title={role === 'TEACHER' ? 'Subjects you teach' : isStudent ? 'Your subjects' : 'Subjects'} icon={BookOpen} badge={<DataSourceBadge source={source} />}>
        {subjects.length === 0 ? (
          <EmptyState title="No subjects yet" />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {subjects.map((subject) => (
              <li key={subject.id} className="px-5 py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{subject.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {[
                    subject.code,
                    role !== 'TEACHER' && subject.teacherName,
                    `${subject.assignmentCount} ${subject.assignmentCount === 1 ? 'assignment' : 'assignments'}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
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
