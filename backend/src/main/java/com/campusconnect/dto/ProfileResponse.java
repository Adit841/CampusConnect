package com.campusconnect.dto;

import java.time.LocalDateTime;

import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;

public class ProfileResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private String profileImage;
    private String phone;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private StudentProfileResponse studentProfile;
    private TeacherProfileResponse teacherProfile;

    public ProfileResponse() {
    }

    public static ProfileResponse of(User user, StudentProfile studentProfile, TeacherProfile teacherProfile) {
        ProfileResponse response = new ProfileResponse();
        if (user != null) {
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setProfileImage(user.getProfileImage());
            response.setPhone(user.getPhone());
            response.setBio(user.getBio());
            response.setCreatedAt(user.getCreatedAt());
            response.setUpdatedAt(user.getUpdatedAt());
        }
        if (studentProfile != null) {
            response.setStudentProfile(StudentProfileResponse.fromEntity(studentProfile));
        }
        if (teacherProfile != null) {
            response.setTeacherProfile(TeacherProfileResponse.fromEntity(teacherProfile));
        }
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public StudentProfileResponse getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfileResponse studentProfile) {
        this.studentProfile = studentProfile;
    }

    public TeacherProfileResponse getTeacherProfile() {
        return teacherProfile;
    }

    public void setTeacherProfile(TeacherProfileResponse teacherProfile) {
        this.teacherProfile = teacherProfile;
    }
}
