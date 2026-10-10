package com.campusconnect.repository;

import com.campusconnect.entity.ModerationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModerationAuditLogRepository extends JpaRepository<ModerationAuditLog, Long> {

    List<ModerationAuditLog> findAllByOrderByCreatedAtDesc();
}
