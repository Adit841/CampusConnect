import { Activity, CalendarDays, ClipboardList, Clock, Megaphone } from 'lucide-react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { getStudentDashboard } from '../../services/dashboardService.js';
import WelcomeSection from '../../components/dashboard/WelcomeSection.jsx';
import StatCard, { StatGrid } from '../../components/dashboard/StatCard.jsx';
import DataSection from '../../components/dashboard/DataSection.jsx';
import DeadlineList from '../../components/dashboard/DeadlineList.jsx';
import AnnouncementList from '../../components/dashboard/AnnouncementList.jsx';
import UpcomingEvents from '../../components/dashboard/UpcomingEvents.jsx';
import RecentActivity from '../../components/dashboard/RecentActivity.jsx';
import QuickActions from '../../components/dashboard/QuickActions.jsx';
import DashboardError from './DashboardError.jsx';

function StudentDashboard({ user }) {
  const { data, status, error, reload } = useAsyncData(getStudentDashboard);
  const loading = status === 'loading';
  const stats = data?.stats;
  const source = data?.source;

  return (
    <div className="space-y-8">
      <WelcomeSection user={user} message="Here's what's coming up in your classes and around campus." />

      {status === 'error' ? (
        <DashboardError error={error} onRetry={reload} />
      ) : (
        <>
          <StatGrid>
            <StatCard label="Pending assignments" value={stats?.pendingAssignments} icon={ClipboardList} loading={loading} hint="Not yet past their due date" />
            <StatCard label="Due this week" value={stats?.dueThisWeek} icon={Clock} tone="amber" loading={loading} hint="Within the next 7 days" />
            <StatCard label="Recent announcements" value={stats?.announcements} icon={Megaphone} tone="sky" loading={loading} />
            <StatCard label="Upcoming events" value={stats?.upcomingEvents} icon={CalendarDays} tone="emerald" loading={loading} />
          </StatGrid>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <DataSection
              className="xl:col-span-2"
              title="Upcoming deadlines"
              icon={Clock}
              viewAllTo="/academics"
              loading={loading}
              source={source}
              items={data?.assignments}
              emptyTitle="No upcoming deadlines"
              emptyDescription="You're all caught up. New assignments will appear here."
            >
              {(items) => <DeadlineList items={items} />}
            </DataSection>

            <DataSection
              title="Recent activity"
              icon={Activity}
              loading={loading}
              source={source}
              items={data?.activity}
              emptyTitle="No recent activity"
            >
              {(items) => <RecentActivity items={items} />}
            </DataSection>

            <DataSection
              className="xl:col-span-2"
              title="Recent announcements"
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

      <QuickActions role="STUDENT" />
    </div>
  );
}

export default StudentDashboard;
