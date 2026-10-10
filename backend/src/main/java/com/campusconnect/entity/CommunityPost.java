package com.campusconnect.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "community_posts",
        indexes = {
                @Index(name = "idx_community_posts_category", columnList = "category"),
                @Index(name = "idx_community_posts_created_at", columnList = "created_at"),
                @Index(name = "idx_community_posts_upvotes", columnList = "upvotes_count")
        }
)
public class CommunityPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "category_label", length = 64)
    private String categoryLabel;

    @Column(name = "is_suggestion", nullable = false)
    private boolean isSuggestion;

    @Column(length = 32)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "upvotes_count", nullable = false)
    private int upvotesCount = 0;

    @Column(name = "comments_count", nullable = false)
    private int commentsCount = 0;

    @Column(name = "reports_count", nullable = false)
    private int reportsCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityVote> votes = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityReport> reports = new ArrayList<>();

    public CommunityPost() {
    }

    public CommunityPost(String title, String content, String category, String categoryLabel, boolean isSuggestion, String status, User author) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.categoryLabel = categoryLabel;
        this.isSuggestion = isSuggestion;
        this.status = status;
        this.author = author;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCategoryLabel() {
        return categoryLabel;
    }

    public void setCategoryLabel(String categoryLabel) {
        this.categoryLabel = categoryLabel;
    }

    public boolean isSuggestion() {
        return isSuggestion;
    }

    public void setSuggestion(boolean suggestion) {
        isSuggestion = suggestion;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public int getUpvotesCount() {
        return upvotesCount;
    }

    public void setUpvotesCount(int upvotesCount) {
        this.upvotesCount = upvotesCount;
    }

    public int getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(int commentsCount) {
        this.commentsCount = commentsCount;
    }

    public int getReportsCount() {
        return reportsCount;
    }

    public void setReportsCount(int reportsCount) {
        this.reportsCount = reportsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CommunityComment> getComments() {
        return comments;
    }

    public void setComments(List<CommunityComment> comments) {
        this.comments = comments;
    }

    public List<CommunityVote> getVotes() {
        return votes;
    }

    public void setVotes(List<CommunityVote> votes) {
        this.votes = votes;
    }

    public List<CommunityReport> getReports() {
        return reports;
    }

    public void setReports(List<CommunityReport> reports) {
        this.reports = reports;
    }
}
