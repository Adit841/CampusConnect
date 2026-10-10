import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { BookOpen, ClipboardList, LayoutGrid, Plus, SearchX } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import {
  defaultFilters,
  describeError,
  filterAssignments,
  loadAcademics,
  statusFilters,
  summarize,
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
import AssignmentFormDialog from '../components/academics/AssignmentFormDialog.jsx';
import SubjectFormDialog from '../components/academics/SubjectFormDialog.jsx';
import SubmissionsReviewDialog from '../components/academics/SubmissionsReviewDialog.jsx';
import { primaryButton, secondaryButton } from '../components/academics/buttonStyles.js';

const TAB_IDS = ['overview', 'subjects', 'assignments'];
const ID_PREFIX = 'academics';

const descriptions = {
  STUDENT: 'Your subjects, study materials and assignment deadlines in one place.',
  TEACHER: 'Manage your subjects, publish assignments and review student submissions.',
  ADMIN: 'Oversee subjects, teacher assignments and submission progress across the campus.',
};

function PageHeader({ role, source, canCreate, hasOwnSubjects, onNewSubject, onNewAssignment, onShowPending, onBrowseSubjects }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Academics &amp; Assignments
          </h1>
          <DataSourceBadge source={source} />
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{descriptions[role]}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        {role === 'STUDENT' && (
          <>
            <button type="button" onClick={onBrowseSubjects} className={secondaryButton}>Browse subjects</button>
            <button type="button" onClick={onShowPending} className={primaryButton}>View pending work</button>
          </>
        )}
        {role === 'TEACHER' && canCreate && (
          <>
            <button type="button" onClick={onNewSubject} className={secondaryButton}>
              <Plus className="size-4" aria-hidden="true" />
              New subject
            </button>
            <button
              type="button"
              onClick={onNewAssignment}
              disabled={!hasOwnSubjects}
              title={hasOwnSubjects ? undefined : 'Create a subject first'}
              className={primaryButton}
            >
              <Plus className="size-4" aria-hidden="true" />
              New assignment
            </button>
          </>
        )}
        {role === 'ADMIN' && canCreate && (
          <button type="button" onClick={onNewSubject} className={primaryButton}>
            <Plus className="size-4" aria-hidden="true" />
            New subject
          </button>
        )}
      </div>
    </div>
  );
}

