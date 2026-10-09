/*
 * DEMO DATA ONLY — fictional people and records used while the academics, announcements, clubs and
 * admin APIs do not exist yet. Every screen that shows this data displays a "Demo data" badge.
 * Replace each dataset with the real API call in services/dashboardService.js when it becomes available.
 */

const DAY = 24 * 60 * 60 * 1000;
const at = (days, hour = 23, minute = 59) => {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

/** Users shown in development demo mode when nobody is signed in. Shapes match AuthContext's user. */
export const demoUsers = {
  STUDENT: {
    id: 'demo-student',
    name: 'Ananya Rao',
    email: 'ananya.rao@demo.campusconnect.local',
    role: 'STUDENT',
    profileImage: null,
    department: 'Computer Engineering',
    studentProfile: { course: 'B.Tech', year: 3, section: 'A', rollNo: 'CE-3A-14' },
    teacherProfile: null,
  },
  TEACHER: {
    id: 'demo-teacher',
    name: 'Prof. Vikram Iyer',
    email: 'vikram.iyer@demo.campusconnect.local',
    role: 'TEACHER',
    profileImage: null,
    department: 'Computer Engineering',
    studentProfile: null,
    teacherProfile: { designation: 'Associate Professor', officeRoom: 'B-204' },
  },
  ADMIN: {
    id: 'demo-admin',
    name: 'Meera Kulkarni',
    email: 'meera.kulkarni@demo.campusconnect.local',
    role: 'ADMIN',
    profileImage: null,
    department: 'Academic Office',
    studentProfile: null,
    teacherProfile: null,
  },
};

export const mockAnnouncements = [
  {
    id: 'ann-1',
    title: 'Mid-semester examination timetable published',
    author: 'Examination Cell',
    postedAt: at(-1, 10, 30),
    audience: 'All students',
  },
  {
    id: 'ann-2',
    title: 'Library will remain open until 10 PM during exam weeks',
    author: 'Central Library',
    postedAt: at(-2, 16, 0),
    audience: 'Everyone',
  },
  {
    id: 'ann-3',
    title: 'Guest lecture on Spring Boot microservices — Seminar Hall 2',
    author: 'Dept. of Computer Engineering',
    postedAt: at(-4, 9, 15),
    audience: 'Computer Engineering',
  },
];

export const mockEvents = [
  { id: 'evt-1', title: 'Hackathon kickoff', club: 'Coding Club', startsAt: at(3, 10, 0), location: 'Innovation Lab' },
  { id: 'evt-2', title: 'Inter-college debate prelims', club: 'Literary Society', startsAt: at(6, 14, 0), location: 'Auditorium' },
  { id: 'evt-3', title: 'Photography walk', club: 'Shutterbugs', startsAt: at(9, 7, 0), location: 'Main Gate' },
];

/** Student's assignments. None are marked submitted — these are not real academic records. */
export const mockStudentAssignments = [
  { id: 'asg-1', title: 'JDBC CRUD mini-project', course: 'Advanced Java', dueAt: at(2) },
  { id: 'asg-2', title: 'Normalization worksheet', course: 'Database Systems', dueAt: at(4) },
  { id: 'asg-3', title: 'Process scheduling report', course: 'Operating Systems', dueAt: at(7) },
  { id: 'asg-4', title: 'REST API design exercise', course: 'Advanced Java', dueAt: at(12) },
];

export const mockStudentActivity = [
  { id: 'sa-1', text: 'New assignment posted in Advanced Java', at: hoursAgo(3) },
  { id: 'sa-2', text: 'Coding Club announced the Hackathon kickoff', at: at(-1, 18, 30) },
  { id: 'sa-3', text: 'Database Systems lecture notes were updated', at: at(-2, 12, 0) },
];

/** Assignments created by the teacher, with submission counts. */
export const mockTeacherAssignments = [
  { id: 'tasg-1', title: 'JDBC CRUD mini-project', course: 'Advanced Java · TE-A', dueAt: at(2), submitted: 38, total: 62 },
  { id: 'tasg-2', title: 'Servlet lifecycle quiz', course: 'Advanced Java · TE-B', dueAt: at(5), submitted: 12, total: 58 },
  { id: 'tasg-3', title: 'REST API design exercise', course: 'Advanced Java · TE-A', dueAt: at(12), submitted: 0, total: 62 },
  { id: 'tasg-4', title: 'Hibernate mapping lab', course: 'Advanced Java · TE-B', dueAt: at(-3), submitted: 55, total: 58 },
];

export const mockPendingReviews = [
  { id: 'rev-1', student: 'Rahul Menon', assignment: 'Hibernate mapping lab', submittedAt: at(-3, 22, 10) },
  { id: 'rev-2', student: 'Sneha Pillai', assignment: 'Hibernate mapping lab', submittedAt: at(-3, 20, 45) },
  { id: 'rev-3', student: 'Arjun Desai', assignment: 'JDBC CRUD mini-project', submittedAt: hoursAgo(9) },
  { id: 'rev-4', student: 'Kavya Nair', assignment: 'JDBC CRUD mini-project', submittedAt: hoursAgo(2) },
];

export const mockTeacherActivity = [
  { id: 'ta-1', text: '4 new submissions for JDBC CRUD mini-project', at: hoursAgo(2) },
  { id: 'ta-2', text: 'You posted Servlet lifecycle quiz to TE-B', at: at(-1, 11, 0) },
  { id: 'ta-3', text: 'Department meeting moved to Friday', at: at(-2, 9, 30) },
];

export const mockUserSummary = { total: 1284, students: 1176, teachers: 96, admins: 12 };

export const mockActiveClubs = 14;

export const mockPlatformActivity = [
  { id: 'pa-1', text: '23 new student accounts registered', at: hoursAgo(4) },
  { id: 'pa-2', text: 'Coding Club created the event "Hackathon kickoff"', at: at(-1, 18, 30) },
  { id: 'pa-3', text: 'Examination Cell posted a new announcement', at: at(-1, 10, 30) },
  { id: 'pa-4', text: '2 new teacher accounts registered', at: at(-3, 14, 0) },
];
