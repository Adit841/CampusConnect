package com.campusconnect.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.campusconnect.entity.Role;
import com.campusconnect.entity.User;
import com.campusconnect.repository.UserRepository;

/**
 * Server-side provisioning runner that safely elevates the configured initial
 * administrator account on startup and ensures valid administrator credentials.
 *
 * <p>This ensures administrator privileges are granted through a trusted server-side
 * mechanism rather than trusting client parameters, registration requests, or JWT payloads.</p>
 */
@Component
public class AdminProvisioningRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminProvisioningRunner.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.provision-email:pathakaayushman57@gmail.com}")
    private String provisionEmail;

    @Value("${app.admin.provision-password:Password123!}")
    private String provisionPassword;

    public AdminProvisioningRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (provisionEmail == null || provisionEmail.isBlank()) {
            return;
        }

        String normalizedEmail = provisionEmail.trim().toLowerCase();
        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(user -> {
            boolean updated = false;
            if (user.getRole() != Role.ADMIN) {
                user.setRole(Role.ADMIN);
                updated = true;
            }
            if (provisionPassword != null && !provisionPassword.isBlank()) {
                user.setPassword(passwordEncoder.encode(provisionPassword));
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
                log.info("Provisioned user '{}' with ADMIN role based on server-side configuration", normalizedEmail);
            } else {
                log.info("User '{}' is already verified with ADMIN role", normalizedEmail);
            }
        }, () -> {
            if (provisionPassword != null && !provisionPassword.isBlank()) {
                User newAdmin = new User("Ayushman Pathak", normalizedEmail, passwordEncoder.encode(provisionPassword), Role.ADMIN);
                userRepository.save(newAdmin);
                log.info("Created and provisioned new initial administrator '{}'", normalizedEmail);
            } else {
                log.info("Configured admin bootstrap email '{}' is not registered in the database yet", normalizedEmail);
            }
        });
    }
}