/** All page state lives here; it is remounted (and so reset) whenever the role changes. */
function AcademicsWorkspace({ role, isDemo }) {
  const loader = useCallback(() => loadAcademics(role, isDemo), [role, isDemo]);
  const { data, status, error, reload } = useAsyncData(loader);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  // { type: 'details' | 'submissions' | 'assignmentForm' | 'subjectForm', id?, subject?, subjectId? }
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    if (!error) return undefined;
    let active = true;
    describeError(error).then((message) => active && setErrorMessage(message));
    return () => {
      active = false;
    };
  }, [error]);

  const requestedTab = searchParams.get('tab');
  const activeTab = TAB_IDS.includes(requestedTab) ? requestedTab : 'overview';
  const setTab = useCallback(
    (tab) => setSearchParams(tab === 'overview' ? {} : { tab }, { replace: true }),
    [setSearchParams],
  );

  const subjects = useMemo(() => data?.subjects ?? [], [data]);
  const assignments = useMemo(() => data?.assignments ?? [], [data]);
  const ownSubjects = useMemo(() => subjects.filter((s) => s.canManage), [subjects]);
  const summary = useMemo(() => summarize(role, subjects, assignments), [role, subjects, assignments]);
  const visibleAssignments = useMemo(() => filterAssignments(assignments, filters), [assignments, filters]);
  const dialogAssignment = dialog?.id != null ? assignments.find((a) => a.id === dialog.id) ?? null : null;

  const initialLoading = status === 'loading' && !data;
  const source = data?.source;
  const readOnly = source === 'mock';
  const canCreate = !readOnly && source === 'api';

  const openAssignment = (assignment) => setDialog({ type: 'details', id: assignment.id });
  const closeDialog = () => setDialog(null);

  const showPending = () => {
    setFilters({ ...defaultFilters, status: 'PENDING' });
    setTab('assignments');
  };

  const showSubjectAssignments = (subject) => {
    setFilters({ ...defaultFilters, subjectId: String(subject.id) });
    setTab('assignments');
  };

  const header = (
    <PageHeader
      role={role}
      source={source}
      canCreate={canCreate}
      hasOwnSubjects={ownSubjects.length > 0}
      onNewSubject={() => setDialog({ type: 'subjectForm' })}
      onNewAssignment={() => setDialog({ type: 'assignmentForm' })}
      onShowPending={showPending}
      onBrowseSubjects={() => setTab('subjects')}
    />
  );

  if (status === 'error') {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <ErrorState title="We couldn't load your academics" message={errorMessage} onRetry={reload} />
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'subjects', label: 'Subjects', icon: BookOpen, count: initialLoading ? null : subjects.length },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, count: initialLoading ? null : assignments.length },
  ];

  const emptySubjectsText = {
    STUDENT: 'No subjects match your department, course, year and section yet. Check that your profile is complete.',
    TEACHER: 'Create a subject to start publishing assignments.',
    ADMIN: 'No subjects have been created yet.',
  };

  return (
    <div className="space-y-6">
      {header}
      <AcademicSummary role={role} summary={initialLoading ? null : summary} loading={initialLoading} />

      <div>
        <AcademicsTabs tabs={tabs} activeTab={activeTab} onChange={setTab} idPrefix={ID_PREFIX} />

        <div
          role="tabpanel"
          id={`${ID_PREFIX}-panel-${activeTab}`}
          aria-labelledby={`${ID_PREFIX}-tab-${activeTab}`}
          aria-busy={status === 'loading'}
          tabIndex={0}
          className="pt-6 focus-visible:outline-none"
        >
          {initialLoading ? (
            <Card>
              <SkeletonList rows={4} />
            </Card>
          ) : activeTab === 'overview' ? (
            <AcademicsOverview
              role={role}
              subjects={subjects}
              assignments={assignments}
              source={source}
              onOpen={openAssignment}
              onShowAll={() => setTab('assignments')}
            />
          ) : activeTab === 'subjects' ? (
            subjects.length === 0 ? (
              <Card>
                <EmptyState icon={BookOpen} title="No subjects yet" description={emptySubjectsText[role]} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onViewAssignments={showSubjectAssignments}
                    onEdit={canCreate && subject.canManage ? (s) => setDialog({ type: 'subjectForm', subject: s }) : undefined}
                    onCreateAssignment={
                      canCreate && role === 'TEACHER' && subject.canManage
                        ? (s) => setDialog({ type: 'assignmentForm', subjectId: s.id })
                        : undefined
                    }
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
                  <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    description={role === 'TEACHER' ? 'Create an assignment for one of your subjects.' : 'New assignments will appear here once published.'}
                  />
                ) : visibleAssignments.length === 0 ? (
                  <EmptyState icon={SearchX} title="No matching assignments" description="Try a different search or clear the filters." />
                ) : (
                  <AssignmentList assignments={visibleAssignments} role={role} onOpen={openAssignment} />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>

      {dialog?.type === 'details' && dialogAssignment && (
        <AssignmentDetails
          assignment={dialogAssignment}
          role={role}
          source={source}
          readOnly={readOnly}
          onClose={closeDialog}
          onChanged={reload}
          onEdit={(a) => setDialog({ type: 'assignmentForm', id: a.id })}
          onViewSubmissions={(a) => setDialog({ type: 'submissions', id: a.id })}
          onDeleted={() => {
            closeDialog();
            reload();
          }}
        />
      )}

      {dialog?.type === 'submissions' && dialogAssignment && (
        <SubmissionsReviewDialog
          assignment={dialogAssignment}
          onClose={() => setDialog({ type: 'details', id: dialogAssignment.id })}
          onChanged={reload}
        />
      )}

      {dialog?.type === 'assignmentForm' && canCreate && (dialog.id == null || dialogAssignment) && (
        <AssignmentFormDialog
          assignment={dialogAssignment}
          subjects={ownSubjects}
          defaultSubjectId={dialog.subjectId}
          onClose={() => setDialog(dialog.id != null ? { type: 'details', id: dialog.id } : null)}
          onSaved={(saved, options) => {
            reload();
            if (!options?.keepOpen) setDialog({ type: 'details', id: saved.id });
          }}
        />
      )}

      {dialog?.type === 'subjectForm' && canCreate && (
        <SubjectFormDialog
          role={role}
          subject={dialog.subject}
          onClose={closeDialog}
          onSaved={() => {
            closeDialog();
            reload();
          }}
        />
      )}
    </div>
  );
}

/** /academics — protected by RequireRole(['STUDENT', 'TEACHER', 'ADMIN']) in App.jsx. */
function AcademicsPage() {
  const { user, isDemo } = useAuth();
  return <AcademicsWorkspace key={`${user.role}-${isDemo}`} role={user.role} isDemo={isDemo} />;
}

export default AcademicsPage;
