package com.campusconnect.repository;

import com.campusconnect.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository for {@link Message} entities.
 */
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Returns a page of messages for the given conversation, ordered by sent_at ascending.
     * The default page size is defined by the caller; controllers use 50 messages per page.
     */
    @Query("""
            SELECT m FROM Message m
            WHERE m.conversation.id = :conversationId
            ORDER BY m.sentAt ASC
            """)
    Page<Message> findByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);

    /**
     * Looks up a message by its client-generated deduplication ID.
     * If found, the service returns the existing persisted message instead of creating a duplicate.
     */
    Optional<Message> findByClientMsgId(String clientMsgId);
}
