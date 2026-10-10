package com.campusconnect.dto;

import com.campusconnect.entity.StoredFile;

/** Public file metadata. The storage key and filesystem location are intentionally omitted. */
public record FileInfoResponse(String fileName, String contentType, Long sizeBytes) {

    public static FileInfoResponse from(StoredFile file) {
        if (file == null || file.getStorageKey() == null) {
            return null;
        }
        return new FileInfoResponse(file.getOriginalName(), file.getContentType(), file.getSizeBytes());
    }
}
