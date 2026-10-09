package com.campusconnect.repository;

import com.campusconnect.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for {@link Conversation} entities.
 */
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Returns all conversations in which the given user is a participant,
     * ordered by the latest message timestamp descending (nulls last for empty conversations).
     */
    @Query("""
            SELECT DISTINCT c FROM Conversation c
            JOIN c.participants p
            WHERE p.user.id = :userId
            ORDER BY c.createdAt DESC
            """)
    List<Conversation> findByParticipantUserId(@Param("userId") Long userId);

    /**
     * Finds an existing one-to-one conversation between exactly two users.
     * Used by the service layer to prevent duplicate conversations.
     */
    @Query("""
            SELECT c FROM Conversation c
            WHERE (
                SELECT COUNT(p) FROM ConversationParticipant p WHERE p.conversation = c
            ) = 2
            AND EXISTS (
                SELECT p1 FROM ConversationParticipant p1
                WHERE p1.conversation = c AND p1.user.id = :userId1
            )
            AND EXISTS (
                SELECT p2 FROM ConversationParticipant p2
                WHERE p2.conversation = c AND p2.user.id = :userId2
            )
            """)
    Optional<Conversation> findOneToOne(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
