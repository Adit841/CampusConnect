package com.campusconnect.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.LoginRequest;
import com.campusconnect.dto.RegisterRequest;
import com.campusconnect.dto.UserResponse;
import com.campusconnect.entity.Role;
import com.campusconnect.entity.StudentProfile;
import com.campusconnect.entity.TeacherProfile;
import com.campusconnect.entity.User;
import com.campusconnect.exception.BadRequestException;
import com.campusconnect.repository.StudentProfileRepository;
import com.campusconnect.repository.TeacherProfileRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.CustomUserDetails;
import com.campusconnect.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            TeacherProfileRepository teacherProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getRole() == null) {
            throw new BadRequestException("Role is required");
        }
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Registration as ADMIN is not permitted");
        }
        if (request.getRole() != Role.STUDENT && request.getRole() != Role.TEACHER) {
            throw new BadRequestException("Only STUDENT and TEACHER registrations are allowed");
        }

        // Prevent duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Validate role-specific uniqueness and required identifiers
        if (request.getRole() == Role.STUDENT) {
            if (request.getEnrollmentNo() == null || request.getEnrollmentNo().trim().isEmpty()) {
                throw new BadRequestException("Enrollment number is required for students");
            }
            if (studentProfileRepository.existsByEnrollmentNo(request.getEnrollmentNo().trim())) {
                throw new BadRequestException("Enrollment number is already in use: " + request.getEnrollmentNo());
            }
        } else if (request.getRole() == Role.TEACHER) {
            if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty()) {
                throw new BadRequestException("Employee ID is required for teachers");
            }
            if (teacherProfileRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
                throw new BadRequestException("Employee ID is already in use: " + request.getEmployeeId());
            }
        }

        // Create User with hashed password
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        user.setProfileImage(request.getProfileImage());

        User savedUser = userRepository.save(user);

        // Create the correct profile based on role
        if (request.getRole() == Role.STUDENT) {
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setUser(savedUser);
            studentProfile.setEnrollmentNo(request.getEnrollmentNo().trim());
            studentProfile.setRollNo(request.getRollNo());
            studentProfile.setCourse(request.getCourse());
            studentProfile.setDepartment(request.getDepartment());
            studentProfile.setYear(request.getYear());
            studentProfile.setSection(request.getSection());
            studentProfileRepository.save(studentProfile);
        } else if (request.getRole() == Role.TEACHER) {
            TeacherProfile teacherProfile = new TeacherProfile();
            teacherProfile.setUser(savedUser);
            teacherProfile.setEmployeeId(request.getEmployeeId().trim());
            teacherProfile.setDepartment(request.getDepartment());
            teacherProfile.setDesignation(request.getDesignation());
            teacherProfile.setOfficeRoom(request.getOfficeRoom());
            teacherProfileRepository.save(teacherProfile);
        }

        UserDetails userDetails = new CustomUserDetails(savedUser);
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", savedUser.getRole().name());
        extraClaims.put("userId", savedUser.getId());
        String token = jwtService.generateToken(extraClaims, userDetails);

        return new AuthResponse(token, UserResponse.fromEntity(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("userId", user.getId());
            String token = jwtService.generateToken(extraClaims, userDetails);

            return new AuthResponse(token, UserResponse.fromEntity(user));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }
}
