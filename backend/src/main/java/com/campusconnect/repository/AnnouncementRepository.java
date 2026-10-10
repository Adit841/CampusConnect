package com.campusconnect.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Announcement;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findAllByOrderByPinnedDescCreatedAtDesc();

    @Query("""
            SELECT a FROM Announcement a
            WHERE (:category IS NULL OR :category = '' OR UPPER(a.category) = UPPER(:category))
              AND (:search IS NULL OR :search = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY a.pinned DESC, a.createdAt DESC
            """)
    List<Announcement> searchForAdmin(
            @Param("category") String category,
            @Param("search") String search
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE (UPPER(a.audience) IN ('ALL', 'EVERYONE', 'STUDENTS', 'ALL STUDENTS')
                   OR (:department IS NOT NULL AND :department <> '' AND (LOWER(a.department) = LOWER(:department) OR LOWER(a.audience) = LOWER(:department))))
              AND UPPER(a.audience) NOT IN ('TEACHER', 'TEACHERS', 'FACULTY')
              AND (:category IS NULL OR :category = '' OR UPPER(a.category) = UPPER(:category))
              AND (:search IS NULL OR :search = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY a.pinned DESC, a.createdAt DESC
            """)
    List<Announcement> searchForStudent(
            @Param("department") String department,
            @Param("category") String category,
            @Param("search") String search
    );

    @Query("""
            SELECT a FROM Announcement a
            WHERE (a.author.id = :teacherId
                   OR UPPER(a.audience) IN ('ALL', 'EVERYONE', 'TEACHERS', 'FACULTY', 'STUDENTS', 'ALL STUDENTS')
                   OR (:department IS NOT NULL AND :department <> '' AND (LOWER(a.department) = LOWER(:department) OR LOWER(a.audience) = LOWER(:department))))
              AND (:category IS NULL OR :category = '' OR UPPER(a.category) = UPPER(:category))
              AND (:search IS NULL OR :search = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY a.pinned DESC, a.createdAt DESC
            """)
    List<Announcement> searchForTeacher(
            @Param("teacherId") Long teacherId,
            @Param("department") String department,
            @Param("category") String category,
            @Param("search") String search
    );

    List<Announcement> findByAuthorIdOrderByCreatedAtDesc(Long authorId);
}
