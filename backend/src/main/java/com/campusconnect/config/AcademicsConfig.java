package com.campusconnect.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AcademicsConfig {

    /** Used for deadline checks so they can be tested deterministically. */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
