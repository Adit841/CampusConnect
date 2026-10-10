/*
 * DEMO DATA ONLY — fictional subjects and assignments for the development demo mode (no backend session).
 * Shaped like the real /api/subjects and /api/assignments responses. services/academicsService.js loads it
 * only when the user is in demo mode; real sessions always use the API and never fall back to this file.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const at = (offsetMs) => new Date(Date.now() + offsetMs).toISOString();

const teacher = { teacherId: 900, teacherName: 'Prof. Vikram Iyer' };

const subjects = [
  { id: 1, code: 'CE-AJ301', name: 'Advanced Java', credits: 4, department: 'Computer Engineering', year: 3, section: null, ...teacher,
    description: 'JDBC, Servlets, JSP, Hibernate and building REST APIs with Spring Boot.' },
  { id: 2, code: 'CE-DB302', name: 'Database Systems', credits: 4, department: 'Computer Engineering', year: 3, section: null,
    teacherId: 901, teacherName: 'Dr. Leena Joshi', description: 'Relational modelling, normalization, SQL, transactions and indexing.' },
  { id: 3, code: 'CE-SE304', name: 'Software Engineering', credits: 3, department: 'Computer Engineering', year: 3, section: 'A', ...teacher,
    description: 'Requirements, design patterns, testing strategies and agile delivery.' },
];

const base = (id, subject, title, description, dueOffset, extra = {}) => ({
  id,
  subjectId: subject.id,
  subjectName: subject.name,
  subjectCode: subject.code,
  teacherName: subject.teacherName,
  title,
  description,
  instructions: null,
  maxMarks: 50,
  status: 'PUBLISHED',
  publishedAt: at(-3 * DAY - id * HOUR),
  createdAt: at(-4 * DAY),
  dueAt: at(dueOffset),
  allowLateSubmissions: false,
  pastDue: dueOffset < 0,
  attachment: null,
  canManage: false,
  ...extra,
});

const studentAssignments = [
  base(1, subjects[0], 'JDBC CRUD mini-project', 'Build a console app that performs CRUD operations on MySQL using JDBC.', 30 * HOUR, {
    instructions: 'Use PreparedStatement for every query.\nInclude a README explaining how to run the project.',
    attachment: { fileName: 'jdbc-brief.pdf', contentType: 'application/pdf', sizeBytes: 182000 },
    myStatus: 'PENDING',
  }),
  base(2, subjects[1], 'Normalization worksheet', 'Normalize the given schemas up to BCNF and justify each decomposition.', 4 * DAY, { myStatus: 'PENDING' }),
  base(3, subjects[1], 'ER diagram for hostel management', 'Draw a complete ER diagram including cardinalities and keys.', -2 * DAY, { myStatus: 'OVERDUE' }),
  base(4, subjects[2], 'Use-case document', 'Write use cases for the CampusConnect chat feature.', 3 * DAY, {
    myStatus: 'SUBMITTED',
    mySubmission: { id: 41, status: 'SUBMITTED', textResponse: 'Draft use cases attached.', file: { fileName: 'use-cases.pdf', sizeBytes: 90000 },
      submittedAt: at(-5 * HOUR), attemptNumber: 1, late: false, canEdit: false },
  }),
  base(5, subjects[0], 'Servlet lifecycle quiz', 'Short written answers on init, service and destroy.', -6 * DAY, {
    myStatus: 'GRADED',
    mySubmission: { id: 51, status: 'RETURNED', textResponse: 'init() runs once…', file: null, submittedAt: at(-7 * DAY), attemptNumber: 1,
      late: false, marksAwarded: 44, feedback: 'Clear explanations. Mention thread safety next time.', gradedAt: at(-5 * DAY), canEdit: false },
  }),
];

const stats = (totalStudents, submitted, graded) => ({
  totalStudents, submitted, graded, awaitingReview: submitted - graded, pending: totalStudents - submitted, late: 0,
});

const teacherAssignments = [
  base(1, subjects[0], 'JDBC CRUD mini-project', 'Console app performing CRUD operations on MySQL with JDBC.', 30 * HOUR,
    { canManage: true, stats: stats(62, 38, 20) }),
  base(6, subjects[0], 'REST API design exercise', 'Design and document endpoints for a library system.', 12 * DAY,
    { canManage: true, status: 'DRAFT', publishedAt: null, stats: stats(62, 0, 0) }),
  base(7, subjects[2], 'Use-case document', 'Use cases for the CampusConnect chat feature.', -5 * DAY,
    { canManage: true, stats: stats(60, 48, 41) }),
];

const teacherSubjects = subjects
  .filter((s) => s.teacherId === teacher.teacherId)
  .map((s) => ({ ...s, canManage: true, assignmentCount: teacherAssignments.filter((a) => a.subjectId === s.id).length }));

export const demoAcademics = {
  STUDENT: {
    subjects: subjects.map((s) => ({ ...s, canManage: false, assignmentCount: studentAssignments.filter((a) => a.subjectId === s.id).length })),
    assignments: studentAssignments,
  },
  TEACHER: { subjects: teacherSubjects, assignments: teacherAssignments },
  ADMIN: {
    subjects: teacherSubjects,
    assignments: teacherAssignments.map((a) => ({ ...a, canManage: false })),
  },
};
