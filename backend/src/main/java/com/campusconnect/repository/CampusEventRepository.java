package com.campusconnect.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.CampusEvent;
import com.campusconnect.entity.EventCategory;

import jakarta.persistence.LockModeType;

@Repository
public interface CampusEventRepository extends JpaRepository<CampusEvent, Long> {

    Optional<CampusEvent> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT e FROM CampusEvent e LEFT JOIN FETCH e.club WHERE e.status = 'PUBLISHED' " +
           "AND e.endDateTime >= :now " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(e.venue) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.startDateTime ASC, e.id ASC")
    Page<CampusEvent> findUpcomingEvents(@Param("now") LocalDateTime now,
                                         @Param("category") EventCategory category,
                                         @Param("search") String search,
                                         Pageable pageable);

    @Query("SELECT e FROM CampusEvent e LEFT JOIN FETCH e.club WHERE " +
           "(e.status = 'COMPLETED' OR (e.status = 'PUBLISHED' AND e.endDateTime < :now)) " +
           "AND (:category IS NULL OR e.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(e.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(e.venue) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.startDateTime DESC, e.id DESC")
    Page<CampusEvent> findPastEvents(@Param("now") LocalDateTime now,
                                     @Param("category") EventCategory category,
                                     @Param("search") String search,
                                     Pageable pageable);

    @Query("SELECT e FROM CampusEvent e LEFT JOIN FETCH e.club WHERE e.status = 'PUBLISHED' " +
           "AND e.featured = true AND e.endDateTime >= :now " +
           "ORDER BY e.startDateTime ASC, e.id ASC")
    List<CampusEvent> findFeaturedUpcoming(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT e FROM CampusEvent e LEFT JOIN FETCH e.club WHERE e.status = 'PUBLISHED' " +
           "AND e.startDateTime >= :start AND e.startDateTime <= :end " +
           "ORDER BY e.startDateTime ASC, e.id ASC")
    List<CampusEvent> findUpcomingInDateRange(@Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT e FROM CampusEvent e WHERE e.club.id = :clubId AND e.status = 'PUBLISHED' " +
           "AND e.endDateTime >= :now ORDER BY e.startDateTime ASC")
    List<CampusEvent> findUpcomingByClubId(@Param("clubId") Long clubId, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM CampusEvent e LEFT JOIN FETCH e.club WHERE " +
           "(:clubId IS NULL OR e.club.id = :clubId) " +
           "ORDER BY e.startDateTime DESC")
    Page<CampusEvent> findAllForOrganizer(@Param("clubId") Long clubId, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM CampusEvent e WHERE e.id = :id")
    Optional<CampusEvent> findByIdForUpdate(@Param("id") Long id);
}
