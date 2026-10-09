import { BookOpen, CircleCheck, ClipboardList, Hourglass, TriangleAlert } from 'lucide-react';
import StatCard, { StatGrid } from '../dashboard/StatCard.jsx';

/** Headline numbers, computed from the same data the lists display. */
function AcademicSummary({ role, summary, loading }) {
  const value = (key) => summary?.[key];

  if (role === 'TEACHER') {
    return (
      <StatGrid>
        <StatCard label="Subjects taught" value={value('subjects')} icon={BookOpen} loading={loading} />
        <StatCard label="Assignments" value={value('assignments')} icon={ClipboardList} tone="sky" loading={loading} />
        <StatCard label="Open for submission" value={value('open')} icon={Hourglass} tone="emerald" loading={loading} />
        <StatCard label="Awaiting review" value={value('awaitingReview')} icon={TriangleAlert} tone="amber" loading={loading} hint="Submissions not yet reviewed" />
      </StatGrid>
    );
  }

  return (
    <StatGrid>
      <StatCard label="Total subjects" value={value('subjects')} icon={BookOpen} loading={loading} />
      <StatCard label="Total assignments" value={value('assignments')} icon={ClipboardList} tone="sky" loading={loading} />
      <StatCard
        label="Pending"
        value={value('pending')}
        icon={Hourglass}
        tone="amber"
        loading={loading}
        hint={summary && (summary.overdue ? `Plus ${summary.overdue} overdue` : 'Nothing overdue')}
      />
      <StatCard label="Submitted" value={value('submitted')} icon={CircleCheck} tone="emerald" loading={loading} />
    </StatGrid>
  );
}

export default AcademicSummary;
