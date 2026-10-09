import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  UserRound,
} from 'lucide-react';

/*
 * Single source of truth for sidebar links, page titles and module placeholders.
 * `roles` controls visibility only — it is NOT authorization. The backend must enforce access.
 */
export const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['STUDENT', 'TEACHER', 'ADMIN'] }],
  },
  {
    label: 'Campus',
    items: [
      { to: '/academics', label: 'Academics', icon: BookOpen, roles: ['STUDENT', 'TEACHER'] },
      { to: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
      { to: '/clubs', label: 'Clubs & Events', icon: CalendarDays, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
      { to: '/chat', label: 'Chat', icon: MessagesSquare, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
    ],
  },
  {
    label: 'Account',
    items: [{ to: '/profile', label: 'Profile', icon: UserRound, roles: ['STUDENT', 'TEACHER', 'ADMIN'] }],
  },
];

export function getNavSectionsForRole(role) {
  return navSections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0);
}

export function findNavItem(pathname) {
  for (const section of navSections) {
    const match = section.items.find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
    if (match) return match;
  }
  return null;
}

/** Dashboard shortcuts per role. Every `to` must be a route registered in App.jsx. */
export const quickActions = {
  STUDENT: [
    { to: '/academics', label: 'View assignments', description: 'Deadlines and coursework', icon: BookOpen },
    { to: '/announcements', label: 'Read announcements', description: 'Campus and department news', icon: Megaphone },
    { to: '/clubs', label: 'Explore clubs & events', description: 'Find something to join', icon: CalendarDays },
    { to: '/chat', label: 'Open chat', description: 'Message classmates and teachers', icon: MessagesSquare },
  ],
  TEACHER: [
    { to: '/academics', label: 'Go to academics', description: 'Assignments and submissions', icon: BookOpen },
    { to: '/announcements', label: 'Announcements', description: 'Notices for your classes', icon: Megaphone },
    { to: '/chat', label: 'Open chat', description: 'Talk with students', icon: MessagesSquare },
    { to: '/profile', label: 'My profile', description: 'Department and office details', icon: UserRound },
  ],
  ADMIN: [
    { to: '/announcements', label: 'Announcements', description: 'Platform-wide notices', icon: Megaphone },
    { to: '/clubs', label: 'Clubs & events', description: 'Campus activities overview', icon: CalendarDays },
    { to: '/chat', label: 'Open chat', description: 'Reach students and staff', icon: MessagesSquare },
    { to: '/profile', label: 'My profile', description: 'Your account details', icon: UserRound },
  ],
};

/** Feature modules owned by other team members; shown as placeholders until they are merged. */
export const modulePlaceholders = {
  academics: {
    title: 'Academics',
    owner: 'Academics & Assignments module',
    description: 'Courses, assignments, submissions and grading will appear here.',
    icon: BookOpen,
  },
  announcements: {
    title: 'Announcements',
    owner: 'Announcements & Notifications module',
    description: 'Campus-wide and department announcements will appear here.',
    icon: Megaphone,
  },
  clubs: {
    title: 'Clubs & Events',
    owner: 'Clubs & Events module',
    description: 'Student clubs, memberships and upcoming events will appear here.',
    icon: CalendarDays,
  },
  chat: {
    title: 'Chat',
    owner: 'Chat & Communication module',
    description: 'Direct and group conversations between students and teachers will appear here.',
    icon: MessagesSquare,
  },
};
