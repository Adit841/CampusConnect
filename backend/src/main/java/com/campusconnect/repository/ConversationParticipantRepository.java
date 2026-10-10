package com.campusconnect.repository;

import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.ConversationParticipant;
import com.campusconnect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for {@link ConversationParticipant} join entities.
 */
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    /**
     * Checks whether a user is a member of a given conversation.
     * Used by the service layer to enforce authorization.
     */
    boolean existsByConversationAndUser(Conversation conversation, User user);

    /**
     * Finds a specific participant row.
     */
    Optional<ConversationParticipant> findByConversationAndUser(Conversation conversation, User user);

    /**
     * Retrieves all participant records for a conversation by conversation ID.
     */
    java.util.List<ConversationParticipant> findByConversationId(Long conversationId);

    /**
     * Retrieves all participant records for a conversation entity.
     */
    java.util.List<ConversationParticipant> findByConversation(Conversation conversation);
}
