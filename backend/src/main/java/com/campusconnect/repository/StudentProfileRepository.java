package com.campusconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.User;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUser(User user);

    Optional<StudentProfile> findByUserId(Long userId);

    java.util.List<StudentProfile> findByUserIdIn(java.util.Collection<Long> userIds);

    boolean existsByEnrollmentNo(String enrollmentNo);

    /** Students eligible for a subject's audience. Must stay in sync with {@code AcademicAccessService#isEligible}. */
    @Query("""
            SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u
            WHERE LOWER(TRIM(sp.department)) = LOWER(TRIM(:department))
              AND (:year IS NULL OR sp.year = :year)
              AND (:course IS NULL OR LOWER(TRIM(sp.course)) = LOWER(TRIM(:course)))
              AND (:section IS NULL OR LOWER(TRIM(sp.section)) = LOWER(TRIM(:section)))
            ORDER BY u.name ASC
            """)
    List<StudentProfile> findEligibleForAudience(
            @Param("department") String department,
            @Param("course") String course,
            @Param("year") Integer year,
            @Param("section") String section
    );

    @Query("""
            SELECT COUNT(sp) FROM StudentProfile sp
            WHERE LOWER(TRIM(sp.department)) = LOWER(TRIM(:department))
              AND (:year IS NULL OR sp.year = :year)
              AND (:course IS NULL OR LOWER(TRIM(sp.course)) = LOWER(TRIM(:course)))
              AND (:section IS NULL OR LOWER(TRIM(sp.section)) = LOWER(TRIM(:section)))
            """)
    long countEligibleForAudience(
            @Param("department") String department,
            @Param("course") String course,
            @Param("year") Integer year,
            @Param("section") String section
    );
}
