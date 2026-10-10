package com.campusconnect.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "community_votes",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_community_votes_post_user", columnNames = {"post_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_community_votes_post", columnList = "post_id"),
                @Index(name = "idx_community_votes_user", columnList = "user_id")
        }
)
public class CommunityVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private CommunityPost post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public CommunityVote() {
    }

    public CommunityVote(CommunityPost post, User user) {
        this.post = post;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CommunityPost getPost() {
        return post;
    }

    public void setPost(CommunityPost post) {
        this.post = post;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
