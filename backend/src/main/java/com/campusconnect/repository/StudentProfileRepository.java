package com.campusconnect.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.User;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUser(User user);

    Optional<StudentProfile> findByUserId(Long userId);

    java.util.List<StudentProfile> findByUserIdIn(java.util.Collection<Long> userIds);

    boolean existsByEnrollmentNo(String enrollmentNo);
}
