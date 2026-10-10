package com.campusconnect.service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.CampusEventSummaryDto;
import com.campusconnect.dto.ClubDto;
import com.campusconnect.dto.ClubMembershipDto;
import com.campusconnect.dto.ClubSummaryDto;
import com.campusconnect.dto.CreateClubRequest;
import com.campusconnect.dto.UpdateClubRequest;
import com.campusconnect.entity.CampusEvent;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.ClubMemberRole;
import com.campusconnect.entity.ClubMembership;
import com.campusconnect.entity.MembershipStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.CampusEventRepository;
import com.campusconnect.repository.ClubMembershipRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.UserRepository;

@Service
@Transactional
public class ClubService {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private final ClubRepository clubRepo;
    private final ClubMembershipRepository membershipRepo;
    private final CampusEventRepository eventRepo;
    private final UserRepository userRepo;

    public ClubService(ClubRepository clubRepo,
                       ClubMembershipRepository membershipRepo,
                       CampusEventRepository eventRepo,
                       UserRepository userRepo) {
        this.clubRepo = clubRepo;
        this.membershipRepo = membershipRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
    }

    public static String toSlug(String input) {
        if (input == null) return "";
        String nowhitespace = WHITESPACE.matcher(input.trim()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }

    @Transactional(readOnly = true)
    public Page<ClubSummaryDto> listClubs(String search, ClubCategory category, int page, int size, Long currentUserId, boolean isAdmin) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<Club> clubsPage = isAdmin
                ? clubRepo.findAllForAdmin(category, search, pageable)
                : clubRepo.findFilteredClubs(category, search, pageable);

        Map<Long, ClubMembership> userMemberships = Map.of();
        if (currentUserId != null && !clubsPage.isEmpty()) {
            List<ClubMembership> memList = membershipRepo.findByUserIdWithClub(currentUserId);
            userMemberships = memList.stream().collect(Collectors.toMap(m -> m.getClub().getId(), m -> m, (a, b) -> a));
        }

        final Map<Long, ClubMembership> memMap = userMemberships;
        return clubsPage.map(club -> {
            ClubMembership mem = memMap.get(club.getId());
            String memStatus = mem != null ? mem.getStatus().name() : null;
            String memRole = mem != null ? mem.getRole().name() : null;

            return new ClubSummaryDto(
                    club.getId(),
                    club.getName(),
                    club.getSlug(),
                    club.getCategory(),
                    club.getTagline(),
                    club.getLogoUrl(),
                    club.isActive(),
                    club.isSampleData(),
                    club.getMemberCount(),
                    memStatus,
                    memRole,
                    null,
                    null
            );
        });
    }

    @Transactional(readOnly = true)
    public ClubDto getClubBySlug(String slug, Long currentUserId) {
        Club club = clubRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with slug: " + slug));

        String memStatus = null;
        String memRole = null;
        if (currentUserId != null) {
            var mem = membershipRepo.findByClubIdAndUserId(club.getId(), currentUserId);
            if (mem.isPresent()) {
                memStatus = mem.get().getStatus().name();
                memRole = mem.get().getRole().name();
            }
        }

        List<CampusEvent> upcoming = eventRepo.findUpcomingByClubId(club.getId(), LocalDateTime.now());
        List<CampusEventSummaryDto> eventDtos = upcoming.stream().map(e -> new CampusEventSummaryDto(
                e.getId(),
                e.getTitle(),
                e.getSlug(),
                club.getId(),
                club.getName(),
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
                false,
                null
        )).toList();

        return new ClubDto(
                club.getId(),
                club.getName(),
                club.getSlug(),
                club.getCategory(),
                club.getTagline(),
                club.getDescription(),
                club.getActivities(),
                club.getLogoUrl(),
                club.getBannerUrl(),
                club.getContactEmail(),
                club.getLeadCoordinator() != null ? club.getLeadCoordinator().getId() : null,
                club.getLeadCoordinator() != null ? club.getLeadCoordinator().getName() : null,
                club.isActive(),
                club.isSampleData(),
                club.getMemberCount(),
                memStatus,
                memRole,
                club.getCreatedAt(),
                eventDtos
        );
    }

