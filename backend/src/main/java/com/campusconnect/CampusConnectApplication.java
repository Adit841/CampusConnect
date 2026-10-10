package com.campusconnect;

import com.campusconnect.config.DotenvInitializer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CampusConnectApplication {

    public static void main(String[] args) {
        DotenvInitializer.load();
        SpringApplication.run(CampusConnectApplication.class, args);
    }
}
