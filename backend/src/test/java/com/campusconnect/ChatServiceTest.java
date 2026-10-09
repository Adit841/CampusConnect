package com.campusconnect;

import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.ConversationParticipant;
import com.campusconnect.entity.Message;
import com.campusconnect.entity.User;
import com.campusconnect.dto.ConversationSummaryDto;
import com.campusconnect.dto.CreateConversationRequest;
import com.campusconnect.dto.MessageDto;
import com.campusconnect.dto.SendMessageRequest;
import com.campusconnect.repository.ConversationParticipantRepository;
import com.campusconnect.repository.ConversationRepository;
import com.campusconnect.repository.MessageRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.ConversationService;
import com.campusconnect.service.MessageService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the chat module's service layer.
 *
 * These tests use Mockito and do NOT require a running database or application context.
 * They test business logic, authorization enforcement, and deduplication in isolation.
 */
@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    // ── Repositories (mocked) ─────────────────────────────────────────────────
    @Mock ConversationRepository conversationRepo;
    @Mock ConversationParticipantRepository participantRepo;
    @Mock UserRepository userRepo;
    @Mock MessageRepository messageRepo;

    // ── Services under test ───────────────────────────────────────────────────
    ConversationService conversationService;
    MessageService messageService;

    // ── Test fixtures ─────────────────────────────────────────────────────────
    User alice;
    User bob;
    Conversation conv;

    @BeforeEach
    void setUp() {
        conversationService = new ConversationService(
                conversationRepo, participantRepo, userRepo, messageRepo);
        messageService = new MessageService(messageRepo, conversationService);

        alice = new User("Alice Smith", "alice@test.com", "password", com.campusconnect.entity.Role.STUDENT);
        alice.setId(1L);

        bob = new User("Bob Jones", "bob@test.com", "password", com.campusconnect.entity.Role.STUDENT);
        bob.setId(2L);

        conv = new Conversation();
        setId(conv, 10L);
    }

    // =========================================================================
    // ConversationService tests
    // =========================================================================

    @Test
    void requireUser_throwsWhenNotFound() {
        when(userRepo.findByEmail("ghost@test.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> conversationService.requireUser("ghost@test.com"))
                .isInstanceOf(com.campusconnect.exception.ResourceNotFoundException.class)
                .hasMessageContaining("ghost@test.com");
    }

    @Test
    void findOrCreate_throwsWhenSelfMessaging() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(userRepo.findById(1L)).thenReturn(Optional.of(alice));

        CreateConversationRequest req = new CreateConversationRequest(1L);
        assertThatThrownBy(() -> conversationService.findOrCreate("alice@test.com", req))
                .isInstanceOf(com.campusconnect.exception.BadRequestException.class)
                .hasMessageContaining("yourself");
    }

    @Test
    void findOrCreate_throwsWhenTargetNotFound() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(userRepo.findById(99L)).thenReturn(Optional.empty());

        CreateConversationRequest req = new CreateConversationRequest(99L);
        assertThatThrownBy(() -> conversationService.findOrCreate("alice@test.com", req))
                .isInstanceOf(com.campusconnect.exception.ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void requireMembership_throwsWhenUserNotParticipant() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(conversationRepo.findById(10L)).thenReturn(Optional.of(conv));
        when(participantRepo.existsByConversationAndUser(conv, alice)).thenReturn(false);

        assertThatThrownBy(() -> conversationService.requireMembership(10L, "alice@test.com"))
                .isInstanceOf(org.springframework.security.access.AccessDeniedException.class)
                .hasMessageContaining("not a participant");
    }

    @Test
    void requireMembership_succeedsWhenUserIsParticipant() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(conversationRepo.findById(10L)).thenReturn(Optional.of(conv));
        when(participantRepo.existsByConversationAndUser(conv, alice)).thenReturn(true);

        Conversation result = conversationService.requireMembership(10L, "alice@test.com");
        assertThat(result).isSameAs(conv);
    }

    @Test
    void requireMembership_throwsWhenConversationNotFound() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(conversationRepo.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> conversationService.requireMembership(999L, "alice@test.com"))
                .isInstanceOf(com.campusconnect.exception.ResourceNotFoundException.class)
                .hasMessageContaining("Conversation not found");
    }

    @Test
    void listForUser_ordersByLatestMessageDescending() {
        Conversation convOld = new Conversation();
        setId(convOld, 1L);
        convOld.getParticipants().add(new ConversationParticipant(convOld, alice));
        convOld.getParticipants().add(new ConversationParticipant(convOld, bob));

        Conversation convNew = new Conversation();
        setId(convNew, 2L);
        convNew.getParticipants().add(new ConversationParticipant(convNew, alice));
        convNew.getParticipants().add(new ConversationParticipant(convNew, bob));

        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(conversationRepo.findByParticipantUserId(1L)).thenReturn(List.of(convOld, convNew));

        // convOld has a recent message (now)
        Message msgRecent = new Message(convOld, bob, "Recent message", UUID.randomUUID().toString());
        setId(msgRecent, 101L);
        Page<Message> recentPage = new PageImpl<>(List.of(msgRecent));
        when(messageRepo.findByConversationId(eq(1L), any())).thenReturn(recentPage);

        // convNew has an older message (1 hour ago)
        Message msgOlder = new Message(convNew, bob, "Older message", UUID.randomUUID().toString());
        setId(msgOlder, 102L);
        try {
            var sentAtField = Message.class.getDeclaredField("sentAt");
            sentAtField.setAccessible(true);
            sentAtField.set(msgOlder, Instant.now().minusSeconds(3600));
            sentAtField.set(msgRecent, Instant.now());
        } catch (Exception ignored) {}
        Page<Message> olderPage = new PageImpl<>(List.of(msgOlder));
        when(messageRepo.findByConversationId(eq(2L), any())).thenReturn(olderPage);

        List<ConversationSummaryDto> result = conversationService.listForUser("alice@test.com");

        assertThat(result).hasSize(2);
        // convOld should be first because its message is newer
        assertThat(result.get(0).id()).isEqualTo(1L);
        assertThat(result.get(1).id()).isEqualTo(2L);
    }

    // =========================================================================
    // MessageService tests
    // =========================================================================

    @Test
    void send_persistsNewMessage() {
        String msgId = UUID.randomUUID().toString();
        SendMessageRequest req = new SendMessageRequest("Hello Bob", msgId);
        Message saved = new Message(conv, alice, "Hello Bob", msgId);
        setId(saved, 100L);

        when(messageRepo.findByClientMsgId(msgId)).thenReturn(Optional.empty());
        when(messageRepo.save(any(Message.class))).thenReturn(saved);

        MessageDto dto = messageService.send(conv, alice, req);

        assertThat(dto.content()).isEqualTo("Hello Bob");
        assertThat(dto.clientMsgId()).isEqualTo(msgId);
        verify(messageRepo).save(any(Message.class));
    }

    @Test
    void send_deduplicatesWhenClientMsgIdAlreadyExists() {
        String msgId = UUID.randomUUID().toString();
        SendMessageRequest req = new SendMessageRequest("Hello again", msgId);
        Message existing = new Message(conv, alice, "Hello Bob", msgId); // original content
        setId(existing, 100L);

        when(messageRepo.findByClientMsgId(msgId)).thenReturn(Optional.of(existing));

        MessageDto dto = messageService.send(conv, alice, req);

        // Must return existing, not save again
        assertThat(dto.id()).isEqualTo(100L);
        assertThat(dto.content()).isEqualTo("Hello Bob"); // original, not the retry content
        verify(messageRepo, never()).save(any());
    }

    @Test
    void send_stripsWhitespaceFromContent() {
        String msgId = UUID.randomUUID().toString();
        SendMessageRequest req = new SendMessageRequest("  trimmed  ", msgId);
        Message saved = new Message(conv, alice, "trimmed", msgId);
        setId(saved, 101L);

        when(messageRepo.findByClientMsgId(msgId)).thenReturn(Optional.empty());
        when(messageRepo.save(any(Message.class))).thenAnswer(inv -> {
            Message m = inv.getArgument(0);
            // Verify content was stripped before save
            assertThat(m.getContent()).isEqualTo("trimmed");
            setId(m, 101L);
            return m;
        });

        MessageDto dto = messageService.send(conv, alice, req);
        assertThat(dto.content()).isEqualTo("trimmed");
    }

    @Test
    void getHistory_returnsPaginatedMessages() {
        Message m1 = new Message(conv, alice, "Hi", UUID.randomUUID().toString());
        setId(m1, 1L);
        Message m2 = new Message(conv, bob, "Hey", UUID.randomUUID().toString());
        setId(m2, 2L);

        Page<Message> page = new PageImpl<>(List.of(m1, m2));
        when(messageRepo.findByConversationId(eq(10L), any(Pageable.class))).thenReturn(page);

        Page<MessageDto> result = messageService.getHistory(conv, 0);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).senderUsername()).isEqualTo("alice@test.com");
        assertThat(result.getContent().get(1).senderUsername()).isEqualTo("bob@test.com");
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /** Reflectively set the id field (avoids needing setters on entities). */
    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
