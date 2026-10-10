package com.campusconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByRoleOrderByNameAsc(Role role);

    boolean existsByEmail(String email);

    /**
     * Searches for users whose name or email contains the given query string
     * (case-insensitive), excluding the caller to prevent self-conversations.
     * Results are capped at 20 rows for performance.
     */
    @Query("""
            SELECT u FROM User u
            WHERE u.id <> :excludeId
              AND (LOWER(u.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY u.name ASC
            """)
    List<User> searchByNameOrEmail(@Param("q") String query, @Param("excludeId") Long excludeId);
}
