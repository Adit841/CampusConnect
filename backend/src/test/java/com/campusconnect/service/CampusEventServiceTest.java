package com.campusconnect.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.CreateEventRequest;
import com.campusconnect.dto.EventRegistrationDto;
import com.campusconnect.entity.CampusEvent;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.entity.EventRegistration;
import com.campusconnect.entity.EventStatus;
import com.campusconnect.entity.RegistrationStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.repository.CampusEventRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class CampusEventServiceTest {

    @Mock
    private CampusEventRepository eventRepo;

    @Mock
    private ClubRepository clubRepo;

    @Mock
    private EventRegistrationRepository regRepo;

    @Mock
    private UserRepository userRepo;

    @Mock
    private ClubService clubService;

    private CampusEventService eventService;

    private User admin;
    private User student;
    private Club club;
    private CampusEvent event;

    @BeforeEach
    void setUp() {
        eventService = new CampusEventService(eventRepo, clubRepo, regRepo, userRepo, clubService);

        admin = new User("Admin", "admin@campusconnect.edu", "pass", Role.ADMIN);
        admin.setId(1L);

        student = new User("Student Bob", "bob@campusconnect.edu", "pass", Role.STUDENT);
        student.setId(2L);

        club = new Club("Arya Robotics Club", "arya-robotics-club", ClubCategory.TECHNICAL, "Robotics", "Bots");
        club.setId(10L);

        event = new CampusEvent();
        event.setId(100L);
        event.setTitle("Roboleague 2026");
        event.setSlug("roboleague-2026");
        event.setClub(club);
        event.setCategory(EventCategory.TECHNICAL);
        event.setDescription("Bot challenge");
        event.setVenue("Tech Lab B");
        event.setStartDateTime(LocalDateTime.now().plusDays(5));
        event.setEndDateTime(LocalDateTime.now().plusDays(5).plusHours(4));
        event.setRegistrationDeadline(LocalDateTime.now().plusDays(4));
        event.setCapacity(50);
        event.setRegisteredCount(10);
        event.setStatus(EventStatus.PUBLISHED);
        event.setOrganizer(admin);
    }

    @Test
    void createEvent_invalidDateRange_throwsBadRequest() {
        CreateEventRequest req = new CreateEventRequest(
                "Invalid Event", 10L, EventCategory.TECHNICAL, "Desc", "Venue",
                false, null,
                LocalDateTime.now().plusDays(5),
                LocalDateTime.now().plusDays(4), // end before start!
                null, 100, false, null
        );

        when(userRepo.findByEmail("admin@campusconnect.edu")).thenReturn(Optional.of(admin));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                eventService.createEvent(req, "admin@campusconnect.edu"));
        assertTrue(ex.getMessage().contains("end time cannot be before start time"));
    }

    @Test
    void createEvent_unauthorizedStudent_throwsAccessDenied() {
        CreateEventRequest req = new CreateEventRequest(
                "Student Created Event", 10L, EventCategory.TECHNICAL, "Desc", "Venue",
                false, null,
                LocalDateTime.now().plusDays(2),
                LocalDateTime.now().plusDays(3),
                null, 100, false, null
        );

        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(clubRepo.findById(10L)).thenReturn(Optional.of(club));
        when(clubService.isUserClubCoordinator(club, student)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () ->
                eventService.createEvent(req, "bob@campusconnect.edu"));
    }

    @Test
    void registerForEvent_success() {
        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findByIdForUpdate(100L)).thenReturn(Optional.of(event));
        when(regRepo.findByEventIdAndUserId(100L, 2L)).thenReturn(Optional.empty());

        EventRegistrationDto dto = eventService.registerForEvent(100L, "bob@campusconnect.edu");

        assertNotNull(dto);
        assertEquals(RegistrationStatus.REGISTERED, dto.status());
        assertEquals(11, event.getRegisteredCount());
        verify(regRepo).save(any(EventRegistration.class));
        verify(eventRepo).save(event);
    }

    @Test
    void registerForEvent_capacityExceeded_throwsBadRequest() {
        event.setCapacity(10);
        event.setRegisteredCount(10); // Full!

        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findByIdForUpdate(100L)).thenReturn(Optional.of(event));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                eventService.registerForEvent(100L, "bob@campusconnect.edu"));
        assertTrue(ex.getMessage().contains("Event is full"));
    }

    @Test
    void registerForEvent_deadlinePassed_throwsBadRequest() {
        event.setRegistrationDeadline(LocalDateTime.now().minusHours(1)); // passed!

        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findByIdForUpdate(100L)).thenReturn(Optional.of(event));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                eventService.registerForEvent(100L, "bob@campusconnect.edu"));
        assertTrue(ex.getMessage().contains("registration deadline for this event has passed"));
    }

    @Test
    void registerForEvent_duplicateRegistration_throwsBadRequest() {
        EventRegistration existing = new EventRegistration(event, student);
        existing.setStatus(RegistrationStatus.REGISTERED);

        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findByIdForUpdate(100L)).thenReturn(Optional.of(event));
        when(regRepo.findByEventIdAndUserId(100L, 2L)).thenReturn(Optional.of(existing));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                eventService.registerForEvent(100L, "bob@campusconnect.edu"));
        assertTrue(ex.getMessage().contains("already registered for this event"));
    }

    @Test
    void cancelRegistration_decrementsCount() {
        EventRegistration existing = new EventRegistration(event, student);
        existing.setStatus(RegistrationStatus.REGISTERED);

        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findByIdForUpdate(100L)).thenReturn(Optional.of(event));
        when(regRepo.findByEventIdAndUserId(100L, 2L)).thenReturn(Optional.of(existing));

        eventService.cancelRegistration(100L, "bob@campusconnect.edu");

        assertEquals(RegistrationStatus.CANCELLED, existing.getStatus());
        assertEquals(9, event.getRegisteredCount());
        verify(regRepo).save(existing);
        verify(eventRepo).save(event);
    }

    @Test
    void getEventAttendees_unauthorizedUser_throwsAccessDenied() {
        when(userRepo.findByEmail("bob@campusconnect.edu")).thenReturn(Optional.of(student));
        when(eventRepo.findById(100L)).thenReturn(Optional.of(event));
        when(clubService.isUserClubCoordinator(club, student)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () ->
                eventService.getEventAttendees(100L, "bob@campusconnect.edu", 0, 10));
    }
}
