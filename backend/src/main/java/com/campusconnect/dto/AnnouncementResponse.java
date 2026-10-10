package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.Announcement;
import com.campusconnect.entity.Role;

public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String audience;
    private String department;
    private boolean pinned;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private Role authorRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AnnouncementResponse() {
    }

    public static AnnouncementResponse fromEntity(Announcement announcement) {
        AnnouncementResponse res = new AnnouncementResponse();
        res.setId(announcement.getId());
        res.setTitle(announcement.getTitle());
        res.setContent(announcement.getContent());
        res.setCategory(announcement.getCategory());
        res.setAudience(announcement.getAudience());
        res.setDepartment(announcement.getDepartment());
        res.setPinned(announcement.isPinned());
        if (announcement.getAuthor() != null) {
            res.setAuthorId(announcement.getAuthor().getId());
            res.setAuthorName(announcement.getAuthor().getName());
            res.setAuthorEmail(announcement.getAuthor().getEmail());
            res.setAuthorRole(announcement.getAuthor().getRole());
        }
        res.setCreatedAt(announcement.getCreatedAt());
        res.setUpdatedAt(announcement.getUpdatedAt());
        return res;
    }

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

    public String getAudience() {
        return audience;
    }

    public void setAudience(String audience) {
        this.audience = audience;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public Role getRole() {
        return authorRole;
    }

    public Role getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(Role authorRole) {
        this.authorRole = authorRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /** Compatibility getter for dashboard AnnouncementList component */
    public String getAuthor() {
        return authorName;
    }

    /** Compatibility getter for dashboard AnnouncementList component */
    public LocalDateTime getPostedAt() {
        return createdAt;
    }
}
