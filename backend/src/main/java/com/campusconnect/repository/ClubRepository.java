package com.campusconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    Optional<Club> findBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Club c WHERE c.active = true " +
           "AND (:category IS NULL OR c.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.tagline) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Club> findFilteredClubs(@Param("category") ClubCategory category,
                                @Param("search") String search,
                                Pageable pageable);

    @Query("SELECT c FROM Club c WHERE " +
           "(:category IS NULL OR c.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Club> findAllForAdmin(@Param("category") ClubCategory category,
                              @Param("search") String search,
                              Pageable pageable);

    List<Club> findTop6ByActiveTrueOrderByMemberCountDesc();
}
