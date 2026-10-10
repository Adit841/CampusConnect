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

import com.campusconnect.dto.ClubDto;
import com.campusconnect.dto.ClubMembershipDto;
import com.campusconnect.dto.ClubSummaryDto;
import com.campusconnect.dto.CreateClubRequest;
import com.campusconnect.dto.UpdateClubRequest;
import com.campusconnect.entity.ClubCategory;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.ClubService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;
    private final UserRepository userRepo;

    public ClubController(ClubService clubService, UserRepository userRepo) {
        this.clubService = clubService;
        this.userRepo = userRepo;
    }

    @GetMapping
    public ResponseEntity<Page<ClubSummaryDto>> listClubs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ClubCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            Principal principal) {
        User user = principal != null ? userRepo.findByEmail(principal.getName()).orElse(null) : null;
        Long userId = user != null ? user.getId() : null;
        boolean isAdmin = user != null && user.getRole() == Role.ADMIN;
        return ResponseEntity.ok(clubService.listClubs(search, category, page, size, userId, isAdmin));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ClubDto> getClub(@PathVariable String slug, Principal principal) {
        Long userId = null;
        if (principal != null) {
            userId = userRepo.findByEmail(principal.getName()).map(u -> u.getId()).orElse(null);
        }
        return ResponseEntity.ok(clubService.getClubBySlug(slug, userId));
    }

    @PostMapping
    public ResponseEntity<ClubDto> createClub(@Valid @RequestBody CreateClubRequest request, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.status(HttpStatus.CREATED).body(clubService.createClub(request, principal.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClubDto> updateClub(@PathVariable Long id,
                                             @Valid @RequestBody UpdateClubRequest request,
                                             Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(clubService.updateClub(id, request, principal.getName()));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ClubMembershipDto> joinClub(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(clubService.joinClub(id, principal.getName()));
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveClub(@PathVariable Long id, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        clubService.leaveClub(id, principal.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my/memberships")
    public ResponseEntity<List<ClubMembershipDto>> getMyMemberships(Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(clubService.getMyMemberships(principal.getName()));
    }
}
