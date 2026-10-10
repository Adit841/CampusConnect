package com.campusconnect.service;

import java.util.List;
import java.util.Objects;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.dto.CreateAnnouncementRequest;
import com.campusconnect.dto.UpdateAnnouncementRequest;
import com.campusconnect.entity.Announcement;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.AnnouncementRepository;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;

@Service
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherProfileRepository teacherProfileRepository
    ) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAnnouncements(String userEmail, String category, String search, Integer limit) {
        User user = getUserByEmail(userEmail);

        List<Announcement> announcements;
        String cleanCategory = (category != null && !category.isBlank()) ? category.trim() : null;
        String cleanSearch = (search != null && !search.isBlank()) ? search.trim() : null;

        if (user.getRole() == Role.ADMIN) {
            announcements = announcementRepository.searchForAdmin(cleanCategory, cleanSearch);
        } else if (user.getRole() == Role.TEACHER) {
            String department = teacherProfileRepository.findByUser(user)
                    .map(tp -> tp.getDepartment())
                    .orElse(null);
            announcements = announcementRepository.searchForTeacher(user.getId(), department, cleanCategory, cleanSearch);
        } else {
            String department = studentProfileRepository.findByUser(user)
                    .map(sp -> sp.getDepartment())
                    .orElse(null);
            announcements = announcementRepository.searchForStudent(department, cleanCategory, cleanSearch);
        }

        if (limit != null && limit > 0 && announcements.size() > limit) {
            announcements = announcements.subList(0, limit);
        }

        return announcements.stream()
                .map(AnnouncementResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Announcement announcement = getAnnouncementEntity(id);

        if (user.getRole() == Role.STUDENT) {
            String audienceUpper = announcement.getAudience() != null ? announcement.getAudience().trim().toUpperCase() : "ALL";
            if ("TEACHER".equals(audienceUpper) || "TEACHERS".equals(audienceUpper) || "FACULTY".equals(audienceUpper)) {
                throw new AccessDeniedException("You do not have permission to view this announcement");
            }
        }

        return AnnouncementResponse.fromEntity(announcement);
    }

    public AnnouncementResponse createAnnouncement(String userEmail, CreateAnnouncementRequest request) {
        User user = getUserByEmail(userEmail);

        if (user.getRole() == Role.STUDENT) {
            throw new AccessDeniedException("Students are not allowed to create announcements");
        }

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Announcement title cannot be empty");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Announcement content cannot be empty");
        }

        String category = (request.getCategory() != null && !request.getCategory().isBlank())
                ? request.getCategory().trim()
                : "GENERAL";
        String audience = (request.getAudience() != null && !request.getAudience().isBlank())
                ? request.getAudience().trim()
                : "ALL";
        boolean pinned = Boolean.TRUE.equals(request.getPinned());

        Announcement announcement = new Announcement(
                request.getTitle().trim(),
                request.getContent().trim(),
                category,
                audience,
                request.getDepartment(),
                pinned,
                user
        );

        Announcement saved = announcementRepository.save(announcement);
        return AnnouncementResponse.fromEntity(saved);
    }

    public AnnouncementResponse updateAnnouncement(Long id, String userEmail, UpdateAnnouncementRequest request) {
        User user = getUserByEmail(userEmail);
        Announcement announcement = getAnnouncementEntity(id);

        checkEditPermission(user, announcement);

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Announcement title cannot be empty");
        }
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BadRequestException("Announcement content cannot be empty");
        }

        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getContent().trim());

        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            announcement.setCategory(request.getCategory().trim());
        }
        if (request.getAudience() != null && !request.getAudience().isBlank()) {
            announcement.setAudience(request.getAudience().trim());
        }
        announcement.setDepartment(request.getDepartment());

        if (request.getPinned() != null) {
            announcement.setPinned(request.getPinned());
        }

        Announcement updated = announcementRepository.save(announcement);
        return AnnouncementResponse.fromEntity(updated);
    }

    public void deleteAnnouncement(Long id, String userEmail) {
        User user = getUserByEmail(userEmail);
        Announcement announcement = getAnnouncementEntity(id);

        checkEditPermission(user, announcement);

        announcementRepository.delete(announcement);
    }

    private void checkEditPermission(User user, Announcement announcement) {
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        if (user.getRole() == Role.TEACHER) {
            if (announcement.getAuthor() != null && Objects.equals(announcement.getAuthor().getId(), user.getId())) {
                return;
            }
            throw new AccessDeniedException("You are not authorized to modify an announcement you did not author");
        }

        throw new AccessDeniedException("Students are not authorized to modify announcements");
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Announcement getAnnouncementEntity(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found with id: " + id));
    }
}
