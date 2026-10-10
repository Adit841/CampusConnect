package com.campusconnect.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import com.campusconnect.dto.ClubDto;
import com.campusconnect.dto.ClubMembershipDto;
import com.campusconnect.dto.ClubSummaryDto;
import com.campusconnect.dto.CreateClubRequest;
import com.campusconnect.entity.Club;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.ClubMemberRole;
import com.campusconnect.entity.ClubMembership;
import com.campusconnect.entity.MembershipStatus;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.repository.CampusEventRepository;
import com.campusconnect.repository.ClubMembershipRepository;
import com.campusconnect.repository.ClubRepository;
import com.campusconnect.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ClubServiceTest {

    @Mock
    private ClubRepository clubRepo;

    @Mock
    private ClubMembershipRepository membershipRepo;

    @Mock
    private CampusEventRepository eventRepo;

    @Mock
    private UserRepository userRepo;

    private ClubService clubService;

    private User admin;
    private User student;
    private Club codingClub;

    @BeforeEach
    void setUp() {
        clubService = new ClubService(clubRepo, membershipRepo, eventRepo, userRepo);

        admin = new User("Admin User", "admin@campusconnect.edu", "pass", Role.ADMIN);
        admin.setId(1L);

        student = new User("Student Alice", "alice@campusconnect.edu", "pass", Role.STUDENT);
        student.setId(2L);

        codingClub = new Club("Arya Cipher Coding Club", "arya-cipher-coding-club",
                ClubCategory.TECHNICAL, "Algorithmic challenges and coding.", "Deep dive into algorithms.");
        codingClub.setId(10L);
        codingClub.setActive(true);
        codingClub.setMemberCount(15);
    }

    @Test
    void listClubs_returnsFilteredClubs() {
        when(clubRepo.findFilteredClubs(any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(codingClub)));

        Page<ClubSummaryDto> result = clubService.listClubs("coding", ClubCategory.TECHNICAL, 0, 10, null, false);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Arya Cipher Coding Club", result.getContent().get(0).name());
    }

    @Test
    void getClubBySlug_returnsClubWithMembershipState() {
        when(clubRepo.findBySlug("arya-cipher-coding-club")).thenReturn(Optional.of(codingClub));
        when(membershipRepo.findByClubIdAndUserId(10L, 2L)).thenReturn(Optional.of(
                new ClubMembership(codingClub, student, ClubMemberRole.MEMBER, MembershipStatus.APPROVED)
        ));
        when(eventRepo.findUpcomingByClubId(any(), any())).thenReturn(List.of());

        ClubDto dto = clubService.getClubBySlug("arya-cipher-coding-club", 2L);

        assertNotNull(dto);
        assertEquals("arya-cipher-coding-club", dto.slug());
        assertEquals("APPROVED", dto.currentMemberStatus());
    }

    @Test
    void createClub_adminSuccess() {
        CreateClubRequest req = new CreateClubRequest(
                "Arya GDG Club", ClubCategory.TECHNICAL, "Google Developer Group",
                "Web and Cloud technologies", "Workshops", null, null, "gdg@test.com", null
        );

        when(userRepo.findByEmail("admin@campusconnect.edu")).thenReturn(Optional.of(admin));
        when(clubRepo.existsByNameIgnoreCase("Arya GDG Club")).thenReturn(false);
        when(clubRepo.existsBySlug("arya-gdg-club")).thenReturn(false);
        when(clubRepo.save(any(Club.class))).thenAnswer(i -> {
            Club c = i.getArgument(0);
            c.setId(20L);
            return c;
        });
        when(clubRepo.findBySlug("arya-gdg-club")).thenReturn(Optional.of(
                new Club("Arya GDG Club", "arya-gdg-club", ClubCategory.TECHNICAL, "Google Developer Group", "Web and Cloud")
        ));
        when(eventRepo.findUpcomingByClubId(any(), any())).thenReturn(List.of());

        ClubDto created = clubService.createClub(req, "admin@campusconnect.edu");
        assertNotNull(created);
        assertEquals("Arya GDG Club", created.name());
    }

    @Test
    void createClub_studentDenied() {
        CreateClubRequest req = new CreateClubRequest(
                "Arya Fake Club", ClubCategory.SOCIAL, "Tagline", "Desc", null, null, null, null, null
        );

        when(userRepo.findByEmail("alice@campusconnect.edu")).thenReturn(Optional.of(student));

        assertThrows(AccessDeniedException.class, () ->
                clubService.createClub(req, "alice@campusconnect.edu"));
    }

    @Test
    void joinClub_preventsDuplicateActiveMembership() {
        when(userRepo.findByEmail("alice@campusconnect.edu")).thenReturn(Optional.of(student));
        when(clubRepo.findById(10L)).thenReturn(Optional.of(codingClub));
        when(membershipRepo.findByClubIdAndUserId(10L, 2L)).thenReturn(Optional.of(
                new ClubMembership(codingClub, student, ClubMemberRole.MEMBER, MembershipStatus.APPROVED)
        ));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                clubService.joinClub(10L, "alice@campusconnect.edu"));
        assertTrue(ex.getMessage().contains("already an active member"));
    }

    @Test
    void joinClub_successIncrementsCount() {
        when(userRepo.findByEmail("alice@campusconnect.edu")).thenReturn(Optional.of(student));
        when(clubRepo.findById(10L)).thenReturn(Optional.of(codingClub));
        when(membershipRepo.findByClubIdAndUserId(10L, 2L)).thenReturn(Optional.empty());

        ClubMembershipDto dto = clubService.joinClub(10L, "alice@campusconnect.edu");

        assertNotNull(dto);
        assertEquals(MembershipStatus.APPROVED, dto.status());
        assertEquals(16, codingClub.getMemberCount());
        verify(membershipRepo).save(any(ClubMembership.class));
        verify(clubRepo).save(codingClub);
    }

    @Test
    void leaveClub_decrementsCount() {
        ClubMembership mem = new ClubMembership(codingClub, student, ClubMemberRole.MEMBER, MembershipStatus.APPROVED);
        when(userRepo.findByEmail("alice@campusconnect.edu")).thenReturn(Optional.of(student));
        when(clubRepo.findById(10L)).thenReturn(Optional.of(codingClub));
        when(membershipRepo.findByClubIdAndUserId(10L, 2L)).thenReturn(Optional.of(mem));

        clubService.leaveClub(10L, "alice@campusconnect.edu");

        assertEquals(14, codingClub.getMemberCount());
        verify(membershipRepo).delete(mem);
        verify(clubRepo).save(codingClub);
    }
}
