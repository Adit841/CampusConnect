package com.campusconnect.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Assignment;
import com.campusconnect.entity.AssignmentStatus;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a JOIN FETCH a.subject s JOIN FETCH s.teacher WHERE a.id = :id")
    Optional<Assignment> findWithSubjectById(@Param("id") Long id);

    @Query("SELECT a FROM Assignment a JOIN FETCH a.subject s JOIN FETCH s.teacher ORDER BY a.dueAt ASC")
    List<Assignment> findAllWithSubject();

    @Query("""
            SELECT a FROM Assignment a JOIN FETCH a.subject s JOIN FETCH s.teacher t
            WHERE t.id = :teacherId
            ORDER BY a.dueAt ASC
            """)
    List<Assignment> findForTeacher(@Param("teacherId") Long teacherId);

    @Query("""
            SELECT a FROM Assignment a JOIN FETCH a.subject s JOIN FETCH s.teacher
            WHERE s.id IN :subjectIds AND a.status = :status
            ORDER BY a.dueAt ASC
            """)
    List<Assignment> findBySubjectIdsAndStatus(
            @Param("subjectIds") Collection<Long> subjectIds,
            @Param("status") AssignmentStatus status
    );

    @Query("""
            SELECT a FROM Assignment a JOIN FETCH a.subject s JOIN FETCH s.teacher
            WHERE s.id = :subjectId
            ORDER BY a.dueAt ASC
            """)
    List<Assignment> findBySubjectIdWithSubject(@Param("subjectId") Long subjectId);

    /** Rows of [subjectId, count]. When {@code status} is null every status is counted. */
    @Query("""
            SELECT a.subject.id, COUNT(a) FROM Assignment a
            WHERE a.subject.id IN :subjectIds AND (:status IS NULL OR a.status = :status)
            GROUP BY a.subject.id
            """)
    List<Object[]> countBySubjectIds(
            @Param("subjectIds") Collection<Long> subjectIds,
            @Param("status") AssignmentStatus status
    );
}
