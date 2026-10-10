package com.campusconnect.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.ClubMemberRole;
import com.campusconnect.entity.ClubMembership;
import com.campusconnect.entity.MembershipStatus;

@Repository
public interface ClubMembershipRepository extends JpaRepository<ClubMembership, Long> {

    Optional<ClubMembership> findByClubIdAndUserId(Long clubId, Long userId);

    @Query("SELECT cm FROM ClubMembership cm JOIN FETCH cm.club WHERE cm.user.id = :userId ORDER BY cm.createdAt DESC")
    List<ClubMembership> findByUserIdWithClub(@Param("userId") Long userId);

    Page<ClubMembership> findByClubIdOrderByCreatedAtDesc(Long clubId, Pageable pageable);

    Page<ClubMembership> findByClubIdAndStatusOrderByCreatedAtDesc(Long clubId, MembershipStatus status, Pageable pageable);

    long countByClubIdAndStatus(Long clubId, MembershipStatus status);

    boolean existsByClubIdAndUserIdAndRoleIn(Long clubId, Long userId, Collection<ClubMemberRole> roles);

    boolean existsByClubIdAndUserIdAndStatus(Long clubId, Long userId, MembershipStatus status);

    void deleteByClubIdAndUserId(Long clubId, Long userId);
}
