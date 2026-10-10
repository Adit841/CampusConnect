package com.campusconnect.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Submission;
import com.campusconnect.entity.SubmissionStatus;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    @Query("""
            SELECT sub FROM Submission sub
            JOIN FETCH sub.student
            JOIN FETCH sub.assignment a
            JOIN FETCH a.subject s
            JOIN FETCH s.teacher
            WHERE sub.id = :id
            """)
    Optional<Submission> findWithDetailsById(@Param("id") Long id);

    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    @Query("SELECT sub FROM Submission sub WHERE sub.student.id = :studentId AND sub.assignment.id IN :assignmentIds")
    List<Submission> findByStudentAndAssignmentIds(
            @Param("studentId") Long studentId,
            @Param("assignmentIds") Collection<Long> assignmentIds
    );

    @Query("""
            SELECT sub FROM Submission sub
            JOIN FETCH sub.assignment a
            JOIN FETCH a.subject s
            JOIN FETCH s.teacher
            WHERE sub.student.id = :studentId
            ORDER BY sub.submittedAt DESC
            """)
    List<Submission> findForStudentWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT sub FROM Submission sub JOIN FETCH sub.student WHERE sub.assignment.id = :assignmentId")
    List<Submission> findByAssignmentIdWithStudent(@Param("assignmentId") Long assignmentId);

    /**
     * Rows of [assignmentId, total, reviewed, late], where "reviewed" counts every status
     * other than {@code submittedStatus}.
     */
    @Query("""
            SELECT sub.assignment.id,
                   COUNT(sub),
                   SUM(CASE WHEN sub.status <> :submittedStatus THEN 1 ELSE 0 END),
                   SUM(CASE WHEN sub.late = true THEN 1 ELSE 0 END)
            FROM Submission sub
            WHERE sub.assignment.id IN :assignmentIds
            GROUP BY sub.assignment.id
            """)
    List<Object[]> summarizeByAssignmentIds(
            @Param("assignmentIds") Collection<Long> assignmentIds,
            @Param("submittedStatus") SubmissionStatus submittedStatus
    );

    boolean existsByAssignmentId(Long assignmentId);

    @Query("SELECT MAX(sub.marksAwarded) FROM Submission sub WHERE sub.assignment.id = :assignmentId")
    BigDecimal findHighestMarksForAssignment(@Param("assignmentId") Long assignmentId);
}
