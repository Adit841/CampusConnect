package com.campusconnect.security;

import com.campusconnect.entity.Conversation;
import com.campusconnect.service.ConversationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatSubscriptionInterceptorTest {

    @Mock
    private ConversationService conversationService;

    @Mock
    private MessageChannel channel;

    private ChatSubscriptionInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new ChatSubscriptionInterceptor(conversationService);
    }

    private Message<?> createStompMessage(StompCommand command, String destination, Principal principal) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
        if (destination != null) {
            accessor.setDestination(destination);
        }
        if (principal != null) {
            accessor.setUser(principal);
        }
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    @Test
    void subscribe_allowedForParticipant() {
        Principal principal = () -> "alice@test.com";
        Message<?> message = createStompMessage(StompCommand.SUBSCRIBE, "/topic/conversations/42", principal);
        when(conversationService.requireMembership(42L, "alice@test.com")).thenReturn(new Conversation());

        Message<?> result = interceptor.preSend(message, channel);

        assertThat(result).isNotNull();
        verify(conversationService).requireMembership(42L, "alice@test.com");
    }

    @Test
    void subscribe_deniedForNonParticipant() {
        Principal principal = () -> "eve@test.com";
        Message<?> message = createStompMessage(StompCommand.SUBSCRIBE, "/topic/conversations/42", principal);
        when(conversationService.requireMembership(42L, "eve@test.com"))
                .thenThrow(new AccessDeniedException("Access denied: user is not a participant"));

        assertThatThrownBy(() -> interceptor.preSend(message, channel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not a participant");

        verify(conversationService).requireMembership(42L, "eve@test.com");
    }

    @Test
    void subscribe_deniedWhenUnauthenticated() {
        Message<?> message = createStompMessage(StompCommand.SUBSCRIBE, "/topic/conversations/42", null);

        assertThatThrownBy(() -> interceptor.preSend(message, channel))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Unauthenticated user");

        verifyNoInteractions(conversationService);
    }

    @Test
    void subscribe_allowedForOtherTopics() {
        Principal principal = () -> "alice@test.com";
        Message<?> message = createStompMessage(StompCommand.SUBSCRIBE, "/topic/announcements", principal);

        Message<?> result = interceptor.preSend(message, channel);

        assertThat(result).isNotNull();
        verifyNoInteractions(conversationService);
    }

    @Test
    void subscribe_throwsWhenDestinationInvalidFormat() {
        Principal principal = () -> "alice@test.com";
        Message<?> message = createStompMessage(StompCommand.SUBSCRIBE, "/topic/conversations/invalid-id", principal);

        assertThatThrownBy(() -> interceptor.preSend(message, channel))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid conversation topic destination");

        verifyNoInteractions(conversationService);
    }

    @Test
    void nonSubscribeCommands_ignoredByInterceptor() {
        Principal principal = () -> "alice@test.com";
        Message<?> message = createStompMessage(StompCommand.SEND, "/topic/conversations/42", principal);

        Message<?> result = interceptor.preSend(message, channel);

        assertThat(result).isNotNull();
        verifyNoInteractions(conversationService);
    }
}
