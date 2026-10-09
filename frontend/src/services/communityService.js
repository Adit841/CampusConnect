/**
 * Campus Community & Feedback Hub — Persistence and Data Management Service.
 *
 * Implements client-side persistent storage for community posts, suggestions,
 * comments, upvotes, and moderation flags. Uses browser localStorage so changes
 * persist across reloads without modifying teammates' MySQL database schema.
 */

const STORAGE_KEY = 'campusconnect_community_posts_v1';

export const CATEGORIES = [
  { id: 'all', label: 'All Discussions', icon: 'Sparkles' },
  { id: 'facilities', label: 'Facilities & Feedback', icon: 'Building2', isSuggestion: true },
  { id: 'academics', label: 'Academics & Study', icon: 'BookOpen', isSuggestion: false },
  { id: 'clubs-events', label: 'Clubs & Events', icon: 'CalendarDays', isSuggestion: false },
  { id: 'campus-life', label: 'Campus Life', icon: 'Compass', isSuggestion: false },
  { id: 'qna', label: 'Questions & Help', icon: 'HelpCircle', isSuggestion: false },
];

export const FEEDBACK_STATUSES = {
  SUBMITTED: {
    key: 'SUBMITTED',
    label: 'Submitted',
    tone: 'warning',
    description: 'Received and queued for campus review',
  },
  UNDER_REVIEW: {
    key: 'UNDER_REVIEW',
    label: 'Under Review',
    tone: 'accent',
    description: 'Being inspected by facility / club coordinators',
  },
  RESOLVED: {
    key: 'RESOLVED',
    label: 'Resolved',
    tone: 'success',
    description: 'Action taken and issue addressed',
  },
};

