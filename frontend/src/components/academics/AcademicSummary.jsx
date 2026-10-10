import { BookOpen, CircleCheck, ClipboardList, FilePen, Hourglass, TriangleAlert } from 'lucide-react';
import StatCard, { StatGrid } from '../dashboard/StatCard.jsx';

/** Headline numbers, computed from the same data the lists display. */
function AcademicSummary({ role, summary, loading }) {
  const value = (key) => summary?.[key];

  if (role === 'STUDENT') {
    return (
      <StatGrid>
        <StatCard label="Your subjects" value={value('subjects')} icon={BookOpen} loading={loading} />
        <StatCard
          label="Pending"
          value={value('pending')}
          icon={Hourglass}
          tone="amber"
          loading={loading}
          hint={summary && (summary.overdue ? `Plus ${summary.overdue} overdue` : 'Nothing overdue')}
        />
        <StatCard label="Submitted" value={value('submitted')} icon={ClipboardList} tone="sky" loading={loading} />
        <StatCard label="Graded" value={value('graded')} icon={CircleCheck} tone="emerald" loading={loading} hint="Marks returned by your teachers" />
      </StatGrid>
    );
  }

  return (
    <StatGrid>
      <StatCard label={role === 'TEACHER' ? 'Subjects taught' : 'Subjects'} value={value('subjects')} icon={BookOpen} loading={loading} />
      <StatCard label="Open for submission" value={value('open')} icon={Hourglass} tone="emerald" loading={loading} />
      <StatCard label="Drafts" value={value('drafts')} icon={FilePen} tone="sky" loading={loading} hint="Not visible to students yet" />
      <StatCard label="Awaiting review" value={value('awaitingReview')} icon={TriangleAlert} tone="amber" loading={loading} hint="Submissions not yet graded" />
    </StatGrid>
  );
}

export default AcademicSummary;
