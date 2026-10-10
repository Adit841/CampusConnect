package com.campusconnect.util;

import java.nio.charset.StandardCharsets;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.campusconnect.entity.StoredFile;

public final class FileDownloadResponses {

    private FileDownloadResponses() {
    }

    /** Always served as an attachment with nosniff, so uploaded content is never rendered inline by the browser. */
    public static ResponseEntity<Resource> attachment(Resource resource, StoredFile file) {
        MediaType mediaType;
        try {
            mediaType = file.getContentType() != null ? MediaType.parseMediaType(file.getContentType()) : MediaType.APPLICATION_OCTET_STREAM;
        } catch (IllegalArgumentException e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.getOriginalName() != null ? file.getOriginalName() : "download", StandardCharsets.UTF_8)
                .build();
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store");
        if (file.getSizeBytes() != null) {
            builder.contentLength(file.getSizeBytes());
        }
        return builder.body(resource);
    }
}
