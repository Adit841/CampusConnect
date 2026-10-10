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
