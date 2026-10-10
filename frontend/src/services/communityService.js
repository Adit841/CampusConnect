/**
 * Campus Community & Feedback Hub — Persistence and Data Management Service.
 *
 * Backed by Spring Boot REST API and MySQL database for authenticated users.
 * Supports searching, category filters, trending/recent sorting, upvotes,
 * comments, and feedback status workflows.
 */

import api, { TOKEN_STORAGE_KEY } from './api.js';

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

export const communityService = {
  /**
   * Retrieves community posts matching category, sort, and search filters.
   */
  async getPosts({ category = 'all', sort = 'trending', search = '' } = {}) {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      return [];
    }

    const params = {};
    if (category && category !== 'all') params.category = category;
    if (sort) params.sort = sort;
    if (search && search.trim()) params.search = search.trim();

    const response = await api.get('/community/posts', { params });
    return response.data || [];
  },

  /**
   * Retrieves a single post by ID.
   */
  async getPost(postId) {
    const response = await api.get(`/community/posts/${postId}`);
    return response.data;
  },

  /**
   * Creates a new community post or feedback suggestion.
   */
  async createPost({ title, content, category, isSuggestion }) {
    const cat = category || 'facilities';
    const suggestionFlag = isSuggestion !== undefined ? isSuggestion : cat === 'facilities';

    const response = await api.post('/community/posts', {
      title: title.trim(),
      content: content.trim(),
      category: cat,
      isSuggestion: suggestionFlag,
    });
    return response.data;
  },

  /**
   * Toggles upvote on a post for the authenticated user.
   */
  async toggleUpvote(postId) {
    const response = await api.post(`/community/posts/${postId}/upvote`);
    return response.data;
  },

  /**
   * Adds a comment to a community post.
   */
  async addComment(postId, { text }) {
    const response = await api.post(`/community/posts/${postId}/comments`, {
      text: text.trim(),
    });
    return response.data;
  },

  /**
   * Updates feedback status for suggestion posts (author, teacher, admin).
   */
  async updateStatus(postId, newStatus) {
    const response = await api.patch(`/community/posts/${postId}/status`, {
      status: newStatus,
    });
    return response.data;
  },

  /**
   * Reports a community post for moderation review.
   */
  async reportPost(postId) {
    const response = await api.post(`/community/posts/${postId}/report`);
    return response.data;
  },

  /**
   * Deletes a community post (Author or ADMIN).
   */
  async deletePost(postId) {
    const response = await api.delete(`/community/posts/${postId}`);
    return response.data;
  },

  /**
   * Deletes a comment on a community post (Author or ADMIN).
   */
  async deleteComment(postId, commentId) {
    const response = await api.delete(`/community/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  /**
   * Resolves/dismisses reported flags on a post (ADMIN only).
   */
  async resolveReports(postId) {
    const response = await api.post(`/community/posts/${postId}/resolve-reports`);
    return response.data;
  },

  /**
   * Fetches posts with active reports for admin review (ADMIN only).
   */
  async getReportedPosts() {
    const response = await api.get('/community/reported');
    return response.data || [];
  },

  /**
   * Fetches the moderation audit log (ADMIN only).
   */
  async getModerationLogs() {
    const response = await api.get('/community/moderation-logs');
    return response.data || [];
  },
};
