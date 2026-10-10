-- =============================================================================
-- CampusConnect Database Schema
-- Compatible with MySQL 8.0+ / Cloud-Hosted MySQL (Aiven, Railway, AWS RDS, TiDB)
--
-- All statements use IF NOT EXISTS to guarantee idempotent, non-destructive execution.
-- Existing tables and records are completely preserved.
--
-- NOTE FOR CLOUD-HOSTED DATABASES:
-- If your provider already created a default database (e.g., 'defaultdb' or 'railway'),
-- select that database in your connection or comment out the CREATE DATABASE line below.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

-- ── 1. users ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    phone         VARCHAR(255) DEFAULT NULL,
    bio           TEXT         DEFAULT NULL,
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. student_profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    user_id       BIGINT       NOT NULL,
    enrollment_no VARCHAR(255) NOT NULL,
    roll_no       VARCHAR(255) DEFAULT NULL,
    course        VARCHAR(255) DEFAULT NULL,
    department    VARCHAR(255) DEFAULT NULL,
    year          INT          DEFAULT NULL,
    section       VARCHAR(255) DEFAULT NULL,
    CONSTRAINT pk_student_profiles PRIMARY KEY (id),
    CONSTRAINT uk_student_profiles_user UNIQUE (user_id),
    CONSTRAINT uk_student_profiles_enrollment UNIQUE (enrollment_no),
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. teacher_profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    employee_id VARCHAR(255) NOT NULL,
    department  VARCHAR(255) DEFAULT NULL,
    designation VARCHAR(255) DEFAULT NULL,
    office_room VARCHAR(255) DEFAULT NULL,
    CONSTRAINT pk_teacher_profiles PRIMARY KEY (id),
    CONSTRAINT uk_teacher_profiles_user UNIQUE (user_id),
    CONSTRAINT uk_teacher_profiles_employee UNIQUE (employee_id),
    CONSTRAINT fk_teacher_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. conversations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_conversations PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. conversation_participants ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_participants (
    id              BIGINT      NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT      NOT NULL,
    user_id         BIGINT      NOT NULL,
    joined_at       DATETIME(6) NOT NULL,
    CONSTRAINT pk_cp            PRIMARY KEY (id),
    CONSTRAINT uk_cp_conv_user  UNIQUE (conversation_id, user_id),
    CONSTRAINT fk_cp_conv       FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_cp_user       FOREIGN KEY (user_id)         REFERENCES users (id)          ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. messages ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT        NOT NULL,
    sender_id       BIGINT        NOT NULL,
    content         VARCHAR(4000) NOT NULL,
    sent_at         DATETIME(6)   NOT NULL,
    client_msg_id   VARCHAR(36)   NOT NULL,
    CONSTRAINT pk_messages           PRIMARY KEY (id),
    CONSTRAINT uk_messages_client_id UNIQUE (client_msg_id),
    CONSTRAINT fk_msg_conv           FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender         FOREIGN KEY (sender_id)       REFERENCES users (id)          ON DELETE CASCADE,
    INDEX idx_messages_conv_sent (conversation_id, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. announcements ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    audience    VARCHAR(100) NOT NULL DEFAULT 'ALL',
    department  VARCHAR(255) DEFAULT NULL,
    pinned      BOOLEAN      NOT NULL DEFAULT FALSE,
    author_id   BIGINT       NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    CONSTRAINT pk_announcements PRIMARY KEY (id),
    CONSTRAINT fk_announcements_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_announcements_audience (audience),
    INDEX idx_announcements_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 8. subjects (Academics) ──────────────────────────────────────────────────
-- Students are linked through their student_profiles: a student is eligible when
-- department matches and, where set here, course / year / section match too.
CREATE TABLE IF NOT EXISTS subjects (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(30)  NOT NULL,
    description TEXT         DEFAULT NULL,
    credits     INT          DEFAULT NULL,
    department  VARCHAR(255) NOT NULL,
    course      VARCHAR(255) DEFAULT NULL,
    year        INT          DEFAULT NULL,
    section     VARCHAR(255) DEFAULT NULL,
    teacher_id  BIGINT       NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    updated_at  DATETIME(6)  NOT NULL,
    CONSTRAINT pk_subjects PRIMARY KEY (id),
    CONSTRAINT uk_subjects_code UNIQUE (code),
    CONSTRAINT fk_subjects_teacher FOREIGN KEY (teacher_id) REFERENCES users (id),
    CONSTRAINT chk_subjects_credits CHECK (credits IS NULL OR credits BETWEEN 0 AND 20),
    CONSTRAINT chk_subjects_year CHECK (year IS NULL OR year BETWEEN 1 AND 10),
    INDEX idx_subjects_teacher (teacher_id),
    INDEX idx_subjects_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 9. assignments (Academics) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    subject_id              BIGINT       NOT NULL,
    created_by              BIGINT       NOT NULL,
    title                   VARCHAR(200) NOT NULL,
    description             TEXT         DEFAULT NULL,
    instructions            TEXT         DEFAULT NULL,
    max_marks               INT          NOT NULL,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    published_at            DATETIME(6)  DEFAULT NULL,
    due_at                  DATETIME(6)  NOT NULL,
    allow_late_submissions  BOOLEAN      NOT NULL DEFAULT FALSE,
    attachment_name         VARCHAR(255) DEFAULT NULL,
    attachment_storage_key  VARCHAR(80)  DEFAULT NULL,
    attachment_content_type VARCHAR(120) DEFAULT NULL,
    attachment_size_bytes   BIGINT       DEFAULT NULL,
    created_at              DATETIME(6)  NOT NULL,
    updated_at              DATETIME(6)  NOT NULL,
    CONSTRAINT pk_assignments PRIMARY KEY (id),
    CONSTRAINT fk_assignments_subject    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT chk_assignments_max_marks CHECK (max_marks BETWEEN 1 AND 1000),
    CONSTRAINT chk_assignments_status    CHECK (status IN ('DRAFT', 'PUBLISHED')),
    INDEX idx_assignments_subject_status (subject_id, status),
    INDEX idx_assignments_due_at (due_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 10. submissions (Academics) ──────────────────────────────────────────────
-- One row per (assignment, student); permitted resubmissions update the row and bump attempt_number.
CREATE TABLE IF NOT EXISTS submissions (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    assignment_id     BIGINT       NOT NULL,
    student_id        BIGINT       NOT NULL,
    text_response     TEXT         DEFAULT NULL,
    file_name         VARCHAR(255) DEFAULT NULL,
    file_storage_key  VARCHAR(80)  DEFAULT NULL,
    file_content_type VARCHAR(120) DEFAULT NULL,
    file_size_bytes   BIGINT       DEFAULT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'SUBMITTED',
    late              BOOLEAN      NOT NULL DEFAULT FALSE,
    attempt_number    INT          NOT NULL DEFAULT 1,
    submitted_at      DATETIME(6)  NOT NULL,
    marks_awarded     DECIMAL(6,2) DEFAULT NULL,
    feedback          TEXT         DEFAULT NULL,
    graded_at         DATETIME(6)  DEFAULT NULL,
    graded_by         BIGINT       DEFAULT NULL,
    returned_at       DATETIME(6)  DEFAULT NULL,
    created_at        DATETIME(6)  NOT NULL,
    updated_at        DATETIME(6)  NOT NULL,
    CONSTRAINT pk_submissions PRIMARY KEY (id),
    CONSTRAINT uk_submissions_assignment_student UNIQUE (assignment_id, student_id),
    CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (id),
    CONSTRAINT fk_submissions_student    FOREIGN KEY (student_id)    REFERENCES users (id),
    CONSTRAINT fk_submissions_graded_by  FOREIGN KEY (graded_by)     REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_submissions_marks     CHECK (marks_awarded IS NULL OR marks_awarded >= 0),
    CONSTRAINT chk_submissions_attempt   CHECK (attempt_number >= 1),
    CONSTRAINT chk_submissions_status    CHECK (status IN ('SUBMITTED', 'GRADED', 'RETURNED')),
    INDEX idx_submissions_student (student_id),
    INDEX idx_submissions_assignment_status (assignment_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

