package com.campusconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Subject;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher WHERE s.id = :id")
    Optional<Subject> findWithTeacherById(@Param("id") Long id);

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher ORDER BY s.name ASC")
    List<Subject> findAllWithTeacher();

    @Query("SELECT s FROM Subject s JOIN FETCH s.teacher t WHERE t.id = :teacherId ORDER BY s.name ASC")
    List<Subject> findByTeacherIdWithTeacher(@Param("teacherId") Long teacherId);

    /** Must stay in sync with {@code AcademicAccessService#isEligible}. */
    @Query("""
            SELECT s FROM Subject s JOIN FETCH s.teacher
            WHERE LOWER(TRIM(s.department)) = LOWER(TRIM(:department))
              AND (s.year IS NULL OR s.year = :year)
              AND (s.course IS NULL OR LOWER(TRIM(s.course)) = LOWER(TRIM(:course)))
              AND (s.section IS NULL OR LOWER(TRIM(s.section)) = LOWER(TRIM(:section)))
            ORDER BY s.name ASC
            """)
    List<Subject> findForStudent(
            @Param("department") String department,
            @Param("course") String course,
            @Param("year") Integer year,
            @Param("section") String section
    );

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
}
