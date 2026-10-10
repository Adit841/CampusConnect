package com.campusconnect.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campusconnect.dto.CampusEventDto;
import com.campusconnect.dto.CampusEventSummaryDto;
import com.campusconnect.dto.ClubsLandingSummaryDto;
import com.campusconnect.dto.CreateEventRequest;
import com.campusconnect.dto.EventAttendeeDto;
import com.campusconnect.dto.EventRegistrationDto;
import com.campusconnect.dto.UpdateEventRequest;
import com.campusconnect.entity.EventCategory;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.CampusEventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class CampusEventController {

    private final CampusEventService eventService;
    private final UserRepository userRepo;

    public CampusEventController(CampusEventService eventService, UserRepository userRepo) {
        this.eventService = eventService;
        this.userRepo = userRepo;
    }

    private Long getUserId(Principal principal) {
        if (principal == null) return null;
        return userRepo.findByEmail(principal.getName()).map(u -> u.getId()).orElse(null);
    }

    @GetMapping("/landing")
    public ResponseEntity<ClubsLandingSummaryDto> getLandingSummary(Principal principal) {
        return ResponseEntity.ok(eventService.getLandingSummary(getUserId(principal)));
    }

    @GetMapping
    public ResponseEntity<Page<CampusEventSummaryDto>> listUpcoming(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Principal principal) {
        return ResponseEntity.ok(eventService.listUpcomingEvents(category, search, page, size, getUserId(principal)));
    }

    @GetMapping("/past")
    public ResponseEntity<Page<CampusEventSummaryDto>> listPast(
            @RequestParam(required = false) EventCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Principal principal) {
        return ResponseEntity.ok(eventService.listPastEvents(category, search, page, size, getUserId(principal)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CampusEventDto> getEvent(@PathVariable String slug, Principal principal) {
        return ResponseEntity.ok(eventService.getEventBySlug(slug, getUserId(principal)));
    }

    @PostMapping
    public ResponseEntity<CampusEventDto> createEvent(@Valid @RequestBody CreateEventRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(request, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CampusEventDto> updateEvent(@PathVariable Long id,
                                                     @Valid @RequestBody UpdateEventRequest request,
                                                     Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eventService.updateEvent(id, request, principal.getName()));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<EventRegistrationDto> registerForEvent(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eventService.registerForEvent(id, principal.getName()));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        eventService.cancelRegistration(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my/registrations")
    public ResponseEntity<List<EventRegistrationDto>> getMyRegistrations(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eventService.getMyRegistrations(principal.getName()));
    }

    @GetMapping("/{id}/attendees")
    public ResponseEntity<Page<EventAttendeeDto>> getEventAttendees(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(eventService.getEventAttendees(id, principal.getName(), page, size));
    }
}
