package com.campusconnect.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.RegistrationStatus;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    Optional<EventRegistration> findByEventIdAndUserId(Long eventId, Long userId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event e LEFT JOIN FETCH e.club " +
           "WHERE er.user.id = :userId AND er.status = :status ORDER BY er.registeredAt DESC")
    List<EventRegistration> findByUserIdAndStatusWithEvent(@Param("userId") Long userId,
                                                           @Param("status") RegistrationStatus status);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event e LEFT JOIN FETCH e.club " +
           "WHERE er.user.id = :userId ORDER BY er.registeredAt DESC")
    List<EventRegistration> findAllByUserIdWithEvent(@Param("userId") Long userId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.user " +
           "WHERE er.event.id = :eventId AND er.status = :status ORDER BY er.registeredAt ASC")
    Page<EventRegistration> findByEventIdAndStatusWithUser(@Param("eventId") Long eventId,
                                                           @Param("status") RegistrationStatus status,
                                                           Pageable pageable);

    long countByEventIdAndStatus(Long eventId, RegistrationStatus status);

    boolean existsByEventIdAndUserIdAndStatus(Long eventId, Long userId, RegistrationStatus status);
}
