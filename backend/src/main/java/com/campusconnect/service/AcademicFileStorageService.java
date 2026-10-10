package com.campusconnect.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.campusconnect.entity.StoredFile;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;

/**
 * Stores assignment attachments and submission files on the local filesystem.
 *
 * <p>Files are saved under a generated name ({@code <uuid>.<ext>}) inside a single configured directory,
 * so user-supplied names never influence the path. The content type is derived from the allow-listed
 * extension rather than trusted from the client.</p>
 */
@Service
public class AcademicFileStorageService {

    private static final Logger log = LoggerFactory.getLogger(AcademicFileStorageService.class);

    private static final Pattern STORAGE_KEY_PATTERN = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[a-z0-9]{1,10}$");

    private static final Map<String, String> CONTENT_TYPES = Map.ofEntries(
            Map.entry("pdf", "application/pdf"),
            Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("txt", "text/plain"),
            Map.entry("md", "text/markdown"),
            Map.entry("csv", "text/csv"),
            Map.entry("zip", "application/zip"),
            Map.entry("png", "image/png"),
            Map.entry("jpg", "image/jpeg"),
            Map.entry("jpeg", "image/jpeg")
    );

    private final Path root;
    private final long maxFileSizeBytes;
    private final Set<String> allowedExtensions;

    public AcademicFileStorageService(
            @Value("${app.academics.storage-dir:uploads/academics}") String storageDir,
            @Value("${app.academics.max-file-size-mb:10}") long maxFileSizeMb,
            @Value("${app.academics.allowed-extensions:pdf,doc,docx,ppt,pptx,xls,xlsx,txt,md,csv,zip,png,jpg,jpeg}") String allowedExtensions
    ) {
        this.root = Paths.get(storageDir).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
        this.allowedExtensions = Arrays.stream(allowedExtensions.split(","))
                .map(ext -> ext.trim().toLowerCase(Locale.ROOT))
                .filter(CONTENT_TYPES::containsKey)
                .collect(Collectors.toUnmodifiableSet());
    }

    public Set<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public long getMaxFileSizeBytes() {
        return maxFileSizeBytes;
    }

    /**
     * Validates and saves the file. When called inside a transaction, the file is removed again if the
     * transaction rolls back, so failed requests do not leave orphaned files behind.
     */
    public StoredFile store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("The uploaded file is empty");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("The file must be " + (maxFileSizeBytes / (1024 * 1024)) + " MB or smaller");
        }

        String originalName = sanitizeFileName(file.getOriginalFilename());
        String extension = extensionOf(originalName);
        if (extension == null || !allowedExtensions.contains(extension)) {
            throw new BadRequestException("Unsupported file type. Allowed types: " + String.join(", ", allowedExtensions.stream().sorted().toList()));
        }

        String storageKey = UUID.randomUUID() + "." + extension;
        Path target = resolve(storageKey);
        try {
            Files.createDirectories(root);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store uploaded file", e);
        }

        StoredFile stored = new StoredFile(originalName, storageKey, CONTENT_TYPES.get(extension), file.getSize());
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status != STATUS_COMMITTED) {
                        deleteNow(stored);
                    }
                }
            });
        }
        return stored;
    }

    public Resource load(StoredFile file) {
        if (file == null || file.getStorageKey() == null) {
            throw new ResourceNotFoundException("File not found");
        }
        Path path = resolve(file.getStorageKey());
        if (!Files.isRegularFile(path) || !Files.isReadable(path)) {
            throw new ResourceNotFoundException("File not found");
        }
        return new FileSystemResource(path);
    }

    /** Deletes the file once the surrounding transaction commits (or immediately when there is none). */
    public void deleteAfterCommit(StoredFile file) {
        if (file == null || file.getStorageKey() == null) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deleteNow(file);
                }
            });
        } else {
            deleteNow(file);
        }
    }

    private void deleteNow(StoredFile file) {
        try {
            Files.deleteIfExists(resolve(file.getStorageKey()));
        } catch (IOException | RuntimeException e) {
            log.warn("Could not delete stored academic file {}: {}", file.getStorageKey(), e.getMessage());
        }
    }

    private Path resolve(String storageKey) {
        if (storageKey == null || !STORAGE_KEY_PATTERN.matcher(storageKey).matches()) {
            throw new ResourceNotFoundException("File not found");
        }
        Path path = root.resolve(storageKey).normalize();
        if (!root.equals(path.getParent())) {
            throw new ResourceNotFoundException("File not found");
        }
        return path;
    }

    static String sanitizeFileName(String name) {
        if (name == null) {
            return "file";
        }
        String base = name.replace('\\', '/');
        base = base.substring(base.lastIndexOf('/') + 1);
        base = base.replaceAll("[\\p{Cntrl}\"<>|:*?]", "_").trim();
        if (base.isEmpty() || base.equals(".") || base.equals("..")) {
            return "file";
        }
        if (base.length() > 200) {
            String ext = extensionOf(base);
            base = ext == null ? base.substring(0, 200) : base.substring(0, 190) + "." + ext;
        }
        return base;
    }

    static String extensionOf(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot <= 0 || dot == fileName.length() - 1) {
            return null;
        }
        return fileName.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
