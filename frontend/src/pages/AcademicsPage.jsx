import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { BookOpen, ClipboardList, LayoutGrid, PlugZap, SearchX } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import {
  defaultFilters,
  filterAssignments,
  loadAcademics,
  statusFilters,
  summarize,
  withDerivedFields,
} from '../services/academicsService.js';
import { Card } from '../components/ui/Card.jsx';
import { DataSourceBadge } from '../components/ui/Badge.jsx';
import { EmptyState, ErrorState, SkeletonList } from '../components/ui/StateViews.jsx';
import AcademicSummary from '../components/academics/AcademicSummary.jsx';
import AcademicsTabs from '../components/academics/AcademicsTabs.jsx';
import AcademicsOverview from '../components/academics/AcademicsOverview.jsx';
import SubjectCard from '../components/academics/SubjectCard.jsx';
import AssignmentFilters from '../components/academics/AssignmentFilters.jsx';
import AssignmentList from '../components/academics/AssignmentList.jsx';
import AssignmentDetails from '../components/academics/AssignmentDetails.jsx';
import TeacherToolsDialog from '../components/academics/TeacherToolsDialog.jsx';
import { primaryButton, secondaryButton } from '../components/academics/buttonStyles.js';

const TAB_IDS = ['overview', 'subjects', 'assignments'];
const ID_PREFIX = 'academics';

function PageHeader({ role, source, onPrimary, onSecondary }) {
  const isTeacher = role === 'TEACHER';
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Academics &amp; Assignments
          </h1>
          <DataSourceBadge source={source} />
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {isTeacher
            ? 'Track the subjects you teach, assignment deadlines and submissions waiting for review.'
            : 'Your subjects, study materials and assignment deadlines in one place.'}
        </p>
      </div>
      {source === 'mock' && (
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onSecondary} className={secondaryButton}>
            {isTeacher ? 'View assignments' : 'Browse subjects'}
          </button>
          <button type="button" onClick={onPrimary} className={primaryButton}>
            {isTeacher ? 'Manage assignments' : 'View pending work'}
          </button>
        </div>
      )}
    </div>
  );
}

/** All page state lives here; it is remounted (and so reset) whenever the role changes. */
function AcademicsWorkspace({ role, isDemo }) {
  const loader = useCallback(() => loadAcademics(role, isDemo), [role, isDemo]);
  const { data, status, error, reload } = useAsyncData(loader);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  const [demoSubmissions, setDemoSubmissions] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [toolsOpen, setToolsOpen] = useState(false);

  const requestedTab = searchParams.get('tab');
  const activeTab = TAB_IDS.includes(requestedTab) ? requestedTab : 'overview';
  const setTab = useCallback(
    (tab) => setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true }),
    [setSearchParams],
  );

  const subjects = useMemo(() => data?.subjects ?? [], [data]);
  const assignments = useMemo(
    () => withDerivedFields(data?.assignments ?? [], subjects, role, demoSubmissions),
    [data, subjects, role, demoSubmissions],
  );
  const summary = useMemo(() => summarize(role, subjects, assignments), [role, subjects, assignments]);
  const visibleAssignments = useMemo(() => filterAssignments(assignments, filters), [assignments, filters]);
  const selected = assignments.find((a) => a.id === selectedId) ?? null;

  const loading = status === 'loading';
  const source = data?.source;

  const onDemoSubmit = (assignmentId, fileName) =>
    setDemoSubmissions((current) => ({ ...current, [assignmentId]: { fileName, at: new Date().toISOString() } }));

  const showPending = () => {
    setFilters({ ...defaultFilters, status: 'PENDING' });
    setTab('assignments');
  };

  const header = (
    <PageHeader
      role={role}
      source={source}
      onPrimary={role === 'TEACHER' ? () => setToolsOpen(true) : showPending}
      onSecondary={() => setTab(role === 'TEACHER' ? 'assignments' : 'subjects')}
    />
  );

  if (status === 'error') {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState title="We couldn't load your academics" message={error?.message} onRetry={reload} />
        </Card>
      </div>
    );
  }

  if (source === 'unavailable') {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <EmptyState
            icon={PlugZap}
            title="Academics isn't connected yet"
            description="Subjects and assignments will appear here once the Academics API is available."
          />
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, count: loading ? null : subjects.length },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: loading ? null : assignments.length },
  ];

  return (
    <div className="space-y-6">
      {header}
      <AcademicSummary role={role} summary={loading ? null : summary} loading={loading} />

      <div>
        <AcademicsTabs tabs={tabs} activeTab={activeTab} onChange={setTab} idPrefix={ID_PREFIX} />

        <div
          role="tabpanel"
          id={`${ID_PREFIX}-panel-${activeTab}`}
          aria-labelledby={`${ID_PREFIX}-tab-${activeTab}`}
          tabIndex={0}
          className="pt-6 focus-visible:outline-none"
        >
          {loading ? (
            <Card>
              <SkeletonList rows={4} />
            </Card>
          ) : activeTab === 'overview' ? (
            <AcademicsOverview
              role={role}
              subjects={subjects}
              assignments={assignments}
              source={source}
              onOpen={(a) => setSelectedId(a.id)}
              onShowAll={() => setTab('assignments')}
            />
          ) : activeTab === 'subjects' ? (
            subjects.length === 0 ? (
              <Card>
                <EmptyState icon={BookOpen} title="No subjects yet" description="Subjects you're enrolled in or teaching will appear here." />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    assignmentCount={assignments.filter((a) => a.subjectId === subject.id).length}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="space-y-4">
              <AssignmentFilters
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultFilters)}
                statusOptions={statusFilters[role]}
                subjects={subjects}
                resultCount={visibleAssignments.length}
                totalCount={assignments.length}
              />
              <Card>
                {assignments.length === 0 ? (
                  <EmptyState icon={ClipboardList} title="No assignments yet" description="New assignments will appear here." />
                ) : visibleAssignments.length === 0 ? (
                  <EmptyState icon={SearchX} title="No matching assignments" description="Try a different search or clear the filters." />
                ) : (
                  <AssignmentList assignments={visibleAssignments} role={role} onOpen={(a) => setSelectedId(a.id)} />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <AssignmentDetails
          assignment={selected}
          role={role}
          source={source}
          onClose={() => setSelectedId(null)}
          onDemoSubmit={onDemoSubmit}
        />
      )}
      {toolsOpen && <TeacherToolsDialog onClose={() => setToolsOpen(false)} />}
    </div>
  );
}

/** /academics — protected by RequireRole(['STUDENT', 'TEACHER']) in App.jsx. */
function AcademicsPage() {
  const { user, isDemo } = useAuth();
  return <AcademicsWorkspace key={`${user.role}-${isDemo}`} role={user.role} isDemo={isDemo} />;
}

export default AcademicsPage;
