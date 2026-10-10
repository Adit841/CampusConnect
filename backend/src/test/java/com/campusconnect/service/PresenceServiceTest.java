package com.campusconnect.service;

import com.campusconnect.dto.PresenceEventDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PresenceServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private PresenceService presenceService;

    @BeforeEach
    void setUp() {
        presenceService = new PresenceService(messagingTemplate);
    }

    @Test
    void registerSession_marksUserOnlineAndBroadcastsEvent() {
        presenceService.registerSession("alice@test.com", 1L, "sess-1");

        assertThat(presenceService.isOnline(1L)).isTrue();
        assertThat(presenceService.isOnline("alice@test.com")).isTrue();
        assertThat(presenceService.getStatus(1L)).isEqualTo("ONLINE");

        ArgumentCaptor<PresenceEventDto> captor = ArgumentCaptor.forClass(PresenceEventDto.class);
        verify(messagingTemplate).convertAndSend(eq("/topic/presence"), captor.capture());

        PresenceEventDto event = captor.getValue();
        assertThat(event.userId()).isEqualTo(1L);
        assertThat(event.email()).isEqualTo("alice@test.com");
        assertThat(event.status()).isEqualTo("ONLINE");
    }

    @Test
    void multiSession_remainsOnlineUntilLastSessionCloses() {
        presenceService.registerSession("alice@test.com", 1L, "sess-tab-1");
        presenceService.registerSession("alice@test.com", 1L, "sess-tab-2");

        // Broadcasted only once when transitioning from offline to online
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/presence"), any(PresenceEventDto.class));

        // Close first tab
        presenceService.unregisterSession("sess-tab-1");
        assertThat(presenceService.isOnline(1L)).isTrue();
        assertThat(presenceService.getStatus(1L)).isEqualTo("ONLINE");

        // Still 1 broadcast
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/presence"), any(PresenceEventDto.class));

        // Close second tab
        presenceService.unregisterSession("sess-tab-2");
        assertThat(presenceService.isOnline(1L)).isFalse();
        assertThat(presenceService.getStatus(1L)).isEqualTo("OFFLINE");

        // Now broadcasted OFFLINE event
        verify(messagingTemplate, times(2)).convertAndSend(eq("/topic/presence"), any(PresenceEventDto.class));
    }

    @Test
    void getBatchStatus_returnsCorrectStatusForEachUser() {
        presenceService.registerSession("bob@test.com", 2L, "sess-bob");

        Map<Long, String> result = presenceService.getBatchStatus(List.of(1L, 2L, 999L));
        assertThat(result.get(1L)).isEqualTo("OFFLINE");
        assertThat(result.get(2L)).isEqualTo("ONLINE");
        assertThat(result.get(999L)).isEqualTo("OFFLINE");
    }

    @Test
    void unknownUser_returnsUnknown() {
        assertThat(presenceService.getStatus(null)).isEqualTo("UNKNOWN");
    }
}
