/*
 * DEMO DATA ONLY — fictional subjects and assignments for the development demo mode.
 * The backend has no academics API yet. services/academicsService.js loads this file only in
 * development demo mode, so it never reaches production users. Replace it with API calls later.
 */

const DAY = 24 * 60 * 60 * 1000;
const dueIn = (days, hour = 23, minute = 59) => {
  const date = new Date(Date.now() + days * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const subjects = [
  {
    id: 'sub-ajava',
    code: 'CE-AJ301',
    name: 'Advanced Java',
    faculty: 'Prof. Vikram Iyer',
    credits: 4,
    description: 'JDBC, Servlets, JSP, Hibernate and building REST APIs with Spring Boot.',
    materials: [
      { id: 'mat-1', title: 'Unit 1 — JDBC fundamentals', type: 'PDF' },
      { id: 'mat-2', title: 'Servlet lifecycle slides', type: 'Slides' },
      { id: 'mat-3', title: 'Spring Boot starter guide', type: 'Link' },
    ],
  },
  {
    id: 'sub-dbms',
    code: 'CE-DB302',
    name: 'Database Systems',
    faculty: 'Dr. Leena Joshi',
    credits: 4,
    description: 'Relational modelling, normalization, SQL, transactions and indexing.',
    materials: [
      { id: 'mat-4', title: 'ER modelling notes', type: 'PDF' },
      { id: 'mat-5', title: 'Normalization worked examples', type: 'PDF' },
    ],
  },
  {
    id: 'sub-os',
    code: 'CE-OS303',
    name: 'Operating Systems',
    faculty: 'Prof. Sameer Kulkarni',
    credits: 3,
    description: 'Processes, scheduling, synchronization, memory management and file systems.',
    materials: [{ id: 'mat-6', title: 'CPU scheduling slides', type: 'Slides' }],
  },
  {
    id: 'sub-se',
    code: 'CE-SE304',
    name: 'Software Engineering',
    faculty: 'Prof. Vikram Iyer',
    credits: 3,
    description: 'Requirements, design patterns, testing strategies and agile delivery.',
    materials: [],
  },
];

const submission = (allowedTypes, maxSizeMb) => ({ allowedTypes, maxSizeMb });

/** The demo student's assignments. `submittedAt` marks demo records that are already submitted. */
const studentAssignments = [
  {
    id: 'asg-1',
    subjectId: 'sub-ajava',
    title: 'JDBC CRUD mini-project',
    summary: 'Build a console app that performs CRUD operations on a MySQL table using JDBC.',
    instructions: [
      'Use PreparedStatement for every query.',
      'Include a README explaining how to run the project.',
      'Submit the source code as a single ZIP file.',
    ],
    dueAt: dueIn(2),
    priority: 'HIGH',
    submission: submission(['zip'], 10),
    submittedAt: null,
  },
  {
    id: 'asg-2',
    subjectId: 'sub-dbms',
    title: 'Normalization worksheet',
    summary: 'Normalize the given schemas up to BCNF and justify each decomposition.',
    instructions: ['Show functional dependencies for every relation.', 'Submit a single PDF.'],
    dueAt: dueIn(4),
    priority: 'MEDIUM',
    submission: submission(['pdf'], 5),
    submittedAt: null,
  },
  {
    id: 'asg-3',
    subjectId: 'sub-os',
    title: 'Process scheduling report',
    summary: 'Compare FCFS, SJF and Round Robin on the provided workload.',
    instructions: ['Include Gantt charts for each algorithm.', 'Maximum 6 pages.'],
    dueAt: dueIn(7),
    priority: 'MEDIUM',
    submission: submission(['pdf', 'docx'], 10),
    submittedAt: null,
  },
  {
    id: 'asg-4',
    subjectId: 'sub-ajava',
    title: 'REST API design exercise',
    summary: 'Design endpoints for a library system and document them.',
    instructions: ['Describe each endpoint, method and response code.', 'PDF or Markdown accepted.'],
    dueAt: dueIn(12),
    priority: 'LOW',
    submission: submission(['pdf', 'md'], 5),
    submittedAt: null,
  },
  {
    id: 'asg-5',
    subjectId: 'sub-dbms',
    title: 'ER diagram for hostel management',
    summary: 'Draw a complete ER diagram including cardinalities and keys.',
    instructions: ['Export the diagram as PDF or PNG.'],
    dueAt: dueIn(-2),
    priority: 'HIGH',
    submission: submission(['pdf', 'png'], 5),
    submittedAt: null,
  },
  {
    id: 'asg-6',
    subjectId: 'sub-se',
    title: 'Use-case document',
    summary: 'Write use cases for the CampusConnect chat feature.',
    instructions: ['Follow the template shared in class.'],
    dueAt: dueIn(-5),
    priority: 'LOW',
    submission: submission(['pdf', 'docx'], 5),
    submittedAt: dueIn(-6, 18, 20),
  },
  {
    id: 'asg-7',
    subjectId: 'sub-os',
    title: 'Deadlock avoidance quiz prep',
    summary: "Solve the Banker's algorithm problems from the tutorial sheet.",
    instructions: ['Handwritten solutions may be scanned as PDF.'],
    dueAt: dueIn(-1),
    priority: 'MEDIUM',
    submission: submission(['pdf'], 10),
    submittedAt: dueIn(-1, 16, 5),
  },
];

/** Assignments created by the demo teacher (Prof. Vikram Iyer), with submission counts. */
const teacherAssignments = [
  {
    id: 'tasg-1',
    subjectId: 'sub-ajava',
    title: 'JDBC CRUD mini-project',
    summary: 'Console app performing CRUD operations on MySQL with JDBC.',
    instructions: ['PreparedStatement only.', 'ZIP with README.'],
    dueAt: dueIn(2),
    priority: 'HIGH',
    submission: submission(['zip'], 10),
    submittedCount: 38,
    reviewedCount: 20,
    totalStudents: 62,
  },
  {
    id: 'tasg-2',
    subjectId: 'sub-ajava',
    title: 'Servlet lifecycle quiz',
    summary: 'Short written answers on init, service and destroy.',
    instructions: ['Single PDF.'],
    dueAt: dueIn(5),
    priority: 'MEDIUM',
    submission: submission(['pdf'], 5),
    submittedCount: 12,
    reviewedCount: 0,
    totalStudents: 58,
  },
  {
    id: 'tasg-3',
    subjectId: 'sub-ajava',
    title: 'REST API design exercise',
    summary: 'Design and document endpoints for a library system.',
    instructions: ['PDF or Markdown.'],
    dueAt: dueIn(12),
    priority: 'LOW',
    submission: submission(['pdf', 'md'], 5),
    submittedCount: 0,
    reviewedCount: 0,
    totalStudents: 62,
  },
  {
    id: 'tasg-4',
    subjectId: 'sub-ajava',
    title: 'Hibernate mapping lab',
    summary: 'Map a one-to-many relationship and write HQL queries.',
    instructions: ['ZIP with source and screenshots.'],
    dueAt: dueIn(-3),
    priority: 'MEDIUM',
    submission: submission(['zip'], 15),
    submittedCount: 55,
    reviewedCount: 53,
    totalStudents: 58,
  },
  {
    id: 'tasg-5',
    subjectId: 'sub-se',
    title: 'Use-case document',
    summary: 'Use cases for the CampusConnect chat feature.',
    instructions: ['Follow the class template.'],
    dueAt: dueIn(-5),
    priority: 'LOW',
    submission: submission(['pdf', 'docx'], 5),
    submittedCount: 48,
    reviewedCount: 41,
    totalStudents: 60,
  },
];

export const demoAcademics = {
  STUDENT: { subjects, assignments: studentAssignments },
  TEACHER: {
    subjects: subjects.filter((subject) => subject.faculty === 'Prof. Vikram Iyer'),
    assignments: teacherAssignments,
  },
};
