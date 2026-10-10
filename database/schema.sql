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

-- ── 8. clubs ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clubs (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    name                VARCHAR(255) NOT NULL,
    slug                VARCHAR(255) NOT NULL,
    category            VARCHAR(50)  NOT NULL,
    tagline             VARCHAR(500) DEFAULT NULL,
    description         TEXT         NOT NULL,
    activities          TEXT         DEFAULT NULL,
    logo_url            VARCHAR(500) DEFAULT NULL,
    banner_url          VARCHAR(500) DEFAULT NULL,
    lead_coordinator_id BIGINT       DEFAULT NULL,
    contact_email       VARCHAR(255) DEFAULT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    is_sample_data      BOOLEAN      NOT NULL DEFAULT FALSE,
    member_count        INT          NOT NULL DEFAULT 0,
    created_at          DATETIME(6)  NOT NULL,
    updated_at          DATETIME(6)  NOT NULL,
    CONSTRAINT pk_clubs PRIMARY KEY (id),
    CONSTRAINT uk_clubs_name UNIQUE (name),
    CONSTRAINT uk_clubs_slug UNIQUE (slug),
    CONSTRAINT fk_clubs_lead FOREIGN KEY (lead_coordinator_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_clubs_category (category),
    INDEX idx_clubs_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 9. club_memberships ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS club_memberships (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    club_id    BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    role       VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    status     VARCHAR(50) NOT NULL DEFAULT 'APPROVED',
    joined_at  DATETIME(6) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_club_memberships PRIMARY KEY (id),
    CONSTRAINT uk_club_member UNIQUE (club_id, user_id),
    CONSTRAINT fk_cm_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE,
    CONSTRAINT fk_cm_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_cm_user (user_id),
    INDEX idx_cm_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 10. campus_events ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campus_events (
    id                    BIGINT       NOT NULL AUTO_INCREMENT,
    title                 VARCHAR(255) NOT NULL,
    slug                  VARCHAR(255) NOT NULL,
    club_id               BIGINT       DEFAULT NULL,
    category              VARCHAR(50)  NOT NULL,
    description           TEXT         NOT NULL,
    venue                 VARCHAR(255) NOT NULL,
    is_online             BOOLEAN      NOT NULL DEFAULT FALSE,
    meeting_link          VARCHAR(500) DEFAULT NULL,
    start_date_time       DATETIME(6)  NOT NULL,
    end_date_time         DATETIME(6)  NOT NULL,
    registration_deadline DATETIME(6)  DEFAULT NULL,
    capacity              INT          DEFAULT NULL,
    registered_count      INT          NOT NULL DEFAULT 0,
    status                VARCHAR(50)  NOT NULL DEFAULT 'PUBLISHED',
    is_featured           BOOLEAN      NOT NULL DEFAULT FALSE,
    image_url             VARCHAR(500) DEFAULT NULL,
    is_sample_data        BOOLEAN      NOT NULL DEFAULT FALSE,
    organizer_id          BIGINT       NOT NULL,
    created_at            DATETIME(6)  NOT NULL,
    updated_at            DATETIME(6)  NOT NULL,
    CONSTRAINT pk_campus_events PRIMARY KEY (id),
    CONSTRAINT uk_events_slug UNIQUE (slug),
    CONSTRAINT fk_events_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE SET NULL,
    CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_events_start_time (start_date_time),
    INDEX idx_events_category (category),
    INDEX idx_events_status (status),
    INDEX idx_events_club (club_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 11. event_registrations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    event_id      BIGINT      NOT NULL,
    user_id       BIGINT      NOT NULL,
    status        VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    registered_at DATETIME(6) NOT NULL,
    cancelled_at  DATETIME(6) DEFAULT NULL,
    CONSTRAINT pk_event_registrations PRIMARY KEY (id),
    CONSTRAINT uk_event_user UNIQUE (event_id, user_id),
    CONSTRAINT fk_er_event FOREIGN KEY (event_id) REFERENCES campus_events (id) ON DELETE CASCADE,
    CONSTRAINT fk_er_user  FOREIGN KEY (user_id)  REFERENCES users (id)         ON DELETE CASCADE,
    INDEX idx_er_user (user_id),
    INDEX idx_er_event (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


