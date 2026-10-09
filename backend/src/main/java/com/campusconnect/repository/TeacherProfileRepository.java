package com.campusconnect.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {

    Optional<TeacherProfile> findByUser(User user);

    Optional<TeacherProfile> findByUserId(Long userId);

    boolean existsByEmployeeId(String employeeId);
}
