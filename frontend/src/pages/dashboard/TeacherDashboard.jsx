import { CalendarDays, ClipboardCheck, ClipboardList, Clock, Hourglass, Megaphone } from 'lucide-react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getTeacherDashboard } from '../../services/dashboardService.js';
import WelcomeSection from '../../components/dashboard/WelcomeSection.jsx';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard.jsx';
import DataSection from '../../components/dashboard/DataSection.jsx';
import AssignmentsTable from '../../components/dashboard/AssignmentsTable.jsx';
import PendingReviewList from '../../components/dashboard/PendingReviewList.jsx';
import AnnouncementList from '../../components/dashboard/AnnouncementList.jsx';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import DashboardError from './DashboardError.jsx';

function TeacherDashboard({ user }) {
  const { data, status, error, reload } = useAsyncData(getTeacherDashboard);
  const loading = status === 'loading';
  const stats = data?.stats;
  const source = data?.source;

  return (
    <div className="space-y-8">
      <WelcomeSection user={user} message="An overview of your classes, submissions and campus updates." />

      {status === 'error' ? (
        <DashboardError error={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard label="Assignments created" value={stats?.assignmentsCreated} icon={ClipboardList} loading={loading} />
            <StatCard label="Awaiting review" value={stats?.awaitingReview} icon={Hourglass} tone="amber" loading={loading} hint="Submissions not yet graded" />
            <StatCard label="Upcoming deadlines" value={stats?.upcomingDeadlines} icon={Clock} tone="sky" loading={loading} />
            <StatCard label="Recent announcements" value={stats?.announcements} icon={Megaphone} tone="emerald" loading={loading} />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DataSection
              className="xl:col-span-2"
              title="Recent assignments"
              icon={ClipboardList}
              viewAllTo="/academics"
              loading={loading}
              source={source}
              items={data?.assignments}
              emptyTitle="No assignments yet"
              emptyDescription="Assignments you create will be listed here."
            >
              {(items) => <AssignmentsTable items={items} />}
            </DataSection>

            <DataSection
              title="Pending review"
              icon={ClipboardCheck}
              viewAllTo="/academics"
              loading={loading}
              source={source}
              items={data?.pendingReviews}
              emptyTitle="Nothing to review"
              emptyDescription="New submissions will show up here."
            >
              {(items) => <PendingReviewList items={items} />}
            </DataSection>

            <DataSection
              className="xl:col-span-2"
              title="Announcements"
              icon={Megaphone}
              viewAllTo="/announcements"
              loading={loading}
              source={source}
              items={data?.announcements}
              emptyTitle="No announcements yet"
            >
              {(items) => <AnnouncementList items={items} />}
            </DataSection>

            <DataSection
              title="Upcoming events"
              icon={CalendarDays}
              viewAllTo="/clubs"
              loading={loading}
              source={source}
              items={data?.events}
              emptyTitle="No upcoming events"
            >
              {(items) => <UpcomingEvents items={items} />}
            </DataSection>
          </div>
        </>
      )}

      <QuickActions role="TEACHER" />
    </div>
  );
}

export default TeacherDashboard;
