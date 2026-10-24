package com.campusconnect.config;

import java.sql.Connection;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.autoconfigure.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.zaxxer.hikari.HikariDataSource;

/**
 * Builds the production pool and retries the first MySQL connection.
 * Render cold starts often cannot reach Aiven on the first attempt; without
 * this retry Hibernate 7 fails with "Unable to determine Dialect without JDBC metadata".
 */
@Configuration
@Profile("prod")
@EnableConfigurationProperties(DataSourceProperties.class)
public class ProdDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(ProdDataSourceConfig.class);

    private static final int ATTEMPTS = 8;
    private static final long DELAY_MS = 5000;

    @Bean
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();
        dataSource.setInitializationFailTimeout(-1);
        dataSource.setConnectionTimeout(10_000);

        Exception last = null;
        for (int attempt = 1; attempt <= ATTEMPTS; attempt++) {
            try (Connection connection = dataSource.getConnection()) {
                log.info("Connected to MySQL on attempt {}/{}", attempt, ATTEMPTS);
                return dataSource;
            } catch (Exception ex) {
                last = ex;
                log.warn("MySQL not reachable yet (attempt {}/{}): {}", attempt, ATTEMPTS, ex.getMessage());
                if (attempt < ATTEMPTS) {
                    try {
                        Thread.sleep(DELAY_MS);
                    } catch (InterruptedException interrupted) {
                        Thread.currentThread().interrupt();
                        dataSource.close();
                        throw new IllegalStateException("Interrupted while waiting to connect to MySQL", interrupted);
                    }
                }
            }
        }

        dataSource.close();
        throw new IllegalStateException(
                "Could not connect to MySQL after " + ATTEMPTS + " attempts. "
                        + "On Render, check SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, "
                        + "SPRING_DATASOURCE_PASSWORD, and that Aiven allows connections from anywhere "
                        + "(or from Render). The JDBC URL should look like "
                        + "jdbc:mysql://HOST:PORT/DB?sslMode=REQUIRED",
                last
        );
    }
}
