package com.campusconnect.service;

import com.campusconnect.dto.ConversationSummaryDto;
import com.campusconnect.dto.CreateConversationRequest;
import com.campusconnect.entity.Conversation;
import com.campusconnect.entity.ConversationParticipant;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.ConversationParticipantRepository;
import com.campusconnect.repository.ConversationRepository;
import com.campusconnect.repository.MessageRepository;
import com.campusconnect.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConversationServiceTest {

    @Mock
    private ConversationRepository conversationRepo;

    @Mock
    private ConversationParticipantRepository participantRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private MessageRepository messageRepo;

    @InjectMocks
    private ConversationService conversationService;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = new User("Alice Smith", "alice@test.com", "pass123", Role.STUDENT);
        user1.setId(1L);

        user2 = new User("Bob Jones", "bob@test.com", "pass123", Role.STUDENT);
        user2.setId(2L);
    }

    @Test
    void findOrCreate_whenNew_returnsOtherParticipantIdentity() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(user1));
        when(userRepo.findById(2L)).thenReturn(Optional.of(user2));
        when(conversationRepo.findOneToOne(1L, 2L)).thenReturn(Optional.empty());

        when(conversationRepo.save(any(Conversation.class))).thenAnswer(invocation -> {
            Conversation c = invocation.getArgument(0);
            return c;
        });
        when(participantRepo.save(any(ConversationParticipant.class))).thenAnswer(inv -> inv.getArgument(0));
        when(messageRepo.findByConversationId(any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        ConversationSummaryDto summary = conversationService.findOrCreate("alice@test.com", new CreateConversationRequest(2L));

        assertThat(summary).isNotNull();
        // Crucial bug fix verification: must identify Bob (id 2), NOT Alice (id 1)
        assertThat(summary.otherParticipantId()).isEqualTo(2L);
        assertThat(summary.otherParticipantDisplayName()).isEqualTo("Bob Jones");
        assertThat(summary.otherParticipantUsername()).isEqualTo("bob@test.com");
    }

    @Test
    void listForUser_returnsOtherParticipantEvenIfUninitializedCollection() {
        when(userRepo.findByEmail("alice@test.com")).thenReturn(Optional.of(user1));

        Conversation conv = new Conversation();
        // Simulate empty in-memory collection
        when(conversationRepo.findByParticipantUserId(1L)).thenReturn(List.of(conv));

        ConversationParticipant p1 = new ConversationParticipant(conv, user1);
        ConversationParticipant p2 = new ConversationParticipant(conv, user2);
        when(participantRepo.findByConversationId(conv.getId())).thenReturn(List.of(p1, p2));
        when(messageRepo.findByConversationId(any(), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        List<ConversationSummaryDto> list = conversationService.listForUser("alice@test.com");

        assertThat(list).hasSize(1);
        ConversationSummaryDto summary = list.get(0);
        assertThat(summary.otherParticipantId()).isEqualTo(2L);
        assertThat(summary.otherParticipantDisplayName()).isEqualTo("Bob Jones");
        assertThat(summary.otherParticipantUsername()).isEqualTo("bob@test.com");
    }
}
