package com.campusconnect.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import com.campusconnect.entity.StoredFile;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;

class AcademicFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private AcademicFileStorageService storage;

    @BeforeEach
    void setUp() {
        storage = new AcademicFileStorageService(tempDir.toString(), 1, "pdf,docx,zip,exe");
    }

    @Test
    void store_savesFileUnderGeneratedNameAndDerivesContentType() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "report.PDF", "text/html", "hello".getBytes());

        StoredFile stored = storage.store(file);

        assertEquals("report.PDF", stored.getOriginalName());
        assertEquals("application/pdf", stored.getContentType());
        assertEquals(5L, stored.getSizeBytes());
        assertTrue(stored.getStorageKey().matches("^[0-9a-f-]{36}\\.pdf$"));
        assertTrue(Files.exists(tempDir.resolve(stored.getStorageKey())));

        Resource resource = storage.load(stored);
        assertEquals("hello", new String(resource.getInputStream().readAllBytes()));
    }

    @Test
    void store_stripsPathComponentsFromOriginalName() {
        MockMultipartFile file = new MockMultipartFile("file", "../../etc/passwd.pdf", "application/pdf", "x".getBytes());

        StoredFile stored = storage.store(file);

        assertEquals("passwd.pdf", stored.getOriginalName());
        assertTrue(Files.exists(tempDir.resolve(stored.getStorageKey())));
    }

    @Test
    void store_rejectsDisallowedExtensionEvenIfConfigured() {
        assertFalse(storage.getAllowedExtensions().contains("exe"));
        MockMultipartFile file = new MockMultipartFile("file", "virus.exe", "application/pdf", "x".getBytes());
        assertThrows(BadRequestException.class, () -> storage.store(file));
    }

    @Test
    void store_rejectsMissingExtensionEmptyAndOversizedFiles() {
        assertThrows(BadRequestException.class,
                () -> storage.store(new MockMultipartFile("file", "noext", "application/pdf", "x".getBytes())));
        assertThrows(BadRequestException.class,
                () -> storage.store(new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0])));
        assertThrows(BadRequestException.class,
                () -> storage.store(new MockMultipartFile("file", "big.pdf", "application/pdf", new byte[1024 * 1024 + 1])));
    }

    @Test
    void load_rejectsTamperedStorageKeys() {
        assertThrows(ResourceNotFoundException.class,
                () -> storage.load(new StoredFile("a.pdf", "../secret.pdf", "application/pdf", 1L)));
        assertThrows(ResourceNotFoundException.class,
                () -> storage.load(new StoredFile("a.pdf", "00000000-0000-0000-0000-000000000000.pdf", "application/pdf", 1L)));
    }

    @Test
    void deleteAfterCommit_removesFileImmediatelyOutsideTransaction() {
        StoredFile stored = storage.store(new MockMultipartFile("file", "a.zip", "application/zip", "x".getBytes()));
        storage.deleteAfterCommit(stored);
        assertFalse(Files.exists(tempDir.resolve(stored.getStorageKey())));
    }
}