    public ClubDto createClub(CreateClubRequest req, String userEmail) {
        User caller = getUserByEmail(userEmail);
        if (caller.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only administrators can create official club records");
        }

        if (clubRepo.existsByNameIgnoreCase(req.name())) {
            throw new BadRequestException("A club with this name already exists");
        }

        String baseSlug = toSlug(req.name());
        String slug = baseSlug;
        int counter = 1;
        while (clubRepo.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Club club = new Club(req.name(), slug, req.category(), req.tagline(), req.description());
        club.setActivities(req.activities());
        club.setLogoUrl(req.logoUrl());
        club.setBannerUrl(req.bannerUrl());
        club.setContactEmail(req.contactEmail());
        club.setActive(true);
        club.setSampleData(false);

        if (req.leadCoordinatorId() != null) {
            User lead = userRepo.findById(req.leadCoordinatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lead coordinator user not found"));
            club.setLeadCoordinator(lead);
            clubRepo.save(club);

            ClubMembership leadMem = new ClubMembership(club, lead, ClubMemberRole.LEAD, MembershipStatus.APPROVED);
            membershipRepo.save(leadMem);
            club.setMemberCount(1);
        } else {
            clubRepo.save(club);
        }

        return getClubBySlug(club.getSlug(), caller.getId());
    }

    public ClubDto updateClub(Long clubId, UpdateClubRequest req, String userEmail) {
        User caller = getUserByEmail(userEmail);
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        boolean isCoordinator = isUserClubCoordinator(club, caller);
        if (caller.getRole() != Role.ADMIN && !isCoordinator) {
            throw new AccessDeniedException("You are not authorized to update this club");
        }

        club.setTagline(req.tagline());
        club.setDescription(req.description());
        club.setActivities(req.activities());
        club.setLogoUrl(req.logoUrl());
        club.setBannerUrl(req.bannerUrl());
        club.setContactEmail(req.contactEmail());

        if (caller.getRole() == Role.ADMIN) {
            if (!club.getName().equalsIgnoreCase(req.name())) {
                if (clubRepo.existsByNameIgnoreCase(req.name())) {
                    throw new BadRequestException("A club with this name already exists");
                }
                club.setName(req.name());
            }
            club.setCategory(req.category());
            if (req.active() != null) {
                club.setActive(req.active());
            }
            if (req.leadCoordinatorId() != null) {
                User lead = userRepo.findById(req.leadCoordinatorId()).orElse(null);
                club.setLeadCoordinator(lead);
            }
        }

        clubRepo.save(club);
        return getClubBySlug(club.getSlug(), caller.getId());
    }

    public ClubMembershipDto joinClub(Long clubId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        if (!club.isActive()) {
            throw new BadRequestException("This club is currently inactive");
        }

        var existingOpt = membershipRepo.findByClubIdAndUserId(clubId, user.getId());
        if (existingOpt.isPresent()) {
            ClubMembership existing = existingOpt.get();
            if (existing.getStatus() == MembershipStatus.APPROVED) {
                throw new BadRequestException("You are already an active member of this club");
            }
            if (existing.getStatus() == MembershipStatus.PENDING) {
                throw new BadRequestException("Your membership request is already pending approval");
            }
            existing.setStatus(MembershipStatus.APPROVED);
            existing.setRole(ClubMemberRole.MEMBER);
            existing.setJoinedAt(LocalDateTime.now());
            membershipRepo.save(existing);
            club.setMemberCount(club.getMemberCount() + 1);
            clubRepo.save(club);
            return toMembershipDto(existing);
        }

        ClubMembership membership = new ClubMembership(club, user, ClubMemberRole.MEMBER, MembershipStatus.APPROVED);
        membershipRepo.save(membership);
        club.setMemberCount(club.getMemberCount() + 1);
        clubRepo.save(club);

        return toMembershipDto(membership);
    }

    public void leaveClub(Long clubId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Club club = clubRepo.findById(clubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club not found with id: " + clubId));

        ClubMembership membership = membershipRepo.findByClubIdAndUserId(clubId, user.getId())
                .orElseThrow(() -> new BadRequestException("You are not a member of this club"));

        if (membership.getStatus() == MembershipStatus.APPROVED) {
            club.setMemberCount(Math.max(0, club.getMemberCount() - 1));
            clubRepo.save(club);
        }

        membershipRepo.delete(membership);
    }

    @Transactional(readOnly = true)
    public List<ClubMembershipDto> getMyMemberships(String userEmail) {
        User user = getUserByEmail(userEmail);
        return membershipRepo.findByUserIdWithClub(user.getId()).stream()
                .map(this::toMembershipDto)
                .toList();
    }

    public boolean isUserClubCoordinator(Club club, User user) {
        if (user == null || club == null) return false;
        if (club.getLeadCoordinator() != null && club.getLeadCoordinator().getId().equals(user.getId())) {
            return true;
        }
        return membershipRepo.existsByClubIdAndUserIdAndRoleIn(
                club.getId(), user.getId(), List.of(ClubMemberRole.COORDINATOR, ClubMemberRole.LEAD));
    }

    private ClubMembershipDto toMembershipDto(ClubMembership cm) {
        return new ClubMembershipDto(
                cm.getId(),
                cm.getClub().getId(),
                cm.getClub().getName(),
                cm.getClub().getSlug(),
                cm.getClub().getCategory(),
                cm.getClub().getLogoUrl(),
                cm.getRole(),
                cm.getStatus(),
                cm.getJoinedAt(),
                cm.getCreatedAt()
        );
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }
}
