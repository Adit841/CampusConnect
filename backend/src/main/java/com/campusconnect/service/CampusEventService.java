package com.campusconnect.service;

import java.text.Normalizer;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.CampusEventDto;
import com.campusconnect.dto.CampusEventSummaryDto;
import com.campusconnect.dto.ClubsLandingSummaryDto;
import com.campusconnect.dto.ClubSummaryDto;
import com.campusconnect.dto.CreateEventRequest;
import com.campusconnect.dto.EventAttendeeDto;
import com.campusconnect.dto.EventRegistrationDto;
import com.campusconnect.dto.UpdateEventRequest;
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
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.CampusEventRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.UserRepository;

@Service
@Transactional
public class CampusEventService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final CampusEventRepository eventRepo;
    private final ClubRepository clubRepo;
    private final EventRegistrationRepository regRepo;
    private final UserRepository userRepo;
    private final ClubService clubService;

    public CampusEventService(CampusEventRepository eventRepo,
                              ClubRepository clubRepo,
                              EventRegistrationRepository regRepo,
                              UserRepository userRepo,
                              ClubService clubService) {
        this.eventRepo = eventRepo;
        this.clubRepo = clubRepo;
        this.regRepo = regRepo;
        this.userRepo = userRepo;
        this.clubService = clubService;
    }

    public static String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }

    @Transactional(readOnly = true)
    public ClubsLandingSummaryDto getLandingSummary(Long currentUserId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                .withHour(23).withMinute(59).withSecond(59);

        List<CampusEvent> featuredList = eventRepo.findFeaturedUpcoming(now, PageRequest.of(0, 4));
        List<CampusEvent> thisWeekList = eventRepo.findUpcomingInDateRange(now, endOfWeek);

        Map<Long, EventRegistration> userRegs = Map.of();
        if (currentUserId != null) {
            List<EventRegistration> regs = regRepo.findAllByUserIdWithEvent(currentUserId);
            userRegs = regs.stream().collect(Collectors.toMap(r -> r.getEvent().getId(), r -> r, (a, b) -> a));
        }

        final Map<Long, EventRegistration> regMap = userRegs;

        List<CampusEventSummaryDto> featuredDtos = featuredList.stream()
                .map(e -> toSummaryDto(e, regMap.get(e.getId())))
                .toList();

        List<CampusEventSummaryDto> thisWeekDtos = thisWeekList.stream()
                .map(e -> toSummaryDto(e, regMap.get(e.getId())))
                .toList();

        List<Club> popularClubs = clubRepo.findTop6ByActiveTrueOrderByMemberCountDesc();
        List<ClubSummaryDto> popularClubDtos = popularClubs.stream().map(c -> new ClubSummaryDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getCategory(),
                c.getTagline(),
                c.getLogoUrl(),
                c.isActive(),
                c.isSampleData(),
                c.getMemberCount(),
                null,
                null,
                null,
                null
        )).toList();

        Map<String, Long> categoryEventCounts = new HashMap<>();
        for (EventCategory cat : EventCategory.values()) {
            categoryEventCounts.put(cat.name(), 0L);
        }
        long totalUpcoming = 0;
        for (Object[] row : eventRepo.countUpcomingByCategory(now)) {
            long count = (Long) row[1];
            totalUpcoming += count;
            if (row[0] != null) {
                categoryEventCounts.put(((EventCategory) row[0]).name(), count);
            }
        }

        Map<String, Long> categoryClubCounts = new HashMap<>();
        for (ClubCategory cat : ClubCategory.values()) {
            categoryClubCounts.put(cat.name(), 0L);
        }
        for (Object[] row : clubRepo.countActiveByCategory()) {
            if (row[0] != null) {
                categoryClubCounts.put(((ClubCategory) row[0]).name(), (Long) row[1]);
            }
        }

        long totalClubs = clubRepo.count();

        return new ClubsLandingSummaryDto(
                featuredDtos,
                thisWeekDtos,
                popularClubDtos,
                categoryEventCounts,
                categoryClubCounts,
                totalClubs,
                totalUpcoming
        );
    }

    @Transactional(readOnly = true)
    public Page<CampusEventSummaryDto> listUpcomingEvents(EventCategory category, String search, int page, int size, Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CampusEvent> eventsPage = eventRepo.findUpcomingEvents(LocalDateTime.now(), category, search, pageable);

        Map<Long, EventRegistration> userRegs = Map.of();
        if (currentUserId != null && !eventsPage.isEmpty()) {
            List<EventRegistration> regs = regRepo.findAllByUserIdWithEvent(currentUserId);
            userRegs = regs.stream().collect(Collectors.toMap(r -> r.getEvent().getId(), r -> r, (a, b) -> a));
        }

        final Map<Long, EventRegistration> regMap = userRegs;
        return eventsPage.map(e -> toSummaryDto(e, regMap.get(e.getId())));
    }

    @Transactional(readOnly = true)
    public Page<CampusEventSummaryDto> listPastEvents(EventCategory category, String search, int page, int size, Long currentUserId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CampusEvent> eventsPage = eventRepo.findPastEvents(LocalDateTime.now(), category, search, pageable);

        Map<Long, EventRegistration> userRegs = Map.of();
        if (currentUserId != null && !eventsPage.isEmpty()) {
            List<EventRegistration> regs = regRepo.findAllByUserIdWithEvent(currentUserId);
            userRegs = regs.stream().collect(Collectors.toMap(r -> r.getEvent().getId(), r -> r, (a, b) -> a));
        }

        final Map<Long, EventRegistration> regMap = userRegs;
        return eventsPage.map(e -> toSummaryDto(e, regMap.get(e.getId())));
    }

    @Transactional(readOnly = true)
    public CampusEventDto getEventBySlug(String slug, Long currentUserId) {
        CampusEvent event = eventRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with slug: " + slug));

        boolean registered = false;
        String regStatus = null;
        LocalDateTime regAt = null;

        if (currentUserId != null) {
            Optional<EventRegistration> reg = regRepo.findByEventIdAndUserId(event.getId(), currentUserId);
            if (reg.isPresent() && reg.get().getStatus() == RegistrationStatus.REGISTERED) {
                registered = true;
                regStatus = reg.get().getStatus().name();
                regAt = reg.get().getRegisteredAt();
            } else if (reg.isPresent()) {
                regStatus = reg.get().getStatus().name();
            }
        }

        Integer remaining = event.getCapacity() != null ? Math.max(0, event.getCapacity() - event.getRegisteredCount()) : null;

        return new CampusEventDto(
                event.getId(),
                event.getTitle(),
                event.getSlug(),
                event.getClub() != null ? event.getClub().getId() : null,
                event.getClub() != null ? event.getClub().getName() : null,
                event.getClub() != null ? event.getClub().getSlug() : null,
                event.getCategory(),
                event.getDescription(),
                event.getVenue(),
                event.isOnline(),
                event.getMeetingLink(),
                event.getStartDateTime(),
                event.getEndDateTime(),
                event.getRegistrationDeadline(),
                event.getCapacity(),
                event.getRegisteredCount(),
                remaining,
                event.getStatus(),
                event.isFeatured(),
                event.getImageUrl(),
                event.isSampleData(),
                event.getOrganizer().getId(),
                event.getOrganizer().getName(),
                registered,
                regStatus,
                regAt,
                event.getCreatedAt()
        );
    }

    public CampusEventDto createEvent(CreateEventRequest req, String userEmail) {
        User organizer = getUserByEmail(userEmail);

        if (req.endDateTime().isBefore(req.startDateTime())) {
            throw new BadRequestException("Event end time cannot be before start time");
        }
        if (req.registrationDeadline() != null && req.registrationDeadline().isAfter(req.startDateTime())) {
            throw new BadRequestException("Registration deadline cannot be after event start time");
        }

        Club club = null;
        if (req.clubId() != null) {
            club = clubRepo.findById(req.clubId())
                    .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + req.clubId()));

            boolean canManage = organizer.getRole() == Role.ADMIN || clubService.isUserClubCoordinator(club, organizer);
            if (!canManage) {
                throw new AccessDeniedException("You are not authorized to create events for this club");
            }
        } else {
            if (organizer.getRole() != Role.ADMIN && organizer.getRole() != Role.TEACHER) {
                throw new AccessDeniedException("Only faculty or administrators can create campus-wide events without a club");
            }
        }

        String baseSlug = toSlug(req.title());
        String slug = baseSlug;
        int counter = 1;
        while (eventRepo.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        CampusEvent event = new CampusEvent();
        event.setTitle(req.title());
        event.setSlug(slug);
        event.setClub(club);
        event.setCategory(req.category());
        event.setDescription(req.description());
        event.setVenue(req.venue());
        event.setOnline(Boolean.TRUE.equals(req.online()));
        event.setMeetingLink(req.meetingLink());
        event.setStartDateTime(req.startDateTime());
        event.setEndDateTime(req.endDateTime());
        event.setRegistrationDeadline(req.registrationDeadline());
        event.setCapacity(req.capacity());
        event.setRegisteredCount(0);
        event.setStatus(EventStatus.PUBLISHED);
        event.setFeatured(Boolean.TRUE.equals(req.featured()));
        event.setImageUrl(req.imageUrl());
        event.setSampleData(false);
        event.setOrganizer(organizer);

        eventRepo.save(event);
        return getEventBySlug(event.getSlug(), organizer.getId());
    }

    public CampusEventDto updateEvent(Long eventId, UpdateEventRequest req, String userEmail) {
        User caller = getUserByEmail(userEmail);
        CampusEvent event = eventRepo.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        boolean canManage = caller.getRole() == Role.ADMIN ||
                (event.getClub() != null && clubService.isUserClubCoordinator(event.getClub(), caller)) ||
                (event.getOrganizer().getId().equals(caller.getId()));

        if (!canManage) {
            throw new AccessDeniedException("You are not authorized to edit this event");
        }

        if (req.endDateTime().isBefore(req.startDateTime())) {
            throw new BadRequestException("Event end time cannot be before start time");
        }
        if (req.registrationDeadline() != null && req.registrationDeadline().isAfter(req.startDateTime())) {
            throw new BadRequestException("Registration deadline cannot be after event start time");
        }

        event.setTitle(req.title());
        event.setCategory(req.category());
        event.setDescription(req.description());
        event.setVenue(req.venue());
        event.setOnline(Boolean.TRUE.equals(req.online()));
        event.setMeetingLink(req.meetingLink());
        event.setStartDateTime(req.startDateTime());
        event.setEndDateTime(req.endDateTime());
        event.setRegistrationDeadline(req.registrationDeadline());
        event.setCapacity(req.capacity());
        if (req.status() != null) {
            event.setStatus(req.status());
        }
        if (req.featured() != null && caller.getRole() == Role.ADMIN) {
            event.setFeatured(req.featured());
        }
        event.setImageUrl(req.imageUrl());

        eventRepo.save(event);
        return getEventBySlug(event.getSlug(), caller.getId());
    }

    public EventRegistrationDto registerForEvent(Long eventId, String userEmail) {
        User user = getUserByEmail(userEmail);

        // Transactional lock ensures strict concurrency-safety and zero overbooking
        CampusEvent event = eventRepo.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BadRequestException("This event is not open for registration");
        }

        LocalDateTime now = LocalDateTime.now();
        if (event.getEndDateTime().isBefore(now)) {
            throw new BadRequestException("This event has already ended");
        }

        if (event.getRegistrationDeadline() != null && now.isAfter(event.getRegistrationDeadline())) {
            throw new BadRequestException("The registration deadline for this event has passed");
        }

        if (event.getCapacity() != null && event.getRegisteredCount() >= event.getCapacity()) {
            throw new BadRequestException("Event is full. Maximum capacity (" + event.getCapacity() + ") reached.");
        }

        Optional<EventRegistration> existingOpt = regRepo.findByEventIdAndUserId(eventId, user.getId());
        if (existingOpt.isPresent()) {
            EventRegistration existing = existingOpt.get();
            if (existing.getStatus() == RegistrationStatus.REGISTERED) {
                throw new BadRequestException("You are already registered for this event");
            }
            existing.setStatus(RegistrationStatus.REGISTERED);
            existing.setRegisteredAt(now);
            existing.setCancelledAt(null);
            regRepo.save(existing);

            event.setRegisteredCount(event.getRegisteredCount() + 1);
            eventRepo.save(event);
            return toRegDto(existing);
        }

        EventRegistration reg = new EventRegistration(event, user);
        reg.setRegisteredAt(now);
        regRepo.save(reg);

        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepo.save(event);

        return toRegDto(reg);
    }

    public void cancelRegistration(Long eventId, String userEmail) {
        User user = getUserByEmail(userEmail);

        CampusEvent event = eventRepo.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        EventRegistration reg = regRepo.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new BadRequestException("You do not have a registration for this event"));

        if (reg.getStatus() == RegistrationStatus.REGISTERED) {
            reg.setStatus(RegistrationStatus.CANCELLED);
            reg.setCancelledAt(LocalDateTime.now());
            regRepo.save(reg);

            event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
            eventRepo.save(event);
        }
    }

    @Transactional(readOnly = true)
    public List<EventRegistrationDto> getMyRegistrations(String userEmail) {
        User user = getUserByEmail(userEmail);
        return regRepo.findAllByUserIdWithEvent(user.getId()).stream()
                .map(r -> toRegDto(r))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<EventAttendeeDto> getEventAttendees(Long eventId, String userEmail, int page, int size) {
        User caller = getUserByEmail(userEmail);
        CampusEvent event = eventRepo.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        boolean canManage = caller.getRole() == Role.ADMIN ||
                (event.getClub() != null && clubService.isUserClubCoordinator(event.getClub(), caller)) ||
                (event.getOrganizer().getId().equals(caller.getId()));

        if (!canManage) {
            throw new AccessDeniedException("You are not authorized to view attendee details for this event");
        }

        Pageable pageable = PageRequest.of(page, size);
        return regRepo.findByEventIdAndStatusWithUser(eventId, RegistrationStatus.REGISTERED, pageable)
                .map(r -> new EventAttendeeDto(
                        r.getId(),
                        r.getUser().getId(),
                        r.getUser().getName(),
                        r.getUser().getEmail(),
                        r.getUser().getRole(),
                        r.getStatus(),
                        r.getRegisteredAt()
                ));
    }

    private CampusEventSummaryDto toSummaryDto(CampusEvent e, EventRegistration reg) {
        boolean isReg = reg != null && reg.getStatus() == RegistrationStatus.REGISTERED;
        String regStatus = reg != null ? reg.getStatus().name() : null;

        return new CampusEventSummaryDto(
                e.getId(),
                e.getTitle(),
                e.getSlug(),
                e.getClub() != null ? e.getClub().getId() : null,
                e.getClub() != null ? e.getClub().getName() : null,
                e.getCategory(),
                e.getVenue(),
                e.isOnline(),
                e.getStartDateTime(),
                e.getEndDateTime(),
                e.getRegistrationDeadline(),
                e.getCapacity(),
                e.getRegisteredCount(),
                e.getStatus(),
                e.isFeatured(),
                e.getImageUrl(),
                e.isSampleData(),
                isReg,
                regStatus
        );
    }

    private EventRegistrationDto toRegDto(EventRegistration r) {
        CampusEvent e = r.getEvent();
        return new EventRegistrationDto(
                r.getId(),
                e.getId(),
                e.getTitle(),
                e.getSlug(),
                e.getCategory(),
                e.getVenue(),
                e.isOnline(),
                e.getStartDateTime(),
                e.getEndDateTime(),
                e.getStatus(),
                r.getStatus(),
                r.getRegisteredAt(),
                r.getCancelledAt()
        );
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
