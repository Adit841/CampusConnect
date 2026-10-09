package com.campusconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.ProfileResponse;
import com.campusconnect.dto.UpdateProfileRequest;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.ResourceNotFoundException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;

@Service
public class ProfileService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;

    public ProfileService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherProfileRepository teacherProfileRepository
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
    }

    public ProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        StudentProfile studentProfile = null;
        TeacherProfile teacherProfile = null;

        if (user.getRole() == Role.STUDENT) {
            studentProfile = studentProfileRepository.findByUser(user).orElse(null);
        } else if (user.getRole() == Role.TEACHER) {
            teacherProfile = teacherProfileRepository.findByUser(user).orElse(null);
        }

        return ProfileResponse.of(user, studentProfile, teacherProfile);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Note: id, email, role, and password hash are preserved and never altered.
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        User updatedUser = userRepository.save(user);

        StudentProfile studentProfile = null;
        TeacherProfile teacherProfile = null;

        if (updatedUser.getRole() == Role.STUDENT) {
            StudentProfile existing = studentProfileRepository.findByUser(updatedUser).orElse(null);
            if (existing != null) {
                if (request.getRollNo() != null) {
                    existing.setRollNo(request.getRollNo());
                }
                if (request.getCourse() != null) {
                    existing.setCourse(request.getCourse());
                }
                if (request.getDepartment() != null) {
                    existing.setDepartment(request.getDepartment());
                }
                if (request.getYear() != null) {
                    existing.setYear(request.getYear());
                }
                if (request.getSection() != null) {
                    existing.setSection(request.getSection());
                }
                studentProfile = studentProfileRepository.save(existing);
            }
        } else if (updatedUser.getRole() == Role.TEACHER) {
            TeacherProfile existing = teacherProfileRepository.findByUser(updatedUser).orElse(null);
            if (existing != null) {
                if (request.getDepartment() != null) {
                    existing.setDepartment(request.getDepartment());
                }
                if (request.getDesignation() != null) {
                    existing.setDesignation(request.getDesignation());
                }
                if (request.getOfficeRoom() != null) {
                    existing.setOfficeRoom(request.getOfficeRoom());
                }
                teacherProfile = teacherProfileRepository.save(existing);
            }
        }

        return ProfileResponse.of(updatedUser, studentProfile, teacherProfile);
    }
}
