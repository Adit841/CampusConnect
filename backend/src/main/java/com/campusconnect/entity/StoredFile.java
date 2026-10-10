package com.campusconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/**
 * Metadata for a file kept by {@code AcademicFileStorageService}. Only the generated
 * {@code storageKey} is used to locate the file on disk; it is never exposed through the API.
 */
@Embeddable
public class StoredFile {

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "storage_key", length = 80)
    private String storageKey;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    public StoredFile() {
    }

    public StoredFile(String originalName, String storageKey, String contentType, Long sizeBytes) {
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }
}
