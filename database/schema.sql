CREATE DATABASE IF NOT EXISTS campusconnect;

-- ─────────────────────────────────────────────────────────────────────────────
-- Chat module schema (ayushman-feature)
-- All statements use IF NOT EXISTS — safe to re-run without destroying data.
-- Hibernate ddl-auto=update will also apply these at startup when connected.
-- ─────────────────────────────────────────────────────────────────────────────

USE campusconnect;

-- ── conversations ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id         BIGINT      NOT NULL AUTO_INCREMENT,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT pk_conversations PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── conversation_participants ──────────────────────────────────────────────────
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

-- ── messages ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    conversation_id BIGINT        NOT NULL,
    sender_id       BIGINT        NOT NULL,
    content         VARCHAR(4000) NOT NULL,
    sent_at         DATETIME(6)   NOT NULL,
    client_msg_id   VARCHAR(36)   NOT NULL,
    CONSTRAINT pk_messages          PRIMARY KEY (id),
    CONSTRAINT uk_messages_client_id UNIQUE (client_msg_id),
    CONSTRAINT fk_msg_conv          FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender        FOREIGN KEY (sender_id)       REFERENCES users (id)          ON DELETE CASCADE,
    INDEX idx_messages_conv_sent (conversation_id, sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