const SEED_POSTS = [
  {
    id: 'post-101',
    title: 'Cafeteria Cleanliness & Water Dispenser Maintenance in Block C',
    content:
      'The water cooler on the 2nd floor of Block C has low pressure and requires a filter replacement. Also, having dedicated recycling bins in the cafeteria seating area would keep tables much cleaner during lunch hours.',
    category: 'facilities',
    categoryLabel: 'Facilities & Feedback',
    isSuggestion: true,
    status: 'UNDER_REVIEW',
    author: {
      id: 201,
      name: 'Aditi Sharma',
      role: 'STUDENT',
      department: 'Computer Engineering',
      initials: 'AS',
    },
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3 hours ago
    upvotes: 42,
    upvotedBy: ['user-demo-1', 'user-demo-2'],
    reportsCount: 0,
    reportedBy: [],
    comments: [
      {
        id: 'c-1',
        author: {
          id: 501,
          name: 'Prof. Ramesh Gupta',
          role: 'TEACHER',
          initials: 'RG',
        },
        text: 'Estate and Facilities office has acknowledged this. Maintenance team is scheduled for inspection tomorrow morning.',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'c-2',
        author: {
          id: 204,
          name: 'Rohan Mehra',
          role: 'STUDENT',
          initials: 'RM',
        },
        text: 'Strongly agree, lunch rush gets messy without proper bins!',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-102',
    title: 'Advanced Java (TE-A) Study Circle & Mock Interview Prep',
    content:
      'Forming a study circle for the upcoming JDBC & Spring Boot practicals. We meet at Library Group Study Room 3 on Wednesday at 4 PM. Anyone looking to practice mock technical questions is welcome to join.',
    category: 'academics',
    categoryLabel: 'Academics & Study',
    isSuggestion: false,
    author: {
      id: 202,
      name: 'Ayushman Das',
      role: 'STUDENT',
      department: 'Information Technology',
      initials: 'AD',
    },
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), // 7 hours ago
    upvotes: 27,
    upvotedBy: ['user-demo-1'],
    reportsCount: 0,
    reportedBy: [],
    comments: [
      {
        id: 'c-3',
        author: {
          id: 205,
          name: 'Kavya Nair',
          role: 'STUDENT',
          initials: 'KN',
        },
        text: 'Count me in! I have prepared revision notes for transaction management.',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-103',
    title: 'Smart India Hackathon 2026: Team Formation (Frontend / React Dev needed)',
    content:
      'We have a 4-member team with backend (Java/Spring) and ML expertise working on an AI student assistance theme. Looking for one passionate frontend developer with React/Tailwind experience.',
    category: 'clubs-events',
    categoryLabel: 'Clubs & Events',
    isSuggestion: false,
    author: {
      id: 203,
      name: 'Siddharth Varma',
      role: 'STUDENT',
      department: 'Computer Engineering',
      initials: 'SV',
    },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    upvotes: 31,
    upvotedBy: [],
    reportsCount: 0,
    reportedBy: [],
    comments: [
      {
        id: 'c-4',
        author: {
          id: 206,
          name: 'Priya Iyer',
          role: 'STUDENT',
          initials: 'PI',
        },
        text: 'Hey! I just built our department showcase in React. Sent you a DM in Direct Messages.',
        createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'post-104',
    title: 'Central Library Extended Hours During Mid-Sem Examination Period',
    content:
      'Requesting student council and administration to keep the 2nd floor reading hall open until 10:00 PM for the two weeks preceding mid-semester exams.',
    category: 'facilities',
    categoryLabel: 'Facilities & Feedback',
    isSuggestion: true,
    status: 'RESOLVED',
    author: {
      id: 207,
      name: 'Tanvi Joshi',
      role: 'STUDENT',
      department: 'Electronics',
      initials: 'TJ',
    },
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    upvotes: 68,
    upvotedBy: ['user-demo-1'],
    reportsCount: 0,
    reportedBy: [],
    comments: [
      {
        id: 'c-5',
        author: {
          id: 502,
          name: 'Chief Librarian',
          role: 'ADMIN',
          initials: 'CL',
        },
        text: 'Approved by Dean of Academics. Reading hall 2B will remain open until 10:00 PM starting next Monday with campus security stationed.',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      },
    ],
  },
];

function getStoredPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
      return SEED_POSTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_POSTS;
  } catch {
    return SEED_POSTS;
  }
}

function saveStoredPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save community posts to localStorage', err);
  }
}

export const communityService = {
  getPosts({ category = 'all', sort = 'trending', search = '' } = {}) {
    let posts = [...getStoredPosts()];

    if (category && category !== 'all') {
      posts = posts.filter((p) => p.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.author.name.toLowerCase().includes(q) ||
          (p.categoryLabel && p.categoryLabel.toLowerCase().includes(q))
      );
    }

    if (sort === 'trending') {
      posts.sort((a, b) => b.upvotes - a.upvotes || new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === 'recent') {
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return posts;
  },

  createPost({ title, content, category, author }) {
    const posts = getStoredPosts();
    const catObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[1];
    const isSuggestion = catObj.isSuggestion || category === 'facilities';

    const newPost = {
      id: `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: catObj.id === 'all' ? 'general' : catObj.id,
      categoryLabel: catObj.label,
      isSuggestion,
      status: isSuggestion ? 'SUBMITTED' : undefined,
      author: {
        id: author?.id || Date.now(),
        name: author?.name || 'Campus Student',
        role: author?.role || 'STUDENT',
        department: author?.department || 'Computer Engineering',
        initials: author?.initials || (author?.name ? author.name.slice(0, 2).toUpperCase() : 'ME'),
      },
      createdAt: new Date().toISOString(),
      upvotes: 1, // author's initial vote
      upvotedBy: [String(author?.id || 'current-user')],
      reportsCount: 0,
      reportedBy: [],
      comments: [],
    };

    const updated = [newPost, ...posts];
    saveStoredPosts(updated);
    return newPost;
  },

  toggleUpvote(postId, userId) {
    const posts = getStoredPosts();
    const idStr = String(userId || 'current-user');
    let target = null;

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const hasVoted = post.upvotedBy.includes(idStr);
        const upvotedBy = hasVoted
          ? post.upvotedBy.filter((u) => u !== idStr)
          : [...post.upvotedBy, idStr];
        const upvotes = Math.max(0, post.upvotes + (hasVoted ? -1 : 1));
        target = { ...post, upvotes, upvotedBy };
        return target;
      }
      return post;
    });

    saveStoredPosts(updated);
    return target;
  },

  addComment(postId, { author, text }) {
    const posts = getStoredPosts();
    let target = null;

    const newComment = {
      id: `c-${Date.now()}`,
      author: {
        id: author?.id || Date.now(),
        name: author?.name || 'Campus Student',
        role: author?.role || 'STUDENT',
        initials: author?.initials || (author?.name ? author.name.slice(0, 2).toUpperCase() : 'ME'),
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = posts.map((post) => {
      if (post.id === postId) {
        target = {
          ...post,
          comments: [...(post.comments || []), newComment],
        };
        return target;
      }
      return post;
    });

    saveStoredPosts(updated);
    return { target, newComment };
  },

  updateStatus(postId, newStatus) {
    if (!FEEDBACK_STATUSES[newStatus]) return null;
    const posts = getStoredPosts();
    let target = null;

    const updated = posts.map((post) => {
      if (post.id === postId && post.isSuggestion) {
        target = { ...post, status: newStatus };
        return target;
      }
      return post;
    });

    saveStoredPosts(updated);
    return target;
  },

  reportPost(postId, userId) {
    const posts = getStoredPosts();
    const idStr = String(userId || 'current-user');
    let target = null;

    const updated = posts.map((post) => {
      if (post.id === postId) {
        const alreadyReported = (post.reportedBy || []).includes(idStr);
        if (!alreadyReported) {
          target = {
            ...post,
            reportsCount: (post.reportsCount || 0) + 1,
            reportedBy: [...(post.reportedBy || []), idStr],
          };
          return target;
        }
        target = post;
      }
      return post;
    });

    saveStoredPosts(updated);
    return target;
  },
};
